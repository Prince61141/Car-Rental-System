import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Renter_Dashboard/Sidebar";
import RenterVerification from "../components/Renter_Dashboard/RenterVerification";
import Overview from "../components/Renter_Dashboard/Overview";
import Settings from "../components/Renter_Dashboard/Settings";
import Booking from "../components/Renter_Dashboard/Booking";
import Chatbot from "../components/Chatbot";

function Renter_Dashboard() {
  const [verified, setVerified] = useState(false);
  const [aadhar, setAadhar] = useState("");
  const [pan, setPan] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [profile, setProfile] = useState({
    name: "",
    photo: "",
    role: "",
  });
  const [photoPreview, setPhotoPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const res = await fetch("http://localhost:5000/api/owners/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const user = data.user || data;

        if (user.role !== "renter") {
          setUnauthorized(true);
        } else {
          setProfile({
            name: user.name || "",
            photo: user.photo || "",
            role: user.role || "",
          });
          setPhotoPreview(user.photo || "");
          setVerified(user.verified);
        }
      } catch (err) {
        setUnauthorized(true);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg text-gray-600">
        Loading...
      </div>
    );
  }

  if (unauthorized) {
    window.location.href = "/login";
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full font-sans bg-gray-100 h-screen">
      <Sidebar
        active={activeSection}
        setActive={setActiveSection}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />
      <main className="flex-1 overflow-auto disabledscrollbar">
        {!verified ? (
          <RenterVerification
            onVerify={() => setVerified(true)}
            aadhar={aadhar}
            setAadhar={setAadhar}
            pan={pan}
            setPan={setPan}
          />
        ) : (
          <>
            {/* Responsive Header */}
            <div className="flex flex-col px-4 py-4 md:px-4 md:py-4 gap-2 md:flex-row md:justify-between md:items-center mb-4">
              <div className="flex items-center gap-2 w-full">
                <button
                  className="md:hidden bg-black text-white p-2 rounded mr-2"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open sidebar"
                >
                  ☰
                </button>
                <span className="text-xl font-bold">
                  Welcome, {profile.name}!
                </span>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                <input
                  type="text"
                  placeholder="Search here"
                  className="border px-4 py-2 rounded-md w-full md:w-64"
                />
                <span className="text-xl">🔔</span>
                <img
                  src={
                    profile.photo
                      ? profile.photo
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          profile.name || "User"
                        )}`
                  }
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border border-gray-300"
                />
              </div>
            </div>
            {/* Section Content */}
            {activeSection === "Dashboard" && <Overview />}
            {activeSection === "Bookings" && <Booking />}
            {activeSection === "Settings" && <Settings />}
            {/* Add more sections as needed */}
            <Chatbot />
          </>
        )}
      </main>
    </div>
  );
}

export default Renter_Dashboard;