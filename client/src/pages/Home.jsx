import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';

function HackathonCard({ h }) {
  const ended = h.end_date && new Date(h.end_date) < new Date();
  return (
    <Link
      to={`/h/${h.slug}`}
      className="card glow-box-hover block transition-all duration-200 hover:-translate-y-0.5 animate-fade-in"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h2 className="font-bold text-gray-100 text-base leading-tight">{h.name}</h2>
        <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${ended ? 'bg-gray-800 text-gray-500' : 'bg-neon/10 text-neon'}`}>
          {ended ? 'ended' : 'live'}
        </span>
      </div>
      {h.theme && <p className="text-xs text-neon mb-2">Theme: {h.theme}</p>}
      {h.description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{h.description}</p>
      )}
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>{h.project_count} project{h.project_count !== 1 ? 's' : ''}</span>
        {h.end_date && (
          <span>{ended ? 'Ended' : 'Ends'} {new Date(h.end_date).toLocaleDateString()}</span>
        )}
      </div>
    </Link>
  );
}

export default function Home() {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getHackathons().then(setHackathons).finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="text-center py-16 mb-12">
        <div className="text-neon text-5xl font-bold glow-neon mb-3">#</div>
        <h1 className="text-4xl sm:text-5xl font-bold mb-3">
          Rank<span className="text-neon">Hacker</span>
        </h1>
        <p className="text-gray-500 text-lg mb-8">The best ideas rise to the top.</p>
        <Link to="/create" className="btn-neon text-base px-8 py-3">
          Create Hackathon
        </Link>
      </div>

      {/* Hackathon list */}
      <div>
        <h2 className="text-xs text-gray-600 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="text-neon">//</span> Active Hackathons
        </h2>
        {loading ? (
          <div className="text-center text-gray-600 py-16">loading...</div>
        ) : hackathons.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 mb-4">No hackathons yet.</p>
            <Link to="/create" className="btn-ghost">Create the first one</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {hackathons.map(h => <HackathonCard key={h.id} h={h} />)}
          </div>
        )}
      </div>
    </div>
  );
}
