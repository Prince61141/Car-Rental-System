import React, { useState, useEffect, useRef } from "react";
import debounce from "lodash.debounce";

function Settings() {
  const API_URL = process.env.REACT_APP_API_URL;
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    aadhar: "",
    pan: "",
    photo: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passMsg, setPassMsg] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Token not found. Please login again.");
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/owners/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setProfile({
            ...data,
            aadhar: data.document?.Aadhar || "",
            pan: data.document?.PAN || "",
            photo: data.photo || "",
          });
          setPhotoPreview(data.photo || "");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const saveProfile = async (updatedProfile) => {
    const token = localStorage.getItem("token");
    setMsg("Saving...");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/owners/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: updatedProfile.name,
          phone: updatedProfile.phone,
          address: updatedProfile.address,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMsg("Saved successfully!");
      } else {
        setMsg(data.message || "Failed to save changes.");
      }
    } catch (err) {
      console.error(err);
      setMsg("Server error");
    }
    setLoading(false);
  };

  const debouncedSave = useRef(
    debounce((updated) => {
      saveProfile(updated);
    }, 1000)
  ).current;

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...profile, [name]: value };
    setProfile(updated);
    debouncedSave(updated);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile((prev) => ({
        ...prev,
        photo: file,
      }));
      setPhotoPreview(URL.createObjectURL(file));
      uploadPhoto(file);
    }
  };

  const uploadPhoto = async (file) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("photo", file);
    try {
      const res = await fetch(`${API_URL}/api/owners/update`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMsg("Photo updated!");
        if (data.photo) setPhotoPreview(data.photo);
      } else {
        setMsg(data.message || "Photo upload failed");
      }
    } catch (err) {
      setMsg("Server error");
    }
  };

  const maskValue = (value, visible = 4) => {
    if (!value) return "";
    return "*".repeat(Math.max(0, value.length - visible)) + value.slice(-visible);
  };

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
      const res = await fetch(
        "${API_URL}/api/users/change-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldPassword: passwords.oldPassword,
            newPassword: passwords.newPassword,
          }),
        }
      );
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
    <div className="ml-3 mr-3 bg-white rounded-xl shadow p-8">
      <h2 className="text-2xl font-bold mb-6 text-[#2f1c53]">Owner Profile</h2>
      
      {/* Profile Photo */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <img
            src={
              photoPreview ||
              "https://ui-avatars.com/api/?name=" +
                encodeURIComponent(profile.name || "User")
            }
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-2 border-[#2f1c53] shadow"
          />
          <button
            type="button"
            className="absolute bottom-0 right-0 bg-[#2f1c53] text-white rounded-full p-2 shadow"
            onClick={() => fileInputRef.current.click()}
            title="Change Photo"
          >
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.414 2.586a2 2 0 0 0-2.828 0l-1.172 1.172 2.828 2.828 1.172-1.172a2 2 0 0 0 0-2.828zM2 13.586V17h3.414l9.586-9.586-2.828-2.828L2 13.586z" />
            </svg>
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handlePhotoChange}
          />
        </div>
        <div className="text-sm text-gray-500 mt-2">Click photo to change</div>
      </div>

      {/* Profile Form */}
      <form className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">Name</label>
          <input
            name="name"
            value={profile.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Email</label>
          <input
            name="email"
            value={profile.email}
            className="w-full border px-3 py-2 rounded bg-gray-100"
            type="email"
            disabled
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Phone</label>
          <input
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            type="tel"
            disabled
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Address</label>
          <input
            name="address"
            value={profile.address}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Aadhar</label>
          <input
            name="aadhar"
            value={maskValue(profile.aadhar)}
            className="w-full border px-3 py-2 rounded bg-gray-100"
            disabled
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">PAN</label>
          <input
            name="pan"
            value={maskValue(profile.pan)}
            className="w-full border px-3 py-2 rounded bg-gray-100"
            disabled
          />
        </div>
        {msg && (
          <div className={msg.includes("success") ? "text-green-600" : "text-red-600"}>
            {msg}
          </div>
        )}
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