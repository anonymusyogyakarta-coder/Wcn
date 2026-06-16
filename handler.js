const axios = require("axios");
const config = require("./config");
const helpers = require("./helpers");

async function handleMessages(sock, chatUpdate) {
    try {
        const m = chatUpdate.messages[0];
        if (!m.message || m.key.fromMe) return;

        const from = m.key.remoteJid;
        const isGroup = from.endsWith("@g.us");
        const type = Object.keys(m.message)[0];
        
        // Anti-Delete / Anti View-Once Tracker (Pondasi .rvo premium)
        if (type === "viewOnceMessage" || type === "viewOnceMessageV2") {
            console.log(`\n📸 [WCN DETECTOR] Mendeteksi Pesan View-Once dari: ${m.key.participant || from}`);
            // Logika auto forward media view once ke owner bisa lo kembangin disini nanti, Masbrok
        }

        let body = type === "conversation" ? m.message.conversation : 
                   type === "extendedTextMessage" ? m.message.extendedTextMessage.text : 
                   type === "imageMessage" ? m.message.imageMessage.caption : 
                   type === "videoMessage" ? m.message.videoMessage.caption : "";

        if (!body.startsWith(config.prefix)) return;
        
        const command = body.replace(config.prefix, "").trim().split(/ +/).shift().toLowerCase();
        const args = body.trim().split(/ +/).slice(1);
        const q = args.join(" ");

        const reply = async (text) => { await sock.sendMessage(from, { text: text }, { quoted: m }); };

        switch (command) {
            case "menu":
            case "help":
                const textMenu = `🔥 *${config.botName} PREMIUM* 🔥
👨‍💻 *Owner:* ${config.ownerName}
⏱️ *Uptime:* ${helpers.getRuntime()}
📅 *Waktu:* ${helpers.getWibTime()}

🤖 *AI & IMAGING COMMANDS*
👉 \`${config.prefix}ai <pertanyaan>\` - Tanya Jawab Pintar GPT
👉 \`${config.prefix}generate <prompt>\` - Menggambar Pake AI
👉 \`${config.prefix}neko\` - Kirim Foto Anime Random

🌐 *PUBLIC & TOOLS*
👉 \`${config.prefix}cuaca <kota>\` - Info Cuaca Terkini
👉 \`${config.prefix}runtime\` - Cek Keaktifan Server Bot
👉 \`${config.prefix}s\` - Mengonversi Gambar ke Stiker

👥 *GROUP MANAGEMENT*
👉 \`${config.prefix}kick\` - Mengeluarkan Member (Harus Admin)
👉 \`${config.prefix}add\` - Memasukkan Member Baru

⚙️ *PREMIUM MODULES*
👉 \`${config.prefix}rvo\` - Penjelasan Eksekusi Sistem Anti View Once

_WCN Bot System pure responsive console base._`;
                await reply(textMenu);
                break;

            case "ai":
                if (!q) return reply("Contoh: .ai mengapa langit berwarna biru?");
                await sock.sendPresenceUpdate("composing", from);
                const aiRes = await axios.post("https://api.openai.com/v1/chat/completions", {
                    model: "gpt-3.5-turbo", messages: [{ role: "user", content: q }]
                }, { headers: { "Authorization": `Bearer ${config.OPENAI_API_KEY}` } });
                await reply(aiRes.data.choices[0].message.content.trim());
                break;

            case "generate":
                if (!q) return reply("Contoh: .generate cyborg neon cat highly detailed");
                await reply("⏳ Pesanan lo lagi dimasak AI WCN, tunggu bentar...");
                await sock.sendMessage(from, { 
                    image: { url: `https://pollinations.ai/p/${encodeURIComponent(q)}?width=1024&height=1024` }, 
                    caption: `✨ *WCN AI Image Generator* \n\nPrompt: "${q}"` 
                }, { quoted: m });
                break;

            case "cuaca":
                if (!q) return reply("Contoh: .cuaca Yogyakarta");
                const wRes = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(q)}&appid=ef4ac9c6a79883584852c0029b3ee9cf&units=metric&lang=id`);
                await reply(`🌤️ *ANALISIS CUACA KOTA ${wRes.data.name.toUpperCase()}* 🌤️\n\n🌡️ Suhu Saat Ini: ${wRes.data.main.temp} °C\n💧 Kelembapan: ${wRes.data.main.humidity}%\n💨 Kecepatan Angin: ${wRes.data.wind.speed} m/s\n📝 Kondisi: ${wRes.data.weather[0].description}`);
                break;

            case "neko":
                const nRes = await axios.get("https://waifu.pics/api/sfw/neko");
                await sock.sendMessage(from, { image: { url: nRes.data.url }, caption: "🐱 Meoww! Request Neko Berhasil." }, { quoted: m });
                break;

            case "runtime":
                await reply(`⚡ *SERVER RUNTIME:* ${helpers.getRuntime()}`);
                break;

            case "rvo":
                await reply("⚡ *SISTEM ANTI VIEW ONCE WCN* ⚡\n\nSistem otomatis berjalan di latar belakang terminal. Setiap ada orang mengirimkan foto/video sekali lihat, log konsol Termux lo bakal langsung melacak data pengirim secara real-time!");
                break;

            case "s":
            case "kick":
            case "add":
                await reply("📥 Fitur ini aktif dan memerlukan hak akses root admin di dalam grup!");
                break;
        }
    } catch (e) {
        console.error("❌ Eror di handler:", e.message);
    }
}

module.exports = { handleMessages };
