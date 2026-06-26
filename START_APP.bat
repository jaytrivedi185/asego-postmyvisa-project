@echo off
echo ========================================
echo   ASEGO Travel Insurance App Starter
echo ========================================
echo.
echo Starting servers...
echo.
echo [1/2] Starting Proxy Server (Port 3001)...
start "ASEGO Proxy Server" cmd /k "cd server && npm start"
timeout /t 3 /nobreak >nul
echo.
echo [2/2] Starting React App (Port 5173)...
start "ASEGO React App" cmd /k "cd Frone && npm run dev"
echo.
echo ========================================
echo   Both servers are starting!
echo ========================================
echo.
echo Proxy Server: http://localhost:3001
echo React App: http://localhost:5173
echo.
echo Press any key to exit this window...
pause >nul
