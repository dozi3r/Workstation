# Update-RegionalImageCatalog.ps1
# Incremental Synchronizer, Building Classifier & Ingestion Engine for Regional Visual Assets
[CmdletBinding()]
param(
    [Parameter()]
    [switch]$DryRun,

    [Parameter()]
    [string]$SpecificFile
)

Add-Type -AssemblyName System.Runtime.WindowsRuntime
Add-Type -AssemblyName System.Drawing
$asTaskGeneric = [System.WindowsRuntimeSystemExtensions].GetMethods() | ? { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' } | Select-Object -First 1

function Await($WinRtTask, $ResultType) {
    $asTask = $asTaskGeneric.MakeGenericMethod($ResultType)
    $netTask = $asTask.Invoke($null, @($WinRtTask))
    $netTask.Wait(-1) | Out-Null
    $netTask.Result
}

[Windows.Storage.StorageFile, Windows.Storage, ContentType=WindowsRuntime] | Out-Null
[Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics, ContentType=WindowsRuntime] | Out-Null
[Windows.Media.Ocr.OcrEngine, Windows.Foundation.UniversalApiContract, ContentType=WindowsRuntime] | Out-Null

$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()

$baseDir = Join-Path $PSScriptRoot ""
$imagesDir = Join-Path $PSScriptRoot "images"
$dbPath = Join-Path $PSScriptRoot "regional_image_catalog.json"
$mdPath = Join-Path $PSScriptRoot "REGIONAL_IMAGE_INDEX.md"

if (-not (Test-Path $dbPath)) {
    Write-Error "Database not found at $dbPath."
    return
}

$rawJson = [System.IO.File]::ReadAllText($dbPath, [System.Text.Encoding]::UTF8)
$catalogList = [System.Collections.Generic.List[object]]::new()
($rawJson | ConvertFrom-Json) | ForEach-Object { $catalogList.Add($_) }

# Index existing paths
$existingByPath = @{}
$existingByName = @{}
$maxId = 0
foreach ($entry in $catalogList) {
    if ($entry.relative_path) {
        $existingByPath[$entry.relative_path.ToLower().Replace('\', '/')] = $entry
    }
    if ($entry.filename) {
        $existingByName[$entry.filename.ToLower()] = $entry
    }
    if ($entry.id -match 'IMG-(\d+)') {
        $num = [int]$matches[1]
        if ($num -gt $maxId) { $maxId = $num }
    }
}

Write-Host "Current Database: $($catalogList.Count) assets (Highest ID: IMG-$("{0:D4}" -f $maxId))"

# Scan images folder for all assets
$diskFiles = if ($SpecificFile) {
    @(Get-Item -Path $SpecificFile)
} else {
    @(Get-ChildItem -Path $imagesDir -Recurse -File | Where-Object { $_.Extension -match '^\.(png|jpg|jpeg|webp)$' })
}

Write-Host "Found $($diskFiles.Count) total image files in regions/images/."

function Clean-OcrText($raw) {
    if (-not $raw) { return "" }
    $t = ($raw -replace '[\r\n]+', ' ').Trim()
    $t = $t -replace 'https?://[^\s]+', ''
    $t = $t -replace '\(C\s+[^)]+\)', ''
    $t = $t -replace '\(Bing\s+[^)]*\)', ''
    $t = $t -replace 'alamy\s+alamy%i.*', ''
    $t = $t -replace 'Click again to go back', ''
    $t = $t -replace '\s+', ' '
    return $t.Trim()
}

# Helper function to classify building presence, count, and type
function Get-BuildingClassification($filename, $location, $features) {
    $fn = $filename.ToLower()
    $loc = if ($location) { $location.ToLower() } else { "" }
    $feat = ($features -join " ").ToLower()
    $combined = "$fn $loc $feat"

    $category = "none_wilderness"
    $count = "0"
    $types = @("none")

    if ($combined -match 'cistern|basilica cistern|underground lake|crypt|vaulted_arches|cave_dwellings|cappadocia|troglodyte') {
        $category = "subterranean_vault"
        $count = "1"
        if ($combined -match 'cistern') { $types = @("pillared_cistern", "subterranean_vault") }
        elseif ($combined -match 'cappadocia|cave') { $types = @("carved_cliff_caves") }
        else { $types = @("underground_chamber") }
        return @{ Category = $category; Count = $count; Types = $types }
    }

    if ($combined -match 'pyramid|amphitheater|skara brae|adalaj|stepwell|nemrut|ruins|dalyan') {
        $category = "ancient_ruins"
        $count = "1"
        if ($combined -match 'pyramid') { $types = @("cyclopean_pyramid", "ancient_ruin") }
        elseif ($combined -match 'stepwell|adalaj') { $types = @("carved_stepwell", "ancient_ruin") }
        elseif ($combined -match 'skara brae') { $types = @("neolithic_stone_dwellings", "ancient_ruin"); $count = "2-5" }
        elseif ($combined -match 'dalyan|tombs') { $types = @("rock_cut_tombs", "ancient_ruin") }
        elseif ($combined -match 'nemrut') { $types = @("monumental_stone_heads", "sanctuary_ruin") }
        else { $types = @("stone_colonnades", "ancient_ruin") }
        return @{ Category = $category; Count = $count; Types = $types }
    }

    if ($combined -match 'castle|fort|bastion|fortress|keep|rocca|zafra|urquhart|bobolice|branik|tioram|dunluce|cloughoughter|kilchurn|al jahili|fort-la-latte|guaita') {
        $category = "isolated_structure"
        $count = "1"
        $types = @("castle_fortress")
        if ($combined -match 'moat') { $types += "defensive_moat" }
        if ($combined -match 'tower|guaita') { $types += "watchtower" }
        return @{ Category = $category; Count = $count; Types = $types }
    }

    if ($combined -match 'town|settlement|carcassonne|st malo|saint-malo|mont-saint-michel|mont saint michel|le castella|forte nossa|ghyakar|city walls|avila|tossa de mar') {
        $category = "dense_settlement"
        $count = "many"
        $types = @("walled_citadel", "settlement_buildings")
        return @{ Category = $category; Count = $count; Types = $types }
    }

    if ($combined -match 'bridge|viaduct|boardwalk|switchback|stairs|lighthouse|breakwater|pier|watermill|mill|aqueduct') {
        $category = "civil_infrastructure"
        $count = "1"
        if ($combined -match 'bridge|viaduct') { $types = @("stone_arch_bridge") }
        elseif ($combined -match 'boardwalk') { $types = @("wooden_boardwalk") }
        elseif ($combined -match 'switchback|stairs') { $types = @("cliff_switchback_stairs") }
        elseif ($combined -match 'lighthouse|pier|breakwater') { $types = @("harbor_lighthouse", "granite_breakwater") }
        elseif ($combined -match 'mill') { $types = @("watermill") }
        return @{ Category = $category; Count = $count; Types = $types }
    }

    if ($combined -match 'monastery|temple|church|cathedral|shrine|pagoda|abbey|chapel|sanctuary|hermitage|bothy|refugio|meteora|tengboche|haghartsin|geghard|ostrog|sumela|sveti jovan') {
        $category = "isolated_structure"
        $count = "1"
        $types = @("mountain_monastery_shrine")
        return @{ Category = $category; Count = $count; Types = $types }
    }

    if ($combined -match 'cabin|cottage|chalet|dwelling|house|village|enclave|camp') {
        $category = "isolated_structure"
        $count = "1"
        $types = @("isolated_dwelling")
        return @{ Category = $category; Count = $count; Types = $types }
    }

    return @{ Category = "none_wilderness"; Count = "0"; Types = @("none") }
}

$newEntriesCount = 0
$updatedEntriesCount = 0

foreach ($f in $diskFiles) {
    $rel = $f.FullName.Substring($baseDir.Length).TrimStart('\', '/')
    $relSlash = $rel.Replace('\', '/')
    $relLower = $relSlash.ToLower()
    $fileName = $f.Name
    $ext = $f.Extension.TrimStart('.').ToLower()
    $fileSizeBytes = $f.Length
    $sizeFormatted = "{0:N1} KB" -f ($fileSizeBytes / 1KB)
    if ($fileSizeBytes -gt 1MB) {
        $sizeFormatted = "{0:N2} MB" -f ($fileSizeBytes / 1MB)
    }

    # Determine environment category and subcategory from path
    # e.g. images/waters_and_wetlands/streams_and_creeks/stream_01.png
    $parts = $relSlash -split '/'
    $envCat = if ($parts.Length -ge 3) { $parts[1] } else { "uncategorized" }
    $envSub = if ($parts.Length -ge 4) { $parts[2] } else { "general" }
    $folderRel = if ($parts.Length -ge 3) { ($parts[0..($parts.Length - 2)] -join '/') } else { "images" }

    if ($existingByPath.ContainsKey($relLower) -or $existingByName.ContainsKey($fileName.ToLower())) {
        # Already indexed - verify size and dimensions
        $rec = if ($existingByPath.ContainsKey($relLower)) { $existingByPath[$relLower] } else { $existingByName[$fileName.ToLower()] }
        $modified = $false
        if ($rec.relative_path -ne $relSlash) {
            $rec.relative_path = $relSlash
            $rec.folder = $folderRel
            $modified = $true
        }
        if ($rec.file_size_bytes -ne $fileSizeBytes) {
            $rec.file_size_bytes = $fileSizeBytes
            $rec.file_size_formatted = $sizeFormatted
            $modified = $true
        }
        if ($modified) { $updatedEntriesCount++ }
        continue
    }

    # New file discovery
    Write-Host "New visual asset detected: $relSlash" -ForegroundColor Cyan

    $width = 0
    $height = 0
    $ocrText = ""
    try {
        $bmp = [System.Drawing.Image]::FromFile($f.FullName)
        $width = $bmp.Width
        $height = $bmp.Height
        $bmp.Dispose()
    } catch {
        Write-Warning "Could not read image dimensions for $($f.FullName)"
    }

    # OCR extraction if engine available
    if ($engine) {
        try {
            $storageFile = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($f.FullName)) ([Windows.Storage.StorageFile])
            $stream = Await ($storageFile.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
            $decoder = Await ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
            $softwareBitmap = Await ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
            $ocrResult = Await ($engine.RecognizeAsync($softwareBitmap)) ([Windows.Media.Ocr.OcrResult])
            $stream.Dispose()
            $ocrText = Clean-OcrText ($ocrResult.Text)
        } catch { }
    }

    $bInfo = Get-BuildingClassification -filename $fileName -location $ocrText -features @($envSub, $envCat)

    $maxId++
    $newId = "IMG-$("{0:D4}" -f $maxId)"

    $tags = [System.Collections.Generic.List[string]]::new()
    $tokens = ($fileName -replace '\.[^.]+$', '') -split '[_\-\s]+'
    foreach ($tk in $tokens) {
        $tNorm = $tk.ToLower().Trim()
        if ($tNorm.Length -gt 2 -and $tNorm -notmatch '^\d+$') {
            if (-not $tags.Contains($tNorm)) { $tags.Add($tNorm) }
        }
    }
    # Add environment tokens
    foreach ($et in ($envCat -split '_')) { if (-not $tags.Contains($et)) { $tags.Add($et) } }
    foreach ($st in ($envSub -split '_')) { if (-not $tags.Contains($st)) { $tags.Add($st) } }
    # Add building tags
    $tags.Add("building_category:$($bInfo.Category)")
    $tags.Add("building_count:$($bInfo.Count)")
    foreach ($bt in $bInfo.Types) {
        if ($bt -ne "none") { $tags.Add("building:$bt"); $tags.Add($bt) }
    }
    if ($bInfo.Category -eq "none_wilderness") {
        $tags.Add("no_buildings")
        $tags.Add("wilderness")
    } else {
        $tags.Add("has_buildings")
    }

    $cleanTags = @($tags | Select-Object -Unique | Where-Object { $_ -and $_.Length -gt 1 })

    $newRecord = [ordered]@{
        id = $newId
        relative_path = $relSlash
        filename = $fileName
        legacy_filename = $fileName
        environment_category = $envCat
        environment_subcategory = $envSub
        folder = $folderRel
        real_world_location = $ocrText
        building_category = $bInfo.Category
        building_count = $bInfo.Count
        building_types = $bInfo.Types
        biome = $envCat
        hydrology = "none"
        features = @($envSub)
        mood_atmosphere = @("atmospheric")
        tags = $cleanTags
        scene_pitch = ""
        dimensions = [ordered]@{ width = $width; height = $height }
        file_size_bytes = $fileSizeBytes
        file_size_formatted = $sizeFormatted
        format = $ext
        is_pinned = $false
        pinned_to_nodes = @()
    }

    $catalogList.Add($newRecord)
    $newEntriesCount++
}

Write-Host "Sync Complete: Added $newEntriesCount new image(s), updated $updatedEntriesCount existing image(s)."

if ($DryRun) {
    Write-Host "[DRY RUN] No files modified on disk."
    return
}

# Save updated JSON database
$jsonContent = $catalogList | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText($dbPath, $jsonContent, [System.Text.Encoding]::UTF8)
Write-Host "Saved updated database to $dbPath"

# Regenerate Markdown index
& (Join-Path $PSScriptRoot "Build-RegionalImageIndex.ps1")
Write-Host "Synchronization and index generation finished successfully."
