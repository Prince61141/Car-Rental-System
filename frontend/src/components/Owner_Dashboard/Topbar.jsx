import React, { useEffect, useState } from "react";
import { FiSearch, FiMenu, FiBell, FiPlus } from "react-icons/fi";

export default function Topbar({ onMenuClick, name = "Owner", photo = "" }) {
  const [q, setQ] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  
  return (
    <>
      <header className="sticky top-0 z-40 bg-[#f3f4f6] bg-opacity-[0.04] backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b">
        <div className="px-4 md:px-6 py-2">
          <div className="h-16 flex items-center justify-between gap-3">
            {/* Left: menu + title */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                aria-label="Open sidebar"
                onClick={onMenuClick}
                className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border bg-[#2f2240] hover:bg-[#3d3356] text-white"
              >
                <FiMenu size={20} />
              </button>
              <div className="min-w-0">
                <div className="text-base md:text-lg font-bold truncate">
                  Welcome, {name || "Owner"}!
                </div>
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2">
              <div className="hidden md:flex flex-1 max-w-xl">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search here"
                  className="w-full border px-4 py-2 rounded-md"
                />
              </div>
              <button
                type="button"
                aria-label="Search"
                className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border bg-white hover:bg-gray-50 "
                onClick={() => setShowMobileSearch((s) => !s)}
              >
                <FiSearch className="h-5 w-5 text-gray-500" />
              </button>
              <FiBell className="sm:inline text-gray-700 cursor-pointer" size={20} />
              <img
                src={
                  photo
                    ? photo
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        name || "Owner"
                      )}`
                }
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border border-gray-300 cursor-pointer"
              />
            </div>
          </div>

          {/* Mobile search input */}
          {showMobileSearch && (
            <div className="pb-3 md:hidden">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search here"
                className="w-full border px-4 py-2 rounded-md"
              />
            </div>
          )}
        </div>
      </header>
    </>
  );
}
