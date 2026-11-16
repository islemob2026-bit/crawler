# opencode-auto.ps1
# Starts OpenCode, choosing proxy vs direct based on whether the corporate
# proxy can actually be resolved and reached right now.
#
#   .\opencode-auto.ps1             -> auto: proxy if reachable, otherwise direct
#   .\opencode-auto.ps1 -NoProxy    -> force direct (hotspot)
#   .\opencode-auto.ps1 -Check      -> only print the decision, don't start OpenCode
#   .\opencode-auto.ps1 -KeepOthers -> don't close opencode processes started earlier
#   .\opencode-auto.ps1 -Force      -> close them without asking
#
# Only this process tree is affected; your system settings are untouched.

[CmdletBinding()]
param(
    [switch]$NoProxy,
    [switch]$Check,
    [switch]$KeepOthers,
    [switch]$Force,
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Rest
)

$proxyHost = "proxy.atmmobilis.local"
$proxyPort = 8080

function Test-ProxyUp {
    param([string]$HostName, [int]$Port, [int]$TimeoutMs = 2500)

    # 1) DNS must resolve: on a hotspot the corporate name does not exist.
    $addrs = $null
    try { $addrs = [System.Net.Dns]::GetHostAddresses($HostName) } catch { return $false }
    if (-not $addrs -or $addrs.Count -eq 0) { return $false }

    # 2) A TCP connection to the proxy port must actually succeed.
    foreach ($a in $addrs) {
        $client = New-Object System.Net.Sockets.TcpClient
        try {
            $task = $client.ConnectAsync($a, $Port)
            if ($task.Wait($TimeoutMs) -and $client.Connected) { return $true }
        } catch {
            # try the next address
        } finally {
            $client.Dispose()
        }
    }
    return $false
}

$useProxy = -not $NoProxy -and (Test-ProxyUp -HostName $proxyHost -Port $proxyPort)

if ($useProxy) {
    Write-Host "Proxy reachable at $proxyHost`:$proxyPort - using corporate proxy." -ForegroundColor Green
    # npm (used by npx for the Playwright MCP) reads these; they override the global npm config.
    $env:npm_config_proxy = "http://${proxyHost}:${proxyPort}"
    $env:npm_config_https_proxy = "http://${proxyHost}:${proxyPort}"
    Remove-Item Env:npm_config_noproxy -ErrorAction SilentlyContinue
} else {
    if ($NoProxy) {
        Write-Host "-NoProxy given - starting OpenCode without proxy." -ForegroundColor Yellow
    } else {
        Write-Host "Proxy unreachable - starting OpenCode without proxy." -ForegroundColor Yellow
    }
    foreach ($v in 'HTTP_PROXY','HTTPS_PROXY','http_proxy','https_proxy','ALL_PROXY','all_proxy','NODE_USE_ENV_PROXY') {
        Remove-Item "Env:$v" -ErrorAction SilentlyContinue
    }
    # Safety net for clients that still honour a proxy variable.
    $env:NO_PROXY = '*'
    $env:no_proxy = '*'
    # npm: override the globally saved proxy so npx downloads directly.
    $env:npm_config_proxy = ''
    $env:npm_config_https_proxy = ''
    $env:npm_config_noproxy = '*'
}

if ($Check) { return }

# An already-running OpenCode process keeps the network settings it was started
# with, so a new window could reconnect to a stale, proxy-bound instance.
if (-not $KeepOthers) {
    $stale = @(Get-Process -Name opencode -ErrorAction SilentlyContinue)
    if ($stale.Count -gt 0) {
        Write-Host "OpenCode processes already running:" -ForegroundColor Cyan
        $stale | ForEach-Object { "  PID {0}  started {1}" -f $_.Id, $_.StartTime }
        Write-Host "These keep the network settings they started with. Close them first?" -ForegroundColor Cyan

        $close = $Force.IsPresent
        if (-not $Force.IsPresent) {
            $ans = Read-Host "Close them? [Y/n]"
            $close = ($ans -eq '' -or $ans -match '^[Yy]')
        }

        if ($close) {
            foreach ($p in $stale) {
                try { Stop-Process -Id $p.Id -Force -ErrorAction Stop; Write-Host "  closed PID $($p.Id)" }
                catch { Write-Host "  could not close PID $($p.Id): $($_.Exception.Message)" -ForegroundColor Red }
            }
            Start-Sleep -Milliseconds 800
        } else {
            Write-Host "Keeping them. If the new session still uses the proxy, close them manually." -ForegroundColor Yellow
        }
    }
}

opencode @Rest
