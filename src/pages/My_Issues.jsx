// src/pages/My_Issues.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import api from "../lib/api"; // centralized axios

function Spinner({ size = 36 }) {
  return (
    <div className="flex items-center justify-center py-8">
      <svg style={{ width: size, height: size }} className="animate-spin text-gray-600" viewBox="0 0 50 50">
        <circle cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
        <path className="opacity-75" fill="currentColor" d="M43.935 25.145a19.978 19.978 0 01-7.03 10.96 ..."/>
      </svg>
    </div>
  );
}

export default function My_Issues() {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit/Delete states...
  const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "", category: "Garbage", location: "", description: "", image: "", amount: "", status: "ongoing",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (!user || !user.email) {
      setIssues([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    // Prefer server-side filter if supported
    api.get("/issues", { params: { email: user.email } })
      .then(res => {
        if (!mounted) return;
        setIssues(Array.isArray(res.data) ? res.data : []);
      })
      .catch(async (err) => {
        console.warn("Server-side filter failed, falling back to fetch-all:", err?.message);
        try {
          const res2 = await api.get("/issues", { params: { limit: 1000 } });
          if (!mounted) return;
          const all = Array.isArray(res2.data) ? res2.data : [];
          const mine = all.filter(it => (it.email || "").toLowerCase() === (user.email || "").toLowerCase());
          setIssues(mine);
        } catch (e) {
          console.error("Failed to load issues fallback:", e);
          if (mounted) setError("Issue load failed. Server error or network.");
        }
      })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [user]);

  const openEdit = (issue) => {
    setEditing(issue);
    setEditForm({
      title: issue.title || "",
      category: issue.category || "Garbage",
      location: issue.location || "",
      description: issue.description || "",
      image: issue.image || "",
      amount: issue.amount || "",
      status: issue.status || "ongoing",
    });
    setEditError(null);
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(s => ({ ...s, [name]: value }));
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editing) return;
    if (!editForm.title.trim() || !editForm.location.trim() || !editForm.description.trim()) {
      setEditError("Title, location and description are required.");
      return;
    }
    try {
      setEditLoading(true);
      setEditError(null);

      const payload = {
        title: editForm.title.trim(),
        category: editForm.category,
        location: editForm.location.trim(),
        description: editForm.description.trim(),
        image: editForm.image ? editForm.image.trim() : "",
        amount: Number(editForm.amount) || 0,
        status: editForm.status || "ongoing",
      };

      const res = await api.put(`/issues/${editing._id}`, payload);
      // optimistic update
      setIssues(prev => prev.map(it => (String(it._id) === String(editing._id) ? { ...it, ...payload } : it)));
      setShowEditModal(false);
      alert("Issue updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      const msg = err?.response?.data?.message || err.message || "Update failed";
      setEditError(String(msg));
    } finally {
      setEditLoading(false);
    }
  };

  const openDelete = (id) => {
    setDeletingId(id);
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      setDeleteLoading(true);
      const res = await api.delete(`/issues/${deletingId}`);
      // remove from UI
      setIssues(prev => prev.filter(it => String(it._id) !== String(deletingId)));
      setShowDeleteModal(false);
      alert("Issue deleted permanently.");
    } catch (err) {
      console.error("Delete failed:", err);
      const msg = err?.response?.data?.message || err.message || "Delete failed";
      setDeleteError(String(msg));
    } finally {
      setDeleteLoading(false);
    }
  };

  const tableRows = useMemo(() => {
    return issues.map((it) => ({
      id: it._id || it.id,
      title: it.title, category: it.category, location: it.location,
      amount: it.amount, status: it.status, createdAt: it.createdAt,
    }));
  }, [issues]);

  return (
    <main className="min-h-screen bg-gray-50 py-8">

        <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">My Issues</h1>
          <Link to="/add-issue" className="px-3 py-2 bg-green-600 text-white rounded">Add New Issue</Link>
        </div>

        {loading ? (
          <div className="bg-white p-6 rounded shadow">
            <Spinner />
            <div className="text-center text-gray-600 mt-2">Loading your issues...</div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded text-red-700">{error}</div>
        ) : tableRows.length === 0 ? (
          <div className="bg-white p-6 rounded shadow text-gray-600">কোনো ইস্যু নেই — আপনি নতুন ইস্যু যোগ করুন।</div>
        ) : (
          <div className="bg-white rounded shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-left text-gray-700">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Amount (৳)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((r) => (
                  <tr key={r.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{r.title}</td>
                    <td className="p-3">{r.category}</td>
                    <td className="p-3">{r.location}</td>
                    <td className="p-3">{r.amount ?? "—"}</td>
                    <td className="p-3">{r.status}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(issues.find(it => String(it._id) === String(r.id)))} className="px-3 py-1 bg-blue-600 text-white rounded text-xs">Update</button>
                        <button onClick={() => openDelete(r.id)} className="px-3 py-1 bg-red-600 text-white rounded text-xs">Delete</button>
                        <Link to={`/issues/${r.id}`} className="px-3 py-1 bg-gray-200 rounded text-xs">Details</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-2xl rounded shadow p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Update Issue</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-600">✕</button>
            </div>

            <form onSubmit={submitEdit} className="space-y-3">
              {editError && <div className="text-sm text-red-600">{editError}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600">Title</label>
                  <input name="title" value={editForm.title} onChange={handleEditChange} className="w-full border rounded px-3 py-2" />
                </div>

                <div>
                  <label className="block text-xs text-gray-600">Category</label>
                  <select name="category" value={editForm.category} onChange={handleEditChange} className="w-full border rounded px-3 py-2">
                    <option>Garbage</option>
                    <option>Illegal Construction</option>
                    <option>Broken Public Property</option>
                    <option>Road Damage</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-600">Location</label>
                <input name="location" value={editForm.location} onChange={handleEditChange} className="w-full border rounded px-3 py-2" />
              </div>

              <div>
                <label className="block text-xs text-gray-600">Description</label>
                <textarea name="description" value={editForm.description} onChange={handleEditChange} rows="4" className="w-full border rounded px-3 py-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600">Image URL</label>
                  <input name="image" value={editForm.image} onChange={handleEditChange} className="w-full border rounded px-3 py-2" />
                </div>

                <div>
                  <label className="block text-xs text-gray-600">Amount (৳)</label>
                  <input type="number" name="amount" value={editForm.amount} onChange={handleEditChange} className="w-full border rounded px-3 py-2" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-600">Status</label>
                <select name="status" value={editForm.status} onChange={handleEditChange} className="w-full border rounded px-3 py-2">
                  <option value="ongoing">ongoing</option>
                  <option value="ended">ended</option>
                </select>
                <div className="text-xs text-gray-500 mt-1">Status change must be a dropdown or radio (requirement)।</div>
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-3 py-2 border rounded">Cancel</button>
                <button type="submit" disabled={editLoading} className="px-4 py-2 bg-blue-600 text-white rounded">
                  {editLoading ? "Updating..." : "Update Issue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-md rounded shadow p-4">
            <h3 className="text-lg font-semibold mb-3">Confirm Delete</h3>
            {deleteError && <div className="text-sm text-red-600 mb-2">{deleteError}</div>}
            <p className="mb-4">আপনি কি নিশ্চিতভাবে এই ইস্যুটি স্থায়ীভাবে মুছে ফেলতে চান? এই কাজ পুনরুদ্ধারযোগ্য নয়।</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDeleteModal(false)} className="px-3 py-2 border rounded">Cancel</button>
              <button onClick={confirmDelete} disabled={deleteLoading} className="px-4 py-2 bg-red-600 text-white rounded">
                {deleteLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ... UI unchanged (same as your original) ... */}
      {/* For brevity, keep your existing JSX rendering code here (table, modals) */}
      {/* Copy your existing rendering markup from your original file below */}
    </main>
  );
}
