# Run PowerShell as Administrator, then:
#   cd C:\Users\HP\eleganz-courses
#   .\scripts\open-dev-firewall.ps1

$rules = @(
  @{ Name = 'Eleganz Vite 5173'; Port = 5173 },
  @{ Name = 'Eleganz API 3001'; Port = 3001 }
)

foreach ($rule in $rules) {
  $existing = Get-NetFirewallRule -DisplayName $rule.Name -ErrorAction SilentlyContinue
  if ($existing) {
    Write-Host "Rule already exists: $($rule.Name)"
    continue
  }

  New-NetFirewallRule `
    -DisplayName $rule.Name `
    -Direction Inbound `
    -Action Allow `
    -Protocol TCP `
    -LocalPort $rule.Port | Out-Null

  Write-Host "Added firewall rule: $($rule.Name) (port $($rule.Port))"
}

Write-Host ""
Write-Host "Done. On your phone (same Wi-Fi), open:"
Write-Host "  http://192.168.100.110:5173"
Write-Host ""
Write-Host "If your PC IP changed, run: ipconfig"
Write-Host "Look for IPv4 under Wi-Fi — use that address instead."
