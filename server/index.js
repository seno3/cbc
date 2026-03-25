const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.use('/api/hackathons', require('./routes/hackathons'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/github', require('./routes/github'));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, '../client/dist/index.html'))
  );
}

app.listen(PORT, () => {
  console.log(`RankHacker server → http://localhost:${PORT}`);
});
