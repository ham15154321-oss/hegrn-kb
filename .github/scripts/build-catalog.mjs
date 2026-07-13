// 自動掃描 hegrn-kb 整個 repo（含子資料夾），重寫 catalog.md
// 每份一行，格式：主題名稱|關鍵字,關鍵字,...|raw網址   （n8n 的 Pick MD 逐行讀）
// 由 .github/workflows/build-catalog.yml 在每次 push 時自動執行。
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const REPO   = process.env.KB_REPO   || process.env.GITHUB_REPOSITORY || 'ham15154321-oss/hegrn-kb';
const BRANCH = process.env.KB_BRANCH || process.env.GITHUB_REF_NAME    || 'main';
const ROOT   = process.env.KB_ROOT   || '.';
const RAW = (p) => `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${p.split('/').map(encodeURIComponent).join('/')}`;

// 不當成知識檔的 meta 檔（不會列進 catalog）
const EXCLUDE = new Set(['catalog.md','readme.md','_format-guide.md','_add-knowledge-sop.md']);

function walk(dir, base=''){
  let out=[];
  for(const name of readdirSync(dir)){
    if(name.startsWith('.')) continue;                 // 跳過 .git / .github 等
    const full=join(dir,name), rel=base?base+'/'+name:name, st=statSync(full);
    if(st.isDirectory()) out=out.concat(walk(full, rel));
    else if(/\.md$/i.test(name)) out.push(rel);
  }
  return out;
}

function parse(path, raw){
  let title='', fmName='', fmDesc='';
  const fm=raw.match(/^---\s*[\r\n]([\s\S]*?)[\r\n]---/);
  if(fm){
    const body=fm[1];
    const nm=body.match(/^\s*name:\s*(.+)$/m); if(nm) fmName=nm[1].trim();
    const dm=body.match(/description:\s*([\s\S]*?)(?:\n[a-zA-Z_]+:\s|\n?$)/); if(dm) fmDesc=dm[1];
  }
  // 標題：優先第一個中文 # 標題 → frontmatter name → 檔名
  const h=raw.match(/^#\s+(.+)$/m); if(h) title=h[1].trim();
  if(!title && fmName) title=fmName;
  if(title && fmName && !/[一-鿿]/.test(title) && /[一-鿿]/.test(fmName)) title=fmName;
  if(!title) title=fmName || path.split('/').pop().replace(/\.md$/i,'');

  // 關鍵字：優先取 frontmatter description 裡的「」詞；沒 frontmatter 才退回掃全文，並設上限避免爆量
  const kw=new Set();
  const src=fmDesc||raw; const re=/「([^」]{1,25})」/g; let m;
  while((m=re.exec(src))!==null){
    const s=m[1].trim();
    if(s && !/[|,，]/.test(s)) kw.add(s);
    if(kw.size>=30) break;
  }
  const folder = path.includes('/')?path.split('/')[0]:'';
  if(folder){ kw.add(folder); if(/^hegrn-/.test(folder)) kw.add(folder.replace(/^hegrn-/,'')); }
  return { title:title.replace(/\|/g,'/'), keywords:[...kw].slice(0,32) };
}

const files=walk(ROOT).filter(p=>{
  if(/(^|\/)references\//i.test(p)) return false;      // 跳過 references 細節檔，只收主檔
  const base=p.split('/').pop().toLowerCase();
  if(EXCLUDE.has(base)) return false;
  if(base.startsWith('_')) return false;               // 跳過 _ 開頭的說明檔
  return true;
});

const lines=[];
for(const f of files){
  const raw=readFileSync(join(ROOT,f),'utf8');
  const {title,keywords}=parse(f, raw);
  if(!keywords.length) continue;                       // 沒任何關鍵字就略過
  lines.push(`${title}|${keywords.join(',')}|${RAW(f)}`);
}
lines.sort();
writeFileSync(join(ROOT,'catalog.md'), lines.join('\n')+'\n');
console.log(`✅ catalog.md 產生 ${lines.length} 筆（repo=${REPO}@${BRANCH}）`);
