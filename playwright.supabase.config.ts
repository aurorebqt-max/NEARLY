import { defineConfig, devices } from '@playwright/test';
import { execFileSync } from 'node:child_process';
const status = JSON.parse(execFileSync('npx', ['supabase', 'status', '-o', 'json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
if (!/^http:\/\/(127\.0\.0\.1|localhost):54321$/.test(status.API_URL)) throw new Error('Local Supabase required');
export default defineConfig({
  testDir: './tests-backend', workers: 1, timeout: 60000, expect: { timeout: 15000 }, reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:5175', trace: 'off' },
  webServer: {
    command: 'npm run dev -- --port 5175 --strictPort', url: 'http://127.0.0.1:5175', reuseExistingServer: false,
    env: { VITE_BACKEND_MODE: 'supabase', VITE_SUPABASE_URL: status.API_URL, VITE_SUPABASE_PUBLISHABLE_KEY: status.ANON_KEY || status.PUBLISHABLE_KEY },
  },
  projects: [{ name: 'supabase-mobile', use: { ...devices['Pixel 7'] } }],
});
