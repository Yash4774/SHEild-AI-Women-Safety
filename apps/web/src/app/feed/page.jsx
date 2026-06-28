import { useState, useEffect } from "react";
import {
  MessageSquare,
  Heart,
  MapPin,
  Plus,
  X,
  Filter,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import useUser from "@/utils/useUser";

const CATEGORIES = [
  "all",
  "alert",
  "harassment",
  "theft",
  "stalking",
  "unsafe_area",
  "tip",
  "positive",
];
const CAT_COLORS = {
  alert: "bg-red-500/10 border-red-500/20 text-red-400",
  harassment: "bg-orange-500/10 border-orange-500/20 text-orange-400",
  theft: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  stalking: "bg-red-500/10 border-red-500/20 text-red-400",
  unsafe_area: "bg-orange-500/10 border-orange-500/20 text-orange-400",
  tip: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  positive: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  all: "bg-white/10 border-white/20 text-white",
};

export default function FeedPage() {
  const { data: user } = useUser();
  const [posts, setPosts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    content: "",
    category: "alert",
    location_name: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);
  useEffect(() => {
    if (activeFilter === "all") setFiltered(posts);
    else setFiltered(posts.filter((p) => p.category === activeFilter));
  }, [posts, activeFilter]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/feed");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) setPosts(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load safety feed");
    } finally {
      setLoading(false);
    }
  };

  const submitPost = async () => {
    if (!form.content.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const newPost = await res.json();
      setPosts((prev) => [newPost, ...prev]);
      setForm({ content: "", category: "alert", location_name: "" });
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setError("Failed to post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const upvotePost = async (postId) => {
    try {
      const res = await fetch("/api/feed", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = await res.json();
      setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppShell activePage="feed">
      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">
              Community Safety Feed
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Real-time safety updates from your community
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-sm transition-all active:scale-95"
          >
            <Plus size={16} /> Post Alert
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Total Posts",
              val: posts.length,
              icon: MessageSquare,
              color: "text-pink-400",
            },
            {
              label: "Alerts",
              val: posts.filter(
                (p) =>
                  p.category === "alert" ||
                  p.category === "harassment" ||
                  p.category === "stalking",
              ).length,
              icon: AlertTriangle,
              color: "text-red-400",
            },
            {
              label: "Safe Tips",
              val: posts.filter(
                (p) => p.category === "tip" || p.category === "positive",
              ).length,
              icon: CheckCircle,
              color: "text-emerald-400",
            },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center"
              >
                <Icon size={16} className={`${s.color} mx-auto mb-2`} />
                <div className="text-xl font-black text-white">{s.val}</div>
                <div className="text-[10px] text-gray-500">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all capitalize ${activeFilter === cat ? CAT_COLORS[cat] || CAT_COLORS.all : "bg-white/[0.02] border-white/5 text-gray-500 hover:text-gray-300"}`}
            >
              {cat === "all" ? "All Posts" : cat.replace("_", " ")}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Feed */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 shimmer h-32"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare size={48} className="text-gray-700 mx-auto mb-4" />
            <h3 className="text-white font-bold mb-2">No posts yet</h3>
            <p className="text-gray-500 text-sm">
              Be the first to post a safety update for your community.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-6 py-2.5 rounded-xl bg-pink-600 text-white font-bold text-sm hover:bg-pink-700 transition-all"
            >
              Post First Alert
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((post, i) => {
              const isUpvoted =
                post.upvoted_by &&
                user &&
                post.upvoted_by.includes(String(user.id));
              const catCls = CAT_COLORS[post.category] || CAT_COLORS.alert;
              return (
                <div
                  key={post.id}
                  className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all"
                  style={{ animation: `feedIn 0.4s ${i * 0.05}s ease both` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {(post.author_name ||
                          post.user_name ||
                          "U")[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">
                          {post.author_name || post.user_name || "Anonymous"}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {new Date(post.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase ${catCls}`}
                    >
                      {(post.category || "alert").replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-gray-200 text-sm leading-relaxed mb-4">
                    {post.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => upvotePost(post.id)}
                        className={`flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 ${isUpvoted ? "text-pink-400" : "text-gray-500 hover:text-pink-400"}`}
                      >
                        <Heart
                          size={14}
                          className={isUpvoted ? "fill-pink-400" : ""}
                        />{" "}
                        {post.upvotes || 0}
                      </button>
                      {post.location_name && (
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                          <MapPin size={10} /> {post.location_name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Post form modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[#0a0a12] border border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-white">
                  Post to Safety Feed
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">
                    Category
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {["alert", "harassment", "tip", "positive"].map((c) => (
                      <button
                        key={c}
                        onClick={() => setForm((p) => ({ ...p, category: c }))}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all capitalize ${form.category === c ? CAT_COLORS[c] || "" : "border-white/5 text-gray-500 hover:border-white/10"}`}
                      >
                        {c.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">
                    Location (optional)
                  </label>
                  <input
                    type="text"
                    value={form.location_name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, location_name: e.target.value }))
                    }
                    placeholder="e.g. Main Street, Downtown"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-pink-500/50 placeholder-gray-600"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">
                    Your Post
                  </label>
                  <textarea
                    value={form.content}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, content: e.target.value }))
                    }
                    placeholder="Share a safety update, incident report, or helpful tip..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-pink-500/50 resize-none placeholder-gray-600"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 font-bold text-sm hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitPost}
                    disabled={submitting || !form.content.trim()}
                    className="flex-1 py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
                  >
                    {submitting ? "Posting..." : "Post Alert"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes feedIn { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        .shimmer { background:linear-gradient(90deg,rgba(255,255,255,0.02) 25%,rgba(255,255,255,0.05) 50%,rgba(255,255,255,0.02) 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; }
        @keyframes shimmer { 0%{background-position:-200% 0}100%{background-position:200% 0} }
      `}</style>
    </AppShell>
  );
}
