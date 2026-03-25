import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../utils/api';
import { getDisplayName, setDisplayName } from '../utils/session';

// Extract a short description from the first non-heading paragraph of a README
function extractDescription(readme) {
  const lines = readme.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('!') && !trimmed.startsWith('<')) {
      return trimmed.slice(0, 200);
    }
  }
  return '';
}

export default function SubmitProject() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [githubUrl, setGithubUrl] = useState('');
  const [fetched, setFetched] = useState(false);
  const [readme, setReadme] = useState('');
  const [form, setForm] = useState({ title: '', author_name: getDisplayName() });
  const [fetchingReadme, setFetchingReadme] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleFetch(e) {
    e.preventDefault();
    if (!githubUrl.trim()) return toast.error('Paste a GitHub URL first');
    setFetchingReadme(true);
    try {
      const data = await api.fetchGithubReadme(githubUrl);
      setReadme(data.readme);
      setForm(f => ({
        ...f,
        title: f.title || data.repo.split('/')[1].replace(/-/g, ' '),
        description: extractDescription(data.readme),
      }));
      setFetched(true);
      toast.success('README loaded!');
    } catch (err) {
      toast.error(err.message || 'Could not fetch README');
    } finally {
      setFetchingReadme(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.author_name.trim()) return toast.error('Your name is required');
    setLoading(true);
    try {
      setDisplayName(form.author_name);
      await api.submitProject(slug, {
        title: form.title || githubUrl.split('/').pop(),
        description: form.description || '',
        github_url: githubUrl,
        readme,
        author_name: form.author_name,
      });
      toast.success('Project submitted!');
      navigate(`/h/${slug}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold mb-1">
        <span className="text-neon">//</span> Submit Project
      </h1>
      <p className="text-gray-600 text-sm mb-8">Paste your GitHub link — we'll do the rest.</p>

      {/* Step 1: GitHub URL */}
      <form onSubmit={handleFetch} className="card mb-4">
        <label className="block text-xs text-gray-500 mb-2">GitHub Repository *</label>
        <div className="flex gap-2">
          <input
            className="input"
            placeholder="https://github.com/owner/repo"
            value={githubUrl}
            onChange={e => setGithubUrl(e.target.value)}
            autoFocus
          />
          <button
            type="submit"
            disabled={fetchingReadme}
            className="btn-neon shrink-0 text-sm py-2 px-4 whitespace-nowrap"
          >
            {fetchingReadme ? '...' : fetched ? 'Re-fetch' : 'Import →'}
          </button>
        </div>
        {fetched && (
          <p className="text-xs text-neon mt-2">
            ✓ README loaded ({(readme.length / 1024).toFixed(1)} KB)
          </p>
        )}
      </form>

      {/* Step 2: Confirm + name */}
      {fetched && (
        <form onSubmit={handleSubmit} className="card space-y-4 animate-fade-in">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Project Title</label>
            <input
              className="input"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Your Name *</label>
            <input
              className="input"
              placeholder="hacker42"
              value={form.author_name}
              onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))}
            />
          </div>
          <button type="submit" className="btn-neon w-full" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit to Hackathon →'}
          </button>
        </form>
      )}
    </div>
  );
}
