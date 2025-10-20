/**
 * songfinder.js
 * - searchSongText: uses Spotify text search
 * - identifyAudioFromMedia: uses Audd to recognize audio files (voice note or audio message)
 *
 * Notes:
 * - Spotify uses Client Credentials flow.
 * - Audd receives a file upload (we send the audio bytes).
 */

const fetch = require('node-fetch');
const FormData = require('form-data');

async function getSpotifyToken() {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) throw new Error('Missing Spotify credentials in .env');
  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  const tok = await tokenRes.json();
  return tok.access_token;
}

async function searchSongText(client, msg, query) {
  try {
    const token = await getSpotifyToken();
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=3`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (!data.tracks || !data.tracks.items.length) {
      await msg.reply("No tracks found on Spotify for that query.");
      return;
    }
    let reply = '🎵 *Spotify results:*\n';
    for (const t of data.tracks.items) {
      const artists = t.artists.map(a=>a.name).join(', ');
      reply += `\n*${t.name}* — ${artists}\nAlbum: ${t.album.name}\nPreview: ${t.preview_url || 'no preview'}\nSpotify: ${t.external_urls.spotify}\n`;
    }
    reply += '\nTip: to identify a voice note, reply to it with /identify';
    await msg.reply(reply);
  } catch (e) {
    console.error('Spotify search failed', e);
    await msg.reply('Spotify search failed. Make sure SPOTIFY_CLIENT_ID and SECRET are set.');
  }
}

async function identifyAudioFromMedia(client, msg, media) {
  try {
    if (!media || !media.data) {
      await msg.reply('No audio found to identify.');
      return;
    }
    // media.data is base64
    const base64 = media.data;
    const form = new FormData();
    // Audd accepts a file field. We'll send as Buffer
    const buf = Buffer.from(base64, 'base64');
    form.append('file', buf, { filename: 'audio.ogg' });
    form.append('api_token', process.env.AUDD_API_TOKEN || '');
    form.append('return', 'lyrics,spotify');

    const res = await fetch('https://api.audd.io/', {
      method: 'POST',
      body: form
    });
    const data = await res.json();
    if (!data || !data.result) {
      await msg.reply('Sorry, Audd could not identify the audio.');
      return;
    }
    const r = data.result;
    let reply = `🔎 Identified: *${r.title}* — ${r.artist}\n`;
    if (r.spotify && r.spotify.external_urls && r.spotify.external_urls.spotify) {
      reply += `Spotify: ${r.spotify.external_urls.spotify}\n`;
    }
    if (r.lyrics) {
      // be cautious: lyrics can be long. Send a snippet then offer to send full lyrics.
      const snippet = r.lyrics.substring(0, 600);
      reply += `\n*Lyrics snippet:*\n${snippet}${r.lyrics.length > 600 ? '\n... (lyrics truncated). Reply /lyrics to get full lyrics feature later.' : ''}`;
    }
    await msg.reply(reply);
  } catch (e) {
    console.error('Audd identify error', e);
    await msg.reply('Failed to identify audio via Audd. Check AUDD_API_TOKEN in .env and that file is a voice note or clear music.');
  }
}

module.exports = {
  searchSongText,
  identifyAudioFromMedia
};
