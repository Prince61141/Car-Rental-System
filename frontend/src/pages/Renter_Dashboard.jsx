import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Renter_Dashboard/Sidebar";
import Topbar from "../components/Owner_Dashboard/Topbar";
import RenterVerification from "../components/Renter_Dashboard/RenterVerification";
import Overview from "../components/Renter_Dashboard/Overview";
import Settings from "../components/Renter_Dashboard/Settings";
import Booking from "../components/Renter_Dashboard/Booking";
import Chatbot from "../components/Chatbot";
import Notifications from "../components/Renter_Dashboard/Notifications";
import Transactions from "../components/Renter_Dashboard/Transactions";
import { subscribeOpenBooking } from "../components/Renter_Dashboard/dashboardBus";

function Renter_Dashboard() {
  
  const API_URL = process.env.REACT_APP_API_URL;

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
  const [openBookingId, setOpenBookingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = subscribeOpenBooking((id) => {
      setOpenBookingId(id || null);
      setActiveSection("Bookings");
    });
    return unsub;
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/owners/me`, {
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
            <Topbar
              onMenuClick={() => setSidebarOpen(true)}
              name={profile.name}
              photo={profile.photo}
            />
            {/* Section Content */}
            {activeSection === "Dashboard" && <Overview />}
            {activeSection === "Bookings" && (
              <Booking
                openId={openBookingId}
                onOpened={() => setOpenBookingId(null)}
              />
            )}
            {activeSection === "Settings" && <Settings />}
            {activeSection === "Notifications" && <Notifications />}
            {activeSection === "Transactions" && <Transactions />}
            {/* Add more sections as needed */}
            <Chatbot />
          </>
        )}
      </main>
    </div>
  );
}

export default Renter_Dashboard;