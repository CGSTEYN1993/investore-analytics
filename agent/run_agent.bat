@echo off
REM Launches the InvestOre trading agent using the bundled venv.
REM Logs go to %LOCALAPPDATA%\InvestOre\agent.log so issues can be diagnosed
REM after Windows startup. Pythonw.exe runs without a console window.

setlocal
set "AGENT_DIR=%~dp0"
set "LOG_DIR=%LOCALAPPDATA%\InvestOre"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
set "LOG_FILE=%LOG_DIR%\agent.log"

REM Append a startup timestamp so log rolls forward across launches.
echo. >> "%LOG_FILE%"
echo ===== Agent starting %DATE% %TIME% ===== >> "%LOG_FILE%"

cd /d "%AGENT_DIR%"
"%AGENT_DIR%.venv\Scripts\pythonw.exe" "%AGENT_DIR%agent.py" >> "%LOG_FILE%" 2>&1
endlocal
