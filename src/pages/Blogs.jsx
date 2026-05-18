import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "./Blogs.css";

const API = "http://127.0.0.1:8000";

const STATIC_BLOGS = [
  {
    id: 0,
    title: "10 Easy Ways to Start Your Fitness Journey",
    content:
      "Starting a fitness journey can seem intimidating, but it doesn't have to be. Here are 10 simple ways to begin: 1. Start with 10-minute walks, 2. Drink more water, 3. Do home workouts, 4. Track your meals, 5. Get enough sleep, 6. Find a workout buddy, 7. Set small goals, 8. Be consistent, 9. Celebrate wins, 10. Stay patient with yourself.",
    author_name: "Sarah Fitness",
    author_id: 999999,
    created_at: "2024-05-01",
    report_count: 0,
    is_static: true,
  },
  {
    id: -1,
    title: "The Truth About Intermittent Fasting",
    content:
      "Intermittent fasting has become increasingly popular, but what does the science say? Studies show that IF can help with weight loss, improve insulin sensitivity, and boost metabolism. However, it's not for everyone. This guide covers the benefits, risks, and how to get started safely.",
    author_name: "Dr. Health",
    author_id: 999998,
    created_at: "2024-04-28",
    report_count: 0,
    is_static: true,
  },
  {
    id: -2,
    title: "Meal Prep Tips for Busy Professionals",
    content:
      "Don't have time to cook? Meal prep is your answer. Spend 2-3 hours on Sunday preparing meals for the entire week. Focus on: lean proteins, colorful vegetables, healthy grains, and portion control. Use containers to store meals, label them with dates, and keep them in the fridge for up to 5 days.",
    author_name: "Chef Nutrition",
    author_id: 999997,
    created_at: "2024-04-25",
    report_count: 0,
    is_static: true,
  },
  {
    id: -3,
    title: "Mental Health & Nutrition: The Connection",
    content:
      "Your diet directly affects your mental health. Foods rich in omega-3s, B vitamins, and antioxidants support brain function and mood. Depression and anxiety are often linked to nutritional deficiencies. Learn how to eat your way to better mental health with science-backed tips.",
    author_name: "Wellness Coach",
    author_id: 999996,
    created_at: "2024-04-22",
    report_count: 0,
    is_static: true,
  },
];

