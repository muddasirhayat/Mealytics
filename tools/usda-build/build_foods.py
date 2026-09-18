#!/usr/bin/env python3
"""Build bundled data/foods.json from USDA FoodData Central SR Legacy CSVs.

Downloads the SR Legacy CSV zip from https://fdc.nal.usda.gov/download-datasets
into tools/usda-build/raw/ (gitignored), then writes data/foods.json.
"""

from __future__ import annotations

import csv
import io
import json
import shutil
import socket
import subprocess
import urllib.error
import urllib.request
import zipfile
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW_DIR = Path(__file__).resolve().parent / "raw"
OUT_PATH = ROOT / "data" / "foods.json"

USDA_HOST = "fdc.nal.usda.gov"
SR_LEGACY_ZIP_NAME = "FoodData_Central_sr_legacy_food_csv_2018-04.zip"
SR_LEGACY_URL = f"https://{USDA_HOST}/fdc-datasets/{SR_LEGACY_ZIP_NAME}"
FALLBACK_IP = "52.245.234.40"

# FoodData Central nutrient IDs (amounts in CSV are per 100g)
NUTRIENT_CALORIES = 1008
NUTRIENT_PROTEIN = 1003
NUTRIENT_FAT = 1004
NUTRIENT_CARBS = 1005
NUTRIENT_FIBER = 1079
NUTRIENT_SUGAR = 2000
NUTRIENT_SUGAR_FALLBACK = 1063
NUTRIENT_SODIUM = 1093

NEEDED_NUTRIENTS = {
    NUTRIENT_CALORIES,
    NUTRIENT_PROTEIN,
    NUTRIENT_FAT,
    NUTRIENT_CARBS,
    NUTRIENT_FIBER,
    NUTRIENT_SUGAR,
    NUTRIENT_SUGAR_FALLBACK,
    NUTRIENT_SODIUM,
}

USER_AGENT = "Mealytics/1.0 (USDA SR Legacy local catalog build)"
MAX_JSON_BYTES = 5 * 1024 * 1024


def log(message: str) -> None:
    print(message, flush=True)


def lookup_ip(host: str) -> str:
    try:
        infos = socket.getaddrinfo(host, 443, type=socket.SOCK_STREAM)
        return infos[0][4][0]
    except OSError:
        pass

    doh_urls = (
        f"https://1.1.1.1/dns-query?name={host}&type=A",
        f"https://8.8.8.8/resolve?name={host}&type=A",
    )
    for url in doh_urls:
        try:
            req = urllib.request.Request(
                url,
                headers={
                    "Accept": "application/dns-json",
                    "Host": "cloudflare-dns.com" if "1.1.1.1" in url else "dns.google",
                    "User-Agent": USER_AGENT,
                },
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                payload = json.loads(resp.read().decode("utf-8"))
            for answer in payload.get("Answer") or []:
                if answer.get("type") == 1 and answer.get("data"):
                    return str(answer["data"])
        except Exception:
            continue
    return FALLBACK_IP


def download_with_urllib(url: str, dest: Path) -> None:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=120) as resp, dest.open("wb") as out:
        shutil.copyfileobj(resp, out)


def download_with_curl(url: str, dest: Path, host: str, ip: str) -> None:
    curl = shutil.which("curl") or shutil.which("curl.exe")
    if not curl:
        raise FileNotFoundError("curl is not available")
    cmd = [
        curl,
        "--fail",
        "-L",
        "--retry",
        "3",
        "--retry-delay",
        "2",
        "--resolve",
        f"{host}:443:{ip}",
        "-A",
        USER_AGENT,
        "-o",
        str(dest),
        url,
    ]
    subprocess.run(cmd, check=True)


