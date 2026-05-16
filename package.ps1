param(
    [string]$OutputDir = "."
)

$version = if ((Get-Content "manifest.json" -Raw -Encoding UTF8) -match '"version":\s*"([^"]+)"') { $matches[1] } else { "0.0.0" }
$name = "bilibili-live-comment-button"
$filename = "${name}-v${version}.zip"
$outputPath = if ($OutputDir -eq ".") { Join-Path (Get-Location) $filename } else { Join-Path (Resolve-Path $OutputDir) $filename }

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$files = @(
    @{ Source = "manifest.json";    Entry = "manifest.json" }
    @{ Source = "config.js";        Entry = "config.js" }
    @{ Source = "content.js";       Entry = "content.js" }
    @{ Source = "content.css";      Entry = "content.css" }
    @{ Source = "popup.html";       Entry = "popup.html" }
    @{ Source = "popup.js";         Entry = "popup.js" }
    @{ Source = "icons\icon128.png"; Entry = "icons/icon128.png" }
)

Remove-Item -LiteralPath $outputPath -ErrorAction Ignore
$zip = [System.IO.Compression.ZipFile]::Open($outputPath, [System.IO.Compression.ZipArchiveMode]::Create)
try {
    foreach ($e in $files) {
        $null = [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $e.Source, $e.Entry, [System.IO.Compression.CompressionLevel]::Optimal)
    }
} finally {
    $zip.Dispose()
}

Write-Host "Packaged: $outputPath"
