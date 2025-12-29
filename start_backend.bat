@echo off
echo Starting NoteHub Backend...
cd server
if not exist .env (
    echo WARNING: .env file not found! Copying .env.example to .env
    copy .env.example .env
    echo Please edit .env with your database password!
)
npm install
npm run dev
pause
