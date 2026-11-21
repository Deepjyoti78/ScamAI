// No test dependencies: transpile local TS/TSX, then test contracts and rendered routes.
import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { pathToFileURL } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

const root = process.cwd();
const output = path.join(root, 'engineering/stabilization/frontend-runtime');
function compile(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) { compile(file); continue; }
    if (!/\.tsx?$/.test(file)) continue;
    const target = path.join(output, path.relative(path.join(root, 'src'), file)).replace(/\.tsx?$/, '.js');
    fs.mkdirSync(path.dirname(target), { recursive: true });
    let source = fs.readFileSync(file, 'utf8').replaceAll('import.meta.env', '({})');
    source = source.replace(/import\s+['"][^'"]+\.css['"];?/g, '');
    source = source.replace(/import\s+(\w+)\s+from\s+['"][^'"]+\.(?:png|svg)['"];?/g, 'const $1 = "asset";');
    source = source.replace(/from (['"])(\.[^'"]+)\1/g, (_, quote, specifier) => `from ${quote}${specifier}.js${quote}`);
    fs.writeFileSync(target, ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX } }).outputText);
  }
}
compile(path.join(root, 'src'));
const values = new Map();
globalThis.sessionStorage = { setItem: (k,v) => values.set(k,v), getItem: k => values.get(k) || null };
globalThis.window = { location: { hostname: 'localhost' }, scrollTo() {} };
const service = await import(pathToFileURL(path.join(output, 'services/investigationService.js')));
const { default: Result } = await import(pathToFileURL(path.join(output, 'pages/InvestigationResultPage.js')));
const completed = { analysis_status:'completed', scoring_status:'scored', prediction:0, label:'Legitimate', risk_level:'low', fraud_probability:0.12, model_score:0.12, confidence:0.88, assessment_summary:'Uncalibrated score.', top_suspicious_signals:[], top_legitimate_signals:[] };
const failed = { ...completed, analysis_status:'unable_to_assess', scoring_status:'not_scored', prediction:null, label:null, risk_level:'unknown', fraud_probability:null, model_score:null, confidence:null, assessment_summary:'Unable to assess. Paste the description.' };
const frame = (event, data) => `event: ${event}\r\ndata: ${JSON.stringify(data)}\r\n\r\n`;
const response = text => new Response(new ReadableStream({ start(controller) { const bytes = new TextEncoder().encode(text); for(let i=0;i<bytes.length;i+=7) controller.enqueue(bytes.slice(i,i+7)); controller.close(); } }), { headers:{'Content-Type':'text/event-stream'} });

test('nullable unavailable response accepted; fabricated failure score rejected', () => {
  assert.equal(service.validateAnalysisResponse(failed).risk_level,'unknown');
  assert.throws(()=>service.validateAnalysisResponse({...failed,fraud_probability:0,risk_level:'low'}));
  assert.throws(()=>service.validateAnalysisResponse({...completed,fraud_probability:NaN}));
  assert.throws(()=>service.validateAnalysisResponse({...completed,analysis_status:undefined}));
});
test('fragmented CRLF SSE yields the validated final state', async () => {
  globalThis.fetch = async () => response(frame('stage_update',{card_id:2,status:'failed'}) + frame('complete',failed));
  const stages=[];
  const result=await service.analyzeJobPostingWithStream({job_url:'https://jobs.example/job'},s=>stages.push(s));
  assert.equal(result.analysis_status,'unable_to_assess');
  assert.equal(stages[0].status,'failed');
});
test('missing terminal event never retries or saves a successful result', async () => {
  let requests=0;
  globalThis.fetch = async () => {requests++;return response(frame('stage_update',{card_id:3,status:'in_progress'}));};
  await assert.rejects(service.analyzeJobPostingWithStream({description:'A legitimate job description.'},()=>{}),/before the investigation finished/);
  assert.equal(requests,1);
});
test('malformed and error SSE events fail explicitly', async () => {
  for(const body of ['event: complete\ndata: {bad}\n\n',frame('error',{message:'failure'})]) {
    globalThis.fetch=async()=>response(body);
    await assert.rejects(service.analyzeJobPostingWithStream({description:'Job description text.'},()=>{}));
  }
});
test('cancellation never silently restarts a request', async () => {
  const controller=new AbortController(); let requests=0;
  globalThis.fetch=async()=>{requests++;controller.abort();throw new DOMException('Aborted','AbortError');};
  await assert.rejects(service.analyzeJobPostingWithStream({description:'Job description text.'},()=>{},controller.signal),e=>e.code==='ABORTED');
  assert.equal(requests,1);
});
test('unavailable record has no percentage; legacy failed record migrates', () => {
  const record=service.buildInvestigationRecord({sourceDescription:''},failed);
  assert.equal(record.assessmentLabel,'Unable to assess');assert.equal(record.fraudProbability,null);
  const legacy={...record,id:'legacy',analysisStatus:undefined,extractionStatus:'blocked',riskLevel:'low',fraudProbability:0,prediction:0};
  service.persistInvestigation(legacy);
  assert.equal(service.getStoredInvestigation('legacy').riskLevel,'unknown');
  assert.equal(service.getStoredInvestigation('legacy').fraudProbability,null);
});
function renderRecord(record) {
  service.persistInvestigation(record);
  return renderToStaticMarkup(React.createElement(MemoryRouter,{initialEntries:[`/investigations/${record.id}`]},React.createElement(Routes,null,React.createElement(Route,{path:'/investigations/:id',element:React.createElement(Result)}))));
}
test('failed result route exposes alert and recovery without a score or low verdict', () => {
  const record=service.buildInvestigationRecord({sourceDescription:''},failed);
  const html=renderRecord(record);
  assert.match(html,/role="alert"/);assert.match(html,/not scored/);assert.match(html,/Start another analysis/);
  assert.doesNotMatch(html,/0\.00%|Lower Risk|Model-Estimated Fraud Probability|Model Confidence/);
});
test('scored result clearly labels uncalibrated output and separate triage', () => {
  const html=renderRecord(service.buildInvestigationRecord({sourceDescription:'Job description.'},completed));
  assert.match(html,/not a verified probability of fraud/);assert.match(html,/Operational review tier/);
  assert.doesNotMatch(html,/Statistical certainty|Prediction Confidence|P\(Fraud/);
});
