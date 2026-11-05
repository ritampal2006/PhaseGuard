@echo off
echo Starting PhaseGuard Industrial Power Monitoring System...
echo 1. Launching Unified Server (FastAPI + React Dashboard on Port 8000)...
start /b py backend\main.py
timeout /t 5 >nul
echo 2. Launching Cloudflare Tunnel for live public HTTPS demo...
start "" "%TEMP%\cloudflared.exe" tunnel --url http://127.0.0.1:8000
echo PhaseGuard is now running!
echo Local URL: http://localhost:8000
pause

