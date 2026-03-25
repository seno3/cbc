import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <nav className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-neon font-bold text-xl glow-neon">#</span>
          <span className="font-bold text-lg tracking-tight">
            Rank<span className="text-neon">Hacker</span>
          </span>
        </Link>
        <div className="flex items-center gap-1 text-sm">
          <span className="text-gray-600 hidden sm:inline">
            the best ideas rise to the top
          </span>
          {pathname !== '/create' && (
            <Link to="/create" className="ml-4 btn-neon text-sm py-1.5 px-4">
              + New Hackathon
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
