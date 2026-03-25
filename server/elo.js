const K = 32;

/**
 * Calculate new ELO scores after a match.
 * @returns {{ winnerElo: number, loserElo: number }}
 */
function updateElo(winnerElo, loserElo) {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const expectedLoser = 1 - expectedWinner;

  return {
    winnerElo: Math.round(winnerElo + K * (1 - expectedWinner)),
    loserElo: Math.round(loserElo + K * (0 - expectedLoser)),
  };
}

/**
 * Pick the best unseen pair for a session using ELO proximity.
 * Prefers pairs that are close in ELO and haven't been seen by this session.
 */
function pickPair(projects, seenPairs) {
  if (projects.length < 2) return null;

  const seenSet = new Set(seenPairs.map(([a, b]) => pairKey(a, b)));
  const candidates = [];

  for (let i = 0; i < projects.length; i++) {
    for (let j = i + 1; j < projects.length; j++) {
      const a = projects[i];
      const b = projects[j];
      if (seenSet.has(pairKey(a.id, b.id))) continue;
      candidates.push({ a, b, eloDiff: Math.abs(a.elo - b.elo) });
    }
  }

  if (candidates.length === 0) return null;

  // Sort by ELO difference ascending (closest first) with small random jitter
  candidates.sort((x, y) => x.eloDiff - y.eloDiff + (Math.random() - 0.5) * 50);

  // Randomly pick from top 5 to add variety
  const pool = candidates.slice(0, Math.min(5, candidates.length));
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  return chosen ? [chosen.a, chosen.b] : null;
}

function pairKey(a, b) {
  return [Math.min(a, b), Math.max(a, b)].join('-');
}

module.exports = { updateElo, pickPair };
