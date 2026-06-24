import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function getDisplayUrl(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname.length > 1 ? parsed.pathname : ""}`;
  } catch {
    return url.length > 70 ? `${url.slice(0, 70)}...` : url;
  }
}

function AnalyticsDisplay({ data }) {
  const renderItems = (items, keyName) => {
    if (!items || items.length === 0) {
      return <p className="analytics-empty">No data yet</p>;
    }

    return (
      <ul className="analytics-list">
        {items.slice(0, 5).map((item, index) => (
          <li className="analytics-item" key={index}>
            <span className="analytics-item-key" title={item[keyName] || "direct"}>
              {item[keyName] || "direct"}
            </span>
            <span className="analytics-item-val">{item.clicks}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="analytics-panel">
      <div className="analytics-row">
        <span className="analytics-label">Total Clicks</span>
        <span className="analytics-total">{data.total_clicks}</span>
      </div>

      <div className="analytics-section">
        <p className="analytics-section-title">Top Referrers</p>
        {renderItems(data.top_referrers, "referrer")}
      </div>

      <div className="analytics-section">
        <p className="analytics-section-title">Top User Agents</p>
        {renderItems(data.top_user_agents, "user_agent")}
      </div>
    </div>
  );
}

function LinkCard({
  link,
  analytics,
  expandedUrl,
  onToggleLongUrl,
  onViewAnalytics,
  onAskDelete,
  onCopy,
}) {
  const shortUrl = `${import.meta.env.VITE_API_BASE_URL}/${link.short_code}`;
  const isAnalyticsOpen = !!analytics;
  const isLongUrlOpen = !!expandedUrl;

  return (
    <div className="link-card">
      <div className="link-card-top">
        <div className="link-main">
          <a className="link-short-code" href={shortUrl} target="_blank" rel="noreferrer">
            /{link.short_code}
          </a>

          <button className="mini-icon-btn" title="Copy short URL" onClick={() => onCopy(shortUrl)}>
            📋
          </button>

          <button className="mini-icon-btn mini-delete" title="Delete short URL" onClick={onAskDelete}>
            🗑
          </button>
        </div>

        <div className="click-badge">{link.click_count} clicks</div>
      </div>

      <div className="long-url-row">
        <p className="long-url-label">Long URL</p>

        <button
          type="button"
          className="long-url-link"
          onClick={() => onToggleLongUrl(link.short_code)}
          title="Click to view complete long URL"
        >
          {isLongUrlOpen ? "Hide complete URL" : getDisplayUrl(link.original_url)}
        </button>

        {isLongUrlOpen && <div className="full-url-box">{link.original_url}</div>}
      </div>

      <button
        className={`analytics-btn${isAnalyticsOpen ? " active" : ""}`}
        onClick={() => onViewAnalytics(link.short_code)}
      >
        {isAnalyticsOpen ? "Hide Analytics" : "Analytics"}
      </button>

      {isAnalyticsOpen && <AnalyticsDisplay data={analytics} />}
    </div>
  );
}

function Dashboard() {
  const [user, setUser] = useState(null);
  const [links, setLinks] = useState([]);
  const [originalUrl, setOriginalUrl] = useState("");
  const [createdLink, setCreatedLink] = useState("");
  const [analyticsByCode, setAnalyticsByCode] = useState({});
  const [expandedUrls, setExpandedUrls] = useState({});
  const [toast, setToast] = useState("");
  const [deleteCode, setDeleteCode] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 1800);
  };

  const fetchUser = async () => {
    try {
      const response = await api.get("/auth/me", authHeader);
      setUser(response.data);
    } catch (_) {
      localStorage.removeItem("token");
      navigate("/");
    }
  };

  const fetchLinks = async () => {
    try {
      const response = await api.get("/links", authHeader);
      setLinks(response.data);
    } catch (_) {
      setLinks([]);
    }
  };

  const copyLink = async (shortUrl) => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      showToast("Short URL copied");
    } catch (_) {
      showToast("Failed to copy link");
    }
  };

  const createShortLink = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/links/shorten", { original_url: originalUrl }, authHeader);
      const shortUrl = response.data.short_url;

      setCreatedLink(shortUrl);
      setOriginalUrl("");
      fetchLinks();
      showToast("Short URL created");
    } catch (_) {
      showToast("Failed to create short URL");
    }
  };

  const toggleLongUrl = (shortCode) => {
    setExpandedUrls((prev) => ({
      ...prev,
      [shortCode]: !prev[shortCode],
    }));
  };

  const viewAnalytics = async (shortCode) => {
    if (analyticsByCode[shortCode]) {
      setAnalyticsByCode((prev) => {
        const next = { ...prev };
        delete next[shortCode];
        return next;
      });
      return;
    }

    try {
      const response = await api.get(`/links/${shortCode}/analytics`, authHeader);
      setAnalyticsByCode((prev) => ({
        ...prev,
        [shortCode]: response.data,
      }));
    } catch (_) {
      showToast("Failed to load analytics");
    }
  };

  const deleteLink = async () => {
    if (!deleteCode) return;

    try {
      await api.delete(`/links/${deleteCode}`, authHeader);
      fetchLinks();

      setAnalyticsByCode((prev) => {
        const next = { ...prev };
        delete next[deleteCode];
        return next;
      });

      setExpandedUrls((prev) => {
        const next = { ...prev };
        delete next[deleteCode];
        return next;
      });

      setDeleteCode(null);
      showToast("Short URL deleted");
    } catch (_) {
      showToast("Failed to delete link");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    fetchUser();
    fetchLinks();
  }, []);

  const totalClicks = links.reduce((sum, link) => sum + (link.click_count || 0), 0);
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "ML";

  return (
    <div className="dash-root">
      {toast && <div className="toast">{toast}</div>}

      {deleteCode && (
        <div className="modal-backdrop">
          <div className="delete-modal">
            <h3>Delete short URL?</h3>
            <p>This action cannot be undone.</p>

            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setDeleteCode(null)}>
                Cancel
              </button>

              <button className="modal-delete" onClick={deleteLink}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="dash-topbar">
        <div className="dash-logo">
          <div className="dash-logo-mark">ML</div>
          <span className="dash-logo-name">MiniLi</span>
        </div>

        <div className="dash-topbar-right">
          {user && (
            <div className="dash-user-pill">
              <div className="dash-avatar">{initials}</div>
              {user.email}
            </div>
          )}

          <button className="dash-logout" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      <main className="dash-main">
        <div className="dash-page-head">
          <h1 className="dash-page-title">MiniLi Dashboard</h1>
          <p className="dash-page-sub">Manage and track all your shortened URLs.</p>
        </div>

        <div className="dash-stats">
          <div className="dash-stat-card">
            <p className="dash-stat-label">Total Links</p>
            <p className="dash-stat-val">{links.length}</p>
          </div>

          <div className="dash-stat-card">
            <p className="dash-stat-label">Total Clicks</p>
            <p className="dash-stat-val">{totalClicks}</p>
          </div>

          <div className="dash-stat-card">
            <p className="dash-stat-label">Avg. Per Link</p>
            <p className="dash-stat-val">
              {links.length ? Math.round(totalClicks / links.length) : 0}
            </p>
          </div>
        </div>

        <div className="dash-shorten">
          <p className="dash-panel-title">Create Short URL</p>

          <form className="shorten-row" onSubmit={createShortLink}>
            <input
              className="shorten-input"
              type="url"
              placeholder="Paste a long URL here..."
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              required
            />

            <button className="shorten-btn" type="submit">
              Shorten →
            </button>
          </form>

          {createdLink && (
            <div className="created-link-box">
              <input className="created-link-input" value={createdLink} readOnly />

              <button
                type="button"
                className="icon-btn"
                title="Copy short URL"
                onClick={() => copyLink(createdLink)}
              >
                📋
              </button>
            </div>
          )}
        </div>

        <div className="dash-links-head">
          <h2 className="dash-section-title">All Links</h2>
          <span className="dash-count-badge">{links.length}</span>
        </div>

        <div className="links-grid">
          {links.length === 0 && (
            <div className="dash-empty">
              <div className="dash-empty-icon">↗</div>
              <p className="dash-empty-title">No links yet</p>
              <p className="dash-empty-sub">
                Paste a URL above to create your first short link.
              </p>
            </div>
          )}

          {links.map((link) => (
            <LinkCard
              key={link.id}
              link={link}
              analytics={analyticsByCode[link.short_code] ?? null}
              expandedUrl={expandedUrls[link.short_code] ?? false}
              onToggleLongUrl={toggleLongUrl}
              onViewAnalytics={viewAnalytics}
              onAskDelete={() => setDeleteCode(link.short_code)}
              onCopy={copyLink}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;