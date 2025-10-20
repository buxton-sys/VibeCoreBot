/**
 * finsta.js
 * Private vault: /vault add <text>, /myvault, /backupvault
 *
 * Backups use Google Drive service account key file path from env: GOOGLE_SERVICE_ACCOUNT_KEY_PATH
 * and optional folder ID: GOOGLE_DRIVE_FOLDER_ID
 */
const { google } = require('googleapis');
const path = require('path');

function ensureUserVault(db, userId) {
  db.data.vaults = db.data.vaults || {};
  if (!db.data.vaults[userId]) db.data.vaults[userId] = [];
}

async function addVaultEntry(client, msg, db, contact, content) {
  const userId = contact.id._serialized || msg.from;
  ensureUserVault(db, userId);
  db.data.vaults[userId].push({
    id: Date.now().toString(),
    text: content,
    createdAt: Date.now()
  });
  await msg.reply('Saved to your vault. This stays private on the bot server. Use /backupvault to push a copy to your Google Drive.');
}

async function listVault(client, msg, db, contact) {
  const userId = contact.id._serialized || msg.from;
  ensureUserVault(db, userId);
  const entries = db.data.vaults[userId] || [];
  if (!entries.length) {
    await msg.reply('Your vault is empty. Add something with: /vault add I am vibin...');
    return;
  }
  // show last 5 summaries
  const last = entries.slice(-10).reverse();
  let text = '*Your Vault (last items)*\n';
  last.forEach(e => {
    const short = e.text.length > 200 ? e.text.slice(0,200) + '...' : e.text;
    text += `\n• ${new Date(e.createdAt).toLocaleString()} — ${short}\n`;
  });
  await msg.reply(text);
}

async function backupVaultToDrive(client, msg, db, contact) {
  const userId = contact.id._serialized || msg.from;
  ensureUserVault(db, userId);
  const entries = db.data.vaults[userId] || [];
  if (!entries.length) {
    await msg.reply('No vault items to backup.');
    return;
  }
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH) {
    await msg.reply('Google Drive backup not configured. Set GOOGLE_SERVICE_ACCOUNT_KEY_PATH and GOOGLE_DRIVE_FOLDER_ID in .env.');
    return;
  }

  try {
    const keyFile = path.resolve(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH);
    if (!fs.existsSync(keyFile)) throw new Error('Service account key file not found at ' + keyFile);

    const auth = new google.auth.GoogleAuth({
      keyFile,
      scopes: ['https://www.googleapis.com/auth/drive.file']
    });
    const drive = google.drive({ version: 'v3', auth });

    // create a txt file payload
    const content = entries.map(e => `${new Date(e.createdAt).toISOString()}:\n${e.text}\n\n---\n`).join('\n');
    const fileName = `vibecore-vault-${contact.pushname || userId}-${Date.now()}.txt`;
    const fileMetadata = {
      name: fileName,
      parents: process.env.GOOGLE_DRIVE_FOLDER_ID ? [process.env.GOOGLE_DRIVE_FOLDER_ID] : []
    };
    const media = {
      mimeType: 'text/plain',
      body: Buffer.from(content, 'utf8')
    };

    const res = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id,webViewLink'
    });

    const fileId = res.data.id;
    const link = res.data.webViewLink || `https://drive.google.com/file/d/${fileId}/view`;
    await msg.reply(`Vault backed up to Google Drive: ${link}\nOnly the bot account can see this right now. Keep your service account safe.`);
  } catch (e) {
    console.error('Drive backup failed', e);
    await msg.reply('Failed to backup to Google Drive. Check service account key and Drive API access.');
  }
}

module.exports = {
  addVaultEntry,
  listVault,
  backupVaultToDrive
};
