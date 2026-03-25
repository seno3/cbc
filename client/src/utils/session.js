// Persistent browser session ID for tracking votes
export function getSessionId() {
  let id = localStorage.getItem('rh_session');
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('rh_session', id);
  }
  return id;
}

export function getDisplayName() {
  return localStorage.getItem('rh_name') || '';
}

export function setDisplayName(name) {
  localStorage.setItem('rh_name', name);
}
