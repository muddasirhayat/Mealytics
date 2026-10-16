Add-Type -AssemblyName System.Drawing

function Save-Mark {
  param(
    [string]$Path,
    [bool]$Mono
  )
  $size = 1024
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.Clear([System.Drawing.Color]::Transparent)

  $cx = 512
  $cy = 512
  $r = 278
  $sw = 70
  $penColor = if ($Mono) { [System.Drawing.Color]::White } else { [System.Drawing.Color]::FromArgb(255, 91, 95, 239) }
  $fillColor = if ($Mono) { [System.Drawing.Color]::White } else { [System.Drawing.Color]::FromArgb(255, 44, 200, 168) }

  $pen = New-Object System.Drawing.Pen $penColor, $sw
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $g.DrawEllipse($pen, $cx - $r, $cy - $r, $r * 2, $r * 2)

  $inner = $r - ($sw / 2) + 1
  $brush = New-Object System.Drawing.SolidBrush $fillColor
  $g.FillPie($brush, [single]($cx - $inner), [single]($cy - $inner), [single]($inner * 2), [single]($inner * 2), -90, 90)

  $dir = Split-Path $Path
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
  $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
  $pen.Dispose()
  $brush.Dispose()
  Write-Host "Wrote $Path ($((Get-Item $Path).Length) bytes)"
}

$root = Split-Path $PSScriptRoot -Parent
$images = Join-Path $root "assets\images"
Save-Mark -Path (Join-Path $images "adaptive-foreground.png") -Mono:$false
Save-Mark -Path (Join-Path $images "monochrome.png") -Mono:$true

$logoPath = Join-Path $images "logo.png"
$logo = [System.Drawing.Image]::FromFile($logoPath)
$target = 512
$out = New-Object System.Drawing.Bitmap $target, $target
$og = [System.Drawing.Graphics]::FromImage($out)
$og.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$og.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$og.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$og.Clear([System.Drawing.Color]::Transparent)
$og.DrawImage($logo, 0, 0, $target, $target)
$tmp = Join-Path $images "logo.compressed.png"
$out.Save($tmp, [System.Drawing.Imaging.ImageFormat]::Png)
$og.Dispose()
$out.Dispose()
$logo.Dispose()
$orig = (Get-Item $logoPath).Length
$next = (Get-Item $tmp).Length
if ($next -lt $orig) {
  Move-Item -Force $tmp $logoPath
  Write-Host "Compressed logo.png $orig -> $next bytes"
} else {
  Remove-Item $tmp
  Write-Host "Kept original logo.png ($orig bytes); compressed was $next"
}
