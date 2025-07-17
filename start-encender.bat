@echo off
echo Starting Encender Fashion Ecommerce Platform...
echo.

echo Starting Medusa Backend...
start "Medusa Backend" cmd /k "cd encender-medusa && npm run dev"

echo Waiting 10 seconds for backend to start...
timeout /t 10 /nobreak > nul

echo Starting Medusa Admin Panel...
start "Medusa Admin" cmd /k "cd encender-medusa && npx medusa-admin dev"

echo Waiting 10 seconds for admin to start...
timeout /t 10 /nobreak > nul

echo Starting Custom Frontend...
start "Custom Frontend" cmd /k "npm run dev"

echo.
echo Services are starting up...
echo.
echo Access URLs:
echo   Custom Frontend: http://localhost:3000 or http://localhost:3001
echo   Medusa Admin: http://localhost:7000
echo   Medusa Backend API: http://localhost:9000
echo.
echo Admin Login:
echo   Email: admin@encenderfashion.com
echo   Password: admin123
echo.
pause 