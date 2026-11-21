import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import http from 'node:http';
const evidence = path.resolve('engineering/stabilization/evidence');
const staticServer=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const base=path.resolve('dist');
  let file=path.resolve(base,'.'+pathname);
  if(!file.startsWith(base+path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file=path.join(base,'index.html');
  const mime={'.js':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'};
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
  res.end(fs.readFileSync(file));
});
await new Promise(resolve=>staticServer.listen(5188,'127.0.0.1',resolve));
const backend=spawn(path.resolve('.venv/Scripts/python.exe'),['-X','utf8','engineering/stabilization/serve_local.py'],{windowsHide:true,stdio:'ignore',env:{...process.env,SCAMSHIELD_TEST_PORT:'8127'}});
const browser = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--disable-gpu', '--no-first-run', '--disable-background-networking',
  '--remote-debugging-port=9238', '--remote-debugging-address=127.0.0.1',
  '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE localhost, EXCLUDE 127.0.0.1',
  `--user-data-dir=${path.resolve('engineering/stabilization/browser-profile-chrome')}`, 'about:blank',
], { windowsHide:true, stdio:['ignore','ignore','pipe'] });
browser.stderr.on('data',data=>fs.appendFileSync(path.join(evidence,'browser_startup.log'),data));
const delay = ms => new Promise(resolve=>setTimeout(resolve,ms));
let ws;
const keepAlive=setInterval(()=>{},1000);
const results=[];
try {
  let target;
  for(let i=0;i<40;i++) {
    try { target=await (await fetch('http://127.0.0.1:9238/json/new?about:blank',{method:'PUT'})).json(); break; } catch { await delay(200); }
  }
  assert.ok(target,'Browser debugger did not start');
  ws=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
  let id=0;
  const pending=new Map();
  const events=[];
  ws.onmessage=event=>{const data=JSON.parse(event.data);if(data.id){const call=pending.get(data.id);pending.delete(data.id);if(data.error)call?.reject(new Error(data.error.message));else call?.resolve(data.result);}else events.push(data);};
  function command(method,params={}) {return new Promise((resolve,reject)=>{const messageId=++id;const timer=setTimeout(()=>{pending.delete(messageId);reject(new Error(`CDP timeout: ${method}`));},8000);pending.set(messageId,{resolve:value=>{clearTimeout(timer);resolve(value);},reject:error=>{clearTimeout(timer);reject(error);}});ws.send(JSON.stringify({id:messageId,method,params}));});}
  async function evaluate(expression) {const data=await command('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(data.exceptionDetails)throw new Error(data.exceptionDetails.text);return data.result.value;}
  async function until(expression) {for(let i=0;i<100;i++){if(await evaluate(expression))return;await delay(100);}throw new Error('Browser condition timed out: '+expression+' '+JSON.stringify(await evaluate('({url:location.href,body:document.body?.innerText.slice(0,600)})')));}
  async function navigate() {await command('Page.navigate',{url:'http://127.0.0.1:5188/investigate'});await until("Boolean(document.querySelector('textarea'))");}
  async function fill(selector,value) {await evaluate(`(()=>{const element=document.querySelector(${JSON.stringify(selector)});Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element),'value').set.call(element,${JSON.stringify(value)});element.dispatchEvent(new Event('input',{bubbles:true}));})()`);}
  async function click(text) {await evaluate(`(()=>{const button=[...document.querySelectorAll('button')].find(element=>element.textContent.includes(${JSON.stringify(text)}));if(!button)throw Error('Missing button');button.click();})()`);}
  for(let i=0;i<50;i++){try{if((await fetch('http://127.0.0.1:8127/health')).ok)break;}catch{}await delay(100);}
  await command('Page.enable');await command('Runtime.enable');
  await command('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
  await navigate();
  await fill('textarea','We are hiring an experienced software engineer to build and maintain Python services. Candidates work with a collaborative development team.');
  await evaluate("document.querySelector('button[type=submit]').click()");
  await until("document.body.innerText.includes('Show full investigation')");
  assert.ok(await evaluate("document.body.innerText.includes('not a verified probability of fraud')"));
  await evaluate("(()=>{const buttons=[...document.querySelector('[role=dialog]').querySelectorAll('button:not(:disabled)')];buttons.at(-1).focus();})()");
  await command('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
  await command('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
  assert.ok(await evaluate("(()=>{const dialog=document.querySelector('[role=dialog]');return document.activeElement===dialog.querySelector('button:not(:disabled)');})()"));
  results.push({case:'real model text flow and modal keyboard trap',passed:true});
  await click('Show full investigation');
  await until("document.body.innerText.includes('Operational review tier')");
  await command('Emulation.setDeviceMetricsOverride',{width:375,height:900,deviceScaleFactor:1,mobile:true});
  assert.ok(await evaluate('document.documentElement.scrollWidth<=window.innerWidth+1'));
  const screenshot=await command('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});
  fs.writeFileSync(path.join(evidence,'result-mobile.png'),Buffer.from(screenshot.data,'base64'));
  results.push({case:'mobile result hierarchy without horizontal overflow',passed:true});
  await navigate();
  await click('Job URL');
  await until("Boolean(document.querySelector('input[type=url]'))");
  await fill('input[type=url]','https://jobs.example/a-very-long-job-url-'+'x'.repeat(300));
  await evaluate("document.querySelector('button[type=submit]').click()");
  await until("document.body.innerText.includes('No ML score was produced')");
  assert.ok(!(await evaluate("document.querySelector('[role=dialog]').innerText.includes('0.0%')")));
  assert.ok(await evaluate('document.documentElement.scrollWidth<=window.innerWidth+1'));
  const unavailable=await command('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});
  fs.writeFileSync(path.join(evidence,'url-unavailable-mobile.png'),Buffer.from(unavailable.data,'base64'));
  results.push({case:'disabled URL flow shows failure and retry without safe/zero verdict',passed:true});
  await command('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  await command('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  await until("!document.querySelector('[role=dialog]')");
  assert.ok(await evaluate("document.querySelector('input[type=url]').value.includes('a-very-long-job-url')"));
  results.push({case:'Escape dismisses modal and preserves input for recovery',passed:true});
  await navigate();
  await fill('textarea','Preserve this job description when the running request is cancelled.');
  await command('Fetch.enable',{patterns:[{urlPattern:'*analyze/stream',requestStage:'Request'}]});
  await evaluate("document.querySelector('button[type=submit]').click()");
  for(let i=0;i<50&&!events.some(event=>event.method==='Fetch.requestPaused');i++) await delay(50);
  const paused=events.find(event=>event.method==='Fetch.requestPaused');
  assert.ok(paused,'SSE request was not intercepted');
  await command('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  await command('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  await command('Fetch.failRequest',{requestId:paused.params.requestId,errorReason:'Aborted'}).catch(()=>{});
  await command('Fetch.disable');
  await until("!document.querySelector('[role=dialog]') && !document.querySelector('button[type=submit]').disabled");
  assert.ok(await evaluate("document.querySelector('textarea').value.includes('Preserve this job description')"));
  results.push({case:'active SSE cancellation restores form and retains input',passed:true});
  const exceptions=events.filter(event=>event.method==='Runtime.exceptionThrown');
  assert.equal(exceptions.length,0);
  fs.writeFileSync(path.join(evidence,'browser_tests.json'),JSON.stringify({passed:results.length,failed:0,tests:results,runtime_exceptions:exceptions.length,external_dns:'blocked'},null,2));
  console.log(JSON.stringify({passed:results.length,failed:0}));
  await command('Browser.close').catch(()=>{});
} catch(error) {
  fs.writeFileSync(path.join(evidence,'browser_tests.json'),JSON.stringify({passed:results.length,failed:1,tests:results,error:String(error)},null,2));
  throw error;
} finally {
  clearInterval(keepAlive);ws?.close();browser.kill();backend.kill();staticServer.close();
}
