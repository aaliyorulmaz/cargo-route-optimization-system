@echo off
echo ==========================================
echo Kargo Isletme Sistemi - Baslatici
echo ==========================================
echo.
echo 1. Backend (Python Flask) baslatiliyor...
start "Backend Server" cmd /k "python backend/app.py"

echo.
echo 2. Frontend (React Vite) baslatiliyor...
start "Frontend Server" cmd /k "cd frontend_kargo && npm run dev"

echo.
echo ==========================================
echo SISTEM AKTIF!
echo Tarayicidan su adrese gidin: http://localhost:5173
echo.
echo Durdurmak icin acilan siyah pencereleri kapatabilirsiniz.
echo ==========================================
pause
