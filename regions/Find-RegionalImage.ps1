<#
================================================================================
CREATOR STUDIO COMPASS HEADER (AUTO-GENERATED VIA build_suite.js)
SURFACE: CLI Scenery Recommendation Tool
WIKI PAGE: wiki/pages/regions/Find-RegionalImage.ps1.html (Markdown Source: wiki/src/files/regions/Find-RegionalImage.ps1.md)
AUTHORITATIVE SPECIFICATIONS:
  - regions/IMAGE_ENGINE_SPEC.md
DATA PROVENANCE:
  - regions/regional_image_catalog.json
CRITICAL INSTRUCTION:
  CLI tool to recommend images by environment tags and building categories directly from the terminal.
================================================================================
#>
# Find-RegionalImage.ps1
# High-Speed Scene Recommendation, Building Search & Tag Pinning Tool for Regional Visual Assets
[CmdletBinding()]
param(
    [Parameter(Position=0)]
    [string]$Query,

    [Parameter()]
    [Alias('Category')]
    [string]$Environment,

    [Parameter()]
    [string]$Subcategory,

    [Parameter()]
    [string]$BuildingCategory,

    [Parameter()]
    [string]$BuildingType,

    [Parameter()]
    [string]$BuildingCount,

    [Parameter()]
    [string[]]$Tags = @(),

    [Parameter()]
    [string]$Hydrology,

    [Parameter()]
    [string]$Biome,

    [Parameter()]
    [object]$Node,

    [Parameter()]
    [string]$PinImageId,

    [Parameter()]
    [object]$PinToNode,

    [Parameter()]
    [int]$Limit = 5,

    [Parameter()]
    [switch]$MarkdownOnly
)

$baseDir = $PSScriptRoot
$dbPath = Join-Path $baseDir "regional_image_catalog.json"
if (-not (Test-Path $dbPath)) {
    Write-Error "Database not found at $dbPath."
    return
}

$rawJson = [System.IO.File]::ReadAllText($dbPath, [System.Text.Encoding]::UTF8)
$catalog = $rawJson | ConvertFrom-Json

# Handle Image Pinning to a Node
if ($PinImageId -and $PSBoundParameters.ContainsKey('PinToNode')) {
    $nodeStr = [string]$PinToNode
    $targetItem = $catalog | Where-Object { $_.id -eq $PinImageId -or $_.filename -like "*$PinImageId*" } | Select-Object -First 1
    if (-not $targetItem) {
        Write-Error "Image '$PinImageId' not found in database."
        return
    }

    if (-not $targetItem.pinned_to_nodes) {
        $targetItem.pinned_to_nodes = @()
    }
    $currentPinned = [System.Collections.Generic.List[string]]::new()
    foreach ($p in $targetItem.pinned_to_nodes) { $currentPinned.Add([string]$p) }
    if (-not $currentPinned.Contains($nodeStr)) {
        $currentPinned.Add($nodeStr)
    }
    $targetItem.pinned_to_nodes = @($currentPinned)
    $targetItem.is_pinned = $true

    $newJson = $catalog | ConvertTo-Json -Depth 10
    [System.IO.File]::WriteAllText($dbPath, $newJson, [System.Text.Encoding]::UTF8)
    Write-Host "Successfully pinned image $($targetItem.id) ($($targetItem.filename)) to Node #$nodeStr!" -ForegroundColor Green
    return
}

# Normalize search terms
$searchTerms = [System.Collections.Generic.List[string]]::new()
if ($Query) {
    $tokens = $Query.ToLower() -split '[\s,]+' | Where-Object { $_ -and $_.Length -gt 1 }
    foreach ($t in $tokens) { $searchTerms.Add($t) }
}
foreach ($t in $Tags) {
    if ($t) {
        $sub = $t.ToLower() -split '[\s,]+'
        foreach ($s in $sub) { if ($s) { $searchTerms.Add($s) } }
    }
}

