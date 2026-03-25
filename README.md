# RankHacker

> The best ideas rise to the top.

A hackathon project ranking app using ELO-based pairwise voting. Participants pick winners in a "Would You Rather" style head-to-head. Judges get a richer view with README previews. Rankings converge via the ELO algorithm.

## Features

- **Pairwise voting** — Two projects shown at a time; click/tap/keyboard to vote
- **ELO ranking** — Smart algorithm selects close-ELO matchups; updates after every vote
- **GitHub README extraction** — Paste a GitHub URL to auto-pull the README into your submission
- **Judge mode** — Separate passcode-protected view with expandable READMEs and full project detail
- **Live leaderboard** — Real-time ELO rankings with win/loss stats
- **Keyboard shortcuts** — `←`/`→` or `1`/`2` to vote without touching the mouse

## Stack

| Layer    | Tech                        |
| -------- | --------------------------- |
| Frontend | React 18 + Vite + Tailwind  |
| Backend  | Node.js + Express           |
| Database | SQLite via better-sqlite3   |
| Routing  | React Router v6             |

## Setup

### Requirements
- Node.js 18+

### Install

```bash
# Install all dependencies
npm run install:all
```

### Run (development)

```bash
# Starts both server (port 3001) and client (port 5173) concurrently
npm run dev
```

Or separately:

```bash
npm run dev:server   # http://localhost:3001
npm run dev:client   # http://localhost:5173
```

### Run (production)

```bash
npm run build        # builds client into client/dist
npm start            # serves everything from port 3001
```

## Routes

| Path                  | Description                         |
| --------------------- | ----------------------------------- |
| `/`                   | Homepage — list all hackathons      |
| `/create`             | Create a new hackathon              |
| `/h/:slug`            | Voting UI (pairwise)                |
| `/h/:slug/submit`     | Submit a project (+ GitHub import)  |
| `/h/:slug/judge`      | Judge view (passcode required)      |
| `/h/:slug/results`    | Full ELO leaderboard                |

## API

| Method | Path                              | Description                  |
| ------ | --------------------------------- | ---------------------------- |
| GET    | `/api/hackathons`                 | List all hackathons          |
| POST   | `/api/hackathons`                 | Create hackathon             |
| GET    | `/api/hackathons/:slug`           | Get hackathon                |
| GET    | `/api/hackathons/:slug/projects`  | List projects                |
| POST   | `/api/hackathons/:slug/projects`  | Submit project               |
| GET    | `/api/hackathons/:slug/pair`      | Get next smart pair to vote  |
| POST   | `/api/hackathons/:slug/vote`      | Record vote, update ELO      |
| GET    | `/api/hackathons/:slug/leaderboard` | Full ranked list           |
| POST   | `/api/hackathons/:slug/verify-judge` | Verify judge passcode     |
| GET    | `/api/projects/:id`               | Full project detail + README |
| POST   | `/api/github/readme`              | Extract README from GitHub   |

## ELO Algorithm

- All projects start at **ELO 1000**
- K-factor: **32** (standard)
- Pair selection: picks the **closest-ELO unseen pair** for the current session, with slight randomness to add variety
- Judges vote on a separate session (`judge_<sessionId>`) so their votes are tracked independently

## Judge Setup

When creating a hackathon, set a **judge passcode** (default: `judge`). Share the `/h/:slug/judge` URL and the passcode with your judging panel. Judges see:

- Full project detail + expandable README
- Same ELO voting, but flagged as judge votes in the DB
- Keyboard shortcuts (← → or 1/2)
