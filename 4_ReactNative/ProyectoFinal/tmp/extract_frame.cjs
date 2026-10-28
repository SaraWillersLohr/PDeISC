const { chromium } = require('playwright');
const fs = require('fs');
const mp4 = 'file:///C:/Users/Sara%20Willers/AppData/Local/Packages/Microsoft.ScreenSketch_8wekyb3d8bbwe/TempState/Recordings/20261026-1732-47.9376043.mp4';
const html = 'C:/Users/Sara Willers/Desktop/PDeISC/4_ReactNative/ProyectoFinal/tmp/extract_frame.html';
const out = 'C:/Users/Sara Willers/Desktop/PDeISC/4_ReactNative/ProyectoFinal/tmp/admin-slide2-frame.png';
fs.writeFileSync(html, `<video id="v" src="${mp4}" muted playsinline></video>`);
(async()=>{const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--allow-file-access-from-files','--disable-web-security']}); const p=await b.newPage({viewport:{width:1440,height:900}}); await p.goto('file:///C:/Users/Sara%20Willers/Desktop/PDeISC/4_ReactNative/ProyectoFinal/tmp/extract_frame.html'); await p.waitForFunction(()=>{const v=document.querySelector('video'); return v.readyState>=2 && v.videoWidth>0},null,{timeout:30000}); const dur=await p.locator('video').evaluate(v=>v.duration); await p.locator('video').evaluate(v=>{v.currentTime=Math.min(1,v.duration*.1)}); await p.waitForTimeout(600); await p.locator('video').screenshot({path:out}); console.log(JSON.stringify({duration:dur,out})); await b.close();})().catch(e=>{console.error(e);process.exit(1)});
