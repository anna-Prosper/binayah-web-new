// Fill any message keys that exist in en.json but are missing in another locale,
// by translating the English value. Safe + idempotent.
import fs from "node:fs";
const KEY=(fs.readFileSync("/Users/zoop/.env.shared","utf8").split("\n").find(l=>l.startsWith("OPENAI_API_KEY="))||"").slice(15).trim();
const LANGS={ru:"Russian",ar:"Arabic",zh:"Chinese (Simplified)",vi:"Vietnamese",he:"Hebrew"};

function flatKeys(d,p=""){let o=[];for(const[k,v]of Object.entries(d)){const nk=p?`${p}.${k}`:k;if(v&&typeof v==="object"&&!Array.isArray(v))o=o.concat(flatKeys(v,nk));else o.push(nk);}return o;}
function get(d,path){return path.split(".").reduce((a,k)=>a==null?a:a[k],d);}
function set(d,path,val){const ks=path.split(".");let o=d;for(let i=0;i<ks.length-1;i++){if(typeof o[ks[i]]!=="object"||o[ks[i]]==null)o[ks[i]]={};o=o[ks[i]];}o[ks[ks.length-1]]=val;}

async function tr(text,lang){
  if(typeof text!=="string")return text; // skip arrays/non-strings (rare)
  const sys=`Translate this short real-estate website UI string to ${lang}. Return ONLY JSON {"t":"..."}. Keep brand/proper nouns in Latin (Binayah, Dubai, AED, WhatsApp). Preserve {placeholders} and numbers exactly. Natural and concise.`;
  for(let a=1;a<=4;a++){try{
    const res=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${KEY}`},body:JSON.stringify({model:"gpt-4o",temperature:0.2,response_format:{type:"json_object"},messages:[{role:"system",content:sys},{role:"user",content:text}]})});
    if(!res.ok)throw new Error(`HTTP ${res.status}`);
    const t=JSON.parse((await res.json()).choices[0].message.content).t;
    if(typeof t!=="string"||!t)throw new Error("empty");return t;
  }catch(e){if(a===4)throw e;await new Promise(r=>setTimeout(r,1000*a));}}
}

const en=JSON.parse(fs.readFileSync("messages/en.json","utf8"));
const enKeys=flatKeys(en);
for(const[loc,lang]of Object.entries(LANGS)){
  const d=JSON.parse(fs.readFileSync(`messages/${loc}.json`,"utf8"));
  const missing=enKeys.filter(k=>get(d,k)===undefined);
  if(!missing.length){console.log(`${loc}: complete`);continue;}
  process.stdout.write(`${loc}: filling ${missing.length} ... `);
  for(const k of missing){set(d,k,await tr(get(en,k),lang));}
  fs.writeFileSync(`messages/${loc}.json`,JSON.stringify(d,null,2)+"\n");
  console.log("done");
}
console.log("ALL DONE");
