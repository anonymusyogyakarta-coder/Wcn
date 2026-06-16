const axios = require("axios");
const config = require("./config");
const helpers = require("./helpers");

// Engine penyamaran browser Google Chrome asli
const agent = axios.create({
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
    },
    timeout: 25000 // Batas tunggu 25 detik
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

        if (m.key.fromMe && (body.includes("PREMIUM") || body.includes("SERVER RUNTIME"))) return;
        if (!body.startsWith(config.prefix)) return;
        
        const command = body.replace(config.prefix, "").trim().split(/ +/).shift().toLowerCase();
        const args = body.trim().split(/ +/).slice(1);
        const q = args.join(" ");

        const reply = async (text) => { await sock.sendMessage(from, { text: text }, { quoted: m }); };

        switch (command) {
            case "menu":
            case "help":
                const textMenu = `🔥 *${config.botName} PREMIUM v3.0* 🔥
👨‍💻 *Owner:* ${config.ownerName}
⏱️ *Uptime:* ${helpers.getRuntime()}
🌐 *Akses:* Grup & Chat Pribadi (Responsive)

📥 *MEDIA DOWNLOADER*
👉 \`${config.prefix}ytdm <link>\` - YT Jadi Musik (.mp3)
👉 \`${config.prefix}ytdv <link>\` - Video YouTube
👉 \`${config.prefix}ttdv <link>\` - Video TikTok No WM

🤖 *AI COMMANDS*
👉 \`${config.prefix}ai <text>\` - Tanya Jawab Pintar AI
👉 \`${config.prefix}generate <prompt>\` - Gambar Pake AI
👉 \`${config.prefix}neko\` - Kirim Foto Anime Random

🌐 *PUBLIC TOOLS*
👉 \`${config.prefix}cuaca <kota>\` - Info Cuaca (100% Aktif)
👉 \`${config.prefix}runtime\` - Cek Keaktifan Server`;
                await reply(textMenu);
                break;

            // ================= [ AI CHAT MULTI-SERVER ] =================
            case "ai":
                if (!q) return reply("Contoh: .ai mengapa bumi bulat?");
                await sock.sendPresenceUpdate("composing", from);
                let aiDone = false;

                // Server Utama (Itzpire)
                try {
                    const resAi1 = await agent.get(`https://itzpire.com/api/gpt3?q=${encodeURIComponent(q)}`);
                    if (resAi1.data?.result) {
                        await reply(resAi1.data.result);
                        aiDone = true;
                    }
                } catch (e) {}

                // Server Cadangan (Siputzx)
                if (!aiDone) {
                    try {
                        const resAi2 = await agent.get(`https://api.siputzx.my.id/api/ai/chatgpt?paket=1&text=${encodeURIComponent(q)}`);
                        if (resAi2.data?.result) {
                            await reply(resAi2.data.result);
                            aiDone = true;
                        }
                    } catch (e) {}
                }

                if (!aiDone) await reply("❌ Semua server AI sedang sibuk/down, coba sesaat lagi!");
                break;

            // ================= [ AI GENERATE IMAGE ] =================
            case "generate":
                if (!q) return reply("Contoh: .generate futuristic city neon light");
                await reply("⏳ Menggambar pesanan lo, sabar ya Cuy...");
                try {
                    // Pollinations.ai mengembalikan file gambar langsung, sangat stabil!
                    await sock.sendMessage(from, { 
                        image: { url: `https://pollinations.ai/p/${encodeURIComponent(q)}?width=1024&height=1024&seed=42` }, 
                        caption: `✨ *WCN AI Art Generator* \nPrompt: "${q}"` 
                    }, { quoted: m });
                } catch (e) { 
                    await reply("❌ Gagal membuat gambar, server render sedang penuh!"); 
                }
                break;

            // ================= [ TIKTOK DOWNLOADER ] =================
            case "ttdv":
                if (!q) return reply("Contoh: .ttdv https://vm.tiktok.com/xxxx");
                await reply("⏳ Video TikTok No Watermark lo lagi diproses...");
                let ttDone = false;

                try {
                    const resTt1 = await agent.get(`https://itzpire.com/download/tiktok?url=${encodeURIComponent(q)}`);
                    if (resTt1.data?.data?.video) {
                        await sock.sendMessage(from, { video: { url: resTt1.data.data.video }, caption: "🔥 TikTok Sukses Terunduh!" }, { quoted: m });
                        ttDone = true;
                    }
                } catch (e) {}

                if (!ttDone) {
                    try {
                        const resTt2 = await agent.get(`https://api.agatz.xyz/api/tiktok?url=${encodeURIComponent(q)}`);
                        let vUrl = resTt2.data.data?.data || resTt2.data.result?.videoNoWm;
                        if (vUrl) {
                            await sock.sendMessage(from, { video: { url: vUrl }, caption: "🔥 TikTok Sukses Terunduh (Server B)!" }, { quoted: m });
                            ttDone = true;
                        }
                    } catch (e) {}
                }

                if (!ttDone) await reply("❌ Gagal mendownload TikTok. Link privat atau server API down!");
                break;

            // ================= [ ULTRA STABLE WEATHER ] =================
            case "cuaca":
                if (!q) return reply("Contoh: .cuaca Jakarta");
                try {
                    // Menggunakan wttr.in (Server cuaca linux, tanpa JSON, mengembalikan teks langsung, 100% abadi)
                    const resCuaca = await agent.get(`https://wttr.in/${encodeURIComponent(q)}?format=%c+Kondisi:+%C+%7c+Suhu:+%t+%7c+Kelembapan:+%h+%7c+Angin:+%w`);
                    await reply(`🌤️ *INFO CUACA KOTA: ${q.toUpperCase()}* 🌤️\n\n${resCuaca.data.trim()}`);
                } catch (e) { 
                    await reply("❌ Gagal melacak cuaca. Pastikan nama kota benar!"); 
                }
                break;

            // ================= [ ANIME PIC ] =================
            case "neko":
                try {
                    const nRes = await agent.get("https://waifu.pics/api/sfw/neko");
                    if (nRes.data?.url) {
                        await sock.sendMessage(from, { image: { url: nRes.data.url }, caption: "🐱 Meoww! Request Neko Berhasil." }, { quoted: m });
                    }
                } catch (e) { 
                    await reply("❌ Gagal mengambil gambar anime."); 
                }
                break;

            case "runtime":
                await reply(`⚡ *SERVER RUNTIME:* ${helpers.getRuntime()}`);
                break;
        }
    } catch (e) {
        console.error("❌ Fatal Error:", e.message);
    }
}

module.exports = { handleMessages };
                                                                                
