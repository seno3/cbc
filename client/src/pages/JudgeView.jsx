import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import confetti from 'canvas-confetti';
import { api } from '../utils/api';
import { getSessionId } from '../utils/session';

// Judge passcode gate
function JudgeGate({ slug, onVerified }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  async function verify(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.verifyJudge(slug, code);
      onVerified(code);
      toast.success('Access granted');
    } catch {
      toast.error('Incorrect judge code');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20 animate-fade-in">
      <div className="card glow-box text-center">
        <div className="text-neon text-3xl mb-3">⚖</div>
        <h2 className="font-bold text-lg mb-1">Judge Access</h2>
        <p className="text-gray-600 text-sm mb-6">Enter your judge passcode to continue.</p>
        <form onSubmit={verify} className="space-y-3">
          <input
            className="input text-center tracking-widest"
            type="password"
            placeholder="••••••"
            value={code}
            onChange={e => setCode(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn-neon w-full" disabled={loading}>
            {loading ? 'Checking...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Full-detail project panel for judges
function JudgeProjectPanel({ project, onChoose, side, animating, chosen }) {
  const [showReadme, setShowReadme] = useState(false);
  const [fullProject, setFullProject] = useState(null);
  const [loadingReadme, setLoadingReadme] = useState(false);
  const tags = project.tags ? project.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  async function fetchFull() {
    if (fullProject) { setShowReadme(true); return; }
    setLoadingReadme(true);
    try {
      const p = await api.getProject(project.id);
      setFullProject(p);
      setShowReadme(true);
    } catch {
      toast.error('Could not load project details');
    } finally {
      setLoadingReadme(false);
    }
  }

  const border = chosen
    ? 'border-neon shadow-lg shadow-neon/20'
    : animating && !chosen
    ? 'border-red-900/50 opacity-40'
    : 'border-border hover:border-neon/40';

  return (
    <div className={`card border-2 flex flex-col gap-3 transition-all duration-200 ${border}`}>
      {/* ELO badge */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-gray-100 text-base leading-snug">{project.title}</h3>
        <span className="text-xs text-neon shrink-0 bg-neon/10 px-2 py-0.5 rounded">ELO {project.elo}</span>
      </div>

      <div className="text-xs text-neon">@{project.author_name}</div>

      {project.description && (
        <p className="text-sm text-gray-400 leading-relaxed">{project.description}</p>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
      )}

      {project.github_url && (
        <a
          href={project.github_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-neon-blue hover:underline truncate"
        >
          ↗ {project.github_url.replace('https://github.com/', 'github.com/')}
        </a>
      )}

      <div className="flex gap-2 text-xs text-gray-600">
        <span className="text-green-500">{project.wins}W</span>
        <span className="text-red-500">{project.losses}L</span>
      </div>

      {/* README toggle */}
      <div>
        <button
          onClick={fetchFull}
          className="text-xs text-neon-blue hover:underline"
          disabled={loadingReadme}
        >
          {loadingReadme ? 'Loading...' : showReadme ? 'Hide README ▲' : 'View README ▼'}
        </button>
        {showReadme && fullProject?.readme && (
          <div
            className="mt-3 max-h-72 overflow-y-auto border border-border rounded p-3 bg-bg readme-body"
            onClick={() => {}}
          >
            <ReactMarkdown>{fullProject.readme}</ReactMarkdown>
          </div>
        )}
        {showReadme && fullProject && !fullProject.readme && (
          <p className="text-xs text-gray-600 mt-2">No README attached.</p>
        )}
      </div>

      {/* Vote button */}
      <button
        onClick={onChoose}
        className="btn-neon w-full mt-auto"
        disabled={animating}
      >
        {side === 'left' ? '← ' : ''}Pick This{side === 'right' ? ' →' : ''}
      </button>
    </div>
  );
}

export default function JudgeView() {
  const { slug } = useParams();
  const [verified, setVerified] = useState(() => !!sessionStorage.getItem(`rh_judge_${slug}`));
  const [hackathon, setHackathon] = useState(null);
  const [pair, setPair] = useState(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [chosen, setChosen] = useState(null);
  const [voteCount, setVoteCount] = useState(0);
  const sessionId = `judge_${getSessionId()}`;

  function onVerified(code) {
    sessionStorage.setItem(`rh_judge_${slug}`, code);
    setVerified(true);
  }

  const loadPair = useCallback(async () => {
    try {
      const res = await api.getPair(slug, sessionId);
      if (res.done || !res.pair) { setDone(true); setPair(null); }
      else { setPair(res.pair); setDone(false); }
    } catch (err) {
      toast.error(err.message);
    }
  }, [slug, sessionId]);

  useEffect(() => {
    if (!verified) return;
    Promise.all([
      api.getHackathon(slug).then(setHackathon).catch(() => {}),
      loadPair(),
    ]).finally(() => setLoading(false));
  }, [verified, slug, loadPair]);

  async function handleVote(winnerId, loserId) {
    if (voting) return;
    setVoting(true);
    setChosen(winnerId);

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#00ff41', '#00cc33', '#00b4ff'],
    });

    try {
      await api.vote(slug, {
        winner_id: winnerId,
        loser_id: loserId,
        session_id: sessionId,
        is_judge: true,
      });
      setVoteCount(v => v + 1);
      toast.success('Judged!', { duration: 800 });
    } catch (err) {
      toast.error(err.message);
    }

    setTimeout(async () => {
      setChosen(null);
      setVoting(false);
      await loadPair();
    }, 400);
  }

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e) {
      if (!pair || voting) return;
      if (e.key === 'ArrowLeft' || e.key === '1') handleVote(pair[0].id, pair[1].id);
      if (e.key === 'ArrowRight' || e.key === '2') handleVote(pair[1].id, pair[0].id);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pair, voting]);

  if (!verified) return <JudgeGate slug={slug} onVerified={onVerified} />;
  if (loading) return <div className="text-center text-gray-600 py-20">loading...</div>;

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-neon text-xs bg-neon/10 px-2 py-0.5 rounded">⚖ JUDGE MODE</span>
            {voteCount > 0 && (
              <span className="text-xs text-gray-600">{voteCount} decisions made</span>
            )}
          </div>
          <h1 className="text-xl font-bold">{hackathon?.name}</h1>
        </div>
        <div className="flex gap-2">
          <Link to={`/h/${slug}/results`} className="btn-ghost text-sm py-1.5 px-3">Results</Link>
          <Link to={`/h/${slug}`} className="btn-ghost text-sm py-1.5 px-3">← Public Vote</Link>
        </div>
      </div>

      {done ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-4">✅</div>
          <p className="font-bold text-lg mb-2">All pairs judged!</p>
          <p className="text-gray-600 text-sm mb-6">Check the results to see final rankings.</p>
          <Link to={`/h/${slug}/results`} className="btn-neon">View Final Results</Link>
        </div>
      ) : pair ? (
        <div>
          <p className="text-center text-xs text-gray-600 mb-5 uppercase tracking-widest">
            As a judge — which is the stronger project?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-6 items-start">
            <JudgeProjectPanel
              project={pair[0]}
              side="left"
              onChoose={() => handleVote(pair[0].id, pair[1].id)}
              animating={!!chosen}
              chosen={chosen === pair[0].id}
            />
            <div className="flex items-center justify-center py-4">
              <span className="vs-text text-3xl font-black text-neon">VS</span>
            </div>
            <JudgeProjectPanel
              project={pair[1]}
              side="right"
              onChoose={() => handleVote(pair[1].id, pair[0].id)}
              animating={!!chosen}
              chosen={chosen === pair[1].id}
            />
          </div>
          <p className="text-center text-xs text-gray-700 mt-4">
            ← → or 1/2 keys · README expandable per card
          </p>
        </div>
      ) : (
        <div className="card text-center py-16">
          <p className="text-gray-600 mb-4">No projects to judge yet.</p>
          <Link to={`/h/${slug}/submit`} className="btn-neon">Submit a Project</Link>
        </div>
      )}
    </div>
  );
}
