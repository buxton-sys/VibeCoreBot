/**
 * dashboard.js
 * Simple Express server that reads db.json and shows active polls + leaderboard.
 *
 * Run with: npm run dashboard
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const { Low, JSONFile } = require('lowdb');

const PORT = process.env.DASHBOARD_PORT || 4000;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const adapter = new JSONFile(path.join(__dirname, 'db.json'));
const db = new Low(adapter);

async function readDB() {
  await db.read();
  db.data = db.data || { polls: [], leaderboard: {} };
}

app.get('/api/polls', async (req, res) => {
  await readDB();
  res.json(db.data.polls || []);
});

app.get('/api/leaderboard', async (req, res) => {
  await readDB();
  res.json(db.data.leaderboard || {});
});

// Minimal UI
app.get('/', (req, res) => {
  res.send(`
    <html>
    <head><title>VibeCore Dashboard</title></head>
    <body style="font-family:system-ui,Segoe UI,Roboto">
      <h1>VibeCore — Dashboard</h1>
      <div id="polls"></div>
      <div id="leaderboard"></div>
      <script>
        async function load() {
          const p = await fetch('/api/polls').then(r=>r.json());
          const l = await fetch('/api/leaderboard').then(r=>r.json());
          document.getElementById('polls').innerHTML = '<h2>Polls</h2>' + (p.length ? p.map(pol=> '<div style="border:1px solid #eee;padding:8px;margin:8px;"><b>'+pol.id+'</b>: '+pol.question+'<br/>'+pol.options.map((o,i)=> (i+1)+'. '+o.text+' — '+o.votes.length+' votes').join('<br/>') + '</div>').join('') : '<p>No polls</p>');
          const sorted = Object.entries(l).sort((a,b)=>b[1]-a[1]).slice(0,10);
          document.getElementById('leaderboard').innerHTML = '<h2>Leaderboard</h2>' + (sorted.length ? '<ol>'+sorted.map(s => '<li>'+s[0]+' — '+s[1]+' pts</li>').join('')+'</ol>' : '<p>No scores</p>');
        }
        load();
        setInterval(load, 5000);
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Dashboard running on http://localhost:${PORT}`);
});
