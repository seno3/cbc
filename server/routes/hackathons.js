const express = require('express');
const router = express.Router();
const slugify = require('slugify');
const db = require('../db');
const { updateElo, pickPair } = require('../elo');

// GET /api/hackathons
router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT h.*, COUNT(p.id) as project_count
    FROM hackathons h
    LEFT JOIN projects p ON p.hackathon_id = h.id
    GROUP BY h.id
    ORDER BY h.created_at DESC
  `).all();
  res.json(rows);
});

// POST /api/hackathons
router.post('/', (req, res) => {
  const { name, description, theme, end_date, judge_code } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  let slug = slugify(name, { lower: true, strict: true });
  if (db.prepare('SELECT id FROM hackathons WHERE slug = ?').get(slug)) {
    slug = `${slug}-${Date.now()}`;
  }

  const result = db.prepare(`
    INSERT INTO hackathons (slug, name, description, theme, end_date, judge_code)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(slug, name, description || null, theme || null, end_date || null, judge_code || 'judge');

  res.status(201).json(db.prepare('SELECT * FROM hackathons WHERE id = ?').get(result.lastInsertRowid));
});

// GET /api/hackathons/:slug
router.get('/:slug', (req, res) => {
  const h = db.prepare('SELECT * FROM hackathons WHERE slug = ?').get(req.params.slug);
  if (!h) return res.status(404).json({ error: 'Not found' });
  // Don't expose judge_code in public endpoint
  const { judge_code, ...safe } = h;
  res.json(safe);
});

// GET /api/hackathons/:slug/projects
router.get('/:slug/projects', (req, res) => {
  const h = db.prepare('SELECT * FROM hackathons WHERE slug = ?').get(req.params.slug);
  if (!h) return res.status(404).json({ error: 'Not found' });

  const projects = db.prepare(`
    SELECT * FROM projects WHERE hackathon_id = ? ORDER BY elo DESC
  `).all(h.id);
  res.json(projects);
});

// POST /api/hackathons/:slug/projects
router.post('/:slug/projects', (req, res) => {
  const h = db.prepare('SELECT * FROM hackathons WHERE slug = ?').get(req.params.slug);
  if (!h) return res.status(404).json({ error: 'Not found' });

  const { title, description, github_url, readme, tags, author_name } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  if (!author_name) return res.status(400).json({ error: 'Author name is required' });

  const result = db.prepare(`
    INSERT INTO projects (hackathon_id, title, description, github_url, readme, tags, author_name)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(h.id, title, description || null, github_url || null, readme || null, tags || null, author_name);

  res.status(201).json(db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid));
});

// GET /api/hackathons/:slug/pair?session=xxx
// Returns two projects to compare, smart-selected by ELO proximity
router.get('/:slug/pair', (req, res) => {
  const h = db.prepare('SELECT * FROM hackathons WHERE slug = ?').get(req.params.slug);
  if (!h) return res.status(404).json({ error: 'Not found' });

  const sessionId = req.query.session || 'anon';
  const projects = db.prepare('SELECT * FROM projects WHERE hackathon_id = ? ORDER BY elo DESC').all(h.id);

  if (projects.length < 2) return res.json({ pair: null, done: projects.length < 2 });

  // Get pairs this session has already seen
  const seen = db.prepare(`
    SELECT winner_id, loser_id FROM comparisons
    WHERE hackathon_id = ? AND session_id = ?
  `).all(h.id, sessionId).map(r => [r.winner_id, r.loser_id]);

  const pair = pickPair(projects, seen);
  if (!pair) return res.json({ pair: null, done: true });

  // Strip readme from pair response (heavy)
  const strip = p => { const { readme, ...rest } = p; return rest; };
  res.json({ pair: pair.map(strip), done: false });
});

// POST /api/hackathons/:slug/vote
router.post('/:slug/vote', (req, res) => {
  const h = db.prepare('SELECT * FROM hackathons WHERE slug = ?').get(req.params.slug);
  if (!h) return res.status(404).json({ error: 'Not found' });

  const { winner_id, loser_id, session_id, is_judge } = req.body;
  if (!winner_id || !loser_id || !session_id) {
    return res.status(400).json({ error: 'winner_id, loser_id, session_id required' });
  }

  const winner = db.prepare('SELECT * FROM projects WHERE id = ? AND hackathon_id = ?').get(winner_id, h.id);
  const loser = db.prepare('SELECT * FROM projects WHERE id = ? AND hackathon_id = ?').get(loser_id, h.id);
  if (!winner || !loser) return res.status(400).json({ error: 'Invalid project ids' });

  const { winnerElo, loserElo } = updateElo(winner.elo, loser.elo);

  const update = db.transaction(() => {
    db.prepare('UPDATE projects SET elo = ?, wins = wins + 1 WHERE id = ?').run(winnerElo, winner.id);
    db.prepare('UPDATE projects SET elo = ?, losses = losses + 1 WHERE id = ?').run(loserElo, loser.id);
    db.prepare(`
      INSERT INTO comparisons (hackathon_id, winner_id, loser_id, session_id, is_judge)
      VALUES (?, ?, ?, ?, ?)
    `).run(h.id, winner.id, loser.id, session_id, is_judge ? 1 : 0);
  });
  update();

  res.json({ ok: true, winnerElo, loserElo });
});

// GET /api/hackathons/:slug/leaderboard
router.get('/:slug/leaderboard', (req, res) => {
  const h = db.prepare('SELECT * FROM hackathons WHERE slug = ?').get(req.params.slug);
  if (!h) return res.status(404).json({ error: 'Not found' });

  const projects = db.prepare(`
    SELECT id, title, author_name, tags, elo, wins, losses,
           (wins + losses) as total_votes,
           CASE WHEN (wins + losses) = 0 THEN 0
                ELSE ROUND(wins * 100.0 / (wins + losses), 1)
           END as win_rate
    FROM projects
    WHERE hackathon_id = ?
    ORDER BY elo DESC
  `).all(h.id);
  res.json(projects);
});

// POST /api/hackathons/:slug/verify-judge
router.post('/:slug/verify-judge', (req, res) => {
  const h = db.prepare('SELECT * FROM hackathons WHERE slug = ?').get(req.params.slug);
  if (!h) return res.status(404).json({ error: 'Not found' });
  const { code } = req.body;
  if (code === h.judge_code) return res.json({ ok: true });
  res.status(401).json({ error: 'Invalid judge code' });
});

module.exports = router;
