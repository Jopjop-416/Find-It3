import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const isWindows = process.platform === 'win32';
const venvPythonWin = join(process.cwd(), 'ai-service', '.venv', 'Scripts', 'python.exe');
const venvPythonUnix = join(process.cwd(), 'ai-service', '.venv', 'bin', 'python');

let pythonBin = 'python';
if (isWindows && existsSync(venvPythonWin)) {
  pythonBin = venvPythonWin;
} else if (!isWindows && existsSync(venvPythonUnix)) {
  pythonBin = venvPythonUnix;
}

const args = ['-m', 'uvicorn', '--app-dir', 'ai-service', 'app.main:app', '--reload', '--port', '8000'];

console.log(`[AI Service] Starting using: ${pythonBin}`);

const child = spawn(pythonBin, args, {
  stdio: 'inherit',
});

child.on('error', (err) => {
  console.error('[AI Service] Gagal menjalankan AI Service:', err.message);
  console.error('[AI Service] Pastikan Python dan dependencies di folder ai-service sudah terpasang.');
});

child.on('exit', (code) => {
  if (code !== null && code !== 0) {
    console.log(`[AI Service] Selesai dengan kode keluar ${code}`);
  }
});

process.on('SIGINT', () => {
  child.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  child.kill('SIGTERM');
  process.exit(0);
});
