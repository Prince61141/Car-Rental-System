import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import OwnerVerification from "./OwnerVerification";
import Overview from "./Overview";
import Cars from "./Cars";
import Settings from "./Settings";
import Booking from "./Booking";
import { fetchOwner } from "../../services/owner";

function Dashboard() {
  const [verified, setVerified] = useState(false);
  const [aadhar, setAadhar] = useState("");
  const [pan, setPan] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [ownerName, setOwnerName] = useState("");

  useEffect(() => {
    fetchOwner().then((ownerName) => {
      if (ownerName) setOwnerName(ownerName);
    });
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen w-full font-sans bg-gray-100">
      <Sidebar
        active={activeSection}
        setActive={setActiveSection}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />
      <main className="flex-1 overflow-auto">
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
                <span className="text-xl font-bold">Welcome, {ownerName}!</span>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                <input
                  type="text"
                  placeholder="Search here"
                  className="border px-4 py-2 rounded-md w-full md:w-64"
                />
                <span className="text-xl">🔔</span>
                <div className="w-10 h-10 bg-gray-300 rounded-full" />
              </div>
            </div>
            {/* Section Content */}
            {activeSection === "Dashboard" && <Overview />}
            {activeSection === "Cars" && <Cars />}
            {activeSection === "Bookings" && <Booking />}
            {activeSection === "Settings" && <Settings />}
            {/* Add more sections as needed */}
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;