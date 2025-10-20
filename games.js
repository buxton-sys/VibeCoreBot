/**
 * games.js
 * Mini-games: trivia, wyr, tvd (truth or dare), score
 *
 * Data shapes:
 * db.data.games.triviaState[chatId] = { question, options, answerIndex, askedBy, expiresAt }
 * db.data.leaderboard[userId] = points
 */

const { v4: uuidv4 } = require('uuid');

// tiny bank of trivia Qs. Expand as you want or integrate OpenTriviaDB.
const QUESTION_BANK = [
  {
    q: "Which app popularized 'streaks' and made people lose sleep over daily snaps?",
    options: ["Twitter", "Snapchat", "Tumblr", "Telegram"],
    a: 1
  },
  {
    q: "Which language is the web primarily built with?",
    options: ["Python", "C++", "JavaScript", "Rust"],
    a: 2
  },
  {
    q: "What's the file extension for Node.js packages?",
    options: [".java", ".json", ".node", ".js"],
    a: 3
  }
];

const WYR_BANK = [
  "Would you rather always have to reply with GIFs or never send GIFs again?",
  "Would you rather get free flights for life or free food anywhere?",
  "Would you rather be famous on TikTok or rich and unknown?"
];

const TVD_TRUTHS = [
  "What's a secret hobby nobody knows about?",
  "Who was your first crush?"
];

const TVD_DARES = [
  "Send a selfie making the silliest face (only if you want).",
  "Record a 5-sec dramatic monologue and send it."
];

async function startTrivia(client, msg, db) {
  const chatId = msg.from;
  const q = QUESTION_BANK[Math.floor(Math.random() * QUESTION_BANK.length)];
  const optionsText = q.options.map((o, i) => `${i+1}. ${o}`).join('\n');
  const content = `🎯 *Trivia Time!* 🎯\n${q.q}\n\n${optionsText}\n\nReply with /answer <optionNumber> — first correct gets +5 points.`;
  await msg.reply(content);

  db.data.games.triviaState[chatId] = {
    id: uuidv4(),
    question: q.q,
    options: q.options,
    answerIndex: q.a,
    askedBy: msg.author || msg.from,
    expiresAt: Date.now() + (1000 * 60 * 2) // 2 minutes
  };
}

async function answerTrivia(client, msg, db, arg) {
  const chatId = msg.from;
  const state = db.data.games.triviaState[chatId];
  if (!state) {
    await msg.reply("No trivia is running. Send /trivia to start.");
    return;
  }
  if (Date.now() > state.expiresAt) {
    delete db.data.games.triviaState[chatId];
    await msg.reply("Trivia expired — send /trivia for another one.");
    return;
  }
  const pick = parseInt(arg && arg.split(' ')[0], 10);
  if (!pick || pick < 1 || pick > state.options.length) {
    await msg.reply("Send `/answer <optionNumber>` — valid number.");
    return;
  }
  const correct = (pick - 1) === state.answerIndex;
  const contact = await msg.getContact();
  const id = contact.id._serialized || msg.from;

  if (correct) {
    // award points
    db.data.leaderboard[id] = (db.data.leaderboard[id] || 0) + 5;
    await msg.reply(`✅ Correct! ${contact.pushname || contact.number || 'You'} got +5 points.`);
    delete db.data.games.triviaState[chatId];
  } else {
    await msg.reply("Nah — wrong answer. Try again next time.");
  }
}

async function sendWYR(client, msg) {
  const q = WYR_BANK[Math.floor(Math.random() * WYR_BANK.length)];
  await msg.reply(`🤔 *Would you rather?*\n\n${q}\n\nReply with your answer and why. Keep it spicy.`);
}

async function startTVD(client, msg, db) {
  // truth or dare starter
  const choice = Math.random() > 0.5 ? 'truth' : 'dare';
  const prompt = choice === 'truth' ? TVD_TRUTHS[Math.floor(Math.random() * TVD_TRUTHS.length)] : TVD_DARES[Math.floor(Math.random() * TVD_DARES.length)];
  await msg.reply(`🎲 *Truth or Dare* — ${choice.toUpperCase()}\n\n${prompt}`);
}

async function showScore(client, msg, db) {
  const contact = await msg.getContact();
  const id = contact.id._serialized || msg.from;
  const score = db.data.leaderboard[id] || 0;
  // show top 5
  const pairs = Object.entries(db.data.leaderboard || {});
  const sorted = pairs.sort((a,b) => b[1] - a[1]).slice(0,5);
  let topText = '🏆 *Leaderboard (top 5)*\n';
  for (let i=0;i<sorted.length;i++) {
    topText += `${i+1}. ${sorted[i][0]} — ${sorted[i][1]} pts\n`;
  }
  await msg.reply(`Your score: *${score} pts*\n\n${topText}`);
}

module.exports = {
  startTrivia,
  answerTrivia,
  sendWYR,
  startTVD,
  showScore
};
