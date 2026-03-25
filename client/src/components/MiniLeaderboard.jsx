import { Link } from 'react-router-dom';

const medals = ['🥇', '🥈', '🥉'];

export default function MiniLeaderboard({ entries, slug }) {
  return (
    <div className="card">
      <h3 className="text-xs uppercase tracking-widest text-gray-600 mb-3 flex items-center gap-1">
        <span className="text-neon">//</span> Top Ranked
      </h3>
      <div className="space-y-2">
        {entries.map((p, i) => (
          <div key={p.id} className="flex items-start gap-2 text-sm">
            <span className="shrink-0 w-5 text-center">{medals[i] || `${i + 1}.`}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-200 truncate leading-tight">{p.title}</p>
              <p className="text-xs text-gray-600">
                ELO <span className="text-neon">{p.elo}</span>
                {p.total_votes > 0 && <span> · {p.win_rate}% win</span>}
              </p>
            </div>
          </div>
        ))}
      </div>
      {slug && (
        <Link to={`/h/${slug}/results`} className="block text-xs text-neon hover:underline mt-4 text-center">
          Full leaderboard →
        </Link>
      )}
    </div>
  );
}
