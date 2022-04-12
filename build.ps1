function Before-Process{
    $libFile = Join-Path $PSScriptRoot "src/verovio-toolkit.js"

    if(-not $(Test-Path $libFile)){
        $fetchScript = Join-Path $PSScriptRoot "fetch-lib.ps1"
        & $fetchScript
    }
}

Before-Process

$DestDir = Join-Path $PSScriptRoot "build"

if(Test-Path $DestDir){
    Remove-Item -Path $DestDir -Recurse -Force
}

New-Item -Path $DestDir -ItemType Directory

$ArchiveDir = Join-Path $DestDir "github-musical-score-extension"

New-Item -Path $ArchiveDir -ItemType Directory

# ファイルのコピー

$Src = Join-Path $PSScriptRoot "src"
Copy-Item -Path $Src -Destination $ArchiveDir -Recurse -Force

$Src = Join-Path $PSScriptRoot "icons"
Copy-Item -Path $Src -Destination $ArchiveDir -Recurse -Force

$Src = Join-Path $PSScriptRoot "manifest.json"
Copy-Item -Path $Src -Destination $ArchiveDir -Recurse -Force

$Src = Join-Path $PSScriptRoot "githubPage.js"
Copy-Item -Path $Src -Destination $ArchiveDir -Recurse -Force

# ZIP ファイルの作成
$ZipFile = Join-Path $DestDir "github-musical-score-extension.zip"
Get-ChildItem $ArchiveDir | Compress-Archive -DestinationPath $ZipFile
