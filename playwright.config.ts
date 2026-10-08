import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
 testDir:'./e2e',testIgnore:'**/._*',timeout:45000,fullyParallel:true,workers:2,
 use:{baseURL:process.env.BASE_URL||'http://127.0.0.1:4173',trace:'retain-on-failure',screenshot:'only-on-failure',reducedMotion:'reduce'},
 reporter:[['list'],['html',{open:'never'}]],
 projects:[{name:'desktop',use:{...devices['Desktop Chrome']}},{name:'mobile',use:{...devices['iPhone 13'],defaultBrowserType:'chromium'}}],
 webServer:process.env.BASE_URL?undefined:{command:'npm run preview',port:4173,reuseExistingServer:!process.env.CI,timeout:30000},
});
