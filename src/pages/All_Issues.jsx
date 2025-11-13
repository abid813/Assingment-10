// src/pages/All_Issues.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

// ✅ Correct BASE URL
const BASE = import.meta.env.VITE_API_URL || "https://assingment10-server-side-1.onrender.com";

function Spinner({ size = 40 }) {
  return (
    <div className="flex items-center justify-center py-8">
      <svg style={{ width: size, height: size }} className="animate-spin text-gray-600" viewBox="0 0 50 50">
        <circle className="opacity-25" cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M43.935 25.145a19.978 19.978 0 01-7.03 10.96 19.978 19.978 0 01-11.02 4.36 19.978 19.978 0 01-11.02-4.36 19.978 19.978 0 01-7.03-10.96 19.978 19.978 0 014.36-11.02 19.978 19.978 0 0110.96-7.03 19.978 19.978 0 0111.02 4.36 19.978 19.978 0 014.36 11.02z" />
      </svg>
    </div>
  );
}

export default function All_Issues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sort, setSort] = useState("desc");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    // ✅ Fetch from the new server
    fetch(`${BASE}/issues`)
      .then(async (res) => {
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `Server error ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        const normalized = (Array.isArray(data) ? data : []).map((it) => ({
          ...it,
          createdAt: it.createdAt ? new Date(it.createdAt) : new Date(),
        }));
        setIssues(normalized);
      })
      .catch((err) => {
        console.error("Failed to load issues:", err);
        if (mounted) setError("Unable to load issues. Try again later.");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    let list = issues;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (it) =>
          (it.title && it.title.toLowerCase().includes(q)) ||
          (it.description && it.description.toLowerCase().includes(q)) ||
          (it.location && it.location.toLowerCase().includes(q))
      );
    }

    if (categoryFilter) {
      list = list.filter((it) => (it.category || "").toLowerCase() === categoryFilter.toLowerCase());
    }

    list = list.slice().sort((a, b) => {
      if (sort === "asc") return new Date(a.createdAt) - new Date(b.createdAt);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return list;
  }, [issues, search, categoryFilter, sort]);

  const categories = useMemo(() => {
    const set = new Set();
    issues.forEach((it) => {
      if (it.category) set.add(it.category);
    });
    return Array.from(set);
  }, [issues]);

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-semibold">All Issues</h1>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, location or description..."
              className="flex-1 md:flex-none w-full md:w-80 border rounded px-3 py-2"
              aria-label="Search issues"
            />

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border rounded px-3 py-2"
              aria-label="Filter by category"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border rounded px-3 py-2"
              aria-label="Sort issues"
            >
              <option value="desc">Latest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="bg-white p-6 rounded shadow">
            <Spinner />
            <div className="text-center text-gray-600 mt-2">Loading issues...</div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white p-6 rounded shadow text-gray-600">No issues found.</div>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filtered.map((issue) => (
              <article key={issue._id || issue.id} className="bg-white rounded shadow overflow-hidden">
                <div className="h-48 bg-gray-100">
                  <img
                    src={issue.image || "https://via.placeholder.com/800x480?text=No+Image"}
                    alt={issue.title || "Issue image"}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/800x480?text=No+Image")}
                  />
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start gap-3">
                    <h2 className="text-lg font-semibold">{issue.title}</h2>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        (issue.status || "").toLowerCase() === "ended"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {issue.status || "ongoing"}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mt-1">{issue.category} • {issue.location}</p>
                  <p className="text-sm text-gray-700 mt-2 line-clamp-3">{issue.description}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm font-semibold">৳ {issue.amount ?? "—"}</div>
                    <Link
                      to={`/issues/${issue._id || issue.id}`}
                      className="text-green-600 font-medium hover:underline"
                    >
                      See Details →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
