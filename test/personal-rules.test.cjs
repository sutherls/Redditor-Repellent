const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const { webcrypto } = require('node:crypto');
require('../src/patterns.js');
const { personalRule, personalRules, personalMatch } = globalThis.RedditorRepellentPatterns;
test('literal phrases normalize case/punctuation with explicit match scope and word boundaries', () => {
  const exact = personalRule('Your meme, sir!', 'exact');
  assert.ok(personalMatch([exact], 'YOUR MEME SIR.'));
  assert.equal(personalMatch([exact], 'Your meme sir is fine'), null);
  const contains = personalRule('my axe', 'contains');
  assert.ok(personalMatch([contains], 'And my axe!'));
  assert.equal(personalMatch([contains], 'And my axes'), null);
  assert.equal(personalMatch([personalRule('/evil.*/', 'exact')], 'evil anything'), null);
  assert.equal(personalRule('!!!', 'exact'), null);
  assert.equal(personalRule('a'.repeat(301), 'exact'), null);
  assert.equal(personalRule('hello', 'regex'), null);
  assert.deepEqual(personalRules([null, { id:'ok',text:'hello',mode:'exact' }, {text:'bad',mode:'exact'}]).map(r=>r.id), ['ok']);
});
function background() {
  let listener, fail = false;const stored = { personalRules: [], lifetime: 0 };
  const context = vm.createContext({ crypto:webcrypto, chrome:{
    storage:{local:{get:async()=>structuredClone(stored), set:async patch=>{if(fail)throw new Error('Storage failed');Object.assign(stored,structuredClone(patch));}}},
    runtime:{onMessage:{addListener(fn){listener=fn;}}},action:{}
  }});
  for(const file of ['patterns.js','background.js']) vm.runInContext(fs.readFileSync(path.join(__dirname,'../src',file),'utf8'),context);
  return { stored, fail(value){fail=value;}, send:msg=>new Promise(resolve=>listener({type:'rgc:personal-rule',...msg},{},resolve)) };
}
test('concurrent saves serialize; duplicate save and undo cannot remove someone else’s rule', async()=>{
  const bg=background();
  const [a,b]=await Promise.all([bg.send({action:'add',text:'My axe',mode:'exact'}),bg.send({action:'add',text:'Your meme',mode:'contains'})]);
  assert.equal(bg.stored.personalRules.length,2);assert.ok(a.added&&b.added);
  const duplicate=await bg.send({action:'add',text:'MY AXE!',mode:'exact'});
  assert.equal(duplicate.added,false);assert.equal(duplicate.rule.id,a.rule.id);
  await bg.send({action:'remove',id:a.rule.id});
  assert.deepEqual(bg.stored.personalRules.map(r=>r.id),[b.rule.id]);
});
test('failed writes report error, preserve saved data and allow retry', async()=>{
  const bg=background();bg.fail(true);
  assert.match((await bg.send({action:'add',text:'Test phrase',mode:'exact'})).error,/Storage failed/);
  assert.equal(bg.stored.personalRules.length,0);bg.fail(false);
  assert.ok((await bg.send({action:'add',text:'Test phrase',mode:'exact'})).added);
  assert.ok((await bg.send({action:'add',text:'',mode:'exact'})).error);
});
test('rule limit is enforced without blocking removal or existing duplicates',async()=>{
  const bg=background();
  for(let i=0;i<100;i++)await bg.send({action:'add',text:`phrase ${i}`,mode:'exact'});
  assert.match((await bg.send({action:'add',text:'overflow',mode:'exact'})).error,/100-rule/);
  assert.equal((await bg.send({action:'add',text:'phrase 0',mode:'exact'})).added,false);
  await bg.send({action:'remove',id:bg.stored.personalRules[0].id});
  assert.ok((await bg.send({action:'add',text:'replacement',mode:'exact'})).added);
});
