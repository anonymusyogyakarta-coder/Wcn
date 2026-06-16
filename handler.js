const axios = require("axios");
const config = require("./config");
const helpers = require("./helpers");

// 🔥 KUNCI UTAMA: Bikin Axios menyamar jadi Google Chrome asli biar gak diblokir Cloudflare/API
const agent = axios.create({
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7"
    },
    timeout: 20000 // Batas nunggu respons 20 detik biar gak hang/macet
});

async function handleMessages(sock, chatUpdate) {
    try {
        const m = chatUpdate.messages[0];
        if (!m.message) return; 

        const from = m.key.remoteJid;
        const isGroup = from.endsWith("@g.us");
        const type = Object.keys(m.message)[0];
        
        let body = type === "conversation" ? m.message.conversation : 
                   type === "extendedTextMessage" ? m.message.extendedTextMessage.text : 
                   type === "imageMessage" ? m.message.imageMessage.caption : 
                   type === "videoMessage" ? m.message.videoMessage.caption : "";

        // Cegah bot ngerespon teks otomatisnya sendiri biar gak looping
        if (m.key.fromMe && (body.includes("PREMIUM") || body.includes("SERVER RUNTIME"))) return;

        if (!body.startsWith(config.prefix)) return;
        
        const command = body.replace(config.prefix, "").trim().split(/ +/).shift().toLowerCase();
        const args = body.trim().split(/ +/).slice(1);
        const q = args.join(" ");

        const reply = async (text) => { await sock.sendMessage(from, { text: text }, { quoted: m }); };

        switch (command) {
            case "menu":
            case "help":
                const textMenu = `🔥 *${config.botName} PREMIUM v2.9* 🔥
👨‍💻 *Owner:* ${config.ownerName}
⏱️ *Uptime:* ${helpers.getRuntime()}
🌐 *Akses:* Grup & Chat Pribadi (All Responsive)

📥 *MEDIA DOWNLOADER MODULES*
👉 \`${config.prefix}ytdm <link>\` - Download YT Jadi Musik (.mp3)
👉 \`${config.prefix}ytdv <link>\` - Download Video YouTube
👉 \`${config.prefix}ttdm <link>\` - Download Musik TikTok
👉 \`${config.prefix}ttdv <link>\` - Download Video TikTok No WM
👉 \`${config.prefix}igdwv <link>\` - Download Video Instagram No WM
👉 \`${config.prefix}igdwm <link>\` - Download Video IG Jadi Audio

🤖 *AI COMMANDS (FREE ACCESS)*
👉 \`${config.prefix}ai <text>\` - Tanya Jawab Pintar AI Chat
👉 \`${config.prefix}generate <prompt>\` - Menggambar Pake AI
👉 \`${config.prefix}neko\` - Kirim Foto Anime Random

🌐 *PUBLIC & TOOLS*
👉 \`${config.prefix}cuaca <kota>\` - Info Cuaca Terkini
👉 \`${config.prefix}runtime\` - Cek Keaktifan Server Bot
👉 \`${config.prefix}s\` - Mengonversi Gambar ke Stiker

_WCN Bot System pure responsive console base._`;
                await reply(textMenu);
                break;

            // ================= [ YOUTUBE DOWNLOADER ] =================
            case "ytdm":
                if (!q) return reply(`Contoh: ${config.prefix}ytdm https://www.youtube.com/watch?v=xxxx`);
                await reply("⏳ Loading mendownload audio YouTube, tunggu bentar...");
                try {
                    const resYtdm = await agent.get(`https://api.agatz.xyz/api/ytmp3?url=${encodeURIComponent(q)}`);
                    let urlDl = resYtdm.data.data?.downloadUrl || resYtdm.data.result;
                    await sock.sendMessage(from, { audio: { url: urlDl }, mimetype: 'audio/mp4', ptt: false }, { quoted: m });
                } catch (err) { 
                    console.error("❌ Eror YTDM:", err.message);
                    await reply("❌ Gagal mendownload audio YouTube. Server API lagi padat!"); 
                }
                break;

            case "ytdv":
                if (!q) return reply(`Contoh: ${config.prefix}ytdv https://www.youtube.com/watch?v=xxxx`);
                await reply("⏳ Memproses video YouTube pesanan lo, sabar...");
                try {
                    const resYtdv = await agent.get(`https://api.agatz.xyz/api/ytmp4?url=${encodeURIComponent(q)}`);
                    let urlDlV = resYtdv.data.data?.downloadUrl || resYtdv.data.result;
                    await sock.sendMessage(from, { video: { url: urlDlV }, caption: "✨ Video YouTube Berhasil Didownload!" }, { quoted: m });
                } catch (err) { 
                    console.error("❌ Eror YTDV:", err.message);
                    await reply("❌ Gagal mengunduh video YouTube."); 
                }
                break;

            // ================= [ TIKTOK DOWNLOADER ] =================
            case "ttdm":
                if (!q) return reply(`Contoh: ${config.prefix}ttdm https://vm.tiktok.com/xxxx`);
                await reply("⏳ Narik lagu dari TikTok, meluncur...");
                try {
                    const resTtdm = await agent.get(`https://api.agatz.xyz/api/tiktok?url=${encodeURIComponent(q)}`);
                    let audioUrl = resTtdm.data.data?.music || resTtdm.data.result?.audio;
                    await sock.sendMessage(from, { audio: { url: audioUrl }, mimetype: 'audio/mp4', ptt: false }, { quoted: m });
                } catch (err) { 
                    console.error("❌ Eror TTDM:", err.message);
                    await reply("❌ Gagal mengambil audio TikTok."); 
                }
                break;

            case "ttdv":
                if (!q) return reply(`Contoh: ${config.prefix}ttdv https://vm.tiktok.com/xxxx`);
                await reply("⏳ Video TikTok No Watermark lagi dimasak...");
                try {
                    const resTtdv = await agent.get(`https://api.agatz.xyz/api/tiktok?url=${encodeURIComponent(q)}`);
                    let videoUrl = resTtdv.data.data?.data || resTtdv.data.result?.videoNoWm;
                    await sock.sendMessage(from, { video: { url: videoUrl }, caption: "🔥 TikTok No Watermark Sukses Terunduh!" }, { quoted: m });
                } catch (err) { 
                    console.error("❌ Eror TTDV:", err.message);
                    await reply("❌ Gagal mendownload video TikTok."); 
                }
                break;

            // ================= [ INSTAGRAM DOWNLOADER ] =================
            case "igdwv":
                if (!q) return reply(`Contoh: ${config.prefix}igdwv https://www.instagram.com/reel/xxxx`);
                await reply("⏳ Mengambil video Instagram, tunggu bentar...");
                try {
                    const resIg = await agent.get(`https://widipe.com/download/igdl?url=${encodeURIComponent(q)}`);
                    await sock.sendMessage(from, { video: { url: resIg.data.result[0].url }, caption: "📸 Instagram Reel Berhasil Di-grab!" }, { quoted: m });
                } catch (err) { 
                    console.error("❌ Eror IGDWV:", err.message);
                    await reply("❌ Gagal mendownload media Instagram."); 
                }
                break;

            case "igdwm":
                if (!q) return reply(`Contoh: ${config.prefix}igdwm https://www.instagram.com/reel/xxxx`);
                await reply("⏳ Mengonversi video IG lo jadi Voice Note...");
                try {
                    const resIgM = await agent.get(`https://widipe.com/download/igdl?url=${encodeURIComponent(q)}`);
                    await sock.sendMessage(from, { audio: { url: resIgM.data.result[0].url }, mimetype: 'audio/mp4', ptt: true }, { quoted: m });
                } catch (err) { 
                    console.error("❌ Eror IGDWM:", err.message);
                    await reply("❌ Gagal mengubah video IG menjadi Voice Note."); 
                }
                break;

            // ================= [ SYSTEM AI FREE ] =================
            case "ai":
                if (!q) return reply("Contoh: .ai mengapa langit berwarna biru?");
                await sock.sendPresenceUpdate("composing", from);
                try {
                    const aiFree = await agent.get(`https://widipe.com/cai?text=${encodeURIComponent(q)}`);
                    await reply(aiFree.data.result || "Aduh, AI-nya pusing Cuy, coba tanya lagi!");
                } catch (err) {
                    console.error("❌ Eror AI:", err.message);
                    await reply("❌ Mesin AI lagi sibuk berat!");
                }
                break;

            case "generate":
                if (!q) return reply("Contoh: .generate cyborg neon cat");
                await reply("⏳ Gambar lo lagi digambar AI WCN, tunggu bentar...");
                try {
                    await sock.sendMessage(from, { 
                        image: { url: `https://pollinations.ai/p/${encodeURIComponent(q)}?width=1024&height=1024` }, 
                        caption: `✨ *WCN AI Image Generator* \n\nPrompt: "${q}"` 
                    }, { quoted: m });
                } catch (e) { await reply("❌ Gagal menggambar, server AI overload!"); }
                break;

            // ================= [ SYSTEM TOOLS FIXED ] =================
            case "cuaca":
                if (!q) return reply("Contoh: .cuaca Yogyakarta");
                try {
                    // Switch ke API Agatz yang free tanpa perlu API key openweather yang rawan mati
                    const wRes = await agent.get(`https://api.agatz.xyz/api/cuaca?kota=${encodeURIComponent(q)}`);
                    const dataCuaca = wRes.data.data;
                    await reply(`🌤️ *ANALISIS CUACA KOTA ${q.toUpperCase()}* 🌤️\n\n🌡️ Suhu: ${dataCuaca.suhu}\n💨 Angin: ${dataCuaca.angin}\n📝 Kondisi: ${dataCuaca.cuaca}\n🗺️ Koordinat: ${dataCuaca.koordinat}`);
                } catch (e) { 
                    console.error("❌ Eror Cuaca:", e.message);
                    await reply("❌ Gagal melacak cuaca, coba nama kota besar lain, Cuy!"); 
                }
                break;

            case "neko":
                try {
                    const nRes = await agent.get("https://waifu.pics/api/sfw/neko");
                    await sock.sendMessage(from, { image: { url: nRes.data.url }, caption: "🐱 Meoww! Request Neko Berhasil." }, { quoted: m });
                } catch (e) { 
                    console.error("❌ Eror Neko:", e.message);
                    await reply("❌ Server Anime lagi down, coba bentar lagi!"); 
                }
                break;

            case "runtime":
                await reply(`⚡ *SERVER RUNTIME:* ${helpers.getRuntime()}`);
                break;
        }
    } catch (e) {
        console.error("❌ Global Eror di handler:", e.message);
    }
}

module.exports = { handleMessages };
                        
