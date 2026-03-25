import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { api } from '../utils/api';
import { getSessionId } from '../utils/session';
import ProjectCard from '../components/ProjectCard';
import MiniLeaderboard from '../components/MiniLeaderboard';

export default function HackathonVote() {
  const { slug } = useParams();
  const [hackathon, setHackathon] = useState(null);
  const [pair, setPair] = useState(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [chosen, setChosen] = useState(null); // id of chosen project
  const [voteCount, setVoteCount] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const sessionId = getSessionId();

  const loadPair = useCallback(async () => {
    try {
      const res = await api.getPair(slug, sessionId);
      if (res.done || !res.pair) {
        setDone(true);
        setPair(null);
      } else {
        setPair(res.pair);
        setDone(false);
      }
    } catch (err) {
      toast.error(err.message);
    }
  }, [slug, sessionId]);

  const loadLeaderboard = useCallback(async () => {
    try {
      const lb = await api.getLeaderboard(slug);
      setLeaderboard(lb);
    } catch (_) {}
  }, [slug]);

  useEffect(() => {
    Promise.all([
      api.getHackathon(slug).then(setHackathon).catch(() => {}),
      loadPair(),
      loadLeaderboard(),
    ]).finally(() => setLoading(false));
  }, [slug, loadPair, loadLeaderboard]);

  async function handleVote(winnerId, loserId) {
    if (voting) return;
    setVoting(true);
    setChosen(winnerId);

    // Micro-confetti burst
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#00ff41', '#00cc33', '#00b4ff'],
      scalar: 0.8,
    });

    try {
      await api.vote(slug, {
        winner_id: winnerId,
        loser_id: loserId,
        session_id: sessionId,
        is_judge: false,
      });
      setVoteCount(v => v + 1);
      toast.success('Voted!', { duration: 800 });
    } catch (err) {
      toast.error(err.message);
    }

    // Brief pause to show animation, then load next pair
    setTimeout(async () => {
      setChosen(null);
      setVoting(false);
      await Promise.all([loadPair(), loadLeaderboard()]);
    }, 350);
  }

  // Keyboard voting: Left arrow = left card, Right arrow = right card
  useEffect(() => {
    function onKey(e) {
      if (!pair || voting) return;
      if (e.key === 'ArrowLeft') handleVote(pair[0].id, pair[1].id);
      if (e.key === 'ArrowRight') handleVote(pair[1].id, pair[0].id);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pair, voting]);

  if (loading) return <div className="text-center text-gray-600 py-20">loading...</div>;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{hackathon?.name}</h1>
          {hackathon?.theme && <p className="text-neon text-sm mt-0.5">Theme: {hackathon.theme}</p>}
          {hackathon?.description && (
            <p className="text-gray-500 text-sm mt-1">{hackathon.description}</p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Link to={`/h/${slug}/submit`} className="btn-ghost text-sm py-1.5 px-3">
            + Submit
          </Link>
          <Link to={`/h/${slug}/results`} className="btn-ghost text-sm py-1.5 px-3">
            Results
          </Link>
          <Link to={`/h/${slug}/judge`} className="btn-ghost text-sm py-1.5 px-3">
            Judge
          </Link>
          <button
            onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
            className="btn-ghost text-sm py-1.5 px-3"
            title="Copy shareable link"
          >
            ⎘
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Voting area */}
        <div className="flex-1">
          {voteCount > 0 && (
            <div className="text-xs text-gray-600 mb-4 text-center">
              You've voted <span className="text-neon">{voteCount}</span> time{voteCount !== 1 ? 's' : ''} this session
              <span className="ml-2 text-gray-700">· ← → keys work too</span>
            </div>
          )}

          {done ? (
            <div className="card text-center py-16">
              <div className="text-4xl mb-4">🎉</div>
              <p className="text-gray-300 font-bold text-lg mb-2">You've seen all pairs!</p>
              <p className="text-gray-600 text-sm mb-6">
                {leaderboard.length > 0
                  ? "Check the results to see who's winning."
                  : 'Submit more projects to unlock more comparisons.'}
              </p>
              <div className="flex justify-center gap-3">
                <Link to={`/h/${slug}/results`} className="btn-neon">View Results</Link>
                <Link to={`/h/${slug}/submit`} className="btn-ghost">Submit Project</Link>
              </div>
            </div>
          ) : pair ? (
            <div>
              <p className="text-center text-xs text-gray-600 mb-4 uppercase tracking-widest">
                Which project is better?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
                <ProjectCard
                  project={pair[0]}
                  onClick={() => handleVote(pair[0].id, pair[1].id)}
                  animating={!!chosen}
                  chosen={chosen === pair[0].id}
                />
                <div className="flex items-center justify-center">
                  <span className="vs-text text-3xl font-black text-neon">VS</span>
                </div>
                <ProjectCard
                  project={pair[1]}
                  onClick={() => handleVote(pair[1].id, pair[0].id)}
                  animating={!!chosen}
                  chosen={chosen === pair[1].id}
                />
              </div>
              <p className="text-center text-xs text-gray-700 mt-4">
                ELO rankings update after each vote
              </p>
            </div>
          ) : (
            <div className="card text-center py-16">
              <p className="text-gray-600 mb-4">No projects submitted yet.</p>
              <Link to={`/h/${slug}/submit`} className="btn-neon">Submit the first project</Link>
            </div>
          )}
        </div>

        {/* Mini leaderboard sidebar */}
        {leaderboard.length > 0 && (
          <div className="lg:w-64 shrink-0">
            <MiniLeaderboard entries={leaderboard.slice(0, 5)} slug={slug} />
          </div>
        )}
      </div>
    </div>
  );
}
