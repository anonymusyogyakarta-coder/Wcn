const moment = require("moment-timezone");

function getRuntime() {
    const duration = process.uptime();
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);
    return `${hours} Jam, ${minutes} Menit, ${seconds} Detik`;
}

function getWitaTime() {
    return moment.tz("Asia/Makassar").format("HH:mm:ss WITA");
}

function getWibTime() {
    return moment.tz("Asia/Jakarta").format("HH:mm:ss WIB");
}

module.exports = { getRuntime, getWitaTime, getWibTime };
