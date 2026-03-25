import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../utils/api';

export default function CreateHackathon() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', description: '', theme: '', end_date: '', judge_code: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name required');
    setLoading(true);
    try {
      const h = await api.createHackathon(form);
      toast.success('Hackathon created!');
      navigate(`/h/${h.slug}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold mb-1">
        <span className="text-neon">//</span> New Hackathon
      </h1>
      <p className="text-gray-600 text-sm mb-8">Set up a new ranking session.</p>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Name *</label>
          <input className="input" placeholder="My Awesome Hackathon" value={form.name} onChange={set('name')} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Theme</label>
          <input className="input" placeholder="e.g. AI for Good" value={form.theme} onChange={set('theme')} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Description</label>
          <textarea className="input resize-none" rows={3} placeholder="What's this hackathon about?" value={form.description} onChange={set('description')} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">End Date (optional)</label>
          <input type="date" className="input" value={form.end_date} onChange={set('end_date')} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Judge Passcode</label>
          <input className="input" placeholder="judge (default)" value={form.judge_code} onChange={set('judge_code')} />
          <p className="text-xs text-gray-700 mt-1">Judges use this code to access the enhanced judging view.</p>
        </div>
        <button type="submit" className="btn-neon w-full" disabled={loading}>
          {loading ? 'Creating...' : 'Create Hackathon →'}
        </button>
      </form>
    </div>
  );
}
