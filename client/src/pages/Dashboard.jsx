import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/sessions');
      setSessions(res.data);
    } catch (err) {
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const createSession = async () => {
    if (!title.trim()) return;
    try {
      const res = await axios.post('http://localhost:5000/api/sessions', {
        title, language
      });
      setSessions([res.data, ...sessions]);
      setTitle('');
    } catch (err) {
      setError('Failed to create session');
    }
  };

  const deleteSession = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/sessions/${id}`);
      setSessions(sessions.filter(s => s._id !== id));
    } catch (err) {
      setError('Failed to delete session');
    }
  };

  const langColors = {
    javascript: '#f7df1e',
    python: '#3572A5',
    java: '#b07219',
    cpp: '#f34b7d',
    typescript: '#2b7489'
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="dashboard">

      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <span className="nav-logo">⚡ DevSync</span>
        </div>
        <div className="navbar-right">
          <div className="nav-avatar" onClick={() => setMenuOpen(!menuOpen)}>
            {getInitials(user?.name)}
          </div>
          {menuOpen && (
            <div className="nav-dropdown">
              <p className="dropdown-name">{user?.name}</p>
              <p className="dropdown-email">{user?.email}</p>
              <hr className="dropdown-divider" />
              <button className="dropdown-logout" onClick={logout}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="dashboard-body">

        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat-card">
            <p className="stat-number">{sessions.length}</p>
            <p className="stat-label">Total Sessions</p>
          </div>
          <div className="stat-card">
            <p className="stat-number">
              {sessions.filter(s => s.isActive).length}
            </p>
            <p className="stat-label">Active Sessions</p>
          </div>
          <div className="stat-card">
            <p className="stat-number">
              {[...new Set(sessions.map(s => s.language))].length}
            </p>
            <p className="stat-label">Languages Used</p>
          </div>
        </div>

        {/* Create Session */}
        <div className="create-card">
          <h2 className="section-title">New Session</h2>
          {error && <div className="dash-error">{error}</div>}
          <div className="create-form">
            <input
              className="dash-input"
              type="text"
              placeholder="Session title e.g. Auth Bug Fix Review"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createSession()}
            />
            <select
              className="dash-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="typescript">TypeScript</option>
            </select>
            <button className="create-btn" onClick={createSession}>
              + Create
            </button>
          </div>
        </div>

        {/* Sessions List */}
        <div className="sessions-section">
          <h2 className="section-title">My Sessions</h2>
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="empty-state">
              <p className="empty-icon">🗂️</p>
              <p className="empty-text">No sessions yet</p>
              <p className="empty-sub">Create your first code review session above</p>
            </div>
          ) : (
            <div className="sessions-grid">
              {sessions.map(session => (
                <div key={session._id} className="session-card">
                  <div className="session-card-top">
                    <span
                      className="lang-badge"
                      style={{ backgroundColor: langColors[session.language] + '22',
                               color: langColors[session.language],
                               border: `1px solid ${langColors[session.language]}44` }}
                    >
                      {session.language}
                    </span>
                    <span className={`status-dot ${session.isActive ? 'active' : ''}`}></span>
                  </div>
                  <h3 className="session-title">{session.title}</h3>
                  <p className="session-meta">
                    {session.participants?.length} participant(s) •{' '}
                    {new Date(session.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </p>
                  <div className="session-card-actions">
                    <button className="btn-open" onClick={() => navigate(`/editor/${session._id}`)}>
                   Open Editor →
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => deleteSession(session._id)}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;