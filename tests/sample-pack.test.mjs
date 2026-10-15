import test from 'node:test';
import assert from 'node:assert/strict';
import {installSampleArt} from '../dist/sample-pack.js';
const sample='샘플 원문';
const make=()=>({characters:[{id:'y',name:'유나'},{id:'s',name:'시온'}],chapters:[{text:sample,scenes:[{background:''}]}],assets:[]});
test('installs six images, connects background and never re-adds deleted assets',async()=>{const p=make();await installSampleArt(p,sample,async f=>'data:'+f);assert.equal(p.assets.length,6);assert.equal(p.chapters[0].scenes[0].background,'sample-art-forest-mist.png');p.assets.pop();assert.equal(await installSampleArt(p,sample,async()=>''),false);assert.equal(p.assets.length,5);});
test('preserves user uploads and selected backgrounds',async()=>{const p=make();p.assets.push({id:'custom',kind:'character',characterId:'y',emotion:'기쁨',data:'mine'});p.chapters[0].scenes[0].background='custom-bg';await installSampleArt(p,sample,async()=> 'generated');assert.equal(p.assets.filter(a=>a.characterId==='y'&&a.emotion==='기쁨').length,1);assert.equal(p.assets[0].data,'mine');assert.equal(p.chapters[0].scenes[0].background,'custom-bg');});
test('unrelated stories stay untouched and failed loads are atomic',async()=>{const p=make();assert.equal(await installSampleArt(p,'other',async()=>''),false);assert.equal(p.assets.length,0);await assert.rejects(installSampleArt(p,sample,async()=>{throw Error('offline');}));assert.equal(p.assets.length,0);assert.equal(p.sampleArtVersion,undefined);});
