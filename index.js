const express = require('express');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    downloadMediaMessage,
    Browsers,
    delay
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const axios = require('axios');
const yts = require('yt-search');
const QRCode = require('qrcode');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { exec } = require('child_process');
const FormData = require('form-data');

const app = express();
const PORT = process.env.PORT || 8080;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let sock = null;

// Hosting health check.
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok', service: 'RAHUL-AI-MINI' }));

// Responsive neon-glass WhatsApp pairing portal.
app.get('/', (_req, res) => {
    res.send(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#07111f">
<title>RAHUL-AI-MINI · Pairing Portal</title>
<style>
:root{color-scheme:dark;--cyan:#38bdf8;--green:#4ade80;--muted:#94a3b8}
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:22px;background:#07111f;color:#f8fafc;font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;overflow-x:hidden}
body:before,body:after{content:"";position:fixed;width:300px;height:300px;border-radius:50%;filter:blur(115px);opacity:.25;pointer-events:none;z-index:-1}
body:before{background:#0284c7;left:4%;top:8%}body:after{background:#22c55e;right:2%;bottom:5%}
.card{width:100%;max-width:450px;padding:30px 25px;border-radius:28px;background:linear-gradient(145deg,rgba(15,28,48,.97),rgba(8,18,33,.94));border:1px solid rgba(125,211,252,.28);box-shadow:0 28px 80px #0008,0 0 45px #0ea5e912;backdrop-filter:blur(18px)}
.brand{display:inline-flex;align-items:center;gap:9px;border:1px solid #38bdf866;background:#0284c722;border-radius:99px;padding:10px 16px;color:#7dd3fc;font-weight:900;letter-spacing:1px;box-shadow:0 0 24px #0284c72b}
.eyebrow{display:flex;align-items:center;justify-content:center;gap:8px;margin:22px 0 12px;color:#86efac;font-size:10px;font-weight:900;letter-spacing:1.8px}
.dot{height:7px;width:7px;border-radius:50%;background:var(--green);box-shadow:0 0 12px var(--green)}
h1{font-size:clamp(27px,7vw,35px);letter-spacing:-1px;text-align:center;margin:0 0 10px}h1 span{color:var(--cyan)}
.lead{text-align:center;line-height:1.7;color:var(--muted);font-size:13px;margin:0 auto 24px;max-width:320px}
label{display:block;font-size:12px;font-weight:750;color:#cbd5e1;margin:0 0 8px 3px}
input{width:100%;padding:15px;border-radius:13px;border:1px solid #334155;background:#081323;color:#fff;font-size:16px;text-align:center;outline:none;transition:.2s}
input:focus{border-color:var(--cyan);box-shadow:0 0 0 3px #38bdf81c}
.hint{font-size:11px;color:#64748b;margin:8px 0 17px 3px}
button{width:100%;border:0;border-radius:13px;padding:15px;background:linear-gradient(110deg,#0369a1,#2563eb,#0ea5e9);background-size:200% 100%;color:white;font-weight:850;font-size:15px;cursor:pointer;box-shadow:0 9px 24px #0284c73d;transition:transform .2s,filter .2s}
button:hover{transform:translateY(-2px);filter:brightness(1.12)}button:disabled{opacity:.65;cursor:wait;transform:none}
.error{display:none;color:#fecaca;background:#7f1d1d30;border:1px solid #f8717133;border-radius:12px;padding:11px;margin-top:13px;font-size:12px;line-height:1.5}
.code-box{display:none;margin-top:17px;padding:17px;background:#081323;border:1px dashed #4ade8080;border-radius:15px;text-align:center}
.code-label{font-size:10px;letter-spacing:1.5px;font-weight:850;color:#7dd3fc;margin-bottom:10px}
#pairCode{font-size:28px;color:var(--green);letter-spacing:5px;text-shadow:0 0 13px #4ade8055;cursor:pointer}
.code-note{font-size:11px;color:var(--muted);line-height:1.6;margin:11px 0 0}
.steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:22px}
.step{padding:12px 9px;border-radius:13px;background:#0f1c30;border:1px solid #94a3b81c}
.step b{display:block;color:#7dd3fc;font-size:11px;margin-bottom:6px}.step span{display:block;color:#94a3b8;font-size:10px;line-height:1.5}
footer{text-align:center;margin-top:23px;color:#64748b;font-size:10px;letter-spacing:1.3px}
@media(max-width:360px){.card{padding:25px 17px}.steps{gap:5px}.step{padding:10px 6px}}
</style>
</head>
<body><main class="card">
<div style="text-align:center"><div class="brand">✦ RAHUL-AI-MINI</div></div>
<div class="eyebrow"><i class="dot"></i> WHATSAPP CONNECTION</div>
<h1>Pair your device<span>.</span></h1>
<p class="lead">Connect your WhatsApp account with a pairing code in a few simple steps.</p>
<label for="phone">WhatsApp number</label>
<input id="phone" type="tel" inputmode="numeric" autocomplete="tel" placeholder="Country code + number" aria-describedby="phoneHint">
<div id="phoneHint" class="hint">Include your country calling code. Enter digits only.</div>
<button id="pairButton" type="button">⚡ Generate pairing code</button>
<div class="error" id="errorMessage" role="alert"></div>
<div id="codeContainer" class="code-box" aria-live="polite">
<div class="code-label">YOUR PAIRING CODE · TAP TO COPY</div><div id="pairCode" title="Tap to copy">-----</div>
<p class="code-note">Open WhatsApp → Linked devices → Link with phone number, then enter this code.</p>
</div>
<div class="steps"><div class="step"><b>01 / ENTER</b><span>Full number with country code</span></div><div class="step"><b>02 / GENERATE</b><span>Request a pairing code</span></div><div class="step"><b>03 / LINK</b><span>Enter it in WhatsApp</span></div></div>
<footer>RAHUL-AI-MINI · BUILT FOR WHATSAPP</footer>
</main>
<script>
const phoneInput=document.getElementById('phone'),button=document.getElementById('pairButton'),errorBox=document.getElementById('errorMessage'),codeBox=document.getElementById('codeContainer'),pairCode=document.getElementById('pairCode');
button.addEventListener('click',async()=>{
 const phone=phoneInput.value.trim().replace(/\\D/g,''); errorBox.style.display='none';codeBox.style.display='none';
 if(phone.length<8||phone.length>15){errorBox.textContent='Enter a valid number including country code (8–15 digits).';errorBox.style.display='block';return}
 button.disabled=true;button.textContent='⏳ Generating code…';
 try{const response=await fetch('/pair?number='+encodeURIComponent(phone),{headers:{Accept:'application/json'},cache:'no-store'});const data=await response.json();if(!response.ok||!data.code)throw new Error(data.error||'Could not generate a code. Please retry.');pairCode.textContent=data.code;codeBox.style.display='block'}
 catch(error){errorBox.textContent=error.message||'Connection error. Please retry.';errorBox.style.display='block'}
 finally{button.disabled=false;button.textContent='⚡ Generate pairing code'}
});
pairCode.addEventListener('click',async()=>{if(!pairCode.textContent||pairCode.textContent==='-----')return;try{await navigator.clipboard.writeText(pairCode.textContent);pairCode.title='Copied to clipboard'}catch(_){}})
</script></body></html>`);
});

// Pairing endpoint: no default phone number and no sensitive error details in responses.
app.get('/pair', async (req, res) => {
    const cleanedNumber = String(req.query.number || '').replace(/\\D/g, '');
    res.set('Cache-Control', 'no-store');
    if (cleanedNumber.length < 8 || cleanedNumber.length > 15) {
        return res.status(400).json({ error: 'Enter a valid phone number including country code (8–15 digits).' });
    }
    if (!sock) return res.status(503).json({ error: 'WhatsApp is still starting. Wait a few seconds and retry.' });
    try {
        if (!sock.authState.creds.registered) {
            await delay(1200);
            const code = await sock.requestPairingCode(cleanedNumber);
            return res.json({ code, status: 'success' });
        }
        return res.status(409).json({ error: 'This bot session is already linked to WhatsApp.' });
    } catch (err) {
        console.error('Pairing code generation failed:', err.message);
        return res.status(500).json({ error: 'Pairing failed. Check the number and WhatsApp connection, then retry.' });
    }
});

app.listen(PORT, () => console.log(`🌐 RAHUL-AI-MINI server listening on port ${PORT}`));

// Bot settings.
const startTime = Date.now();
let isAlwaysOnline = false;
let isAutoStatusView = true;
let isAutoReact = true;
let isAutoDL = true;
let PREFIX = '.';

// Media downloader adapters. Third-party endpoints may change independently of this project.
async function getFastVideoUrl(url) {
    const encodedUrl = encodeURIComponent(url);
    try {
        const res = await axios.get(`https://api.tinew.tech/api/downloader/fbdl?url=${encodedUrl}`, { timeout: 10000 });
        if (res.data?.result?.hd || res.data?.result?.sd) return res.data.result.hd || res.data.result.sd;
    } catch (_) {}
    try {
        const res = await axios.get(`https://api.dreaded.site/api/fbdl?url=${encodedUrl}`, { timeout: 10000 });
        if (res.data?.data?.hd || res.data?.data?.sd || res.data?.data?.url) return res.data.data.hd || res.data.data.sd || res.data.data.url;
    } catch (_) {}
    try {
        const res = await axios.get(`https://api.vreden.web.id/api/download/fbdl?url=${encodedUrl}`, { timeout: 10000 });
        const link = res.data?.result?.response?.video_hd || res.data?.result?.response?.video_sd;
        if (link) return link;
    } catch (_) {}
    return null;
}

// Arithmetic parser: supports numbers, parentheses and basic arithmetic operators.
function calculateExpression(expression) {
    if (!expression || expression.length > 120 || !/^[0-9+\\-*/%.()]+$/.test(expression)) throw new Error('Invalid expression');
    let index = 0;
    function parseNumber() {
        if (expression[index] === '+' || expression[index] === '-') {
            const sign = expression[index++] === '-' ? -1 : 1;
            return sign * parseNumber();
        }
        if (expression[index] === '(') {
            index++;
            const value = parseAddSub();
            if (expression[index++] !== ')') throw new Error('Missing closing parenthesis');
            return value;
        }
        const start = index;
        while (index < expression.length && /[0-9.]/.test(expression[index])) index++;
        const raw = expression.slice(start, index);
        if (!raw || (raw.match(/\\./g) || []).length > 1) throw new Error('Invalid number');
        const value = Number(raw);
        if (!Number.isFinite(value)) throw new Error('Invalid number');
        return value;
    }
    function parseMulDiv() {
        let value = parseNumber();
        while (['*', '/', '%'].includes(expression[index])) {
            const op = expression[index++], rhs = parseNumber();
            if ((op === '/' || op === '%') && rhs === 0) throw new Error('Division by zero');
            value = op === '*' ? value * rhs : op === '/' ? value / rhs : value % rhs;
        }
        return value;
    }
    function parseAddSub() {
        let value = parseMulDiv();
        while (expression[index] === '+' || expression[index] === '-') {
            const op = expression[index++], rhs = parseMulDiv();
            value = op === '+' ? value + rhs : value - rhs;
        }
        return value;
    }
    const result = parseAddSub();
    if (index !== expression.length || !Number.isFinite(result)) throw new Error('Invalid expression');
    return result;
}

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version } = await fetchLatestBaileysVersion();
    sock = makeWASocket({ version, logger: pino({ level: 'silent' }), printQRInTerminal: false, auth: state, browser: Browsers.ubuntu('Chrome') });
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('⚠️ Connection closed. Reconnecting...', shouldReconnect);
            if (shouldReconnect) connectToWhatsApp();
        } else if (connection === 'open') {
            console.log('✅ RAHUL-AI-MINI is online and connected.');
            try {
                const userJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                const startMessage = `🤖 *RAHUL-AI-MINI CONNECTED SUCCESSFULLY!*

👑 *Owner:* Rahul Master
📌 *Prefix:* [ ${PREFIX} ]
⚡ *Status:* Online & Ready
🟢 *Always Online:* ${isAlwaysOnline ? 'ON' : 'OFF'}
👀 *Auto Status View:* ${isAutoStatusView ? 'ON' : 'OFF'}
❤️ *Auto React:* ${isAutoReact ? 'ON' : 'OFF'}
🚀 *Auto Download:* ${isAutoDL ? 'ON' : 'OFF'}

💡 Type ${PREFIX}menu or ${PREFIX}ping to test commands!
✨ *Powered by RAHUL-AI*`;
                await sock.sendMessage(userJid, { text: startMessage });
            } catch (err) { console.error('Start message error:', err.message); }
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        try {
            const msg = m.messages[0];
            if (!msg?.message) return;
            const from = msg.key.remoteJid;
            const text = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || '';

            if (isAutoReact && !msg.key.fromMe && from !== 'status@broadcast') {
                const emojis = ['❤️', '🔥', '⚡', '🤖', '👍', '⭐', '✨'];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                await sock.sendMessage(from, { react: { text: randomEmoji, key: msg.key } });
            }
            if (isAlwaysOnline && from) await sock.sendPresenceUpdate('available', from);
            if (from === 'status@broadcast') {
                if (isAutoStatusView) await sock.readMessages([msg.key]);
                return;
            }

            // Automatic public-video link handling.
            if (isAutoDL && !text.startsWith(PREFIX)) {
                const urlMatch = text.match(/(https?:\\/\\/[^\\s]+)/g);
                if (urlMatch) {
                    const url = urlMatch[0];
                    if (['facebook.com','fb.watch','instagram.com','youtu.be','youtube.com','tiktok.com'].some(domain => url.includes(domain))) {
                        await sock.sendMessage(from, { text: '🚀 *Fast AutoDL:* Downloading video…' }, { quoted: msg });
                        const videoUrl = await getFastVideoUrl(url);
                        if (videoUrl) {
                            await sock.sendMessage(from, { video: { url: videoUrl }, caption: '⚡ *RAHUL-AI-MINI AutoDL Success!*' }, { quoted: msg });
                            return;
                        }
                        await sock.sendMessage(from, { text: '❌ Download failed. Check that the link is public and try again.' }, { quoted: msg });
                    }
                }
            }

            const isGroup = from.endsWith('@g.us');
            const isCmd = text.startsWith(PREFIX);
            const body = isCmd ? text.slice(PREFIX.length).trim() : text.trim();
            const command = body.toLowerCase().split(/\\s+/)[0];
            const args = body.split(/\\s+/).slice(1).join(' ');

            // Reply "send" to a quoted WhatsApp status to return status media.
            const contextInfo = msg.message.extendedTextMessage?.contextInfo;
            if (contextInfo?.quotedMessage) {
                const quotedMsg = contextInfo.quotedMessage;
                const isStatusReply = contextInfo.remoteJid === 'status@broadcast';
                const triggerWords = ['send', 'send me', 'dya', 'pathva', 'dakhva', 'sənd', 'पाठव', 'दे'];
                if (isStatusReply && triggerWords.some(word => text.trim().toLowerCase().includes(word))) {
                    await sock.sendMessage(from, { text: '⏳ Status media fetch in progress…' }, { quoted: msg });
                    try {
                        const mediaBuffer = await downloadMediaMessage({ message: quotedMsg }, 'buffer', {});
                        if (quotedMsg.videoMessage) {
                            await sock.sendMessage(from, { video: mediaBuffer, caption: quotedMsg.videoMessage.caption || '🎬 Here is your status video!', mimetype: 'video/mp4' }, { quoted: msg });
                        } else if (quotedMsg.imageMessage) {
                            await sock.sendMessage(from, { image: mediaBuffer, caption: quotedMsg.imageMessage.caption || '🖼️ Here is your status image!' }, { quoted: msg });
                        }
                    } catch (err) {
                        console.error('Status media error:', err.message);
                        await sock.sendMessage(from, { text: '❌ Could not retrieve that status media.' }, { quoted: msg });
                    }
                }
            }

            if (!isCmd && command !== 'ping' && command !== 'menu') return;

            // The original update command is retained; run only inside the bot directory.
            if (command === 'update' || command === 'autoupdate') {
                await sock.sendMessage(from, { text: '🔄 *Checking for updates from GitHub…*' }, { quoted: msg });
                exec('git pull', async (err, stdout) => {
                    if (err) return sock.sendMessage(from, { text: `❌ *Update failed:* ${err.message}` }, { quoted: msg });
                    if (stdout.includes('Already up to date')) return sock.sendMessage(from, { text: '✅ *Bot is already up to date!*' }, { quoted: msg });
                    await sock.sendMessage(from, { text: `✅ *Update complete!*\\n\\n${stdout}\\n\\nRestarting…` }, { quoted: msg });
                    process.exit(0);
                });
            }
            else if (command === 'alwaysonline' || command === 'autoonline') {
                if (args.toLowerCase() === 'on') isAlwaysOnline = true;
                else if (args.toLowerCase() === 'off') isAlwaysOnline = false;
                else return sock.sendMessage(from, { text: `Use: ${PREFIX}alwaysonline on/off` }, { quoted: msg });
                await sock.sendMessage(from, { text: `✅ Always online: ${isAlwaysOnline ? 'ON' : 'OFF'}` }, { quoted: msg });
            }
            else if (command === 'statusview') {
                if (args.toLowerCase() === 'on') isAutoStatusView = true;
                else if (args.toLowerCase() === 'off') isAutoStatusView = false;
                else return sock.sendMessage(from, { text: `Use: ${PREFIX}statusview on/off` }, { quoted: msg });
                await sock.sendMessage(from, { text: `✅ Auto status view: ${isAutoStatusView ? 'ON' : 'OFF'}` }, { quoted: msg });
            }
            else if (command === 'autoreact') {
                if (args.toLowerCase() === 'on') isAutoReact = true;
                else if (args.toLowerCase() === 'off') isAutoReact = false;
                else return sock.sendMessage(from, { text: `Use: ${PREFIX}autoreact on/off` }, { quoted: msg });
                await sock.sendMessage(from, { text: `✅ Auto react: ${isAutoReact ? 'ON' : 'OFF'}` }, { quoted: msg });
            }
            else if (command === 'autodl') {
                if (args.toLowerCase() === 'on') isAutoDL = true;
                else if (args.toLowerCase() === 'off') isAutoDL = false;
                else return sock.sendMessage(from, { text: `✅ Auto download: ${isAutoDL ? 'ON' : 'OFF'}\\nUsage: ${PREFIX}autodl on/off` }, { quoted: msg });
            }
            else if (command === 'setprefix') {
                if (!args.trim() || args.trim().length > 3 || /\\s/.test(args.trim())) return sock.sendMessage(from, { text: '❌ Prefix must be 1–3 non-space characters.' }, { quoted: msg });
                PREFIX = args.trim();
                await sock.sendMessage(from, { text: `✅ Prefix changed to: ${PREFIX}` }, { quoted: msg });
            }
            else if (command === 'ping') {
                const startedAt = Date.now();
                await sock.sendMessage(from, { text: '╭━━〔 ⚡ RAHUL-AI-MINI 〕━━╮\\n┃ ✦ Checking system pulse…\\n╰━━━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg });
                const latency = Date.now() - startedAt;
                const uptimeMs = Date.now() - startTime;
                const uptimeHours = Math.floor(uptimeMs / 3600000);
                const uptimeMinutes = Math.floor((uptimeMs % 3600000) / 60000);
                const uptimeSeconds = Math.floor((uptimeMs % 60000) / 1000);
                const pingText = '╭━━━〔 ⚡ *SYSTEM PULSE* 〕━━━╮\\n' +
                    '┃ 🤖 *Bot:* RAHUL-AI-MINI\\n' +
                    '┃ 🚀 *Speed:* ' + latency + ' ms\\n' +
                    '┃ 🟢 *Status:* ONLINE\\n' +
                    '┃ ⏱️ *Uptime:* ' + uptimeHours + 'h ' + uptimeMinutes + 'm ' + uptimeSeconds + 's\\n' +
                    '┃ 🔖 *Prefix:* ' + PREFIX + '\\n' +
                    '┃ ✨ *Engine:* Baileys\\n' +
                    '╰━━━━━━━━━━━━━━━━━━━━━━╯\\n' +
                    '▰▰▰▰▰▰▰▰▰▰ 100%\\n⚡ *FAST • STABLE • READY*';
                await sock.sendMessage(from, { text: pingText }, { quoted: msg });
            }
            else if (command === 'menu' || command === 'help') {
                const uptimeMs = Date.now() - startTime;
                const uptimeHours = Math.floor(uptimeMs / 3600000);
                const uptimeMinutes = Math.floor((uptimeMs % 3600000) / 60000);
                const menuStyles = [
                    { name: 'NEON CYBER', header: '╭━━〔 ⚡ RAHUL-AI-MINI 〕━━╮', line: '━━━━━━━━━━━━━━━━━━━━━━', footer: '╰━━━━━━━━━━━━━━━━━━━━━━╯' },
                    { name: 'MIDNIGHT GLASS', header: '┏━━〔 ✦ RAHUL-AI-MINI ✦ 〕━━┓', line: '══════════════════════', footer: '┗━━━━━━━━━━━━━━━━━━━━━━┛' },
                    { name: 'VOLT DASHBOARD', header: '◈━━━〔 🚀 RAHUL-AI-MINI 〕━━━◈', line: '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬', footer: '◈━━━━━━━━━━━━━━━━━━━━━━◈' },
                    { name: 'CLASSIC ELITE', header: '╔═══〔 🤖 RAHUL-AI-MINI 〕═══╗', line: '──────────────────────', footer: '╚══════════════════════╝' }
                ];
                const style = menuStyles[Math.floor(Math.random() * menuStyles.length)];
                const menuText = style.header + '\\n' +
                    '┃ ✨ *SMART WHATSAPP ASSISTANT*\\n' +
                    '┃ 🎨 *Theme:* ' + style.name + '\\n' +
                    '┃ 🟢 *Status:* ONLINE\\n' +
                    '┃ 👑 *Developer:* Rahul Master\\n' +
                    '┃ 🔖 *Prefix:* [ ' + PREFIX + ' ]\\n' +
                    '┃ ⏱️ *Uptime:* ' + uptimeHours + 'h ' + uptimeMinutes + 'm\\n' + style.line + '\\n' +
                    '┃ ⚙️ *BOT CONTROL*\\n' +
                    '┃ ' + PREFIX + 'ping — System pulse\\n' +
                    '┃ ' + PREFIX + 'uptime — Runtime details\\n' +
                    '┃ ' + PREFIX + 'update — Update from GitHub\\n' +
                    '┃ ' + PREFIX + 'alwaysonline on/off\\n' +
                    '┃ ' + PREFIX + 'statusview on/off\\n' +
                    '┃ ' + PREFIX + 'autoreact on/off\\n' +
                    '┃ ' + PREFIX + 'autodl on/off\\n' +
                    '┃ ' + PREFIX + 'setprefix <symbol>\\n' + style.line + '\\n' +
                    '┃ 🎬 *MEDIA STUDIO*\\n' +
                    '┃ ' + PREFIX + 'play <song> — Find music\\n' +
                    '┃ ' + PREFIX + 'mp3 <YouTube link> — Media lookup\\n' +
                    '┃ ' + PREFIX + 'tourl — Media to link\\n' +
                    '┃ ' + PREFIX + 'sticker / ' + PREFIX + 's — Create sticker\\n' +
                    '┃ Reply "send" to a status — Fetch media\\n' + style.line + '\\n' +
                    '┃ 🧠 *SMART TOOLS*\\n' +
                    '┃ ' + PREFIX + 'ai <text> — AI chat\\n' +
                    '┃ ' + PREFIX + 'google <query> — Web search\\n' +
                    '┃ ' + PREFIX + 'weather <city> — Weather report\\n' +
                    '┃ ' + PREFIX + 'qr <text> — QR generator\\n' +
                    '┃ ' + PREFIX + 'calc <math> — Safe calculator\\n' +
                    '┃ ' + PREFIX + 'quote — Daily motivation\\n' + style.line + '\\n' +
                    '┃ 👥 *GROUP TOOLS*\\n' +
                    '┃ ' + PREFIX + 'tagall [message]\\n' +
                    '┃ ' + PREFIX + 'mute — Admin-only mode\\n' +
                    '┃ ' + PREFIX + 'unmute — Open group chat\\n' + style.footer + '\\n' +
                    '✦ *POWERED BY RAHUL-AI* ✦';
                await sock.sendMessage(from, { text: menuText }, { quoted: msg });
            }
            else if (command === 'play' || command === 'song') {
                if (!args) return sock.sendMessage(from, { text: `❌ Add a song name. Example: ${PREFIX}play Kesariya` }, { quoted: msg });
                await sock.sendMessage(from, { text: `🔍 Searching YouTube for "${args}"…` }, { quoted: msg });
                try {
                    const searchResult = await yts(args);
                    const song = searchResult.videos[0];
                    if (!song) return sock.sendMessage(from, { text: '❌ No song found.' }, { quoted: msg });
                    const infoText = `🎵 *RAHUL-AI-MINI MUSIC* 🎵
📌 *Title:* ${song.title}
⏱️ *Duration:* ${song.timestamp}
👀 *Views:* ${song.views}
🔗 *Link:* ${song.url}`;
                    await sock.sendMessage(from, { text: infoText }, { quoted: msg });
                } catch (err) {
                    await sock.sendMessage(from, { text: '❌ Search failed. Try again later.' }, { quoted: msg });
                }
            }
            else if (command === 'mp3') {
                if (!args) return sock.sendMessage(from, { text: `❌ Provide a YouTube link. Example: ${PREFIX}mp3 https://youtube.com/...` }, { quoted: msg });
                await sock.sendMessage(from, { text: '⏳ Audio extraction request received…' }, { quoted: msg });
                // This command retains compatibility with the current downloader helper service.
                try {
                    const videoUrl = await getFastVideoUrl(args);
                    if (!videoUrl) return sock.sendMessage(from, { text: '❌ Could not resolve a downloadable media URL.' }, { quoted: msg });
                    await sock.sendMessage(from, { text: `🔗 Download source: ${videoUrl}` }, { quoted: msg });
                } catch (_) {
                    await sock.sendMessage(from, { text: '❌ Audio lookup failed.' }, { quoted: msg });
                }
            }
            else if (command === 'tourl') {
                const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
                const hasMedia = msg.message.imageMessage || msg.message.videoMessage || quoted?.imageMessage || quoted?.videoMessage;
                if (!hasMedia) return sock.sendMessage(from, { text: `❌ Send or reply to an image/video with ${PREFIX}tourl.` }, { quoted: msg });
                try {
                    const mediaBuffer = await downloadMediaMessage(quoted ? { message: quoted } : msg, 'buffer', {});
                    const form = new FormData();
                    form.append('file', mediaBuffer, 'upload.bin');
                    const uploadRes = await axios.post('https://telegra.ph/upload', form, { headers: { ...form.getHeaders() } });
                    if (uploadRes.data?.[0]?.src) {
                        const fileUrl = 'https://telegra.ph' + uploadRes.data[0].src;
                        await sock.sendMessage(from, { text: `🔗 *MEDIA UPLOADED SUCCESSFULLY!*\\n\\n📌 *URL:* ${fileUrl}` }, { quoted: msg });
                    } else await sock.sendMessage(from, { text: '❌ Upload failed. Try again.' }, { quoted: msg });
                } catch (err) {
                    await sock.sendMessage(from, { text: '❌ Upload failed: ' + err.message }, { quoted: msg });
                }
            }
            else if (command === 'qr') {
                if (!args) return sock.sendMessage(from, { text: `❌ Enter text or a URL. Example: ${PREFIX}qr Hello Rahul` }, { quoted: msg });
                try {
                    const qrBuffer = await QRCode.toBuffer(args);
                    await sock.sendMessage(from, { image: qrBuffer, caption: `🔲 QR code for: ${args}` }, { quoted: msg });
                } catch (_) { await sock.sendMessage(from, { text: '❌ QR generation failed.' }, { quoted: msg }); }
            }
            else if (command === 'calc') {
                if (!args) return sock.sendMessage(from, { text: `❌ Enter a math expression. Example: ${PREFIX}calc 50 + 50 * 2` }, { quoted: msg });
                try {
                    const result = calculateExpression(args.replace(/\\s+/g, ''));
                    await sock.sendMessage(from, { text: `🧮 *Calculator*\\n\\n❓ Expression: ${args}\\n✅ Answer: ${result}` }, { quoted: msg });
                } catch (_) { await sock.sendMessage(from, { text: '❌ Invalid expression. Supported: +, -, *, /, %, parentheses.' }, { quoted: msg }); }
            }
            else if (command === 'quote') {
                const quotes = [
                    '“Success begins with consistent effort.” — Rahul Master',
                    '“Small progress every day adds up to big results.”',
                    '“Hard work today builds a stronger tomorrow.”',
                    '“Every failure is a step toward learning.”'
                ];
                await sock.sendMessage(from, { text: '💡 *Daily Quote*\\n\\n' + quotes[Math.floor(Math.random() * quotes.length)] }, { quoted: msg });
            }
            else if (command === 'weather') {
                if (!args) return sock.sendMessage(from, { text: `❌ Enter a city. Example: ${PREFIX}weather Mumbai` }, { quoted: msg });
                try {
                    const weatherRes = await axios.get(`https://wttr.in/${encodeURIComponent(args)}?format=j1`, { timeout: 10000 });
                    const current = weatherRes.data.current_condition[0], area = weatherRes.data.nearest_area[0];
                    const weatherInfo = `🌤️ *Weather Report*
📍 *City:* ${area.areaName[0].value}, ${area.country[0].value}
🌡️ *Temperature:* ${current.temp_C} °C
💧 *Humidity:* ${current.humidity}%
🌬️ *Wind:* ${current.windspeedKmph} km/h
☁️ *Condition:* ${current.weatherDesc[0].value}`;
                    await sock.sendMessage(from, { text: weatherInfo }, { quoted: msg });
                } catch (_) { await sock.sendMessage(from, { text: '❌ Could not fetch weather. Try again.' }, { quoted: msg }); }
            }
            else if (command === 'google' || command === 'g') {
                if (!args) return sock.sendMessage(from, { text: `❌ Enter a search query. Example: ${PREFIX}google India` }, { quoted: msg });
                try {
                    const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(args)}&format=json`;
                    const res = await axios.get(searchUrl, { timeout: 10000 });
                    const resultText = res.data.AbstractText || res.data.RelatedTopics?.[0]?.Text || 'No summary found.';
                    await sock.sendMessage(from, { text: `🌐 *Search Results*\\n\\n📌 Query: ${args}\\n\\n📝 ${resultText}` }, { quoted: msg });
                } catch (_) { await sock.sendMessage(from, { text: '❌ Search failed. Try again.' }, { quoted: msg }); }
            }
            else if (command === 'ai') {
                if (!args) return sock.sendMessage(from, { text: `❌ Enter a question. Example: ${PREFIX}ai Hello` }, { quoted: msg });
                try {
                    const res = await axios.get(`https://api.simsimi.vn/v1/simtalk?text=${encodeURIComponent(args)}&lc=en`, { timeout: 12000 });
                    await sock.sendMessage(from, { text: '🤖 *AI Answer*\\n\\n' + (res.data?.message || 'No answer was returned.') }, { quoted: msg });
                } catch (_) { await sock.sendMessage(from, { text: '🤖 I am RAHUL-AI-MINI. The chat service is unavailable right now.' }, { quoted: msg }); }
            }
            else if (command === 'sticker' || command === 's') {
                const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
                const isImage = msg.message.imageMessage || quoted?.imageMessage;
                if (!isImage) return sock.sendMessage(from, { text: `❌ Reply to an image with ${PREFIX}sticker.` }, { quoted: msg });
                try {
                    const media = await downloadMediaMessage(quoted ? { message: quoted } : msg, 'buffer', {});
                    const sticker = new Sticker(media, { pack: 'RAHUL-AI-MINI', author: 'Rahul Master', type: StickerTypes.FULL, categories: ['🤩', '🎉'], quality: 70 });
                    await sock.sendMessage(from, { sticker: await sticker.toBuffer() }, { quoted: msg });
                } catch (err) { await sock.sendMessage(from, { text: '❌ Sticker creation failed: ' + err.message }, { quoted: msg }); }
            }
            else if (command === 'tagall' && isGroup) {
                const metadata = await sock.groupMetadata(from);
                const mentions = metadata.participants.map(member => member.id);
                const announcement = args || 'Attention everyone!';
                const mentionsText = '📢 *GROUP ANNOUNCEMENT*\\n\\n' + announcement + '\\n\\n' + mentions.map(id => '👥 @' + id.split('@')[0]).join('\\n');
                await sock.sendMessage(from, { text: mentionsText, mentions }, { quoted: msg });
            }
            else if (command === 'mute' && isGroup) {
                await sock.groupSettingUpdate(from, 'announcement');
                await sock.sendMessage(from, { text: '🔒 Group is now admin-only.' }, { quoted: msg });
            }
            else if (command === 'unmute' && isGroup) {
                await sock.groupSettingUpdate(from, 'not_announcement');
                await sock.sendMessage(from, { text: '🔓 All group members can send messages again.' }, { quoted: msg });
            }
            else if (command === 'uptime') {
                const uptimeMs = Date.now() - startTime;
                const seconds = Math.floor((uptimeMs / 1000) % 60);
                const minutes = Math.floor((uptimeMs / (1000 * 60)) % 60);
                const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
                await sock.sendMessage(from, { text: `⏱️ *RAHUL-AI-MINI UPTIME*\\n\\nRunning for ${hours}h ${minutes}m ${seconds}s.` }, { quoted: msg });
            }
            else if (command === 'owner') {
                await sock.sendMessage(from, { text: '👑 *Owner Info*\\n\\nDeveloper: Rahul Master / Rahul Hiran\\nBot: RAHUL-AI-MINI' }, { quoted: msg });
            }
        } catch (err) {
            console.error('Message handler error:', err.message);
        }
    });
}

connectToWhatsApp().catch(err => {
    console.error('Failed to start WhatsApp bot:', err.message);
    process.exitCode = 1;
});
