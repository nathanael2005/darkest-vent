// index.js
import "dotenv/config";
import TelegramBot from "node-telegram-bot-api";

// --- Bot and Admin Setup ---
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

if (!TELEGRAM_TOKEN || !ADMIN_CHAT_ID) {
    console.error("❌ Missing required environment variables.");
    process.exit(1);
}

// --- Telegram Bot (Polling Mode) ---
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
console.log("✅ Bot is running in polling mode...");

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
