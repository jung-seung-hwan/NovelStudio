export const emotions=['기본','기쁨','슬픔','분노','두려움','놀람'];
export const uid=()=>globalThis.crypto.randomUUID();
const emotionalRules=[['분노',/분노|분노한|화를 내|격노|이를 악/],['두려움',/두려|공포|무서|떨었/],['슬픔',/슬프|슬픔|눈물|울었/],['기쁨',/기쁨|기뻐|웃었|미소/],['놀람',/놀라|놀랐|경악/]];
export function infer(text,characters){
 const character=characters.find(c=>[c.name,...c.aliases.split(',').map(x=>x.trim()).filter(Boolean)].some(n=>text.includes(n)));
 const emotion=emotionalRules.find(([,r])=>r.test(text))?.[0]||'기본';
 const condition=/부상|상처|피를 흘/.test(text)?'부상':/지쳤|피로|탈진/.test(text)?'피로':'정상';
 const skill=(character?.skills||'').split(',').map(x=>x.trim()).filter(Boolean).find(x=>text.includes(x))||'';
 return {characterId:character?.id||'',emotion,condition,skill,background:'',note:'',locked:false};
}
export function analyze(text,characters,previous=[]){
 const buckets=new Map();for(const s of previous){if(!buckets.has(s.text))buckets.set(s.text,[]);buckets.get(s.text).push(s);}
 return text.split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean).map(t=>{const old=buckets.get(t)?.shift();return old?{...old}:{id:uid(),text:t,...infer(t,characters)};});
}
export function imageFor(assets,scene){return assets.find(a=>a.kind==='character'&&a.characterId===scene.characterId&&a.emotion===scene.emotion)||assets.find(a=>a.kind==='character'&&a.characterId===scene.characterId&&a.emotion==='기본');}
export function candidates(text){const found=[...text.matchAll(/(?:^|[\s“"「])([가-힣]{2,4})(?:은|는|이가|이|가)(?=\s)/gm)].map(m=>m[1]);const excluded=new Set(['그녀','그들','우리','나는','그것','이것','하나','소리','바람','오늘','하지만']);return [...new Set(found)].filter(x=>!excluded.has(x));}
export function validateProject(p){
 if(!p||p.version!==1||typeof p.title!=='string'||!Array.isArray(p.chapters)||!p.chapters.length||!Array.isArray(p.characters)||!Array.isArray(p.assets))throw Error('지원하지 않는 프로젝트 형식입니다.');
 const str=(o,keys)=>keys.every(k=>typeof o[k]==='string');
 if(!p.characters.every(c=>str(c,['id','name','aliases','description','skills'])))throw Error('인물 데이터가 올바르지 않습니다.');
 if(!p.chapters.every(c=>str(c,['id','title','text'])&&Array.isArray(c.scenes)&&c.scenes.every(s=>str(s,['id','text','characterId','emotion','condition','skill','background','note']))))throw Error('회차 데이터가 올바르지 않습니다.');
 if(!p.assets.every(a=>str(a,['id','name','kind','characterId','emotion','data'])&&/^data:image\/(png|jpeg|webp|gif);base64,/.test(a.data)))throw Error('이미지 데이터가 올바르지 않습니다.');
 for(const group of [p.characters,p.chapters,p.assets,...p.chapters.map(c=>c.scenes)])if(new Set(group.map(x=>x.id)).size!==group.length)throw Error('중복된 ID가 있습니다.');
 return p;
}
