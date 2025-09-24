import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Owner_Dashboard/Sidebar";
import OwnerVerification from "../components/Owner_Dashboard/OwnerVerification";
import Overview from "../components/Owner_Dashboard/Overview";
import Cars from "../components/Owner_Dashboard/Cars";
import Settings from "../components/Owner_Dashboard/Settings";
import Booking from "../components/Owner_Dashboard/Booking";
import Notifications from "../components/Owner_Dashboard/Notifications";
import Transactions from "../components/Owner_Dashboard/Transactions";
import PaymentDetails from "../components/Owner_Dashboard/PaymentDetails";
import CarReport from "../components/Owner_Dashboard/CarReport";
import Chatbot from "../components/Chatbot";
import Topbar from "../components/Owner_Dashboard/Topbar";

function Owner_Dashboard() {
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

        if (user.role !== "peer-owner") {
          setUnauthorized(true);
        } else {
          setProfile({
            name: user.name || "",
            photo: user.photo || "",
            role: user.role || "",
          });
          setPhotoPreview(user.photo || "");
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
    <div className="flex flex-col md:flex-row h-screen w-full font-sans bg-gray-100">
      <Sidebar
        active={activeSection}
        setActive={setActiveSection}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />
      <main className="flex-1 overflow-auto disabledscrollbar pb-3">
        {!verified ? (
          <OwnerVerification
            onVerify={() => setVerified(true)}
            aadhar={aadhar}
            setAadhar={setAadhar}
            pan={pan}
            setPan={setPan}
          />
        ) : (
          <>
            {/* Sticky Topbar (replaces old inline header) */}
            <Topbar
              onMenuClick={() => setSidebarOpen(true)}
              name={profile.name}
              photo={profile.photo}
            />

            {/* Section Content */}
            {activeSection === "Dashboard" && (
              <Overview ownerName={profile?.name} />
            )}
            {activeSection === "Cars" && (
              <Cars ownerName={profile?.name} />
            )}
            {activeSection === "Bookings" && (
              <Booking ownerName={profile?.name} />
            )}
            {activeSection === "Settings" && <Settings />}
            {activeSection === "Notifications" && <Notifications />}
            {activeSection === "Payment Details" && <PaymentDetails />}
            {activeSection === "Car Report" && <CarReport />}
            {activeSection === "Transactions" && <Transactions />}
            <Chatbot />
          </>
        )}
      </main>
    </div>
  );
}

export default Owner_Dashboard;
