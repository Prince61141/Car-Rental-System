import React, { useState } from "react";

function Sidebar({ active = "Dashboard", open, setOpen }) {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 z-40 h-screen bg-black text-white flex flex-col justify-between py-6 transition-all duration-300
          ${open ? "w-64" : "w-0 overflow-hidden"} md:w-64`}
        style={{ minWidth: open ? "16rem" : "0" }}
      >
        <div>
          <div className="text-2xl font-bold px-6 mb-8">AUTOCONNECT</div>
          <nav className="space-y-2">
            {[
              "Dashboard",
              "Cars",
              "Bookings",
              "Notifications",
              "Settings",
              "Payment Details",
              "Transactions",
              "Car Report",
            ].map((item, index) => (
              <div
                key={index}
                className={`px-6 py-2 cursor-pointer ${
                  item === active ? "bg-blue-600" : "hover:bg-gray-800"
                } rounded`}
              >
                {item}
              </div>
            ))}
          </nav>
        </div>
        <button
          className="bg-gray-800 text-white mx-6 py-2 rounded flex justify-center items-center"
          onClick={handleLogout}
        >
          ⎋ Logout
        </button>
      </aside>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}

export default Sidebar;