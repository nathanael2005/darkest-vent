// index.js

// Import necessary modules
import "dotenv/config";
import TelegramBot from "node-telegram-bot-api";

// --- Bot and Admin Setup ---
// Load environment variables from Render's dashboard.
// The TELEGRAM_TOKEN and ADMIN_CHAT_ID are retrieved from the "Environment" tab.
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

// Ensure all environment variables are present before starting.
// This is a critical check to prevent the app from crashing.
if (!TELEGRAM_TOKEN || !ADMIN_CHAT_ID) {
    console.error("❌ ERROR: Missing required environment variables.");
    console.error("Please ensure TELEGRAM_TOKEN and ADMIN_CHAT_ID are set correctly in your Render dashboard.");
    process.exit(1);
}

// --- Telegram Bot (Polling Mode) ---
// Initialize the bot with a token.
// The `polling: true` option is crucial for Render's free tier,
// as it tells the bot to periodically check Telegram for new messages.
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

console.log("✅ Bot is running in polling mode...");
console.log(`✅ Admin chat ID loaded: ${ADMIN_CHAT_ID}`);

// --- Message Handler ---
// This is the main function that listens for all incoming messages.
bot.on("message", async (msg) => {
    // Extract the chat ID and message text from the incoming message object.
    const chatId = msg.chat.id;
    const messageText = msg.text;

    console.log(`Received a message from chat ID: ${chatId}`);

    // Ignore messages from the admin chat.
    // This prevents the bot from forwarding messages to itself,
    // which can lead to an infinite loop.
    if (chatId.toString() === ADMIN_CHAT_ID) {
        console.log("Ignoring message from admin chat to prevent loop.");
        return;
    }
    
    // Check if the message is a command.
    // The bot should only handle anonymous confessions, not commands like /start.
    // The `isCommand()` function is a simple helper to check if the message starts with a '/'.
    const isCommand = (text) => text && text.startsWith('/');

    // Handle the /start command separately to greet the user.
    if (isCommand(messageText) && messageText === '/start') {
        try {
            await bot.sendMessage(chatId, "Hello! I am the anonymous vent bot. Send me a message and I will forward it to the admin anonymously. You can vent about anything here.");
            console.log("Sent welcome message for /start command.");
        } catch (error) {
            console.error("❌ Failed to send welcome message:", error.message);
        }
        return;
    }

    // --- Core Anonymity and Forwarding Logic ---
    // Process any non-command messages.
    if (messageText) {
        try {
            // Forward the message to the ADMIN_CHAT_ID.
            // Using Markdown for bold text and proper formatting.
            await bot.sendMessage(ADMIN_CHAT_ID, `🤫 *New Anonymous Confession*\n\n"${messageText}"`, { parse_mode: "Markdown" });
            
            // Send a confirmation message back to the user who sent the confession.
            await bot.sendMessage(chatId, "Thank you! Your confession has been sent anonymously.");
            
            console.log("✅ Message forwarded successfully.");
        } catch (error) {
            // Log the error and send a user-friendly message back to the sender.
            console.error("❌ Failed to send message:", error.message);
            await bot.sendMessage(chatId, "⚠️ Sorry, there was an error sending your message. Please try again.");
        }
    }
});
