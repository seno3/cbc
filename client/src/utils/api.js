const BASE = '/api';

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  getHackathons: () => req('GET', '/hackathons'),
  createHackathon: (body) => req('POST', '/hackathons', body),
  getHackathon: (slug) => req('GET', `/hackathons/${slug}`),
  getProjects: (slug) => req('GET', `/hackathons/${slug}/projects`),
  submitProject: (slug, body) => req('POST', `/hackathons/${slug}/projects`, body),
  getPair: (slug, session) => req('GET', `/hackathons/${slug}/pair?session=${session}`),
  vote: (slug, body) => req('POST', `/hackathons/${slug}/vote`, body),
  getLeaderboard: (slug) => req('GET', `/hackathons/${slug}/leaderboard`),
  getJudgeLeaderboard: (slug) => req('GET', `/hackathons/${slug}/leaderboard?judge=true`),
  verifyJudge: (slug, code) => req('POST', `/hackathons/${slug}/verify-judge`, { code }),
  getProject: (id) => req('GET', `/projects/${id}`),
  fetchGithubReadme: (url) => req('POST', '/github/readme', { url }),
};
