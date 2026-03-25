import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../utils/api';

const medals = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const { slug } = useParams();
  const [hackathon, setHackathon] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getHackathon(slug).then(setHackathon).catch(() => {}),
      api.getLeaderboard(slug).then(setEntries),
    ]).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="text-center text-gray-600 py-20">loading...</div>;

  const maxElo = entries[0]?.elo || 1000;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            <span className="text-neon">//</span> Results
          </h1>
          {hackathon && <p className="text-gray-500 text-sm mt-0.5">{hackathon.name}</p>}
        </div>
        <Link to={`/h/${slug}`} className="btn-ghost text-sm">← Vote</Link>
      </div>

      {entries.length === 0 ? (
        <div className="card text-center py-16 text-gray-600">No projects yet.</div>
      ) : (
        <div className="space-y-3">
          {entries.map((p, i) => {
            const barWidth = maxElo > 0 ? (p.elo / maxElo) * 100 : 0;
            return (
              <div key={p.id} className="card relative overflow-hidden">
                {/* ELO bar background */}
                <div
                  className="absolute inset-y-0 left-0 bg-neon/5 transition-all duration-700"
                  style={{ width: `${barWidth}%` }}
                />
                <div className="relative flex items-start gap-3">
                  <span className="text-2xl shrink-0 w-8 text-center">{medals[i] || <span className="text-gray-600 text-base font-bold">{i + 1}</span>}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-gray-100">{p.title}</h3>
                      <span className="text-neon font-bold text-sm shrink-0">ELO {p.elo}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">@{p.author_name}</p>
                    {p.tags && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {p.tags.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                          <span key={t} className="tag">{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-3 text-xs text-gray-600">
                      <span className="text-green-500">{p.wins}W</span>
                      <span className="text-red-500">{p.losses}L</span>
                      <span>{p.total_votes} comparisons</span>
                      {p.total_votes > 0 && <span className="text-neon">{p.win_rate}% win rate</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
