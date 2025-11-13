// src/pages/My_Contribution.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import api from "../lib/api"; // centralized axios

function Spinner({ size = 36 }) {
  return (
    <div className="flex items-center justify-center py-8">
      <svg style={{ width: size, height: size }} className="animate-spin text-gray-600" viewBox="0 0 50 50">
        <circle cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
        <path className="opacity-75" fill="currentColor" d="M43.935 25.145a19.978 19.978 0 01-7.03 10.96 ..." />
      </svg>
    </div>
  );
}

export default function My_Contribution() {
  const { user } = useAuth();
  const [contribs, setContribs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    let mounted = true;
    if (!user || !user.email) {
      setContribs([]);
      setFiltered([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Prefer server-side filter by email: GET /contributions?email=...
    api.get("/contributions", { params: { email: user.email } })
      .then((res) => {
        if (!mounted) return;
        setContribs(Array.isArray(res.data) ? res.data : []);
      })
      .catch(async (err) => {
        // fallback: try fetching all contributions (server may support all=true)
        console.warn("Server-side filter failed, trying fallback:", err?.message || err);
        try {
          const r2 = await api.get("/contributions", { params: { all: true } });
          if (!mounted) return;
          const all = Array.isArray(r2.data) ? r2.data : [];
          const mine = all.filter((c) => (c.email || "").toLowerCase() === (user.email || "").toLowerCase());
          setContribs(mine);
        } catch (err2) {
          // final fallback: try plain /contributions and filter client-side
          try {
            const r3 = await api.get("/contributions");
            if (!mounted) return;
            const all = Array.isArray(r3.data) ? r3.data : [];
            const mine = all.filter((c) => (c.email || "").toLowerCase() === (user.email || "").toLowerCase());
            setContribs(mine);
          } catch (finalErr) {
            console.error("Contributions fetch error:", finalErr);
            if (!mounted) return;
            setError("কন্ট্রিবিউশন লোড করা যায়নি। সার্ভার চেক করো।");
          }
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [user]);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      setFiltered(contribs);
      return;
    }
    setFiltered(
      contribs.filter((c) =>
        (c.issueTitle || "").toLowerCase().includes(q) ||
        (c.name || "").toLowerCase().includes(q) ||
        (c.email || "").toLowerCase().includes(q) ||
        (c.address || "").toLowerCase().includes(q)
      )
    );
  }, [search, contribs]);

  const totalPaid = useMemo(() => {
    return contribs.reduce((s, c) => s + (Number(c.amount) || 0), 0);
  }, [contribs]);

  // generate single PDF report for a contribution
  const downloadContributionPDF = (c) => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text("CleanCity - Contribution Receipt", 14, 20);
      doc.setFontSize(11);
      doc.text(`Issue: ${c.issueTitle || "-"}`, 14, 34);
      doc.text(`Contributor: ${c.name || "-"}`, 14, 42);
      doc.text(`Email: ${c.email || "-"}`, 14, 50);
      doc.text(`Phone: ${c.phone || "-"}`, 14, 58);
      doc.text(`Address: ${c.address || "-"}`, 14, 66);
      doc.text(`Amount (৳): ${c.amount || 0}`, 14, 74);
      const d = c.date ? new Date(c.date).toLocaleString() : new Date().toLocaleString();
      doc.text(`Date: ${d}`, 14, 82);
      if (c.additionalInfo) {
        doc.text("Note:", 14, 94);
        doc.setFontSize(10);
        doc.text(c.additionalInfo, 14, 100, { maxWidth: 180 });
      }
      doc.save(`contribution_${c._id || Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF error:", err);
      alert("PDF তৈরিতে সমস্যা হয়েছে। কনসোল দেখো।");
    }
  };

  // generate combined PDF for all (or current filtered)
  const downloadAllPDF = (rows = filtered.length ? filtered : contribs) => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text("CleanCity - My Contributions Report", 14, 18);
      doc.setFontSize(11);
      doc.text(`Name: ${user?.displayName || "-"}`, 14, 26);
      doc.text(`Email: ${user?.email || "-"}`, 14, 34);
      doc.text(`Total Paid (৳): ${totalPaid}`, 14, 42);

      const tableColumn = ["Issue", "Amount (৳)", "Date"];
      const tableRows = (rows || []).map((r) => [
        r.issueTitle || r.issueId || "-",
        String(r.amount || 0),
        r.date ? new Date(r.date).toLocaleString() : "-"
      ]);

      // autodable
      // eslint-disable-next-line no-undef
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 52,
        styles: { fontSize: 10 }
      });

      doc.save(`my_contributions_${Date.now()}.pdf`);
    } catch (err) {
      console.error("Download all PDF error:", err);
      alert("সব কন্ট্রিবিউশনের PDF তৈরিতে সমস্যা হয়েছে।");
    }
  };

  if (loading) return <div className="p-6"><Spinner /></div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">My Contributions</h1>
          <div className="text-right">
            <div className="text-sm text-gray-600">Total Paid</div>
            <div className="text-xl font-semibold">৳ {totalPaid}</div>
            <div className="mt-2 flex gap-2">
              <button onClick={() => downloadAllPDF()} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Download All (PDF)</button>
              <Link to="/issues" className="px-3 py-1 bg-gray-200 rounded text-sm">Browse Issues</Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded shadow p-4 mb-4">
          <div className="flex items-center gap-3">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by issue, name, email, address..." className="flex-1 border rounded px-3 py-2" />
            <div className="text-sm text-gray-500">Showing {filtered.length} of {contribs.length}</div>
          </div>
        </div>

        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left text-gray-700">
              <tr>
                <th className="p-3">Issue Title</th>
                <th className="p-3">Amount (৳)</th>
                <th className="p-3">Date</th>
                <th className="p-3">Additional Info</th>
                <th className="p-3">Report</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-600">কোনো কনট্রিবিউশন পাওয়া যায়নি।</td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c._id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">{c.issueTitle || c.issueId}</div>
                      <div className="text-xs text-gray-500">{/* optional category */}</div>
                    </td>
                    <td className="p-3">৳ {c.amount}</td>
                    <td className="p-3">{c.date ? new Date(c.date).toLocaleString() : "-"}</td>
                    <td className="p-3">{c.additionalInfo ? (c.additionalInfo.length > 80 ? c.additionalInfo.slice(0,80)+"..." : c.additionalInfo) : "—"}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button onClick={() => downloadContributionPDF(c)} className="px-3 py-1 bg-green-600 text-white rounded text-xs">Download PDF</button>
                        <a href={`data:application/json,${encodeURIComponent(JSON.stringify(c, null, 2))}`} download={`contrib_${c._id || Date.now()}.json`} className="px-3 py-1 bg-gray-200 rounded text-xs">JSON</a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  );
}
