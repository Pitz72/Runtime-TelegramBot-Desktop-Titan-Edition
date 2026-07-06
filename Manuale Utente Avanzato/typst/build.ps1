# build.ps1 — Compila il Manuale Utente Avanzato di Runtime TelegramBot · Titan
# Edition in PDF.
#
#   pwsh ./build.ps1               genera i capitoli da Markdown e compila -> PDF (it)
#   pwsh ./build.ps1 -Lang en     compila un'altra lingua (cartella <lang>/)
#   pwsh ./build.ps1 -All         compila tutte le lingue disponibili
#   pwsh ./build.ps1 -Watch       ricompila a ogni salvataggio (una lingua)
#   pwsh ./build.ps1 -Png         esporta anche le pagine in pag-{p}.png (anteprima)
#
# Sorgenti Markdown: "Manuale Utente Avanzato/<lang>/NN-slug.md" (nomi file
# identici in tutte le lingue; cambia solo il contenuto).
# Richiede Typst (>= 0.13) e pandoc.
param([switch]$Watch, [switch]$Png, [string]$Lang = "it", [switch]$All)

$root  = $PSScriptRoot
$fonts = Join-Path $root 'fonts'
$src   = Join-Path $root 'manuale.typ'
# La project root è la cartella del manuale (un livello sopra typst/): serve a
# Typst per leggere ../vignette e ../screenshots, che stanno fuori da typst/.
$manRoot = Split-Path $root -Parent

# Nome file PDF localizzato per lingua.
$FileNames = @{
  it = "Manuale-Utente-Avanzato-Titan-IT.pdf"
  en = "Titan-Advanced-User-Manual-EN.pdf"
  fr = "Titan-Manuel-Utilisateur-FR.pdf"
  de = "Titan-Benutzerhandbuch-DE.pdf"
  es = "Titan-Manual-de-Usuario-ES.pdf"
  pt = "Titan-Manual-do-Utilizador-PT.pdf"
  ru = "Titan-Rukovodstvo-Polzovatelya-RU.pdf"
  zh = "Titan-Yonghu-Shouce-ZH.pdf"
}

function Build-One([string]$L) {
  Write-Host "Genero i capitoli Typst da Markdown ($L)..." -ForegroundColor Cyan
  python (Join-Path $root 'build-typst.py') $L
  if ($LASTEXITCODE -ne 0) { Write-Error "Conversione Markdown->Typst fallita ($L)"; exit 1 }

  $outName = $FileNames[$L]
  if (-not $outName) { $outName = "Manuale-Utente-Avanzato-Titan-$($L.ToUpper()).pdf" }
  $pdf = Join-Path $root $outName

  typst compile --root $manRoot --font-path $fonts --input "lang=$L" $src $pdf
  if ($LASTEXITCODE -eq 0) { Write-Host "OK -> $pdf" -ForegroundColor Green }
  else { Write-Error "Compilazione Typst fallita ($L)"; exit 1 }
  return $pdf
}

if ($All) {
  # Compila ogni lingua che ha una cartella sorgente non vuota.
  foreach ($L in @('it','en','fr','de','es','pt','ru','zh')) {
    $dir = Join-Path $manRoot $L
    if ((Test-Path $dir) -and (Get-ChildItem $dir -Filter '*.md' -ErrorAction SilentlyContinue)) {
      Build-One $L | Out-Null
    } else {
      Write-Host "Salto '$L' (nessun sorgente in $dir)" -ForegroundColor DarkYellow
    }
  }
  exit 0
}

if ($Watch) {
  python (Join-Path $root 'build-typst.py') $Lang
  typst watch --root $manRoot --font-path $fonts --input "lang=$Lang" $src (Join-Path $root 'manuale.pdf')
} else {
  $pdf = Build-One $Lang
  if ($Png) {
    typst compile --root $manRoot --font-path $fonts --input "lang=$Lang" --format png --ppi 150 $src (Join-Path $root 'pag-{p}.png')
  }
}
