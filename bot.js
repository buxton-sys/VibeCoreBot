// VibecoreBot.js - Full setup
// Owner: Delaquez
import pkg from 'whatsapp-web.js';
const { Client, MessageMedia } = pkg;
import qrcode from 'qrcode-terminal';
import fs from 'fs';
import axios from 'axios';
import ytdl from 'ytdl-core';
import puppeteer from 'puppeteer-core';
import path from 'path';

// Set up Chrome path and profile
const chromeExecutablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chromeProfilePath = 'C:\\Users\\hp\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\VibeCoreprofile';

// Initialize client
const client = new Client({
    puppeteer: {
        executablePath: chromeExecutablePath,
        userDataDir: chromeProfilePath,
        headless: false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-extensions',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--window-size=1280,720'
        ]
    }
});

client.setMaxListeners(50);

// ----------------------
// QR Code & Ready
// ----------------------
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('VibeCoreBot is online!');
});

// ----------------------
// Utility Functions
// ----------------------

// Fetch random dog image
async function getDogImage() {
    const res = await axios.get('https://dog.ceo/api/breeds/image/random');
    return res.data.message;
}

// Fetch random anime image (placeholder)
async function getAnimeImage() {
    return 'https://placekitten.com/400/400';
}

// Send media from URL
async function sendMedia(chat, url, filename) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const media = new MessageMedia('image/jpeg', Buffer.from(response.data, 'binary').toString('base64'), filename);
    await chat.sendMessage(media);
}

// YouTube download helper
async function downloadYouTube(url, type) {
    try {
        const info = await ytdl.getInfo(url);
        const format = ytdl.chooseFormat(info.formats, { quality: type === 'audio' ? 'highestaudio' : 'highestvideo' });
        const filePath = path.join('./temp', `${type}-${Date.now()}.${type === 'audio' ? 'mp3' : 'mp4'}`);
        const stream = ytdl(url, { format });
        const writeStream = fs.createWriteStream(filePath);
        stream.pipe(writeStream);
        await new Promise(resolve => writeStream.on('finish', resolve));
        return filePath;
    } catch (err) {
        console.error(err);
        return null;
    }
}

// ----------------------
// Tic-Tac-Toe Game Logic
// ----------------------
let games = {};

function newTicTacToe(chatId, playerX, playerO) {
    games[chatId] = {
        board: [[' ', ' ', ' '], [' ', ' ', ' '], [' ', ' ', ' ']],
        turn: 'X',
        players: { X: playerX, O: playerO }
    };
}

function printBoard(board) {
    return board.map(row => row.join('|')).join('\n-----\n');
}

function makeMove(chatId, player, x, y) {
    const game = games[chatId];
    if (!game) return 'No active game.';
    if (game.players[game.turn] !== player) return 'Not your turn.';
    if (game.board[x][y] !== ' ') return 'Cell taken.';
    game.board[x][y] = game.turn;
    game.turn = game.turn === 'X' ? 'O' : 'X';
    return printBoard(game.board);
}

// ----------------------
// Message Handler (Basic Commands)
// ----------------------
client.on('message', async message => {
    const chat = await message.getChat();
    const from = message.from;
    const msg = message.body.toLowerCase();

    // Menu
    if (msg.startsWith('.menu')) {
        let menuText = `
╭━❮ *VibeCoreBot MENU* ❯━⊷
┃▸ .play - Download audio from YouTube
┃▸ .song - Download song from YouTube
┃▸ .video - Download video from YouTube
┃▸ .img - Download image
┃▸ .yts - Search videos on YouTube
┃▸ .dog - Random dog image
┃▸ .anime - Random anime image
┃▸ .tic - Start Tic Tac Toe
┃▸ .alive - Check if bot is online
┃▸ .ping - Check bot speed
┃▸ .owner - Owner info
╰━━━━━━━━━━━━⪼
        `;
        chat.sendMessage(menuText);
        return;
    }

    // Dog Image
    if (msg.startsWith('.dog')) {
        const url = await getDogImage();
        await sendMedia(chat, url, 'dog.jpg');
        return;
    }

    // Anime Image
    if (msg.startsWith('.anime')) {
        const url = await getAnimeImage();
        await sendMedia(chat, url, 'anime.jpg');
        return;
    }

    // Bot Alive
    if (msg.startsWith('.alive')) {
        chat.sendMessage('VibeCoreBot is online! Owner: Delaquez');
        return;
    }

    // Owner Info
    if (msg.startsWith('.owner')) {
        chat.sendMessage('Owner: Delaquez\nAnime profile: https://api.waifu.pics/sfw/waifu');
        return;
    }

    // YouTube Audio
    if (msg.startsWith('.play')) {
        let parts = message.body.split(' ');
        if (parts.length < 2) {
            chat.sendMessage('Usage: .play <YouTube URL>');
            return;
        }
        const url = parts[1];
        const audioPath = await downloadYouTube(url, 'audio');
        if (!audioPath) return chat.sendMessage('Failed to download audio.');
        const media = MessageMedia.fromFilePath(audioPath);
        await chat.sendMessage(media);
        fs.unlinkSync(audioPath);
        return;
    }

    // YouTube Video
    if (msg.startsWith('.video')) {
        let parts = message.body.split(' ');
        if (parts.length < 2) {
            chat.sendMessage('Usage: .video <YouTube URL>');
            return;
        }
        const url = parts[1];
        const videoPath = await downloadYouTube(url, 'video');
        if (!videoPath) return chat.sendMessage('Failed to download video.');
        const media = MessageMedia.fromFilePath(videoPath);
        await chat.sendMessage(media);
        fs.unlinkSync(videoPath);
        return;
    }

});
// ----------------------
// Social Media Placeholders
// ----------------------
async function sendTikTok(chat, link) {
    // Placeholder: Replace with TikTok download API or scraper
    chat.sendMessage(`TikTok download placeholder for: ${link}`);
}

