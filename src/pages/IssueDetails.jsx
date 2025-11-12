// src/pages/IssueDetails.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

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

export default function IssueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [issue, setIssue] = useState(null);
  const [loadingIssue, setLoadingIssue] = useState(true);
  const [errorIssue, setErrorIssue] = useState(null);

  const [contribs, setContribs] = useState([]);
  const [loadingContribs, setLoadingContribs] = useState(true);
  const [contribError, setContribError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [form, setForm] = useState({
    amount: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    additionalInfo: ""
  });

  // Fetch issue details
  useEffect(() => {
    let mounted = true;
    setLoadingIssue(true);
    setErrorIssue(null);

    fetch(`${BASE}/issues/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        setIssue(data);
      })
      .catch((err) => {
        console.error("Issue fetch error:", err);
        if (mounted) setErrorIssue("Issue load failed. Try again.");
      })
      .finally(() => mounted && setLoadingIssue(false));

    return () => { mounted = false; };
  }, [id]);

  // Fetch contributions for this issue
  useEffect(() => {
    let mounted = true;
    setLoadingContribs(true);
    setContribError(null);

    fetch(`${BASE}/contributions?issueId=${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        setContribs(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Contributions fetch error:", err);
        if (mounted) setContribError("Failed to load contributions.");
      })
      .finally(() => mounted && setLoadingContribs(false));

    return () => { mounted = false; };
  }, [id]);

  // keep default name/email from user
  useEffect(() => {
    setForm((f) => ({
      ...f,
      name: user?.displayName || "",
      email: user?.email || ""
    }));
  }, [user]);

  const totalCollected = useMemo(() => {
    return contribs.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  }, [contribs]);

  const suggested = Number(issue?.amount || 0);
  const progressPercent = suggested > 0 ? Math.min(100, Math.round((totalCollected / suggested) * 100)) : 0;

  const openModal = () => {
    if (!user || !user.email) {
      // redirect to login with return location
      navigate("/login", { state: { from: location }, replace: true });
      return;
    }
    // reset errors & keep name/email
    setSubmitError(null);
    setForm((f) => ({ ...f, name: user?.displayName || "", email: user?.email || "" }));
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      setSubmitError("বVALID পরিমাণ লিখুন (১ বা তার বেশি)।");
      return;
    }
    if (!form.name || !form.email) {
      setSubmitError("নাম ও ইমেইল প্রয়োজন।");
      return;
    }

    const payload = {
      issueId: id,
      issueTitle: issue?.title || "",
      amount: Number(form.amount),
      name: form.name,
      email: form.email,
      phone: form.phone || "",
      address: form.address || "",
      additionalInfo: form.additionalInfo || "",
      // optional: avatar from user.photoURL if available
      avatar: user?.photoURL || ""
    };

    try {
      setSubmitting(true);
      const res = await fetch(`${BASE}/contributions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Server error ${res.status}`);
      }

      const json = await res.json();
      // Success: refresh contributions list
      setShowModal(false);
      setForm((s) => ({ ...s, amount: "", additionalInfo: "" }));
      // reload contribs
      setLoadingContribs(true);
      const r2 = await fetch(`${BASE}/contributions?issueId=${id}`);
      const list = await r2.json();
      setContribs(Array.isArray(list) ? list : []);
      setSubmitError(null);
      alert("অভিনন্দন — আপনার কন্ট্রিবিউশন সফলভাবে যোগ হয়েছে!");
    } catch (err) {
      console.error("Contribution submit error:", err);
      setSubmitError("কোনো সমস্যা হয়েছে — আবার চেষ্টা করুন।");
    } finally {
      setSubmitting(false);
      setLoadingContribs(false);
    }
  };

  if (loadingIssue) return <Spinner />;

  if (errorIssue || !issue) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-xl text-center">
          <p className="text-red-600 mb-3">{errorIssue || "Issue not found."}</p>
          <Link to="/issues" className="text-sm text-blue-600 underline">পুনরায় All Issues দেখো</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded shadow p-4">
          <div className="w-full h-64 bg-gray-100 rounded overflow-hidden">
            <img
              src={issue.image || "https://via.placeholder.com/1200x600?text=No+Image"}
              alt={issue.title}
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/1200x600?text=No+Image")}
            />
          </div>

          <div className="mt-4 flex flex-col md:flex-row items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{issue.title}</h1>
              <div className="text-sm text-gray-600 mt-1">{issue.category} • {issue.location}</div>
              <p className="mt-3 text-gray-700 whitespace-pre-line">{issue.description}</p>
            </div>

            <div className="w-64 text-right">
              <div className="text-sm text-gray-500">Suggested Budget</div>
              <div className="text-2xl font-semibold mt-1">৳ {issue.amount ?? 0}</div>
              <div className={`mt-3 text-xs px-2 py-1 rounded-full inline-block ${issue.status === "ended" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                {issue.status ?? "ongoing"}
              </div>

              <div className="mt-4">
                <button onClick={openModal} className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                  Pay Clean-Up Contribution
                </button>
                <Link to="/issues" className="block mt-2 text-xs text-gray-600 hover:underline">← Back to all issues</Link>
              </div>
            </div>
          </div>

          {/* progress bar */}
          <div className="mt-5">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <div>Total collected: ৳ {totalCollected}</div>
              <div>{progressPercent}%</div>
            </div>
            <div className="w-full bg-gray-200 h-3 rounded">
              <div style={{ width: `${progressPercent}%` }} className="h-3 rounded bg-green-500" />
            </div>
          </div>
        </div>

        {/* Contributors */}
        <div className="bg-white rounded shadow p-4 mt-6">
          <h2 className="text-lg font-semibold mb-3">Contributors</h2>

          {loadingContribs ? (
            <Spinner />
          ) : contribError ? (
            <div className="text-red-600">{contribError}</div>
          ) : contribs.length === 0 ? (
            <div className="text-gray-600">এ পর্যন্ত কোনো কনট্রিবিউশন নেই।</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-600">
                  <tr>
                    <th className="pb-2">Contributor</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {contribs.map((c) => (
                    <tr key={c._id} className="border-t">
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={c.avatar || `https://i.pravatar.cc/40?u=${c.email}`}
                            alt={c.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-medium">{c.name}</div>
                            <div className="text-xs text-gray-500">{c.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2">৳ {c.amount}</td>
                      <td className="py-2">{c.date ? new Date(c.date).toLocaleString() : "—"}</td>
                      <td className="py-2">{c.phone || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-md rounded shadow p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Pay Clean-Up Contribution</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-600">✕</button>
            </div>

            <form onSubmit={handleContribute} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600">Issue Title</label>
                <div className="text-sm">{issue.title}</div>
              </div>

              <div>
                <label className="block text-xs text-gray-600">Amount (৳)</label>
                <input
                  name="amount"
                  value={form.amount}
                  onChange={handleFormChange}
                  type="number"
                  min="1"
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600">Your Name</label>
                <input name="name" value={form.name} onChange={handleFormChange} className="w-full border rounded px-3 py-2" />
              </div>

              <div>
                <label className="block text-xs text-gray-600">Email</label>
                <input name="email" value={form.email} readOnly className="w-full border rounded px-3 py-2 bg-gray-100" />
              </div>

              <div>
                <label className="block text-xs text-gray-600">Phone</label>
                <input name="phone" value={form.phone} onChange={handleFormChange} className="w-full border rounded px-3 py-2" />
              </div>

              <div>
                <label className="block text-xs text-gray-600">Address</label>
                <input name="address" value={form.address} onChange={handleFormChange} className="w-full border rounded px-3 py-2" />
              </div>

              <div>
                <label className="block text-xs text-gray-600">Additional Info (optional)</label>
                <textarea name="additionalInfo" value={form.additionalInfo} onChange={handleFormChange} rows={3} className="w-full border rounded px-3 py-2" />
              </div>

              {submitError && <div className="text-sm text-red-600">{submitError}</div>}

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-2 border rounded">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-green-600 text-white rounded">
                  {submitting ? "Processing..." : "Pay & Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
