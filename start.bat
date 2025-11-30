@echo off
REM 启动 json-server
start "" /B cmd /c "npx json-server --watch "%~dp0db.json%" --port 3000"

REM 等几秒确保 json-server 已启动
timeout /t 3 /nobreak > nul

REM 启动前端服务（后台运行）
start "" /B cmd /c "cd /d "%~dp0dist" && npx serve -s . -l 5173"

REM 打开默认浏览器
start "" http://localhost:5173
