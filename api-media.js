'use strict';

// API adapter for the current Sayan media endpoints.
const axios = require('axios');

function findMediaUrl(payload, kind='video') {
 const out=[], seen=new Set();
 const keys=/^(url|download|download_url|downloadUrl|media|media_url|mediaUrl|video|video_url|videoUrl|audio|audio_url|audioUrl|link|src|hd|sd|mp4|mp3)$/i;
 function walk(v,k='') {
  if (!v) return;
  if (typeof v === 'string') {
   if (/^https?:\/\//i.test(v) && keys.test(k) && !/thumbnail|image|avatar/i.test(k) && !seen.has(v)) { seen.add(v); out.push({url:v,key:k}); }
   return;
  }
  if (Array.isArray(v)) { v.forEach(x=>walk(x,k)); return; }
  if (typeof v === 'object') Object.entries(v).forEach(([a,b])=>walk(b,a));
 }
 walk(payload);
 const audio=/audio|mp3|music/i.test(kind);
 return (audio ? out.find(x=>/audio|mp3|download|url/i.test(x.key)) : out.find(x=>/video|mp4|download|media|url|link/i.test(x.key)))?.url || out[0]?.url || null;
}
async function downloadMediaBytes(url,maxBytes=80*1024*1024){
 if(!url||!/^https?:\/\//i.test(url))throw new Error('API did not return a valid media URL');
 const r=await axios.get(url,{responseType:'arraybuffer',timeout:120000,maxContentLength:maxBytes,maxBodyLength:maxBytes,headers:{'User-Agent':'Mozilla/5.0 RAHUL-AI-MINI/1.0',Accept:'*/*'},validateStatus:s=>s>=200&&s<300});
 const buffer=Buffer.from(r.data),contentType=String(r.headers['content-type']||'').toLowerCase();
 if(!buffer.length||buffer.length>maxBytes)throw new Error('Downloaded media is empty or too large');
 if(contentType.includes('text/html')||contentType.includes('application/json'))throw new Error('URL returned webpage/API data, not media');
 return {buffer,contentType};
}
async function getSayanMedia(endpoint,params){
 const allowed = new Set(['music','video','insta']);
 if (!allowed.has(endpoint)) throw new Error('Unsupported media endpoint');
 const apiUrl = 'https://api.sayan-nexuswork.workers.dev/' + endpoint;
 const r=await axios.get(apiUrl,{params,timeout:30000,headers:{Accept:'application/json','User-Agent':'RAHUL-AI-MINI/1.0'}});
 const data=r.data;
 if(!data || data.status!=='success' || data.success===false) throw new Error(data?.message || data?.error || 'Media API did not return a successful result');
 let url = typeof data.url==='string' && /^https?:\/\//i.test(data.url) ? data.url : null;
 if (!url && Array.isArray(data.urls)) url = data.urls.find(item => typeof item==='string' && /^https?:\/\//i.test(item)) || null;
 if (!url) url=findMediaUrl(data, endpoint==='music'?'audio':'video');
 if(!url)throw new Error('No downloadable media URL found in API response');
 return {data,url};
}

module.exports = { findMediaUrl, downloadMediaBytes, getSayanMedia };
