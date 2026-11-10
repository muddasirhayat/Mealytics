#!/usr/bin/env bash
# Capture Play phone screenshots from a connected Android device or emulator.
# Navigate to each screen when prompted. PNGs land in store/play-screenshots/.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
out="$root/store/play-screenshots"
mkdir -p "$out"

if ! command -v adb >/dev/null 2>&1; then
  echo "adb is not installed. Install Android platform-tools, connect a device, and run this again." >&2
  exit 1
fi

echo "Waiting for a device..."
adb wait-for-device

capture() {
  local file="$1"
  local instruction="$2"
  echo
  echo "$instruction"
  read -r -p "Press Enter to capture ${file}.png " _
  adb exec-out screencap -p > "$out/${file}.png"
  echo "Saved $out/${file}.png"
}

echo "Package should be com.codixr.mealytics. Open the app before the first capture."

capture "01-today-light" "Show Today in light mode, with the calorie ring visible."
capture "02-search" "Open Search and show a finished query with food rows."
capture "03-logs" "Open Logs on a day that has at least one meal."
capture "04-quick-meals" "Open Quick meals."
capture "05-profile" "Open Profile."
capture "06-today-dark" "Set Appearance to Dark, then return to Today."

echo
echo "Done. Upload the PNGs from $out to the Play phone screenshot slots."
