'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useUser } from '@/context/UserContext';
import type { BerkeleyDashboardData, ActivityPost, ActivityCandidate } from '@/lib/types';
import { Toast, type ToastMessage } from '@/components/Toast';

const BerkeleyMap = dynamic(() => import('@/components/BerkeleyMap'), { ssr: false });

const ACTIVITY_EMOJI: Record<string, string> = {
  run: '🏃',
  walk: '🚶',
  coffee: '☕',
  food: '🍔',
  study: '📚',
  art: '🎨',
  hangout: '👋',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Home() {
  const { currentUser, allUsers, setCurrentUser, loading: userLoading } = useUser();
  const [data, setData] = useState<BerkeleyDashboardData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<ActivityCandidate[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [postText, setPostText] = useState('');
  const [posting, setPosting] = useState(false);
  const [matching, setMatching] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const adminPanelRef = useRef<HTMLDivElement>(null);

  // Auto-select admin (first user) if nobody is picked
  useEffect(() => {
    if (!userLoading && !currentUser && allUsers.length > 0) {
      setCurrentUser(allUsers[0]);
    }
  }, [userLoading, currentUser, allUsers, setCurrentUser]);

  const activeUser = currentUser ?? allUsers[0] ?? null;

  const fetchData = useCallback(() => {
    if (!activeUser) return;
    fetch(`/api/dashboard?userId=${activeUser.id}&t=${Date.now()}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setDataLoading(false);
      });
  }, [activeUser]);

  useEffect(() => {
    if (activeUser) {
      setDataLoading(true);
      fetchData();
    }
  }, [activeUser, fetchData]);

  // Scroll admin panel into view when a post is selected
  useEffect(() => {
    if (selectedPostId && adminPanelRef.current) {
      setTimeout(() => {
        adminPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 300);
    }
  }, [selectedPostId, candidates]);

  // Fetch candidates when a post is selected
  useEffect(() => {
    if (!selectedPostId) {
      setCandidates([]);
      return;
    }
    setCandidatesLoading(true);
    fetch(`/api/activity-posts/${selectedPostId}/candidates?t=${Date.now()}`)
      .then((r) => r.json())
      .then((c) => {
        setCandidates(c);
        setCandidatesLoading(false);
      })
      .catch(() => setCandidatesLoading(false));
  }, [selectedPostId]);



  const handlePost = async () => {
    if (!postText.trim() || posting || !activeUser) return;
    setPosting(true);
    try {
      const res = await fetch('/api/activity-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: activeUser.id, text: postText }),
      });
      if (res.ok) {
        const newPost = await res.json();
        setPostText('');
        setSelectedPostId(newPost.id);
        fetchData();
      } else {
        setToast({ text: 'Failed to post. Please try again.', type: 'error' });
      }
    } catch {
      setToast({ text: 'Network error. Please try again.', type: 'error' });
    } finally {
      setPosting(false);
    }
  };

  const handleMatch = async (postId: string, matchedUserId: string, matchedName: string) => {
    if (!confirm(`Match with ${matchedName}? This cannot be undone.`)) return;
    setMatching(matchedUserId);
    try {
      const res = await fetch(`/api/activity-posts/${postId}/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchedUserId }),
      });
      if (res.ok) {
        setToast({ text: `Matched with ${matchedName}! A MicroQuest session has been created.`, type: 'success' });
        setSelectedPostId(null);
        fetchData();
      } else {
        setToast({ text: 'Failed to create match. Please try again.', type: 'error' });
      }
    } catch {
      setToast({ text: 'Network error. Please try again.', type: 'error' });
    } finally {
      setMatching(null);
    }
  };

  if (userLoading || dataLoading || !data) {
    return (
      <div className="h-[calc(100vh-56px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading Berkeley map…</p>
        </div>
      </div>
    );
  }

  const { currentUser: user, usersOnMap, activePosts } = data;
  const selectedPost = activePosts.find((p) => p.id === selectedPostId);

  return (
    <>
    <Toast message={toast} onDismiss={() => setToast(null)} />
    <div className="dashboard-layout">
      {/* LEFT — Map */}
      <div className="dashboard-map">
        <div className="map-container">
          <BerkeleyMap
            users={usersOnMap}
            posts={activePosts}
            selectedPostId={selectedPostId}
            candidates={candidates}
            currentUserId={user.id}
            onSelectPost={setSelectedPostId}
          />
          {/* Map legend overlay */}
          <div className="map-legend">
            <span><span className="legend-dot" style={{ background: '#6366f1' }} /> Users</span>
            <span><span className="legend-dot" style={{ background: '#f43f5e' }} /> Posts</span>
            <span><span className="legend-dot" style={{ background: '#10b981' }} /> Candidates</span>
            <span><span className="legend-dot" style={{ background: '#8b5cf6' }} /> Matched</span>
          </div>
        </div>
      </div>

      {/* RIGHT — Feed */}
      <div className="dashboard-feed">
        {/* Current user card */}
        <div className="card user-card">
          <div className="user-card-header">
            <div className="user-avatar">
              {user.name[0]}
            </div>
            <div className="user-info">
              <h2 className="user-name">{user.name}</h2>
              <p className="user-meta">{user.major} · Age {user.age}</p>
              <p className="user-location">📍 {user.locationLabel}</p>
            </div>
          </div>
          <p className="user-bio">{user.bio}</p>
          <div className="tag-list">
            {user.interests.split(',').map((tag) => (
              <span key={tag} className="interest-tag">{tag.trim()}</span>
            ))}
          </div>
          <div className="tag-list" style={{ marginTop: 4 }}>
            {user.activityTags.split(',').map((tag) => (
              <span key={tag} className="activity-tag">{ACTIVITY_EMOJI[tag] || '👋'} {tag}</span>
            ))}
          </div>
        </div>

        {/* Composer */}
        <div className="card composer">
          <p className="section-label">What are you up to?</p>
          <div className="composer-input-row">
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder={`Post as ${user.name}… e.g. "going for a run, anyone want to join?"`}
              className="composer-textarea"
              rows={2}
            />
            <button
              onClick={handlePost}
              disabled={!postText.trim() || posting}
              className="composer-btn"
            >
              {posting ? 'Posting…' : 'Post'}
            </button>
          </div>
        </div>

        {/* Activity feed */}
        <div className="feed-section">
          <p className="section-label">Activity Feed</p>
          {activePosts.length === 0 ? (
            <div className="card empty-state">
              <p className="empty-state-icon">👋</p>
              <p className="empty-state-title">No activity posts yet</p>
              <p className="empty-state-sub">
                Share what you&apos;re up to — a run, coffee, study session — and get matched with someone nearby who&apos;s down for the same thing.
              </p>
            </div>
          ) : (
            <div className="feed-list">
              {activePosts.map((post) => (
                <FeedCard
                  key={post.id}
                  post={post}
                  isSelected={post.id === selectedPostId}
                  onSelect={() => setSelectedPostId(post.id === selectedPostId ? null : post.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Admin matching panel */}
        {selectedPost && selectedPost.status === 'active' && (
          <div className="card admin-panel" ref={adminPanelRef}>
            <div className="admin-header">
              <span className="admin-badge">ADMIN</span>
              <p className="section-label" style={{ margin: 0 }}>Match Panel</p>
            </div>
            <div className="admin-post-summary">
              <p className="admin-post-author">{selectedPost.authorName}</p>
              <p className="admin-post-body">"{selectedPost.body}"</p>
              <span className="admin-post-type">
                {ACTIVITY_EMOJI[selectedPost.activityType] || '👋'} {selectedPost.activityType}
              </span>
            </div>
            <p className="section-label" style={{ fontSize: 11 }}>
              Nearby & Down ({candidates.length})
            </p>
            {candidatesLoading ? (
              <div className="candidates-loading">
                <div className="spinner-sm" />
              </div>
            ) : candidates.length === 0 ? (
              <p className="no-candidates">
                No candidates within 1.5 mi who share this activity tag and aren't already matched.
              </p>
            ) : (
              <div className="candidates-list">
                {candidates.map((c) => (
                  <div key={c.id} className="candidate-card">
                    <div className="candidate-info">
                      <div className="candidate-avatar">{c.name[0]}</div>
                      <div>
                        <p className="candidate-name">{c.name}</p>
                        <p className="candidate-meta">
                          {c.major} · {c.distanceMiles} mi · 📍 {c.locationLabel} · Connection: {Math.round(c.compatibilityScore * 100)}%
                        </p>
                        <div className="candidate-tags">
                          {c.activityTags.split(',').map((t) => (
                            <span
                              key={t}
                              className={`candidate-tag ${t.trim() === selectedPost.activityType ? 'candidate-tag-match' : ''}`}
                            >
                              {t.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleMatch(selectedPost.id, c.id, c.name)}
                      disabled={matching !== null}
                      className="match-btn"
                      aria-label={`Match ${c.name} with ${selectedPost.authorName}`}
                    >
                      {matching === c.id ? '…' : 'Match'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedPost && selectedPost.status === 'matched' && (
          <div className="card matched-banner">
            <span className="matched-icon">✨</span>
            <p className="matched-title">Matched!</p>
            <p className="matched-detail">
              {selectedPost.authorName} × {selectedPost.matchedUserName} — a MicroQuest session has been created.
            </p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

function FeedCard({
  post,
  isSelected,
  onSelect,
}: {
  post: ActivityPost;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`feed-card ${isSelected ? 'feed-card-selected' : ''} ${
        post.status === 'matched' ? 'feed-card-matched' : ''
      }`}
    >
      <div className="feed-card-top">
        <div className="feed-card-author-row">
          <div className="feed-card-avatar">
            {post.authorName[0]}
          </div>
          <div>
            <p className="feed-card-author">{post.authorName}</p>
            <p className="feed-card-meta">📍 {post.locationLabel} · {timeAgo(post.createdAt)}</p>
          </div>
        </div>
        <span className={`feed-card-status feed-card-status-${post.status}`}>
          {post.status}
        </span>
      </div>
      <p className="feed-card-body">{post.body}</p>
      <div className="feed-card-bottom">
        <span className="feed-card-type">
          {ACTIVITY_EMOJI[post.activityType] || '👋'} {post.activityType}
        </span>
        {post.status === 'matched' && post.matchedUserName && (
          <span className="feed-card-matched-with">
            ✨ matched with {post.matchedUserName}
          </span>
        )}
      </div>
    </button>
  );
}
