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
  const [msg, setMsg] = useState("");
  // Password change state
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passMsg, setPassMsg] = useState("");
  const [passLoading, setPassLoading] = useState(false);

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
    setMsg("");
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
        setMsg("Profile updated successfully!");
      } else {
        setMsg(data.message || "Failed to update profile");
      }
    } catch (err) {
      setMsg("Server error");
    }
    setLoading(false);
  };

  const maskValue = (value, visible = 4) => {
    if (!value) return "";
    const masked = "*".repeat(Math.max(0, value.length - visible)) + value.slice(-visible);
    return masked;
  };

  // Password change handlers
  const handlePasswordChange = (e) => {
    setPasswords((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassMsg("");
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPassMsg("New passwords do not match.");
      return;
    }
    if (passwords.oldPassword === passwords.newPassword) {
      setPassMsg("New password must be different from old password.");
      return;
    }
    setPassLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/users/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: passwords.oldPassword,
          newPassword: passwords.newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPassMsg("Password changed successfully!");
        setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setPassMsg(data.message || "Failed to change password");
      }
    } catch (err) {
      setPassMsg("Server error");
    }
    setPassLoading(false);
  };

  return (
    <div className="ml-3 mr-3 bg-white rounded-xl shadow p-8 mt-10">
      <h2 className="text-2xl font-bold mb-6 text-[#2f1c53]">Owner Profile</h2>
      {/* Profile Section */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-gray-700 mb-1">Name</label>
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
          <label className="block text-gray-700 mb-1">Email</label>
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
          <label className="block text-gray-700 mb-1">Phone</label>
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
          <label className="block text-gray-700 mb-1">Address</label>
          <input
            name="address"
            value={profile.address}
            onChange={handleChange}
            disabled={!editing}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Aadhar</label>
          <input
            name="aadhar"
            value={maskValue(profile.aadhar)}
            onChange={handleChange}
            disabled
            className="w-full border px-3 py-2 rounded bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">PAN</label>
          <input
            name="pan"
            value={maskValue(profile.pan)}
            onChange={handleChange}
            disabled
            className="w-full border px-3 py-2 rounded bg-gray-100"
          />
        </div>
        {msg && (
          <div className={msg.includes("success") ? "text-green-600" : "text-red-600"}>
            {msg}
          </div>
        )}
        <div className="flex gap-4 mt-6">
          {editing ? (
            <>
              <button
                type="submit"
                className="bg-[#2f1c53] hover:bg-[#3d3356] text-white px-6 py-2 rounded font-medium"
                disabled={loading}
              >
                Save
              </button>
              <button
                type="button"
                className="bg-gray-300 px-6 py-2 rounded font-medium"
                onClick={() => setEditing(false)}
                disabled={loading}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              className="bg-[#2f1c53] hover:bg-[#3d3356] text-white px-6 py-2 rounded font-medium"
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </button>
          )}
        </div>
      </form>

      {/* Password Section */}
      <div className="mt-10 border-t pt-8">
        <h3 className="text-xl font-bold mb-4 text-[#2f1c53]">Change Password</h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Current Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="oldPassword"
              value={passwords.oldPassword}
              onChange={handlePasswordChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">New Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="newPassword"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Confirm New Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword((v) => !v)}
              id="showPass"
            />
            <label htmlFor="showPass" className="text-gray-600 text-sm">
              Show Passwords
            </label>
          </div>
          {passMsg && (
            <div className={passMsg.includes("success") ? "text-green-600" : "text-red-600"}>
              {passMsg}
            </div>
          )}
          <button
            type="submit"
            className="bg-[#2f1c53] hover:bg-[#3d3356] text-white px-6 py-2 rounded font-medium"
            disabled={passLoading}
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default Settings;