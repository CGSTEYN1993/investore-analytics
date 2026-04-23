# Installs / removes a Windows Scheduled Task that launches the InvestOre
# trading agent at user logon. Run from any PowerShell prompt:
#
#   .\install_autostart.ps1            # install (default)
#   .\install_autostart.ps1 -Uninstall # remove
#
# The task runs as the current user, only when interactive (so IB Gateway
# can show its window if it ever needs to), and restarts on failure.

[CmdletBinding()]
param(
    [switch]$Uninstall
)

$ErrorActionPreference = 'Stop'
$TaskName = 'InvestOre Trading Agent'
$AgentDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BatPath  = Join-Path $AgentDir 'run_agent.bat'

if ($Uninstall) {
    if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
        Write-Host "Removed scheduled task '$TaskName'."
    } else {
        Write-Host "No task named '$TaskName' found."
    }
    return
}

if (-not (Test-Path $BatPath)) {
    throw "run_agent.bat not found at $BatPath"
}

# Remove any existing instance so re-running the installer is idempotent.
if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

$action  = New-ScheduledTaskAction -Execute $BatPath -WorkingDirectory $AgentDir
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RestartCount 5 `
    -RestartInterval (New-TimeSpan -Minutes 1) `
    -ExecutionTimeLimit ([TimeSpan]::Zero)

# Run only when the user is logged on (interactive) so the agent can talk to
# the local IB Gateway window if needed.
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Description 'Launches the InvestOre trading agent (broker proxy) at user logon.' | Out-Null

Write-Host "Installed scheduled task '$TaskName'."
Write-Host "Starting it now..."
Start-ScheduledTask -TaskName $TaskName
Start-Sleep -Seconds 2
$state = (Get-ScheduledTask -TaskName $TaskName).State
Write-Host "Task state: $state"
Write-Host "Logs: $env:LOCALAPPDATA\InvestOre\agent.log"
