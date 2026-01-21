import { CronJob } from "cron";
import https from "https";

const URL = "https://nustify-backend.onrender.com";

const job = new CronJob("*/14 * * * *", function () {
    const healthUrl = `${URL}/api`;

    console.log(`⏰ Cron: Pinging ${healthUrl}`);

    const req = https.get(healthUrl, (res) => {
        if (res.statusCode === 200) {
            console.log("✅ Cron: Server is alive");
        } else {
            console.log(`⚠️ Cron: Server responded with status ${res.statusCode}`);
        }
    });

    req.on("error", (e) => {
        console.error(`❌ Cron: Error pinging server: ${e.message}`);
    });

    req.end();
});

export const startSelfPing = () => {
    job.start();
    console.log("⏰ Self-ping cron job started");
};
