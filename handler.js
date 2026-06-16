const axios = require("axios");
const config = require("./config");
const helpers = require("./helpers");

async function handleMessages(sock, chatUpdate) {
    try {
        const m = chatUpdate.messages[0];
        if (!m.message) return; // 🌟 SEKARANG BISA PERINTAH DIRI SENDIRI (fromMe dihapus!)

        const from = m.key.remoteJid;
        const isGroup = from.endsWith("@g.us");
        const type = Object.keys(m.message)[0];
        
        // Anti View-Once Tracker (Tetap Siaga)
        if (type === "viewOnceMessage" || type === "viewOnceMessageV2") {
            console.log(`\n📸 [WCN DETECTOR] Pesan View-Once dari: ${m.key.participant || from}`);
        }

        let body = type === "conversation" ? m.message.conversation : 
                   type === "extendedTextMessage" ? m.message.extendedTextMessage.text : 
                   type === "imageMessage" ? m.message.imageMessage.caption : 
                   type === "videoMessage" ? m.message.videoMessage.caption : "";

        // Cegah bot ngerespon teks otomatisnya sendiri biar gak looping/spam tanpa akhir
        if (m.key.fromMe && (body.includes("PREMIUM") || body.includes("SERVER RUNTIME"))) return;

        if (!body.startsWith(config.prefix)) return;
        
        const command = body.replace(config.prefix, "").trim().split(/ +/).shift().toLowerCase();
        const args = body.trim().split(/ +/).slice(1);
        const q = args.join(" ");

        const reply = async (text) => { await sock.sendMessage(from, { text: text }, { quoted: m }); };

        switch (command) {
            case "menu":
            case "help":
                const textMenu = `🔥 *${config.botName} PREMIUM v2.8* 🔥
👨‍💻 *Owner:* ${config.ownerName}
⏱️ *Uptime:* ${helpers.getRuntime()}
📅 *Waktu:* ${helpers.getWibTime()}
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

👥 *GROUP MANAGEMENT*
👉 \`${config.prefix}kick\` - Mengeluarkan Member (Admin Only)
👉 \`${config.prefix}add\` - Memasukkan Member Baru

⚙️ *PREMIUM TRACKING*
👉 \`${config.prefix}rvo\` - Penjelasan Sistem Anti View Once

_WCN Bot System pure responsive console base._`;
                await reply(textMenu);
                break;

            // ================= [ YOUTUBE DOWNLOADER ] =================
            case "ytdm":
                if (!q) return reply(`Contoh: ${config.prefix}ytdm https://www.youtube.com/watch?v=xxxx`);
                await reply("⏳ Loading mendownload audio YouTube, tunggu bentar...");
                try {
                    const resYtdm = await axios.get(`https://api.agatz.xyz/api/ytmp3?url=${encodeURIComponent(q)}`);
                    await sock.sendMessage(from, { audio: { url: resYtdm.data.data.downloadUrl || resYtdm.data.result }, mimetype: 'audio/mp4', ptt: false }, { quoted: m });
                } catch (err) { await reply("❌ Gagal mendownload audio YouTube. Pastikan link lo valid ya, Cuy!"); }
                break;

            case "ytdv":
                if (!q) return reply(`Contoh: ${config.prefix}ytdv https://www.youtube.com/watch?v=xxxx`);
                await reply("⏳ Memproses video YouTube pesanan lo, sabar...");
                try {
                    const resYtdv = await axios.get(`https://api.agatz.xyz/api/ytmp4?url=${encodeURIComponent(q)}`);
                    await sock.sendMessage(from, { video: { url: resYtdv.data.data.downloadUrl || resYtdv.data.result }, caption: "✨ Video YouTube Berhasil Didownload!" }, { quoted: m });
                } catch (err) { await reply("❌ Gagal mengunduh video YouTube, server API lagi padat!"); }
                break;

            // ================= [ TIKTOK DOWNLOADER ] =================
            case "ttdm":
                if (!q) return reply(`Contoh: ${config.prefix}ttdm https://vm.tiktok.com/xxxx`);
                await reply("⏳ Narik lagu dari TikTok, meluncur...");
                try {
                    const resTtdm = await axios.get(`https://api.agatz.xyz/api/tiktok?url=${encodeURIComponent(q)}`);
                    await sock.sendMessage(from, { audio: { url: resTtdm.data.data.music || resTtdm.data.result.audio }, mimetype: 'audio/mp4', ptt: false }, { quoted: m });
                } catch (err) { await reply("❌ Gagal mengambil audio TikTok, coba link video lain!"); }
                break;

            case "ttdv":
                if (!q) return reply(`Contoh: ${config.prefix}ttdv https://vm.tiktok.com/xxxx`);
                await reply("⏳ Video TikTok No Watermark lagi dimasak...");
                try {
                    const resTtdv = await axios.get(`https://api.agatz.xyz/api/tiktok?url=${encodeURIComponent(q)}`);
                    await sock.sendMessage(from, { video: { url: resTtdv.data.data.data || resTtdv.data.result.videoNoWm }, caption: "🔥 TikTok No Watermark Sukses Terunduh!" }, { quoted: m });
                } catch (err) { await reply("❌ Gagal mendownload video TikTok, pastikan linknya bener!"); }
                break;

            // ================= [ INSTAGRAM DOWNLOADER ] =================
            case "igdwv":
                if (!q) return reply(`Contoh: ${config.prefix}igdwv https://www.instagram.com/reel/xxxx`);
                await reply("⏳ Mengambil video Instagram, tunggu bentar...");
                try {
                    const resIg = await axios.get(`https://widipe.com/download/igdl?url=${encodeURIComponent(q)}`);
                    await sock.sendMessage(from, { video: { url: resIg.data.result[0].url }, caption: "📸 Instagram Reel/Video Berhasil Di-grab!" }, { quoted: m });
                } catch (err) { await reply("❌ Gagal mendownload media Instagram. Link privat atau API down!"); }
                break;

            case "igdwm":
                if (!q) return reply(`Contoh: ${config.prefix}igdwm https://www.instagram.com/reel/xxxx`);
                await reply("⏳ Mengonversi video IG lo jadi Voice Note...");
                try {
                    const resIgM = await axios.get(`https://widipe.com/download/igdl?url=${encodeURIComponent(q)}`);
                    await sock.sendMessage(from, { audio: { url: resIgM.data.result[0].url }, mimetype: 'audio/mp4', ptt: true }, { quoted: m });
                } catch (err) { await reply("❌ Gagal mengubah video IG menjadi Voice Note."); }
                break;

            // ================= [ SYSTEM AI CAI FREE ] =================
            case "ai":
                if (!q) return reply("Contoh: .ai mengapa langit berwarna biru?");
                await sock.sendPresenceUpdate("composing", from);
                try {
                    const aiFree = await axios.get(`https://widipe.com/cai?text=${encodeURIComponent(q)}`);
                    await reply(aiFree.data.result || "Aduh, AI-nya pusing Cuy, coba tanya lagi!");
                } catch (err) {
                    await reply("❌ Mesin AI lagi sibuk berat, coba beberapa saat lagi, Coy!");
                }
                break;

            case "generate":
                if (!q) return reply("Contoh: .generate cyborg neon cat highly detailed");
                await reply("⏳ Gambar lo lagi digambar AI WCN, tunggu bentar...");
                try {
                    await sock.sendMessage(from, { 
                        image: { url: `https://pollinations.ai/p/${encodeURIComponent(q)}?width=1024&height=1024` }, 
                        caption: `✨ *WCN AI Image Generator* \n\nPrompt: "${q}"` 
                    }, { quoted: m });
                } catch (e) { await reply("❌ Gagal menggambar, server AI kelebihan beban!"); }
                break;

            // ================= [ SYSTEM TOOLS ] =================
            case "cuaca":
                if (!q) return reply("Contoh: .cuaca Yogyakarta");
                try {
                    const wRes = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(q)}&appid=ef4ac9c6a79883584852c0029b3ee9cf&units=metric&lang=id`);
                    await reply(`🌤️ *ANALISIS CUACA KOTA ${wRes.data.name.toUpperCase()}* 🌤️\n\n🌡️ Suhu Saat Ini: ${wRes.data.main.temp} °C\n💧 Kelembapan: ${wRes.data.main.humidity}%\n💨 Kecepatan Angin: ${wRes.data.wind.speed} m/s\n📝 Kondisi: ${wRes.data.weather[0].description}`);
                } catch (e) { await reply("❌ Kota tidak ditemukan, pastiin ejaannya bener, Cuy!"); }
                break;

            case "neko":
                try {
                    const nRes = await axios.get("https://waifu.pics/api/sfw/neko");
                    await sock.sendMessage(from, { image: { url: nRes.data.url }, caption: "🐱 Meoww! Request Neko Berhasil." }, { quoted: m });
                } catch (e) { await reply("❌ Gagal mengambil gambar anime."); }
                break;

            case "runtime":
                await reply(`⚡ *SERVER RUNTIME:* ${helpers.getRuntime()}`);
                break;

            case "rvo":
                await reply("⚡ *SISTEM ANTI VIEW ONCE WCN* ⚡\n\nSistem otomatis berjalan di latar belakang terminal. Setiap ada orang mengirimkan foto/video sekali lihat, log konsol Termux lo bakal langsung melacak data pengirim secara real-time!");
                break;

            // ================= [ GROUP EXCLUSIVE COMMANDS ] =================
            case "kick":
            case "add":
                if (!isGroup) return reply("❌ Eror, Masbrok! Fitur manajemen ini cuma bisa dieksekusi di dalam Grup, bukan di chat pribadi!");
                await reply("📥 Fitur ini aktif dan memerlukan hak akses root admin di dalam grup!");
                break;
                
            case "s":
                await reply("📥 Kirim gambar dengan caption .s atau reply gambarnya buat dijadiin stiker!");
                break;
        }
    } catch (e) {
        console.error("❌ Eror di handler:", e.message);
    }
}

module.exports = { handleMessages };

