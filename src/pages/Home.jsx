// src/pages/Home.jsx
import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";



const BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "/api"; // fallback to local /api

function useTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} - CleanCity` : "CleanCity";
  }, [title]);
}

function Spinner({ size = 40 }) {
  return (
    <div className="flex items-center justify-center">
      <svg
        style={{ width: size, height: size }}
        className="animate-spin text-gray-600"
        viewBox="0 0 50 50"
      >
        <circle
          className="opacity-25"
          cx="25"
          cy="25"
          r="20"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M43.935 25.145a19.978 19.978 0 01-7.03 10.96 19.978 19.978 0 01-11.02 4.36 19.978 19.978 0 01-11.02-4.36 19.978 19.978 0 01-7.03-10.96 19.978 19.978 0 014.36-11.02 19.978 19.978 0 0110.96-7.03 19.978 19.978 0 0111.02 4.36 19.978 19.978 0 014.36 11.02z"
        />
      </svg>
    </div>
  );
}

export default function Home() {
  useTitle("Home");

  // Banner slider
  const slides = [
    {
      id: 1,
      title: "Report overflowing garbage in your area",
      subtitle: "Help the community — report now and request cleanup drives.",
      image:
        "https://i.ibb.co.com/JjDn5nKy/Whats-App-Image-2025-11-11-at-09-06-14-0996ef6a.jpg",
    },
    {
      id: 2,
      title: "Join local cleanup drives",
      subtitle: "Be a volunteer — join hands with your neighbors.",
      image:
        "https://i.ibb.co.com/pr2w621B/Whats-App-Image-2025-11-11-at-09-19-53-3b2bb9f4.jpg",
    },
    {
      id: 3,
      title: "Track and contribute to issue fixes",
      subtitle: "Pay small contributions to support clean-up budgets.",
      image:
        "https://i.ibb.co.com/JWwq9jZW/Whats-App-Image-2025-11-11-at-09-29-56-dbfc8f16.jpg",
    },
  ];

  const [index, setIndex] = useState(0);
  const slideTimerRef = useRef(null);

  useEffect(() => {
    // autoplay every 5 seconds
    slideTimerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(slideTimerRef.current);
  }, []);

  // Recent complaints
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    const url = `${BASE}/issues?limit=6`;
    fetch(url)
      .then(async (res) => {
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`${res.status} ${txt}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        // Expecting array of issues
        setIssues(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Failed to load recent issues:", err);
        if (mounted) setError("Unable to load recent issues. Try again later.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Category cards
  const categories = [
    {
      id: "garbage",
      name: "Garbage",
      desc: "Overflowing bins, unmanaged waste, and dangerous littering spots.",
      icon: "🗑️",
    },
    {
      id: "illegal-construction",
      name: "Illegal Construction",
      desc: "Unauthorized constructions causing hazards and obstruction.",
      icon: "🏗️",
    },
    {
      id: "broken-public",
      name: "Broken Public Property",
      desc: "Damaged benches, broken streetlights, vandalized public assets.",
      icon: "🏚️",
    },
    {
      id: "road-damage",
      name: "Road Damage",
      desc: "Potholes, broken sidewalks, and damaged drains causing waterlogging.",
      icon: "🛣️",
    },
  ];

  // Community stats example (you should replace with real API)
  const stats = {
    users: 1240,
    resolved: 860,
    pending: 380,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <section className="relative">
        <div className="h-[420px] md:h-[520px] w-full overflow-hidden rounded-b-lg shadow-inner">
          <img
            src={slides[index].image}
            alt={slides[index].title}
            className="w-full h-full object-cover brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-6xl mx-auto px-6 md:px-12 text-white">
              <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-3">
                {slides[index].title}
              </h1>
              <p className="text-sm md:text-lg max-w-xl">{slides[index].subtitle}</p>

              <div className="mt-6 flex gap-3">
                <Link
                  to="/add-issue"
                  className="inline-block bg-green-500 hover:bg-green-600 px-5 py-3 rounded-md font-semibold shadow"
                >
                  Report an Issue
                </Link>
                <Link
                  to="/issues"
                  className="inline-block bg-white/20 hover:bg-white/30 px-5 py-3 rounded-md"
                >
                  Browse Issues
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Slider controls */}
        <div className="max-w-6xl mx-auto px-6 md:px-12 relative -mt-12 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setIndex(i)}
                className={`w-2 h-2 rounded-full ${index === i ? "bg-green-600" : "bg-gray-300"}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <div className="space-x-2">
            <button
              onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
              className="bg-white p-2 rounded shadow"
              title="Previous"
            >
              ‹
            </button>
            <button
              onClick={() => setIndex((i) => (i + 1) % slides.length)}
              className="bg-white p-2 rounded shadow"
              title="Next"
            >
              ›
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 py-12">
        <h2 className="text-2xl font-semibold mb-4 font-bold bg-gradient-to-r from-[#2a0845] to-[#6441a5] bg-clip-text text-transparent">Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {categories.map((c) => (
            <div key={c.id} className="bg-white  rounded-lg p-5 shadow-sm hover:shadow-md transition"
             style={{ background: "linear-gradient(to right,#636363,#a2ab58)" }}>
              <div className="text-3xl">{c.icon}</div>
              <h3 className="font-semibold mt-3"><span className="text-white">→</span> {c.name}</h3>
              <p className="text-sm mt-2 text-white">{c.desc}</p>
              <div className="mt-4">
                <Link to={`/issues?category=${c.id}`} className=" font-bold bg-gradient-to-r from-[#2a0845] to-[#6441a5] bg-clip-text text-transparent">
                  See {c.name} issues →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Complaints */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Recent Complaints</h2>
          <Link to="/issues" className="text-sm text-green-600 font-semibold">View All Issues</Link>
        </div>

        {loading ? (
          <div className="bg-white p-8 rounded shadow text-center">
            <Spinner />
            <p className="mt-4 text-gray-600">Loading latest issues...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded p-6 text-red-700">
            {error}
          </div>
        ) : issues.length === 0 ? (
          <div className="bg-white p-6 rounded shadow text-gray-600">No issues reported yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {issues.map((issue) => (
              <article key={issue._id || issue.id} className="bg-white border rounded-lg overflow-hidden shadow-sm">
                <div className="h-44 bg-gray-100">
                  <img
                    src={issue.image || "https://images.unsplash.com/photo-1606788075760-11a6d1c6a5b5?auto=format&fit=crop&w=1200&q=60"}
                    alt={issue.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">{issue.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{issue.category} • {issue.location}</p>
                  <p className="text-sm text-gray-700 mt-2 line-clamp-3">{issue.description}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-semibold">৳ {issue.amount ?? "—"}</span>
                    <Link
                      to={`/issues/${issue._id || issue.id}`}
                      className="text-sm text-green-600 font-medium"
                    >
                      See Details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Community stats + CTA */}
      <section className="bg-white border-t">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-12 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold font-bold bg-gradient-to-r from-[#2a0845] to-[#6441a5] bg-clip-text text-transparent">Community in numbers</h3>
            <p className="text-gray-600">Active community members and recent progress.</p>
            <div className="flex gap-6 mt-4">
              <div>
                <div className="text-2xl font-bold">{stats.users}</div>
                <div className="text-xs text-gray-500">Registered users</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
                <div className="text-xs text-gray-500">Issues resolved</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">{stats.pending}</div>
                <div className="text-xs text-gray-500">Pending issues</div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-lg font-semibold">Join a cleanup drive</h4>
                <p className="text-gray-600">Volunteer or start a cleanup drive in your area — bring your neighbors together.</p>
              </div>
              <div className="flex gap-3">
                <Link to="/volunteer" className="px-4 py-2 rounded bg-green-600 text-white font-semibold">Volunteer</Link>
                <Link to="/add-issue" className="px-4 py-2 rounded border border-green-600 font-semibold">Request Drive</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