# Normalize Environment aliases
$envNorm = if ($Environment) { $Environment.ToLower().Trim() } else { "" }
if ($envNorm -match 'water|lake|river|stream|creek|swamp|marsh|cascade|rapids') { $envNorm = "waters_and_wetlands" }
elseif ($envNorm -match 'mountain|highland|peak|foothill|scree|dome|glacier') { $envNorm = "mountains_and_highlands" }
elseif ($envNorm -match 'valley|gorge|canyon|cliff|escarpment|road') { $envNorm = "valleys_and_canyons" }
elseif ($envNorm -match 'forest|wood|tree|fey|redwood|canopy') { $envNorm = "forests_and_woodlands" }
elseif ($envNorm -match 'plain|grass|savanna|meadow') { $envNorm = "plains_and_grasslands" }
elseif ($envNorm -match 'coast|beach|island|cove|headland|surf|lagoon') { $envNorm = "coasts_and_islands" }
elseif ($envNorm -match 'settle|bastion|castle|fort|town|citadel|harbor|port|temple|monastery|church') { $envNorm = "settlements_and_bastions" }
elseif ($envNorm -match 'ruin|pyramid|vault|crypt|cistern|cave_dwelling') { $envNorm = "ancient_ruins_and_vaults" }

# Normalize Building Category
$bCatNorm = if ($BuildingCategory) { $BuildingCategory.ToLower().Trim() } else { "" }
if ($bCatNorm -match '^none|^wild') { $bCatNorm = "none_wilderness" }
elseif ($bCatNorm -match '^iso|castle|lone|single|keep') { $bCatNorm = "isolated_structure" }
elseif ($bCatNorm -match '^civil|bridge|boardwalk|pass|light') { $bCatNorm = "civil_infrastructure" }
elseif ($bCatNorm -match '^dense|^town|^citadel|^village|^city') { $bCatNorm = "dense_settlement" }
elseif ($bCatNorm -match '^ruin|^pyramid|^ancient|^stepwell') { $bCatNorm = "ancient_ruins" }
elseif ($bCatNorm -match '^sub|^cave|^vault|^cistern|^crypt') { $bCatNorm = "subterranean_vault" }

# Score each image in catalog
$scored = foreach ($item in $catalog) {
    $score = 0
    $matchReasons = [System.Collections.Generic.List[string]]::new()

    # Environment filter / boost
    if ($envNorm) {
        if ($item.environment_category -eq $envNorm -or $item.folder -like "*$envNorm*") {
            $score += 25
            $matchReasons.Add("Category: $($item.environment_category)")
        } else {
            $score -= 30
        }
    }

    # Subcategory filter
    if ($Subcategory) {
        $subNorm = $Subcategory.ToLower()
        if ($item.environment_subcategory -like "*$subNorm*") {
            $score += 20
            $matchReasons.Add("Subcategory: $($item.environment_subcategory)")
        }
    }

    # Building Category filter
    if ($bCatNorm) {
        if ($item.building_category -eq $bCatNorm) {
            $score += 25
            $matchReasons.Add("Building Cat: $($item.building_category)")
        } else {
            $score -= 30
        }
    }

    # Building Type filter
    if ($BuildingType) {
        $btNorm = $BuildingType.ToLower()
        $btMatch = $false
        foreach ($bt in $item.building_types) {
            if ($bt.ToLower() -like "*$btNorm*") { $btMatch = $true; break }
        }
        if ($btMatch -or $item.tags -contains "building:$btNorm" -or $item.tags -contains $btNorm) {
            $score += 20
            $matchReasons.Add("Building Type: $BuildingType")
        }
    }

    # Building Count filter
    if ($BuildingCount) {
        if ($item.building_count -eq $BuildingCount) {
            $score += 15
            $matchReasons.Add("Building Count: $BuildingCount")
        }
    }

    # Hydrology filter
    if ($Hydrology) {
        $hNorm = $Hydrology.ToLower()
        if ($item.hydrology.ToLower() -eq $hNorm -or $item.tags -contains $hNorm) {
            $score += 15
            $matchReasons.Add("Hydrology: $Hydrology")
        }
    }

    # Biome filter
    if ($Biome) {
        $bNorm = $Biome.ToLower()
        if ($item.biome.ToLower() -like "*$bNorm*") {
            $score += 12
            $matchReasons.Add("Biome: $($item.biome)")
        }
    }

    # Node Pinning boost / filter
    if ($PSBoundParameters.ContainsKey('Node')) {
        $nodeStr = [string]$Node
        if ($item.pinned_to_nodes -and ($item.pinned_to_nodes -contains $nodeStr -or $item.pinned_to_nodes -contains [int]$nodeStr)) {
            $score += 35
            $matchReasons.Add("Pinned to Node #$nodeStr")
        }
    }

    # Search terms / tags matching
    $matchedTagList = [System.Collections.Generic.List[string]]::new()
    foreach ($term in $searchTerms) {
        $termMatched = $false

        # Direct tag match
        if ($item.tags -contains $term) {
            $score += 10
            $matchedTagList.Add($term)
            $termMatched = $true
        }
        # Partial tag match
        elseif ($item.tags -match "$term") {
            $score += 5
            $matchedTagList.Add("~$term")
            $termMatched = $true
        }

        # Filename match
        if ($item.filename.ToLower() -like "*$term*" -or $item.legacy_filename.ToLower() -like "*$term*") {
            $score += 8
            if (-not $termMatched) { $matchedTagList.Add("file:$term") }
            $termMatched = $true
        }

        # Real world location match
        if ($item.real_world_location -and $item.real_world_location.ToLower() -like "*$term*") {
            $score += 6
            if (-not $termMatched) { $matchedTagList.Add("loc:$term") }
            $termMatched = $true
        }

        # Features / Pitch match
        if ($item.features -and ($item.features -join " ").ToLower() -like "*$term*") {
            $score += 5
            if (-not $termMatched) { $matchedTagList.Add("feat:$term") }
            $termMatched = $true
        }
        if ($item.scene_pitch -and $item.scene_pitch.ToLower() -like "*$term*") {
            $score += 4
            $termMatched = $true
        }
    }

    if ($matchedTagList.Count -gt 0) {
        $matchReasons.Add("Matches: " + ($matchedTagList -join ", "))
    }

    # If general query or tags provided, must have positive score
    if ($score -gt 0) {
        [PSCustomObject]@{
            Score = $score
            Item = $item
            Reasons = ($matchReasons -join " | ")
        }
    }
}