export default function Blogs() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(true);
  const [blogs, setBlogs] = useState(STATIC_BLOGS);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState({});
  const [ setPinnedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("pinnedBlogs") || "[]");
    } catch {
      return [];
    }
  });

  const token = localStorage.getItem("access");
  const userId = localStorage.getItem("user_id");
  const userRole = localStorage.getItem("role");
  const isSuperuser = localStorage.getItem("is_superuser") === "true";
  const isLoggedIn = !!token;
  const isAdmin = userRole === "admin" || isSuperuser;

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/blogs/`);
      setBlogs([...STATIC_BLOGS, ...res.data]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createBlog = async () => {
    if (!isLoggedIn) { navigate("/login"); return; }
    if (!title.trim() || !content.trim()) { setError("Title and content are required"); return; }
    setCreating(true);
    setError("");
    try {
      const res = await axios.post(
        `${API}/api/blogs/create/`,
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBlogs([res.data, ...blogs]);
      setTitle("");
      setContent("");
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create blog");
    } finally {
      setCreating(false);
    }
  };

  const reportBlog = async (blogId) => {
    if (!isLoggedIn) { navigate("/login"); return; }
    try {
      await axios.post(
        `${API}/api/blogs/${blogId}/report/`,
        { reason: "Inappropriate content" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBlogs(blogs.map((b) => b.id === blogId ? { ...b, report_count: b.report_count + 1 } : b));
      alert("✓ Blog reported. Thank you for helping keep our community safe.");
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || "Failed to report blog"));
    }
  };

  const deleteBlog = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog? This cannot be undone.")) return;
    setDeleting((prev) => ({ ...prev, [blogId]: true }));
    try {
      const res = await axios.delete(`${API}/api/blogs/${blogId}/delete/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 200 || res.data.message) {
        setBlogs(blogs.filter((b) => b.id !== blogId));
        
        setPinnedIds(prev => {
          const next = prev.filter(id => id !== blogId);
          localStorage.setItem("pinnedBlogs", JSON.stringify(next));
          return next;
        });
      }
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || "Failed to delete blog"));
    } finally {
      setDeleting((prev) => ({ ...prev, [blogId]: false }));
    }
  };

  const togglePin = async (blogId) => {
  try {
    await axios.post(
      `${API}/api/blogs/${blogId}/pin/`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setBlogs(prev =>
      prev.map(b => b.id === blogId ? { ...b, pinned: !b.pinned } : b)
    );
  } catch (err) {
    alert("Failed to update pin: " + (err.response?.data?.error || err.message));
  }
};

  
  const sortedBlogs = [
  ...blogs.filter(b => b.pinned),
  ...blogs.filter(b => !b.pinned),
];

  return (
    <div className="nc-layout">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <main className="nc-main">
        <div className="nc-content blogs-content">

          {/* ── Hero ── */}
          <div className="pb-dash-hero blogs-hero">
            <div className="pb-hero-content">
              <span className="pb-eyebrow">Community</span>
              <h1>Nutrition <em>Blogs</em></h1>
              <p>Read and share nutrition tips, fitness journeys, and wellness insights.</p>
            </div>
            {isLoggedIn && !showForm && (
              <button className="blogs-hero-write-btn" onClick={() => setShowForm(true)}>
                ✏️ Write a Post
              </button>
            )}
          </div>

          {/* ── Not logged in prompt ── */}
          {!isLoggedIn && (
            <div className="nc-card blogs-login-prompt">
              <span className="blogs-prompt-icon">🔐</span>
              <h3>Join the Community</h3>
              <p>Log in to post and report blogs</p>
              <div className="blogs-auth-actions">
                <button className="blogs-login-btn" onClick={() => navigate("/login")}>Log In</button>
                <button className="blogs-signup-btn" onClick={() => navigate("/signup")}>Sign Up</button>
              </div>
            </div>
          )}

          {/* ── Create form ── */}
          {isLoggedIn && showForm && (
            <div className="nc-card blogs-create-card">
              <div className="blogs-create-header">
                <h2>Create a Post</h2>
                <button className="blogs-close-btn" onClick={() => { setShowForm(false); setError(""); }}>✕</button>
              </div>
              {error && <div className="blogs-error">{error}</div>}
              <input
                type="text"
                placeholder="Post title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="blogs-input-title"
                disabled={creating}
              />
              <textarea
                placeholder="Share your thoughts, tips, or experiences..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="blogs-textarea"
                disabled={creating}
              />
              <div className="blogs-create-actions">
                <button className="blogs-cancel-btn" onClick={() => { setShowForm(false); setError(""); }} disabled={creating}>
                  Cancel
                </button>
                <button className="blogs-submit-btn" onClick={createBlog} disabled={creating || !title.trim() || !content.trim()}>
                  {creating ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          )}

          {/* ── Feed ── */}
          <div className="nc-card blogs-feed-card">
            <div className="blogs-feed-header">
              <h2>
                Latest Posts
                {isAdmin && blogs.filter(b => b.pinned).length > 0 && (
                  <span className="blogs-pinned-count">
                    {blogs.filter(b => b.pinned).length} pinned
                  </span>
                )}
              </h2>
              <span className="blogs-count">{blogs.length}</span>
            </div>

            {loading ? (
              <div className="blogs-loading">
                <div className="blogs-spinner" />
                <p>Loading blogs...</p>
              </div>
            ) : blogs.length === 0 ? (
              <div className="blogs-empty">
                <p>No posts yet. Be the first to share! 🌟</p>
              </div>
            ) : (
              <div className="blogs-list">
                {sortedBlogs.map((blog) => {
                  const isAuthor = !blog.is_static && userId && blog.author_id === parseInt(userId);
                  const canDelete = isAuthor || isAdmin;
                  const isPinned = blog.pinned;

                  return (
                    <div className={`blog-card ${isPinned ? "blog-card--pinned" : ""}`} key={blog.id}>
                      {isPinned && (
                        <div className="blog-pinned-banner">
                          📌 Pinned post
                        </div>
                      )}
                      <div className="blog-header">
                        <div className="blog-header-text">
                          <h3 className="blog-title">{blog.title}</h3>
                          <p className="blog-meta">
                            by <strong>@{blog.author_name}</strong> •{" "}
                            {new Date(blog.created_at).toLocaleDateString()}
                            {blog.is_static && <span className="blog-static-badge">Featured</span>}
                          </p>
                        </div>
                      </div>

                      <p className="blog-content">{blog.content}</p>

                      <div className="blog-actions">
                        {isAdmin && (
                          <button
                            className={`blog-pin-btn ${isPinned ? "pinned" : ""}`}
                            onClick={() => togglePin(blog.id)}
                            title={isPinned ? "Unpin post" : "Pin to top"}
                          >
                            {isPinned ? "📌 Unpin" : "📌 Pin"}
                          </button>
                        )}
                        {isLoggedIn && !blog.is_static && (
                          <button
                            className="blog-report-btn"
                            onClick={() => reportBlog(blog.id)}
                            title="Report inappropriate content"
                            disabled={deleting[blog.id]}
                          >
                            🚩 Report
                            {blog.report_count > 0 && (
                              <span className="blog-report-count">({blog.report_count})</span>
                            )}
                          </button>
                        )}
                        {canDelete && (
                          <button
                            className="blog-delete-btn"
                            onClick={() => deleteBlog(blog.id)}
                            title="Delete blog"
                            disabled={deleting[blog.id]}
                          >
                            {deleting[blog.id] ? "🗑 Deleting..." : "🗑 Delete"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}