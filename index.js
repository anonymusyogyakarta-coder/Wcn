const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const path = require("path");
const fs = require("fs");
const readline = require("readline");
const config = require("./config");
const { handleMessages } = require("./handler");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startWcnBot() {
    console.clear();
    // Banner Glitch Hectic Style
    console.log("\x1b[35m%s\x1b[0m", `
 ██╗    ██╗ ██████╗███╗   ██╗    ██████╗  ██████╗ ████████╗
 ██║    ██║██╔════╝████╗  ██║    ██╔══██╗██╔═══██╗╚══██╔══╝
 ██║ █╗ ██║██║     ██╔██╗ ██║    ██████╔╝██║   ██║   ██║   
 ██║███╗██║██║     ██║╚██╗██║    ██╔══██╗██║   ██║   ██║   
 ╚███╔███╔╝╚██████╗██║  ╚████║    ██████╔╝╚██████╔╝   ██║   
  ╚══╝╚══╝  ╚═════╝╚═╝   ╚═══╝    ╚═════╝  ╚═════╝    ╚═╝   
    `);
    console.log("\x1b[36m%s\x1b[0m", "==================================================");
    console.log("\x1b[32m%s\x1b[0m", `      🚀 ${config.botName} OPERATIONAL - PREMIUM CLI 🚀`);
    console.log("\x1b[36m%s\x1b[0m", "==================================================");

    const sessionPath = path.join(__dirname, 'wcn_premium_session');
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        browser: [config.botName, "Safari", "1.0.0"],
        markOnlineOnConnect: true
    });

    if (!sock.authState.creds.registered) {
        console.log("\x1b[33m%s\x1b[0m", "⚠️ [SYSTEM] Sesi terputus atau belum terdaftar.");
        let phoneNumber = await question("\x1b[32m👉 Masukkan Nomor WhatsApp Target (Contoh: 628xxx): \x1b[0m");
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

        if (!phoneNumber || phoneNumber.length < 10) {
            console.log("\x1b[31m%s\x1b[0m", "❌ [ERROR] Nomor tidak valid! Sistem dihentikan.");
            process.exit(0);
        }

        console.log("\x1b[34m%s\x1b[0m", "⏳ [SERVER] Meminta kode pairing unik dari WhatsApp...");
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log("\x1b[36m%s\x1b[0m", "\n┌───────────────────────────────────────┐");
                console.log("\x1b[32m%s\x1b[0m", ` 🎉 KODE PAIRING BERHASIL DIDAPATKAN: `);
                console.log("\x1b[33m%s\x1b[0m", `          👉  ${code.toUpperCase()}  👈`);
                console.log("\x1b[36m%s\x1b[0m", "└───────────────────────────────────────┘\n");
            } catch (err) {
                console.log("\x1b[31m%s\x1b[0m", "❌ [FATAL] Gagal request kode: " + err.message);
            }
        }, 4000);
    }

    sock.ev.on("creds.update", saveCreds);
    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;
            console.log(`⚠️ Connection Closed. Reason Code: ${reason}`);
            if (reason !== DisconnectReason.loggedOut) { 
                console.log("🔄 Menyambungkan ulang sistem otomatis...");
                startWcnBot(); 
            } else { 
                console.log("❌ Sesi keluar permanen. Menghapus data cache lama...");
                fs.rmSync(sessionPath, { recursive: true, force: true }); 
                startWcnBot();
            }
        } else if (connection === "open") {
            console.log("\x1b[32m%s\x1b[0m", `\n✅ STATUS: WCN PREMIUM BERHASIL ONLINE TERTAUT! 🎉`);
            console.log("\x1b[36m%s\x1b[0m", "==================================================\n");
        }
    });

    sock.ev.on("messages.upsert", async (chatUpdate) => {
        await handleMessages(sock, chatUpdate);
    });
}

// Fitur Anti-Crash Proteksi Utama (Biar kalo ada eror fitur, bot ga mati)
process.on("uncaughtException", (err) => { console.error("🛡️ [PROTECTION] Terjadi eror tak terduga:", err); });
process.on("unhandledRejection", (reason, p) => { console.error("🛡️ [PROTECTION] Rejection terdeteksi:", reason, p); });

startWcnBot();
