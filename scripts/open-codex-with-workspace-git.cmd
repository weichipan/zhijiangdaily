@echo off
setlocal
set "WORKSPACE=%~dp0.."
set "GIT_CMD=%WORKSPACE%\tools\git\cmd"
set "GIT_BIN=%WORKSPACE%\tools\git\bin"
set "PATH=%GIT_CMD%;%GIT_BIN%;%PATH%"
set "GIT=%GIT_CMD%\git.exe"

echo Workspace git enabled: %GIT%
call "%GIT%" --version

set "CODEX_EXE=%LOCALAPPDATA%\OpenAI\Codex\bin\codex.exe"
if exist "%CODEX_EXE%" (
  start "" "%CODEX_EXE%"
  exit /b 0
)

echo Codex executable not found at:
echo   %CODEX_EXE%
echo You can still use this shell to launch tools with the workspace PATH.
exit /b 0
