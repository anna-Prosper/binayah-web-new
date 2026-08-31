// Add new message keys (English) and translate them into ru/ar/zh/vi/he.
// Only fills keys that are missing in each locale — safe to re-run.
import fs from "node:fs";

const KEY = (fs.readFileSync("/Users/zoop/.env.shared","utf8").split("\n").find(l=>l.startsWith("OPENAI_API_KEY="))||"").slice(15).trim();

// namespace -> key -> English source
const NEW = {
  aiChat: {
    backToAI: "Back to AI",
    liveAgent: "Live agent",
    connectedViaLiveChat: "Connected via LiveChat",
    chatWithLiveAgent: "Chat with a live agent",
    liveAgentPanelDesc: "The Binayah live chat window is open. Continue your conversation there — we'll respond as soon as an agent is available.",
    openLiveChat: "Open live chat",
    liveChatStarted: "Live chat started — auto-ends after 30 minutes of inactivity",
    liveChatEnded: "Live chat ended",
    liveChatEndedInactivity: "Live chat ended — 30 minutes of inactivity",
  },
  liveChat: {
    backToAI: "Back to AI",
    liveAgent: "Live agent",
    connectedVia: "connected via LiveChat",
    inactivityWarning: "Live chat will end in 5 minutes due to inactivity.",
    keepChatting: "Keep chatting",
    endTitle: "End live chat?",
    endBody: "You're currently chatting with a live agent. Closing this will end the session.",
    stayInChat: "Stay in chat",
    endLiveChat: "End live chat",
  },
  propertyMatcher: {
    noMatches: "No close matches in our current pipeline — but our team can short-list options for you. Reach us on WhatsApp or +971 55 509 9157.",
    errorGeneric: "Sorry, I couldn't generate recommendations right now. Please try again or contact us at +971 55 509 9157.",
    errorBusy: "Service busy, please try again.",
  },
  countryCode: {
    searchPlaceholder: "Search country or code...",
    noResults: "No results",
  },
};
// Additions that piggyback on existing namespaces with extra keys:
const PATCH = {
  propertyDetail: { namePlaceholder: "Your full name", requirementsPlaceholder: "Any specific requirements..." },
  projectDetail: { namePlaceholder: "Your full name", requirementsPlaceholder: "Any specific requirements..." },
};

const LANGS = { ru: "Russian", ar: "Arabic", zh: "Chinese (Simplified)", vi: "Vietnamese", he: "Hebrew" };

async function tr(text, lang) {
  const sys = `Translate this short real-estate website UI string to ${lang}. Return ONLY JSON {"t":"..."}. Keep brand/proper nouns in Latin (Binayah, Dubai, WhatsApp, LiveChat, AI). Keep phone numbers and {placeholders} exactly. Keep it natural and concise for a button/label/message.`;
  for (let a=1;a<=4;a++){
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${KEY}`},body:JSON.stringify({model:"gpt-4o",temperature:0.2,response_format:{type:"json_object"},messages:[{role:"system",content:sys},{role:"user",content:text}]})});
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const t=JSON.parse((await res.json()).choices[0].message.content).t;
      if(typeof t!=="string"||!t) throw new Error("empty");
      return t;
    } catch(e){ if(a===4) throw e; await new Promise(r=>setTimeout(r,1000*a)); }
  }
}

function setKey(obj, ns, k, v) {
  if (!obj[ns]) obj[ns] = {};
  if (obj[ns][k] === undefined) { obj[ns][k] = v; return true; }
  return false;
}

async function main() {
  // 1. en.json — add all keys
  const en = JSON.parse(fs.readFileSync("messages/en.json","utf8"));
  const all = { ...NEW };
  for (const [ns, keys] of Object.entries(PATCH)) all[ns] = { ...(all[ns]||{}), ...keys };
  for (const [ns, keys] of Object.entries(all)) for (const [k,v] of Object.entries(keys)) setKey(en, ns, k, v);
  fs.writeFileSync("messages/en.json", JSON.stringify(en, null, 2) + "\n");
  console.log("en.json updated");

  // 2. each other locale — translate missing keys
  for (const [loc, lang] of Object.entries(LANGS)) {
    const d = JSON.parse(fs.readFileSync(`messages/${loc}.json`,"utf8"));
    let added = 0;
    for (const [ns, keys] of Object.entries(all)) {
      for (const [k, enVal] of Object.entries(keys)) {
        if (d[ns]?.[k] !== undefined) continue;
        const t = await tr(enVal, lang);
        setKey(d, ns, k, t);
        added++;
      }
    }
    fs.writeFileSync(`messages/${loc}.json`, JSON.stringify(d, null, 2) + "\n");
    console.log(`${loc}.json +${added} keys`);
  }
  console.log("DONE");
}
main().catch(e=>{console.error(e);process.exit(1);});
