// Bundled artwork is added only to the original sample story, once.
// Existing uploads and manually selected backgrounds always take precedence.
export const sampleArt = [
  {file:'yuna-neutral.png',name:'유나 · 결의',character:'유나',emotion:'기본'},
  {file:'yuna-happy.png',name:'유나 · 따뜻한 미소',character:'유나',emotion:'기쁨'},
  {file:'yuna-flame.png',name:'유나 · 분노 / 불꽃 검격',character:'유나',emotion:'분노'},
  {file:'sion-neutral.png',name:'시온 · 평온',character:'시온',emotion:'기본'},
  {file:'sion-fear.png',name:'시온 · 두려움 / 팔 부상',character:'시온',emotion:'두려움'},
  {file:'forest-mist.png',name:'안개 숲 · 푸른 빛',character:'',emotion:'기본'},
];
export async function installSampleArt(project, sampleText, readImage){
  if(project.sampleArtVersion===1)return false;
  const sampleChapters=project.chapters.filter(c=>c.text===sampleText);
  if(!sampleChapters.length)return false;
  const additions=[];
  for(const art of sampleArt){
    const character=project.characters.find(c=>c.name===art.character);
    if(art.character&&!character)continue;
    const id='sample-art-'+art.file;
    const kind=art.character?'character':'background';
    if(project.assets.some(a=>a.id===id||(kind==='character'&&a.kind===kind&&a.characterId===character.id&&a.emotion===art.emotion)))continue;
    additions.push({id,name:art.name,kind,characterId:character?.id||'',emotion:art.emotion,data:await readImage(art.file)});
  }
  project.assets.push(...additions);
  const bg=project.assets.find(a=>a.id==='sample-art-forest-mist.png');
  if(bg)for(const c of sampleChapters)for(const s of c.scenes)if(!s.background)s.background=bg.id;
  project.sampleArtVersion=1;
  return true;
}
