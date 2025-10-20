
// ============================
// VibecoreBot - Full WhatsApp Bot
// Author/Owner: Delaquez
// ============================

// Import necessary packages
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth, MessageMedia } = pkg; // Using default import for CommonJS compatibility
import qrcode from 'qrcode-terminal';
import ytdl from 'ytdl-core'; // YouTube download
import fs from 'fs';
import path from 'path';

// Puppeteer launch options to use your existing Chrome profile
const client = new Client({
    authStrategy: new LocalAuth({
        // Save session so no rescan required
        clientId: "vibecore",
    }),
    puppeteer: {
        headless: false,
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", // Your Chrome executable
        userDataDir: "C:\\Users\\hp\\AppData\\Local\\Google\\Chrome\\User Data\\Default", // Your profile
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
        ]
    }
});

// ============================
// Utility functions
// ============================

// Fake typing simulation
async function fakeTyping(message) {
    await client.sendPresenceAvailable();
    await message.getChat().then(chat => chat.sendStateTyping());
    setTimeout(async () => {
        await message.getChat().then(chat => chat.clearState());
    }, 3000); // typing lasts 3s
}

// Fake recording simulation
async function fakeRecording(message) {
    await client.sendPresenceAvailable();
    await message.getChat().then(chat => chat.sendStateRecording());
    setTimeout(async () => {
        await message.getChat().then(chat => chat.clearState());
    }, 3000); // recording lasts 3s
}

// Random anime image placeholder
function randomAnimeImage() {
    const urls = [
        "https://i.imgur.com/OtYFq1k.jpg", // placeholder anime image 1
        "https://i.imgur.com/2ZC4n8N.jpg",
        "https://i.imgur.com/8Qe7f8b.jpg"
    ];
    return urls[Math.floor(Math.random() * urls.length)];
}

// ============================
// QR code & client ready
// ============================

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('📱 Scan the QR code above to log in.');
});

client.on('ready', () => {
    console.log('✅ VibecoreBot is online and ready!');
});

// ============================
// Command handler
// ============================

client.on('message', async message => {
    const chat = await message.getChat();
    const body = message.body.toLowerCase();

    // Auto fake typing/recording
    if (!body.startsWith('.')) { // simulate only for normal messages
        fakeTyping(message);
        fakeRecording(message);
    }

    // ============================
    // Commands
    // ============================

    // 1. Menu
    if (body === '.menu') {
        const menuText = `
╭━❮ *VibecoreBot MENU* ❯━⊷
┃▸ .play - Download audio from YouTube
┃▸ .song - Download full song from YouTube
┃▸ .video - Download video from YouTube
┃▸ .fb - Fake Facebook media preview
┃▸ .tk - Fake TikTok media preview
┃▸ .ig - Fake Instagram media preview
┃▸ .gdrive - Download files from Google Drive (simulate)
┃▸ .twitter - Fake Twitter video preview
┃▸ .img - Search and send image
┃▸ .darama - Fake full episode video
┃▸ .baiscope - Fake baiscope video
┃▸ .mfire - Fake mediafire file
┃▸ .yts - Search YouTube videos
┃▸ .king - Get king about
┃▸ .dog - Random dog image
┃▸ .anime - Random anime image
┃▸ .animegirl - Random anime girl image
┃▸ .loli - Romantic anime pics
┃▸ .alive - Check bot status
┃▸ .ping - Check bot speed
┃▸ .menu - Show this menu
┃▸ .ai - Chat with AI
┃▸ .system - Check bot systems
┃▸ .owner - Owner info
┃▸ .status - Bot runtime
┃▸ .about - About bot
┃▸ .list - List all commands
┃▸ .script - Get bot repository
╰━━━━━━━━━━━━⪼
        `;
        chat.sendMessage(menuText);
    }

    // 2. Owner info
    if (body === '.owner') {
        const media = await MessageMedia.fromUrl(randomAnimeImage());
        chat.sendMessage(`Owner: *Delaquez*
Bot: *VibecoreBot*
Contact via this WhatsApp`);
        chat.sendMessage(media);
    }

    // 3. YouTube download (audio)
    if (body.startsWith('.play') || body.startsWith('.song')) {
        const url = message.body.split(' ')[1];
        if (!url || !validateURL(url)) {
            chat.sendMessage('❌ Please provide a valid YouTube URL');
        } else {
            const info = await getInfo(url);
            const stream = (url, { filter: 'audioonly' });
            const filePath = path.join('./temp_audio.mp3');
            const writeStream = fs.createWriteStream(filePath);
            stream.pipe(writeStream);
            writeStream.on('finish', async () => {
                const media = MessageMedia.fromFilePath(filePath);
                await chat.sendMessage(media);
                fs.unlinkSync(filePath);
            });
        }
    }

    // 4. YouTube video download
    if (body.startsWith('.video')) {
        const url = message.body.split(' ')[1];
        if (!url || !validateURL(url)) {
            chat.sendMessage('❌ Please provide a valid YouTube URL');
        } else {
            const filePath = path.join('./temp_video.mp4');
            const writeStream = fs.createWriteStream(filePath);
            stream.pipe(writeStream);
            writeStream.on('finish', async () => {
                const media = MessageMedia.fromFilePath(filePath);
                await chat.sendMessage(media);
                fs.unlinkSync(filePath);
            });
        }
    }

    // 5. Fake IG/TikTok/FB/Twitter
    if (body.startsWith('.ig') || body.startsWith('.tk') || body.startsWith('.fb') || body.startsWith('.twitter')) {
        const media = await MessageMedia.fromUrl(randomAnimeImage());
        chat.sendMessage(media);
    }

    // 6. Random anime images
    if (body === '.anime' || body === '.animegirl' || body === '.loli') {
        const media = await MessageMedia.fromUrl(randomAnimeImage());
        chat.sendMessage(media);
    }

    // 7. AI simulation
    if (body.startsWith('.ai')) {
        chat.sendMessage('🤖 AI: Hello! I am your VibecoreBot AI simulation. Ask me anything!');
    }

    // Other commands can be added similarly...

});

// Start the bot
client.initialize();