async function sendInstagram(chat, link) {
    // Placeholder: Replace with IG media fetch logic
    chat.sendMessage(`Instagram download placeholder for: ${link}`);
}

async function sendFacebook(chat, link) {
    // Placeholder: Replace with FB media fetch logic
    chat.sendMessage(`Facebook download placeholder for: ${link}`);
}

// ----------------------
// AI Chat Simulation (Simple Echo + Placeholder)
// ----------------------
async function aiReply(message) {
    // Placeholder for AI logic
    const text = message.body;
    // Simple echo for now
    return `AI says: ${text}`;
}

// ----------------------
// Advanced Commands
// ----------------------
client.on('message', async message => {
    const chat = await message.getChat();
    const from = message.from;
    const msg = message.body.toLowerCase();

    // Ping / Bot Speed
    if (msg.startsWith('.ping')) {
        const start = Date.now();
        await chat.sendMessage('🏓 Pong!');
        const end = Date.now();
        chat.sendMessage(`Response time: ${end - start}ms`);
        return;
    }

    // Tic Tac Toe Start
    if (msg.startsWith('.tic')) {
        const mentions = message.mentionedIds;
        if (mentions.length < 1) {
            chat.sendMessage('Mention a user to play Tic Tac Toe with.');
            return;
        }
        const opponent = mentions[0];
        newTicTacToe(chat.id._serialized, from, opponent);
        chat.sendMessage('New Tic Tac Toe started!\n' + printBoard(games[chat.id._serialized].board));
        return;
    }

    // Tic Tac Toe Move
    if (msg.startsWith('.move')) {
        const parts = msg.split(' ');
        if (parts.length !== 3) {
            chat.sendMessage('Usage: .move <row> <col>');
            return;
        }
        const x = parseInt(parts[1]) - 1;
        const y = parseInt(parts[2]) - 1;
        const result = makeMove(chat.id._serialized, from, x, y);
        chat.sendMessage(result);
        return;
    }

    // TikTok Download
    if (msg.startsWith('.tiktok')) {
        const parts = msg.split(' ');
        if (parts.length < 2) {
            chat.sendMessage('Usage: .tiktok <link>');
            return;
        }
        await sendTikTok(chat, parts[1]);
        return;
    }

    // Instagram Download
    if (msg.startsWith('.ig')) {
        const parts = msg.split(' ');
        if (parts.length < 2) {
            chat.sendMessage('Usage: .ig <link>');
            return;
        }
        await sendInstagram(chat, parts[1]);
        return;
    }

    // Facebook Download
    if (msg.startsWith('.fb')) {
        const parts = msg.split(' ');
        if (parts.length < 2) {
            chat.sendMessage('Usage: .fb <link>');
            return;
        }
        await sendFacebook(chat, parts[1]);
        return;
    }

    // AI Chat
    if (msg.startsWith('.ai')) {
        const reply = await aiReply(message);
        chat.sendMessage(reply);
        return;
    }

    // YouTube Search Placeholder
    if (msg.startsWith('.yts')) {
        chat.sendMessage('YouTube search placeholder for: ' + message.body.split(' ').slice(1).join(' '));
        return;
    }
});

