import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreateHackathon from './pages/CreateHackathon';
import HackathonVote from './pages/HackathonVote';
import SubmitProject from './pages/SubmitProject';
import JudgeView from './pages/JudgeView';
import Leaderboard from './pages/Leaderboard';

export default function App() {
  return (
    <div className="scanlines min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateHackathon />} />
          <Route path="/h/:slug" element={<HackathonVote />} />
          <Route path="/h/:slug/submit" element={<SubmitProject />} />
          <Route path="/h/:slug/judge" element={<JudgeView />} />
          <Route path="/h/:slug/results" element={<Leaderboard />} />
        </Routes>
      </main>
    </div>
  );
}
