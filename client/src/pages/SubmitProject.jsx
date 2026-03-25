import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../utils/api';
import { getDisplayName, setDisplayName } from '../utils/session';

export default function SubmitProject() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    github_url: '',
    tags: '',
    author_name: getDisplayName(),
  });
  const [readme, setReadme] = useState('');
  const [fetchingReadme, setFetchingReadme] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function fetchReadme() {
    if (!form.github_url) return toast.error('Enter a GitHub URL first');
    setFetchingReadme(true);
    try {
      const data = await api.fetchGithubReadme(form.github_url);
      setReadme(data.readme);
      // Auto-fill title from repo name if empty
      if (!form.title) setForm(f => ({ ...f, title: data.repo.split('/')[1] }));
      toast.success('README fetched!');
    } catch (err) {
      toast.error(err.message || 'Could not fetch README');
    } finally {
      setFetchingReadme(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title required');
    if (!form.author_name.trim()) return toast.error('Your name is required');
    setLoading(true);
    try {
      setDisplayName(form.author_name);
      await api.submitProject(slug, { ...form, readme });
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
      <p className="text-gray-600 text-sm mb-8">Add your project to the ranking pool.</p>

      <form onSubmit={handleSubmit} className="card space-y-4">
        {/* GitHub URL + fetch */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">GitHub Repository</label>
          <div className="flex gap-2">
            <input
              className="input"
              placeholder="https://github.com/owner/repo"
              value={form.github_url}
              onChange={set('github_url')}
            />
            <button
              type="button"
              onClick={fetchReadme}
              disabled={fetchingReadme}
              className="btn-ghost shrink-0 text-sm py-2 px-3 whitespace-nowrap"
            >
              {fetchingReadme ? '...' : 'Fetch README'}
            </button>
          </div>
          {readme && (
            <p className="text-xs text-neon mt-1">
              ✓ README loaded ({(readme.length / 1024).toFixed(1)}KB)
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Project Title *</label>
          <input className="input" placeholder="Epic Project Name" value={form.title} onChange={set('title')} />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Short Description</label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="What does your project do? (shown on vote cards)"
            value={form.description}
            onChange={set('description')}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Tags (comma-separated)</label>
          <input className="input" placeholder="ai, web, cli, game" value={form.tags} onChange={set('tags')} />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Your Name *</label>
          <input className="input" placeholder="hacker42" value={form.author_name} onChange={set('author_name')} />
        </div>

        <button type="submit" className="btn-neon w-full" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Project →'}
        </button>
      </form>
    </div>
  );
}