// ----------------------
// Scheduled Tasks / Keep Alive
// ----------------------
setInterval(() => {
    console.log('VibeCoreBot heartbeat check...');
}, 60000);

// ----------------------
// Temp folder check
// ----------------------
if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');
// ----------------------
// YouTube Audio Download
// ----------------------
async function downloadYouTubeAudio(url) {
    try {
        if (!ytdl.validateURL(url)) return null;
        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
        const filePath = `./temp/${title}-${Date.now()}.mp3`;
        const stream = ytdl(url, { filter: 'audioonly' });
        const writeStream = fs.createWriteStream(filePath);
        stream.pipe(writeStream);
        return new Promise((resolve, reject) => {
            writeStream.on('finish', () => resolve(filePath));
            writeStream.on('error', reject);
        });
    } catch (err) {
        console.error('YouTube audio download error:', err);
        return null;
    }
}

// ----------------------
// YouTube Video Download
// ----------------------
async function downloadYouTubeVideo(url) {
    try {
        if (!ytdl.validateURL(url)) return null;
        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
        const filePath = `./temp/${title}-${Date.now()}.mp4`;
        const stream = ytdl(url, { quality: 'highestvideo' });
        const writeStream = fs.createWriteStream(filePath);
        stream.pipe(writeStream);
        return new Promise((resolve, reject) => {
            writeStream.on('finish', () => resolve(filePath));
            writeStream.on('error', reject);
        });
    } catch (err) {
        console.error('YouTube video download error:', err);
        return null;
    }
}

// ----------------------
// Command Integration for YouTube
// ----------------------
client.on('message', async msg => {
    const chat = await msg.getChat();
    const from = msg.from;
    const text = msg.body.toLowerCase();

    if (text.startsWith('.play ')) {
        const url = msg.body.split(' ')[1];
        chat.sendMessage('Downloading audio, please wait...');
        const file = await downloadYouTubeAudio(url);
        if (!file) return chat.sendMessage('Failed to download audio.');
        const media = MessageMedia.fromFilePath(file);
        await chat.sendMessage(media, { caption: '🎵 Your Audio' });
        fs.unlinkSync(file);
    }

    if (text.startsWith('.video ')) {
        const url = msg.body.split(' ')[1];
        chat.sendMessage('Downloading video, please wait...');
        const file = await downloadYouTubeVideo(url);
        if (!file) return chat.sendMessage('Failed to download video.');
        const media = MessageMedia.fromFilePath(file);
        await chat.sendMessage(media, { caption: '📹 Your Video' });
        fs.unlinkSync(file);
    }
});

// ----------------------
// Game Enhancements
// ----------------------
// Checkers
function isMoveValidCheckers(board, fromRow, fromCol, toRow, toCol) {
    if (toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7) return false;
    if (board[toRow][toCol] !== ' ') return false;
    return true;
}

function applyCheckersMove(board, fromRow, fromCol, toRow, toCol) {
    if (!isMoveValidCheckers(board, fromRow, fromCol, toRow, toCol)) return false;
    board[toRow][toCol] = board[fromRow][fromCol];
    board[fromRow][fromCol] = ' ';
    return true;
}

// Chess helper
function isValidChessMove(chessInstance, move) {
    try {
        return chessInstance.move(move, { sloppy: true }) !== null;
    } catch {
        return false;
    }
}

// ----------------------
// Menu Enhancements
// ----------------------
function buildMainMenu() {
    return `
╭━❮ *VibeCoreBot Menu* ❯━⊷
┃🎵 Media
┃  .play
┃  .song
┃  .video
┃  .img
┃
┃🎮 Games
┃  .tic
┃  .checkers
┃  .chess
┃
┃📱 Social Media
┃  .ig
┃  .fb
┃  .tiktok
┃
┃🤖 Bot Info
┃  .owner
┃  .ai
┃  .alive
╰━━━━━━━━━━━━⪼
`;
}

client.on('message', async msg => {
    if (msg.body === '.menu' || msg.body === '.menu2') {
        await msg.reply(buildMainMenu());
    }
});

// ----------------------
// Placeholder Media Fetching (IG/FB/TikTok)
// ----------------------
async function fetchPlaceholderMedia(type, url) {
    return `Placeholder: ${type} media for ${url}`;
}

