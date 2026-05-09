import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const API = "http://127.0.0.1:8000/api";

const ROLES = [
  { value: "user",         label: "User",         color: "role-user" },
  { value: "subscribed",   label: "Subscribed",   color: "role-subscribed" },
  { value: "nutritionist", label: "Nutritionist", color: "role-nutritionist" },
  { value: "admin",        label: "Admin",        color: "role-admin" },
];

function roleColor(role) {
  const map = { admin: "role-admin", nutritionist: "role-nutritionist", subscribed: "role-subscribed", user: "role-user" };
  return map[role] || "role-user";
}

function initials(u) {
  const f = u.first_name?.[0] || "";
  const l = u.last_name?.[0] || "";
  return (f + l).toUpperCase() || u.username?.[0]?.toUpperCase() || "?";
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");

  // ── Users state ──
  const [users, setUsers]               = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [search, setSearch]             = useState("");
  const [filterRole, setFilterRole]     = useState("all");
  const [saving, setSaving]             = useState({});
  const [pendingRoles, setPendingRoles] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ── Blogs state ──
  const [blogs, setBlogs]                     = useState([]);
  const [filteredBlogs, setFilteredBlogs]     = useState([]);
  const [blogLoading, setBlogLoading]         = useState(true);
  const [blogError, setBlogError]             = useState("");
  const [blogSearch, setBlogSearch]           = useState("");
  const [deleteBlogConfirm, setDeleteBlogConfirm] = useState(null);

  // ── Reports state ──
  const [reports, setReports]                 = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [reportLoading, setReportLoading]     = useState(true);
  const [reportSearch, setReportSearch]       = useState("");
  const [reportFilter, setReportFilter]       = useState("all");
  const [resolvingId, setResolvingId]         = useState(null);

  const [toast, setToast]               = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);

  const myUsername = localStorage.getItem("username");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch users ──
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`${API}/admin/users/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 403) { setAccessDenied(true); return; }
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
      setPendingRoles(Object.fromEntries(data.map(u => [u.id, u.role])));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch blogs ──
  const fetchBlogs = useCallback(async () => {
    setBlogLoading(true);
    setBlogError("");
    try {
      const res = await fetch(`${API}/blogs/`);
      if (!res.ok) throw new Error("Failed to fetch blogs");
      const data = await res.json();
      setBlogs(data);
    } catch (e) {
      setBlogError(e.message);
    } finally {
      setBlogLoading(false);
    }
  }, []);

  // ── Fetch reports ──
  const fetchReports = useCallback(async () => {
    setReportLoading(true);
    try {
      const token = localStorage.getItem("access"); // ✅ always fresh
      const res = await fetch(`${API}/reports/all/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setReports(await res.json());
      } else {
        console.error("[reports] failed with status:", res.status);
      }
    } catch (e) {
      console.error("[reports] network error:", e);
    } finally {
      setReportLoading(false);
    }
  }, []);

  // ── Init ──
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) { navigate("/login"); return; }
    fetchUsers();
    fetchBlogs();
    fetchReports();
  }, [fetchUsers, fetchBlogs, fetchReports, navigate]);

  // ── Filter users ──
  useEffect(() => {
    let list = [...users];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(q)
      );
    }
    if (filterRole !== "all") list = list.filter(u => u.role === filterRole);
    setFiltered(list);
  }, [users, search, filterRole]);

  // ── Filter blogs ──
  useEffect(() => {
    let list = [...blogs];
    if (blogSearch.trim()) {
      const q = blogSearch.toLowerCase();
      list = list.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author_name.toLowerCase().includes(q)
      );
    }
    setFilteredBlogs(list);
  }, [blogs, blogSearch]);

  // ── Filter reports ──
  useEffect(() => {
    let list = [...reports];
    if (reportSearch.trim()) {
      const q = reportSearch.toLowerCase();
      list = list.filter(r =>
        r.subject.toLowerCase().includes(q) ||
        r.sender.toLowerCase().includes(q) ||
        r.message.toLowerCase().includes(q)
      );
    }
    if (reportFilter === "open")     list = list.filter(r => !r.is_resolved);
    if (reportFilter === "resolved") list = list.filter(r =>  r.is_resolved);
    setFilteredReports(list);
  }, [reports, reportSearch, reportFilter]);

  // ── Actions ──
  const applyRole = async (userId) => {
    const newRole = pendingRoles[userId];
    setSaving(s => ({ ...s, [userId]: true }));
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`${API}/admin/users/${userId}/role/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole, subscription: data.subscription } : u));
      showToast(`Role updated for @${data.username}`);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setSaving(s => ({ ...s, [userId]: false }));
    }
  };

  const deleteUser = async (userId) => {
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`${API}/admin/users/${userId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setUsers(prev => prev.filter(u => u.id !== userId));
      showToast("User deleted");
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const deleteBlog = async (blogId) => {
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`${API}/blogs/${blogId}/delete/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to delete (${res.status})`);
      setBlogs(prev => prev.filter(b => b.id !== blogId));
      showToast("Blog deleted");
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setDeleteBlogConfirm(null);
    }
  };

  const toggleResolve = async (reportId) => {
    setResolvingId(reportId);
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`${API}/reports/${reportId}/resolve/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setReports(prev => prev.map(r =>
          r.id === reportId ? { ...r, is_resolved: data.is_resolved } : r
        ));
        showToast(data.is_resolved ? "Marked as resolved" : "Marked as open");
      }
    } catch {
      showToast("Failed to update", "error");
    } finally {
      setResolvingId(null);
    }
  };

  const stats = {
    total:         users.length,
    admins:        users.filter(u => u.role === "admin").length,
    nutritionists: users.filter(u => u.role === "nutritionist").length,
    subscribed:    users.filter(u => u.role === "subscribed" || u.subscription).length,
    blogs:         blogs.length,
    openReports:   reports.filter(r => !r.is_resolved).length,
  };

  if (accessDenied) return (
    <div className="adm-denied">
      <div className="adm-denied-card">
        <span className="adm-denied-icon">🔒</span>
        <h2>Access Denied</h2>
        <p>You need admin privileges to view this page.</p>
        <button onClick={() => navigate("/User")}>Go to Dashboard</button>
      </div>
    </div>
  );

  return (
    <div className="adm-root">
      {toast && (
        <div className={`adm-toast adm-toast--${toast.type}`}>
          {toast.type === "success" ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      <header className="adm-header">
        <div>
          <h1 className="adm-title">Admin Dashboard</h1>
          <p className="adm-subtitle">Manage users, content, and reports</p>
        </div>
        <button className="adm-back-btn" onClick={() => navigate("/User")}>
          ← Back to App
        </button>
      </header>

      {/* ── Tabs ── */}
      <div className="adm-tabs">
        <button className={`adm-tab ${activeTab === "users"   ? "active" : ""}`} onClick={() => setActiveTab("users")}>
          👥 Users
        </button>
        <button className={`adm-tab ${activeTab === "blogs"   ? "active" : ""}`} onClick={() => setActiveTab("blogs")}>
          📝 Blogs
        </button>
        <button className={`adm-tab ${activeTab === "reports" ? "active" : ""}`} onClick={() => setActiveTab("reports")}>
          📩 Reports{stats.openReports > 0 && (
            <span style={{ marginLeft: 6, background: "rgba(249,115,22,0.2)", color: "#fb923c", borderRadius: 10, padding: "1px 7px", fontSize: "0.75rem" }}>
              {stats.openReports}
            </span>
          )}
        </button>
      </div>

      {/* ══════════════ USERS TAB ══════════════ */}
      {activeTab === "users" && (
        <>
          <div className="adm-stats">
            <div className="adm-stat"><span className="adm-stat-num">{stats.total}</span><span className="adm-stat-label">Total Users</span></div>
            <div className="adm-stat"><span className="adm-stat-num adm-stat-num--admin">{stats.admins}</span><span className="adm-stat-label">Admins</span></div>
            <div className="adm-stat"><span className="adm-stat-num adm-stat-num--nutritionist">{stats.nutritionists}</span><span className="adm-stat-label">Nutritionists</span></div>
            <div className="adm-stat"><span className="adm-stat-num adm-stat-num--subscribed">{stats.subscribed}</span><span className="adm-stat-label">Subscribed</span></div>
          </div>

          <div className="adm-toolbar">
            <div className="adm-search-wrap">
              <span className="adm-search-icon">🔍</span>
              <input className="adm-search" type="text" placeholder="Search by name, username, or email…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="adm-filter-group">
              {["all", ...ROLES.map(r => r.value)].map(role => (
                <button key={role} className={`adm-filter-btn ${filterRole === role ? "active" : ""}`} onClick={() => setFilterRole(role)}>
                  {role === "all" ? "All" : ROLES.find(r => r.value === role)?.label}
                </button>
              ))}
            </div>
            <button className="adm-refresh-btn" onClick={fetchUsers} title="Refresh">↻</button>
          </div>

          {loading ? (
            <div className="adm-loading"><div className="adm-spinner" /><p>Loading users…</p></div>
          ) : error ? (
            <div className="adm-error">{error} <button onClick={fetchUsers}>Retry</button></div>
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>User</th><th>Email</th><th>Joined</th><th>Current Role</th><th>Change Role</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan="6" className="adm-empty">No users found</td></tr>
                  ) : filtered.map(user => {
                    const isMe    = user.username === myUsername;
                    const pending = pendingRoles[user.id] || user.role;
                    const dirty   = pending !== user.role;
                    return (
                      <tr key={user.id} className={isMe ? "adm-row--me" : ""}>
                        <td>
                          <div className="adm-user-cell">
                            <div className={`adm-avatar adm-avatar--${roleColor(user.role)}`}>{initials(user)}</div>
                            <div>
                              <p className="adm-username">@{user.username}{isMe && <span className="adm-you-badge">you</span>}</p>
                              <p className="adm-fullname">{user.first_name} {user.last_name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="adm-email">{user.email}</td>
                        <td className="adm-date">{user.date_joined}</td>
                        <td><span className={`adm-role-badge ${roleColor(user.role)}`}>{user.role}</span></td>
                        <td>
                          <div className="adm-role-change">
                            <select value={pending} disabled={isMe || saving[user.id]} onChange={e => setPendingRoles(prev => ({ ...prev, [user.id]: e.target.value }))} className="adm-select">
                              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                            </select>
                            {dirty && !isMe && (
                              <button className="adm-apply-btn" onClick={() => applyRole(user.id)} disabled={saving[user.id]}>
                                {saving[user.id] ? "…" : "Apply"}
                              </button>
                            )}
                          </div>
                        </td>
                        <td>
                          {!isMe && (
                            <button className="adm-delete-btn" onClick={() => setDeleteConfirm(user)} title="Delete user">🗑</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="adm-count">Showing {filtered.length} of {users.length} users</p>
            </div>
          )}
        </>
      )}

      {/* ══════════════ BLOGS TAB ══════════════ */}
      {activeTab === "blogs" && (
        <>
          <div className="adm-stats">
            <div className="adm-stat"><span className="adm-stat-num">{stats.blogs}</span><span className="adm-stat-label">Total Blogs</span></div>
          </div>

          <div className="adm-toolbar">
            <div className="adm-search-wrap">
              <span className="adm-search-icon">🔍</span>
              <input className="adm-search" type="text" placeholder="Search blogs by title or author…" value={blogSearch} onChange={e => setBlogSearch(e.target.value)} />
            </div>
            <button className="adm-refresh-btn" onClick={fetchBlogs} title="Refresh">↻</button>
          </div>

          {blogLoading ? (
            <div className="adm-loading"><div className="adm-spinner" /><p>Loading blogs…</p></div>
          ) : blogError ? (
            <div className="adm-error">{blogError} <button onClick={fetchBlogs}>Retry</button></div>
          ) : (
            <div className="adm-blogs-list">
              {filteredBlogs.length === 0 ? (
                <div className="adm-empty">No blogs found</div>
              ) : filteredBlogs.map(blog => (
                <div key={blog.id} className="adm-blog-card">
                  <div className="adm-blog-header">
                    <div>
                      <h3 className="adm-blog-title">{blog.title}</h3>
                      <p className="adm-blog-meta">by <strong>@{blog.author_name}</strong> • {new Date(blog.created_at).toLocaleDateString()}</p>
                    </div>
                    <button className="adm-delete-blog-btn" onClick={() => setDeleteBlogConfirm(blog)}>🗑 Delete</button>
                  </div>
                  <p className="adm-blog-content">{blog.content.substring(0, 150)}...</p>
                  <div className="adm-blog-footer">
                    <span className="adm-blog-reports">
                      {blog.report_count > 0 && `⚠️ ${blog.report_count} report${blog.report_count !== 1 ? "s" : ""}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ══════════════ REPORTS TAB ══════════════ */}
      {activeTab === "reports" && (
        <>
          <div className="adm-stats">
            <div className="adm-stat">
              <span className="adm-stat-num">{reports.length}</span>
              <span className="adm-stat-label">Total Reports</span>
            </div>
            <div className="adm-stat">
              <span className="adm-stat-num" style={{ color: "#f97316" }}>{stats.openReports}</span>
              <span className="adm-stat-label">Open</span>
            </div>
            <div className="adm-stat">
              <span className="adm-stat-num adm-stat-num--nutritionist">{reports.filter(r => r.is_resolved).length}</span>
              <span className="adm-stat-label">Resolved</span>
            </div>
          </div>

          <div className="adm-toolbar">
            <div className="adm-search-wrap">
              <span className="adm-search-icon">🔍</span>
              <input className="adm-search" type="text" placeholder="Search by subject, sender, or message…" value={reportSearch} onChange={e => setReportSearch(e.target.value)} />
            </div>
            <div className="adm-filter-group">
              {["all", "open", "resolved"].map(f => (
                <button key={f} className={`adm-filter-btn ${reportFilter === f ? "active" : ""}`} onClick={() => setReportFilter(f)}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <button className="adm-refresh-btn" onClick={fetchReports} title="Refresh">↻</button>
          </div>

          {reportLoading ? (
            <div className="adm-loading"><div className="adm-spinner" /><p>Loading reports…</p></div>
          ) : filteredReports.length === 0 ? (
            <div className="adm-empty">No reports found</div>
          ) : (
            <div className="adm-blogs-list">
              {filteredReports.map(r => (
                <div key={r.id} className="adm-blog-card" style={{ borderLeft: `3px solid ${r.is_resolved ? "#34d399" : "#f97316"}` }}>
                  <div className="adm-blog-header">
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: 6 }}>
                        <span style={{
                          fontSize: "0.7rem", padding: "2px 8px", borderRadius: 20, textTransform: "capitalize",
                          background: r.is_resolved ? "rgba(52,211,153,0.15)" : "rgba(249,115,22,0.15)",
                          color: r.is_resolved ? "#6ee7b7" : "#fb923c",
                          border: `1px solid ${r.is_resolved ? "rgba(52,211,153,0.3)" : "rgba(249,115,22,0.3)"}`,
                        }}>
                          {r.is_resolved ? "✓ Resolved" : "● Open"}
                        </span>
                        <span style={{
                          fontSize: "0.7rem", padding: "2px 8px", borderRadius: 20, textTransform: "capitalize",
                          background: "rgba(167,139,250,0.12)", color: "#c4b5fd",
                          border: "1px solid rgba(167,139,250,0.2)",
                        }}>
                          {r.category.replace("_", " ")}
                        </span>
                      </div>
                      <h3 className="adm-blog-title">{r.subject}</h3>
                      <p className="adm-blog-meta">from <strong>@{r.sender}</strong> • {r.created_at}</p>
                    </div>
                    <button
                      onClick={() => toggleResolve(r.id)}
                      disabled={resolvingId === r.id}
                      style={{
                        background: r.is_resolved ? "rgba(255,255,255,0.06)" : "rgba(52,211,153,0.15)",
                        border: `1px solid ${r.is_resolved ? "rgba(255,255,255,0.1)" : "rgba(52,211,153,0.3)"}`,
                        color: r.is_resolved ? "#6b7280" : "#6ee7b7",
                        borderRadius: 8, padding: "7px 14px", fontSize: "0.8rem",
                        cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                        opacity: resolvingId === r.id ? 0.5 : 1,
                      }}
                    >
                      {resolvingId === r.id ? "…" : r.is_resolved ? "↩ Reopen" : "✓ Resolve"}
                    </button>
                  </div>
                  <p className="adm-blog-content">{r.message}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Delete User Modal ── */}
      {deleteConfirm && (
        <div className="adm-modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <h3>Delete user?</h3>
            <p>This will permanently delete <strong>@{deleteConfirm.username}</strong> and all their data. This cannot be undone.</p>
            <div className="adm-modal-actions">
              <button className="adm-modal-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="adm-modal-confirm" onClick={() => deleteUser(deleteConfirm.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Blog Modal ── */}
      {deleteBlogConfirm && (
        <div className="adm-modal-backdrop" onClick={() => setDeleteBlogConfirm(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <h3>Delete blog?</h3>
            <p>This will permanently delete <strong>"{deleteBlogConfirm.title}"</strong> by @{deleteBlogConfirm.author_name}. This cannot be undone.</p>
            <div className="adm-modal-actions">
              <button className="adm-modal-cancel" onClick={() => setDeleteBlogConfirm(null)}>Cancel</button>
              <button className="adm-modal-confirm" onClick={() => deleteBlog(deleteBlogConfirm.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}