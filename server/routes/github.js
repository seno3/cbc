const express = require('express');
const router = express.Router();

// POST /api/github/readme
// Body: { url: "https://github.com/owner/repo" }
router.post('/readme', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'GitHub URL is required' });

  // Parse owner/repo from various GitHub URL formats
  const match = url.match(/github\.com\/([^/]+)\/([^/\s?#]+)/);
  if (!match) return res.status(400).json({ error: 'Could not parse GitHub URL' });

  const [, owner, repo] = match;
  const cleanRepo = repo.replace(/\.git$/, '');

  try {
    // Use GitHub API to get README (handles any default branch)
    const apiUrl = `https://api.github.com/repos/${owner}/${cleanRepo}/readme`;
    const apiRes = await fetch(apiUrl, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'RankHacker/1.0',
      },
    });

    if (!apiRes.ok) {
      if (apiRes.status === 404) return res.status(404).json({ error: 'README not found' });
      return res.status(apiRes.status).json({ error: 'GitHub API error' });
    }

    const data = await apiRes.json();
    // Decode base64 content
    const readme = Buffer.from(data.content, 'base64').toString('utf-8');
    res.json({ readme, name: data.name, repo: `${owner}/${cleanRepo}` });
  } catch (err) {
    console.error('GitHub fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch README' });
  }
});

module.exports = router;
