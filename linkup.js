/**
 * linkup.js
 * Polls, votes, split bills
 *
 * Poll shape:
 * {
 *   id, question, options: [{text, votes: []}], createdBy, createdAt
 * }
 *
 * Split shape:
 * {
 *   id, amount, participants: [{name, paid: false}], createdBy, createdAt
 * }
 */

const { v4: uuidv4 } = require('uuid');

async function createPoll(client, msg, db, raw) {
  // format: question|opt1|opt2|opt3
  const parts = raw.split('|').map(p=>p.trim()).filter(Boolean);
  if (parts.length < 2) {
    await msg.reply('Use: /poll create Question | option1 | option2 [, option3]. Need at least 2 options.');
    return;
  }
  const question = parts[0];
  const options = parts.slice(1).map(o => ({ text: o, votes: [] }));
  const poll = { id: uuidv4().slice(0,8), question, options, createdBy: msg.author || msg.from, createdAt: Date.now() };
  db.data.polls.push(poll);
  await msg.reply(`Poll created: *${poll.id}*\n${poll.question}\nOptions:\n${poll.options.map((o,i) => `${i+1}. ${o.text}`).join('\n')}\nVote with: /vote ${poll.id} <optionNumber>\nView dashboard at /polls (if dashboard running).`);
}

async function listPolls(client, msg, db) {
  if (!db.data.polls.length) {
    await msg.reply('No polls active.');
    return;
  }
  let text = '*Active polls:*\n';
  for (const p of db.data.polls) {
    text += `\n${p.id}. ${p.question}\n${p.options.map((o,i)=>`${i+1}. ${o.text} — ${o.votes.length} votes`).join('\n')}\n`;
  }
  await msg.reply(text);
}

async function vote(client, msg, db, args) {
  const parts = args.split(' ').filter(Boolean);
  if (parts.length < 2) {
    await msg.reply('Use: /vote <pollId> <optionNumber>');
    return;
  }
  const pollId = parts[0];
  const optionIndex = parseInt(parts[1], 10) - 1;
  const poll = db.data.polls.find(p => p.id === pollId);
  if (!poll) {
    await msg.reply('Poll not found.');
    return;
  }
  if (optionIndex < 0 || optionIndex >= poll.options.length) {
    await msg.reply('Invalid option number.');
    return;
  }
  const voter = msg.author || msg.from;
  // prevent double vote: remove from other options if exists
  poll.options.forEach(o => { o.votes = o.votes.filter(v => v !== voter); });
  poll.options[optionIndex].votes.push(voter);
  await msg.reply(`Vote registered for "${poll.options[optionIndex].text}" in poll ${poll.id}.`);
}

async function createSplit(client, msg, db, raw) {
  // format: amount|name1,name2,...
  const parts = raw.split('|').map(p => p.trim()).filter(Boolean);
  if (parts.length < 2) {
    await msg.reply('Use: /split create <amount>|name1,name2,...');
    return;
  }
  const amount = parseFloat(parts[0]);
  const names = parts[1].split(',').map(n => n.trim()).filter(Boolean);
  if (!amount || names.length === 0) {
    await msg.reply('Invalid amount or participants.');
    return;
  }
  const perPerson = +(amount / names.length).toFixed(2);
  const participants = names.map(n => ({ name: n, paid: false }));
  const split = { id: uuidv4().slice(0,8), amount, participants, perPerson, createdBy: msg.author || msg.from, createdAt: Date.now() };
  db.data.splits.push(split);
  await msg.reply(`Split created: ${split.id}\nTotal: ${split.amount}\nPer person: ${split.perPerson}\nParticipants: ${names.join(', ')}\nMark paid using reply: /split pay ${split.id} <name>`);
}

async function getSplitStatus(client, msg, db, arg) {
  const id = arg.trim();
  const s = db.data.splits.find(x => x.id === id);
  if (!s) {
    await msg.reply('Split not found.');
    return;
  }
  const lines = s.participants.map(p => `${p.name} — ${p.paid ? '✅ paid' : '❌ unpaid'}`);
  await msg.reply(`Split ${s.id}\nTotal: ${s.amount}\nPer: ${s.perPerson}\n${lines.join('\n')}`);
}

module.exports = {
  createPoll,
  listPolls,
  vote,
  createSplit,
  getSplitStatus
};