def download_zip(url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 1000:
        log(f"Using existing zip: {dest}")
        return

    tmp = dest.with_suffix(dest.suffix + ".tmp")
    if tmp.exists():
        tmp.unlink()

    log(f"Downloading {url}")
    try:
        download_with_urllib(url, tmp)
    except (urllib.error.URLError, OSError, TimeoutError) as err:
        log(f"Direct download failed ({err}); retrying with pinned DNS")
        ip = lookup_ip(USDA_HOST)
        log(f"Resolved {USDA_HOST} -> {ip}")
        download_with_curl(url, tmp, USDA_HOST, ip)

    if tmp.stat().st_size < 1000:
        tmp.unlink(missing_ok=True)
        raise RuntimeError(f"Downloaded file is too small: {tmp}")
    tmp.replace(dest)
    log(f"Saved {dest} ({dest.stat().st_size} bytes)")


def zip_member_name(info_name: str) -> str:
    return info_name.replace("\\", "/").rsplit("/", 1)[-1].lower()


def extract_csv(zip_path: Path, filename: str, dest_dir: Path) -> Path:
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / filename
    with zipfile.ZipFile(zip_path) as archive:
        member = next(
            (info.filename for info in archive.infolist() if zip_member_name(info.filename) == filename),
            None,
        )
        if member is None:
            raise FileNotFoundError(f"{filename} not found in {zip_path.name}")
        with archive.open(member) as src, dest.open("wb") as out:
            shutil.copyfileobj(src, out)
    return dest


def open_csv(path: Path) -> io.TextIOBase:
    return path.open("r", encoding="utf-8-sig", newline="")


def parse_amount(raw: str | None) -> float:
    if raw is None or raw == "":
        return 0.0
    try:
        return float(raw)
    except ValueError:
        return 0.0


def round_macros(value: float) -> float:
    return round(value + 0.0, 2)


def load_nutrients(food_nutrient_path: Path) -> dict[str, dict[int, float]]:
    by_food: dict[str, dict[int, float]] = {}
    with open_csv(food_nutrient_path) as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            try:
                nutrient_id = int(row["nutrient_id"])
            except (KeyError, TypeError, ValueError):
                continue
            if nutrient_id not in NEEDED_NUTRIENTS:
                continue
            fdc_id = (row.get("fdc_id") or "").strip()
            if not fdc_id:
                continue
            by_food.setdefault(fdc_id, {})[nutrient_id] = parse_amount(row.get("amount"))
    return by_food


def build_foods(food_path: Path, nutrients: dict[str, dict[int, float]]) -> list[dict]:
    foods: list[dict] = []
    with open_csv(food_path) as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            data_type = (row.get("data_type") or "").strip()
            if data_type and data_type != "sr_legacy_food":
                continue
            fdc_id = (row.get("fdc_id") or "").strip()
            name = (row.get("description") or "").strip()
            if not fdc_id or not name:
                continue
            values = nutrients.get(fdc_id, {})
            calories = values.get(NUTRIENT_CALORIES, 0.0)
            protein = values.get(NUTRIENT_PROTEIN, 0.0)
            if calories <= 0 and protein <= 0:
                continue
            foods.append(
                {
                    "id": fdc_id,
                    "name": name,
                    "dataSource": "usda",
                    "calories": int(round(calories)),
                    "protein": round_macros(protein),
                    "carbohydrates": round_macros(values.get(NUTRIENT_CARBS, 0.0)),
                    "fat": round_macros(values.get(NUTRIENT_FAT, 0.0)),
                    "fiber": round_macros(values.get(NUTRIENT_FIBER, 0.0)),
                    "sugar": round_macros(
                        values.get(NUTRIENT_SUGAR, values.get(NUTRIENT_SUGAR_FALLBACK, 0.0))
                    ),
                    "sodium": int(round(values.get(NUTRIENT_SODIUM, 0.0))),
                    "servingSize": 100,
                    "servingUnit": "g",
                    "nutrients": [],
                    "rawSourceId": fdc_id,
                }
            )
    foods.sort(key=lambda item: (item["name"].lower(), item["id"]))
    return foods


def write_catalog(foods: list[dict]) -> None:
    payload = {
        "version": 1,
        "generatedAt": date.today().isoformat(),
        "source": "USDA FoodData Central, SR Legacy",
        "per": "100g",
        "foods": foods,
    }
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    encoded = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    size = len(encoded.encode("utf-8"))
    if size > MAX_JSON_BYTES:
        raise RuntimeError(
            f"foods.json would be {size} bytes (limit {MAX_JSON_BYTES}). "
            "Rebuild with fewer foods."
        )
    OUT_PATH.write_text(encoded + "\n", encoding="utf-8")
    log(f"Wrote {OUT_PATH} ({size} bytes, {len(foods)} foods)")


def main() -> int:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    zip_path = RAW_DIR / SR_LEGACY_ZIP_NAME
    download_zip(SR_LEGACY_URL, zip_path)

    csv_dir = RAW_DIR / "sr_legacy"
    food_csv = extract_csv(zip_path, "food.csv", csv_dir)
    food_nutrient_csv = extract_csv(zip_path, "food_nutrient.csv", csv_dir)
    log(f"Extracted {food_csv.name} and {food_nutrient_csv.name}")

    log("Parsing nutrients...")
    nutrients = load_nutrients(food_nutrient_csv)
    log(f"Nutrient rows kept for {len(nutrients)} foods")

    log("Building food catalog...")
    foods = build_foods(food_csv, nutrients)
    write_catalog(foods)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        raise SystemExit(130)
    except Exception as exc:
        log(f"ERROR: {exc}")
        raise SystemExit(1)
