export default function ProjectCard({ project, onClick, animating, chosen }) {
  const tags = project.tags ? project.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  const animClass = animating
    ? chosen
      ? 'animate-slide-right scale-105'
      : 'animate-slide-left opacity-50'
    : '';

  return (
    <button
      onClick={onClick}
      className={`card text-left w-full h-full flex flex-col gap-3 cursor-pointer
                  border-2 border-border transition-all duration-150 glow-box-hover
                  hover:border-neon/50 hover:-translate-y-1 active:scale-[0.98]
                  ${animClass}`}
      style={{ minHeight: 240 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-gray-100 text-base leading-snug">{project.title}</h3>
        <span className="text-xs text-gray-600 shrink-0">ELO {project.elo ?? 1000}</span>
      </div>

      {/* Author */}
      <div className="text-xs text-neon">@{project.author_name}</div>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-gray-400 leading-relaxed flex-1 line-clamp-4">
          {project.description}
        </p>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-auto">
          {tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
      )}

      {/* GitHub */}
      {project.github_url && (
        <a
          href={project.github_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="text-xs text-neon-blue hover:underline mt-1 truncate"
        >
          ↗ {project.github_url.replace('https://github.com/', 'github.com/')}
        </a>
      )}

      {/* Win rate */}
      {(project.wins + project.losses) > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-700 border-t border-border pt-2 mt-1">
          <span>{project.wins}W / {project.losses}L</span>
          <span>·</span>
          <span>{Math.round(project.wins * 100 / (project.wins + project.losses))}% win rate</span>
        </div>
      )}

      {/* Click prompt */}
      <div className="text-xs text-gray-700 text-center border-t border-border pt-2">
        Click to vote for this project
      </div>
    </button>
  );
}
