// src/pages/Add_Issue.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth"; // adjust path if needed
import api from "../lib/api"; // centralized axios instance

export default function Add_Issue() {
  const { user } = useAuth(); // expect { name, email, photoURL } or null
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    category: "Garbage",
    location: "",
    description: "",
    image: "",
    amount: "",
    status: "ongoing",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(""); // image preview

  useEffect(() => {
    setPreview(form.image ? form.image : "");
  }, [form.image]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const validate = () => {
    if (!form.title.trim()) return "Title is required";
    if (!form.category) return "Category is required";
    if (!form.location.trim()) return "Location is required";
    if (!form.description.trim()) return "Description is required";
    if (!form.amount || Number(form.amount) < 0 || isNaN(Number(form.amount)))
      return "Valid amount is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!user || !user.email) {
      setError("You must be logged in to submit an issue.");
      return;
    }

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    const payload = {
      title: form.title.trim(),
      category: form.category,
      location: form.location.trim(),
      description: form.description.trim(),
      image: form.image.trim() || "",
      amount: Number(form.amount),
      status: form.status,
      email: user.email,
      createdAt: new Date().toISOString(),
    };

    try {
      setLoading(true);

      // ================================
      // axios POST: /issues
      // ================================
      const res = await api.post("/issues", payload);
      // If API returns insertedId:
      if (res?.data?.insertedId) {
        alert("✅ Issue submitted successfully!");
      } else {
        // fallback success message
        alert("✅ Issue submitted (server responded).");
      }

      // Reset form
      setForm({
        title: "",
        category: "Garbage",
        location: "",
        description: "",
        image: "",
        amount: "",
        status: "ongoing",
      });

      // Redirect to My Issues
      navigate("/my-issues");
    } catch (err) {
      console.error("Submit failed:", err);
      // Better error message extraction
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Submission failed";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-[60vh] py-8 bg-green-200"
      style={{ backgroundImage: "url('/Sprinkle.svg')" }}
    >
      <div
        className="max-w-3xl mx-auto p-6"
        style={{ backgroundImage: "url('/Sprinkle.svg')" }}
      >
        <h1 className="text-2xl font-semibold mb-4 text-black">Add Issue</h1>

        <form
          onSubmit={handleSubmit}
          className="text-white font-bold p-6 rounded-lg shadow-md space-y-4"
        >
          {error && (
            <div className="text-red-700 bg-red-50 border border-red-100 p-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="Short title of the issue"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Category *
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border bg-black rounded px-3 py-2"
              >
                <option>Garbage</option>
                <option>Illegal Construction</option>
                <option>Broken Public Property</option>
                <option>Road Damage</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Location *
              </label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g. Mohakhali, Dhaka"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              className="w-full border rounded px-3 py-2"
              placeholder="Describe the issue in detail..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Image URL (optional)
            </label>
            <input
              name="image"
              value={form.image}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="https://example.com/image.jpg"
            />
            {preview && (
              <div className="mt-3">
                <div className="text-xs text-gray-500 mb-2">Preview:</div>
                <img
                  src={preview}
                  alt="preview"
                  onError={() => setPreview("")}
                  className="w-48 h-32 object-cover rounded border"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Amount (৳) *
              </label>
              <input
                name="amount"
                value={form.amount}
                onChange={handleChange}
                type="number"
                min="0"
                className="w-full border rounded px-3 py-2"
                placeholder="Suggested fix budget"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 bg-black"
              >
                <option value="ongoing">ongoing</option>
                <option value="ended">ended</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Your Email</label>
            <input
              value={user?.email || ""}
              readOnly
              className="w-full border rounded px-3 py-2 bg-b"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded font-semibold disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Issue"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