// ----------------------
// Placeholder Command Integration
// ----------------------
client.on('message', async msg => {
    const chat = await msg.getChat();
    const text = msg.body.toLowerCase();

    if (text.startsWith('.tiktok ')) {
        const url = msg.body.split(' ')[1];
        const placeholder = await fetchPlaceholderMedia('TikTok', url);
        chat.sendMessage(placeholder);
    }

    if (text.startsWith('.ig ')) {
        const url = msg.body.split(' ')[1];
        const placeholder = await fetchPlaceholderMedia('Instagram', url);
        chat.sendMessage(placeholder);
    }

    if (text.startsWith('.fb ')) {
        const url = msg.body.split(' ')[1];
        const placeholder = await fetchPlaceholderMedia('Facebook', url);
        chat.sendMessage(placeholder);
    }
});

// ----------------------
// Keep Alive / Temp Folder
// ----------------------
if (!fs.existsSync('./downloads')) fs.mkdirSync('./downloads');
// ----------------------
// Simulated Presence (Typing / Recording)
// ----------------------
client.on('message', async msg => {
    try {
        if (Math.random() < 0.7) { // 70% chance simulate typing
            await client.sendTyping(msg.from, 'composing');
            await new Promise(r => setTimeout(r, 800 + Math.random() * 1200)); // 0.8–2s delay
        }
        if (Math.random() < 0.4) { // 40% chance simulate recording
            await client.sendTyping(msg.from, 'recording');
            await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));
        }
    } catch (err) {
        console.error('Presence simulation error:', err);
    }
});

// ----------------------
// AI Chat Simulation (Improved)
// ----------------------
client.on('message', async msg => {
    const text = msg.body.trim();
    if (!text.startsWith('.ai ')) return;

    const userText = text.slice(4).trim();
    if (!userText) return msg.reply('Please type a message after .ai');

    const simulatedResponses = [
        `Hmm, I see. You said: "${userText}"`,
        `Interesting! Can you explain more about "${userText}"?`,
        `LOL! I never thought of "${userText}" like that.`,
        `Gotcha! So you mean "${userText}"?`,
        `That's cool! "${userText}" sounds fun to discuss.`
    ];

    try {
        await client.sendTyping(msg.from, 'composing');
        await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
        await msg.reply(simulatedResponses[Math.floor(Math.random() * simulatedResponses.length)]);
    } catch (err) {
        console.error('AI simulation error:', err);
        await msg.reply('Oops! Something went wrong with AI simulation.');
    }
});

// ----------------------
// TicTacToe Finalization
// ----------------------
client.on('message', async msg => {
    const text = msg.body.toLowerCase();
    const chatId = msg.from;
    if (!text.startsWith('.tic ') && !text.startsWith('.ttt ')) return;

    if (!ticTacToeGames[chatId]) {
        ticTacToeGames[chatId] = Array(9).fill('⬜'); // initialize board
        await msg.reply(`🎮 TicTacToe started!\n${ticTacToeGames[chatId].join(' ')}`);
        return;
    }

    const move = parseInt(text.split(' ')[1]);
    if (isNaN(move) || move < 1 || move > 9 || ticTacToeGames[chatId][move - 1] !== '⬜') {
        return await msg.reply('Invalid move! Pick a number 1-9 on an empty square.');
    }

    ticTacToeGames[chatId][move - 1] = '❌';
    // Bot random move
    const emptyIndices = ticTacToeGames[chatId].map((v, i) => v === '⬜' ? i : -1).filter(i => i !== -1);
    if (emptyIndices.length > 0) {
        const botMove = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        ticTacToeGames[chatId][botMove] = '⭕';
    }

    await msg.reply(ticTacToeGames[chatId].join(' '));
    // Check for game over (simple check)
    if (!ticTacToeGames[chatId].includes('⬜')) {
        await msg.reply('Game Over! Board is full.');
        delete ticTacToeGames[chatId];
    }
});

// ----------------------
// Error Handling & Logging
// ----------------------
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', err => {
    console.error('Uncaught Exception:', err);
});

// ----------------------
// Initialize Client (Final)
// ----------------------
client.initialize().then(() => console.log('VibeCoreBot fully initialized!'))
    .catch(err => console.error('Client init failed:', err));

// ----------------------
// Ensure temp directories exist
// ----------------------
if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');
if (!fs.existsSync('./downloads')) fs.mkdirSync('./downloads');

// ----------------------
// End of Batch 4
// ----------------------
console.log('Batch 4 loaded — bot ready.');
