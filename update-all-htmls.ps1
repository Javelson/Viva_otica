# Script para atualizar todos os HTMLs com recursos locais
# Execute no PowerShell:

# Copiar Supabase para todas as pastas de páginas
$pages = @('admin', 'admin/pages')
foreach ($page in $pages) {
    $dir = "viva-optica\viva-optica\$page"
    if (Test-Path $dir) {
        if (-not (Test-Path "$dir\js\libs")) {
            New-Item -Path "$dir\js\libs" -ItemType Directory -Force
        }
        Copy-Item "viva-optica\viva-optica\js\libs\supabase.min.js" "$dir\js\libs\" -Force
        Write-Host "Copiado para $dir"
    }
}

Write-Host "Execução completa!"
Write-Host "Próximo passo: Atualizar cada HTML manualmente para usar os recursos locais"