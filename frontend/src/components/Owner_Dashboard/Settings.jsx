import React, { useState, useEffect } from "react";

function Settings() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    aadhar: "",
    pan: "",
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Token not found. Please login again.");
        return;
      }
      try {
        const res = await fetch("http://localhost:5000/api/owners/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setProfile({
            ...data,
            aadhar: data.document?.Aadhar || "",
            pan: data.document?.PAN || "",
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/owners/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEditing(false);
      } else {
        alert(data.message || "Failed to update profile");
      }
    } catch (err) {
      alert("Server error");
    }
    setLoading(false);
  };

  const maskValue = (value, visible = 4) => {
    if (!value) return "";
    const masked = "*".repeat(Math.max(0, value.length - visible)) + value.slice(-visible);
    return masked;
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded shadow p-6 mt-8">
      <h2 className="text-2xl font-bold mb-6">Owner Profile</h2>
      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-gray-700">Name</label>
            <input
              name="name"
              value={profile.name}
              onChange={handleChange}
              disabled={!editing}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              name="email"
              value={profile.email}
              onChange={handleChange}
              disabled
              className="w-full border px-3 py-2 rounded bg-gray-100"
              type="email"
            />
          </div>
          <div>
            <label className="block text-gray-700">Phone</label>
            <input
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              disabled={!editing}
              className="w-full border px-3 py-2 rounded"
              type="tel"
            />
          </div>
          <div>
            <label className="block text-gray-700">Address</label>
            <input
              name="address"
              value={profile.address}
              onChange={handleChange}
              disabled={!editing}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">Aadhar</label>
            <input
              name="aadhar"
              value={maskValue(profile.aadhar)}
              onChange={handleChange}
              disabled={!editing}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">PAN</label>
            <input
              name="pan"
              value={maskValue(profile.pan)}
              onChange={handleChange}
              disabled={!editing}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div className="flex gap-4 mt-6">
            {editing ? (
              <>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded"
                  disabled={loading}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="bg-gray-300 px-6 py-2 rounded"
                  onClick={() => setEditing(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                className="bg-blue-600 text-white px-6 py-2 rounded"
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

export default Settings;