// index.js
import "dotenv/config";
import express from "express";
import TelegramBot from "node-telegram-bot-api";

// --- Bot and Admin Setup ---
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const PORT = process.env.PORT || 3000;
const RENDER_EXTERNAL_URL = "your-render-service-url"; // We'll update this later

if (!TELEGRAM_TOKEN || !ADMIN_CHAT_ID) {
    console.error("❌ Missing required environment variables.");
    process.exit(1);
}

// --- Telegram Bot (Webhook Mode) ---
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: false });

// This is where we will set the webhook URL later
// bot.setWebhook(`${RENDER_EXTERNAL_URL}/bot${TELEGRAM_TOKEN}`);

// --- Message Handler ---
bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;

    // Ignore messages from the admin chat to prevent loops
    if (chatId.toString() === ADMIN_CHAT_ID) {
        // You can add admin-specific commands here later
        return;
    }
    
    // --- Core Anonymity Logic ---
    // Forward the message to the admin chat ID
    if (messageText) {
        await bot.sendMessage(ADMIN_CHAT_ID, `🤫 *New Anonymous Confession*\n\n"${messageText}"`, { parse_mode: "Markdown" });
        await bot.sendMessage(chatId, "Thank you! Your confession has been sent anonymously.");
    }
});

// --- Express App ---
const app = express();
app.use(express.json());

// This route receives updates from Telegram
app.post(`/bot${TELEGRAM_TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// A simple home page for a health check
app.get("/", (req, res) => {
    res.send("✅ The anonymous bot is running!");
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`🌍 Server running on port ${PORT}`);
});