$results = @($scored | Sort-Object -Property Score -Descending | Select-Object -First $Limit)

if (-not $results -or $results.Count -eq 0) {
    Write-Host "No images matched query (Query: '$Query', Env: '$Environment', Building: '$BuildingCategory', Tags: $($Tags -join ', '))." -ForegroundColor DarkGray
    return
}

if ($MarkdownOnly) {
    foreach ($r in $results) {
        $it = $r.Item
        $fullPath = ("file:///" + ($PSScriptRoot -replace '\\', '/') + "/" + $it.relative_path).Replace(" ", "%20")
        $caption = if ($it.real_world_location) { "$($it.filename) ($($it.real_world_location))" } else { $it.filename }
        Write-Output "![$caption]($fullPath)"
    }
    return
}

Write-Host "`n=== FOUND $($results.Count) RECOMMENDED REGIONAL IMAGES ===" -ForegroundColor Cyan
$rank = 1
foreach ($r in $results) {
    $it = $r.Item
    $fullPath = ("file:///" + ($PSScriptRoot -replace '\\', '/') + "/" + $it.relative_path).Replace(" ", "%20")
    $localPath = Join-Path $PSScriptRoot ($it.relative_path -replace '/', '\')

    Write-Host "`n#$rank [Score: $($r.Score)] ID: $($it.id) - $($it.filename)" -ForegroundColor Yellow
    Write-Host "  Folder / Subcat:  $($it.folder)"
    Write-Host "  Building Presence: $($it.building_category) [Count: $($it.building_count)] - Types: $(($it.building_types -join ', '))" -ForegroundColor Cyan
    Write-Host "  Hydrology/Biome:  $($it.hydrology) | $($it.biome)"
    if ($it.real_world_location) {
        Write-Host "  Real Subject:     $($it.real_world_location)" -ForegroundColor Green
    }
    if ($it.pinned_to_nodes -and $it.pinned_to_nodes.Count -gt 0) {
        Write-Host "  Pinned To Nodes:  $($it.pinned_to_nodes -join ', ')" -ForegroundColor Magenta
    }
    Write-Host "  Match Why:        $($r.Reasons)"
    if ($it.scene_pitch) {
        Write-Host "  Scene Pitch:      `"$($it.scene_pitch)`"" -ForegroundColor DarkGray
    }
    Write-Host "  Markdown Link:    ![$($it.filename)]($fullPath)" -ForegroundColor White
    Write-Host "  Local Disk Path:  $localPath"
    $rank++
}
Write-Host ""
