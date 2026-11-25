@echo off
rem Starts the MYDL API server and the client app (Expo) in separate windows.
start "MYDL API server" /d "%~dp0api" cmd /k npm start
timeout /t 4 /nobreak >nul
start "MYDL client app" /d "%~dp0client-app" cmd /k npx expo start
