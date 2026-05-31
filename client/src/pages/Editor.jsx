import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MonacoEditor from '@monaco-editor/react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { io } from 'socket.io-client';
import './Editor.css';

const Editor = () => {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [code, setCode] = useState('// Start coding here...');
  const [language, setLanguage] = useState('javascript');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [selectedLine, setSelectedLine] = useState(1);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(true);
  const [saveStatus, setSaveStatus] = useState('saved');

  const socketRef = useRef(null);
  const editorRef = useRef(null);
  const saveTimer = useRef(null);

  // Load session + comments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionRes, commentsRes] = await Promise.all([
          axios.get(`https://devsync-backend-asqm.onrender.com/api/sessions/${sessionId}`),
          axios.get(`https://devsync-backend-asqm.onrender.com/api/comments/${sessionId}`)
        ]);
        setSession(sessionRes.data);
        setCode(sessionRes.data.code);
        setLanguage(sessionRes.data.language);
        setComments(commentsRes.data);
      } catch (err) {
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sessionId, navigate]);

  // Socket.io setup
  useEffect(() => {
    socketRef.current = io('https://devsync-backend-asqm.onrender.com');

    socketRef.current.emit('join-session', {
      sessionId,
      user: { id: user._id, name: user.name }
    });

    socketRef.current.on('code-update', (newCode) => {
      setCode(newCode);
    });

    socketRef.current.on('users-update', (users) => {
      setOnlineUsers(users);
    });

    socketRef.current.on('new-comment', (comment) => {
      setComments(prev => [...prev, comment]);
    });

    return () => {
      socketRef.current.emit('leave-session', { sessionId });
      socketRef.current.disconnect();
    };
  }, [sessionId, user]);

  // Auto save code to MongoDB after 2 seconds of no typing
  const saveCode = useCallback(async (codeToSave) => {
    try {
      setSaveStatus('saving...');
      await axios.put(`https://devsync-backend-asqm.onrender.com/api/sessions/${sessionId}/code`, {
        code: codeToSave
      });
      setSaveStatus('saved');
    } catch (err) {
      setSaveStatus('error saving');
    }
  }, [sessionId]);

  // Handle code change
  const handleCodeChange = (value) => {
    setCode(value);
    setSaveStatus('unsaved');

    // Emit to other users
    socketRef.current.emit('code-change', {
      sessionId,
      code: value
    });

    // Auto save after 2 seconds of no typing
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveCode(value);
    }, 2000);
  };

  // Handle editor mount
  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    editor.onDidChangeCursorPosition((e) => {
      setSelectedLine(e.position.lineNumber);
    });
  };

  // Add comment — save to MongoDB + emit via socket
  const addComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await axios.post(
        `https://devsync-backend-asqm.onrender.com/api/comments/${sessionId}`,
        { text: newComment, line: selectedLine }
      );
      setComments(prev => [...prev, res.data]);
      socketRef.current.emit('add-comment', { 
        sessionId, 
        comment: res.data 
      });
      setNewComment('');
    } catch (err) {
      console.error('Failed to save comment');
    }
  };

  // Delete comment
  const deleteComment = async (commentId) => {
    try {
      await axios.delete(`https://devsync-backend-asqm.onrender.com/api/comments/${commentId}`);
      setComments(prev => prev.filter(c => c._id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment');
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="editor-loading">
        <div className="editor-spinner"></div>
        <p>Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="editor-page">

      {/* Editor Navbar */}
      <nav className="editor-nav">
        <div className="editor-nav-left">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            ← Back
          </button>
          <span className="editor-session-title">{session?.title}</span>
          <span className="editor-lang-badge">{language}</span>
        </div>

        <div className="editor-nav-center">
          <div className="online-users">
            {onlineUsers.map((u, i) => (
              <div
                key={i}
                className="online-avatar"
                title={u.name}
                style={{ zIndex: onlineUsers.length - i }}
              >
                {getInitials(u.name)}
              </div>
            ))}
            {onlineUsers.length > 0 && (
              <span className="online-count">
                {onlineUsers.length} online
              </span>
            )}
          </div>
        </div>

        <div className="editor-nav-right">
          <span className={`save-status ${saveStatus === 'saved' ? 'status-saved' : saveStatus === 'saving...' ? 'status-saving' : 'status-unsaved'}`}>
            {saveStatus === 'saved' ? '✓ Saved' : saveStatus === 'saving...' ? '⟳ Saving...' : '● Unsaved'}
          </span>
          <button
            className="toggle-comments-btn"
            onClick={() => setShowComments(!showComments)}
          >
            💬 Comments ({comments.length})
          </button>
        </div>
      </nav>

      {/* Main Editor Area */}
      <div className="editor-main">

        {/* Code Editor */}
        <div className={`editor-wrapper ${!showComments ? 'editor-full' : ''}`}>
          <div className="editor-toolbar">
            <span className="current-line">Line {selectedLine}</span>
            <div className="editor-dots">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
          </div>
          <MonacoEditor
            height="calc(100vh - 112px)"
            language={language}
            value={code}
            onChange={handleCodeChange}
            onMount={handleEditorMount}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: 'Fira Code, Consolas, monospace',
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              lineNumbers: 'on',
              renderLineHighlight: 'all',
              cursorBlinking: 'smooth',
              smoothScrolling: true,
              padding: { top: 16 }
            }}
          />
        </div>

        {/* Comments Panel */}
        {showComments && (
          <div className="comments-panel">
            <div className="comments-header">
              <h3>Review Comments</h3>
              <span className="comments-count">{comments.length}</span>
            </div>

            {/* Add Comment */}
            <div className="add-comment-box">
              <p className="comment-line-info">
                📍 Commenting on <strong>Line {selectedLine}</strong>
              </p>
              <textarea
                className="comment-input"
                placeholder="Add a review comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              <button className="comment-submit-btn" onClick={addComment}>
                Add Comment
              </button>
            </div>

            {/* Comments List */}
            <div className="comments-list">
              {comments.length === 0 ? (
                <div className="no-comments">
                  <p>💬</p>
                  <p>No comments yet</p>
                  <p>Click a line in the editor and add a review comment</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id || comment.id} className="comment-card">
                    <div className="comment-header">
                      <div className="comment-avatar">
                        {getInitials(comment.authorName)}
                      </div>
                      <div className="comment-meta">
                        <span className="comment-author">{comment.authorName}</span>
                        <span className="comment-line-badge">Line {comment.line}</span>
                      </div>
                      {comment.author === user._id && (
                        <button
                          className="comment-delete-btn"
                          onClick={() => deleteComment(comment._id)}
                        >
                          🗑
                        </button>
                      )}
                    </div>
                    <p className="comment-text">{comment.text}</p>
                    <p className="comment-time">
                      {new Date(comment.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;