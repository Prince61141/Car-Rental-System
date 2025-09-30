import React, { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ scrollEffect }) {
  const API_URL = process.env.REACT_APP_API_URL;
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    role: "",
    photo: "",
  });

  useEffect(() => {
    if (!scrollEffect) return;
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollEffect]);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
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
    };
    fetchProfile();
  }, []);

  const token = localStorage.getItem("token");

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrollEffect
          ? scrolled
            ? "bg-white shadow-md"
            : "bg-transparent"
          : "bg-white shadow-md"
      } p-4`}
    >
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo */}
        <div className="text-2xl font-bold text-[#2f2240] tracking-tight">
          <a href="/">AutoConnect</a>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-10 text-gray-700 font-medium">
          <li>
            <a href="/" className="hover:text-[#2f2240]">
              Home
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-[#2f2240]">
              Cars
            </a>
          </li>
          <li>
            <a href="/about" className="hover:text-[#2f2240]">
              About
            </a>
          </li>
          <li>
            <a
              href="/contact-us"
              className="hover:text-[#2f2240] font-semibold underline underline-offset-4"
            >
              Contact Us
            </a>
          </li>
        </ul>

        {/* Desktop Buttons */}
        <div className="hidden md:flex gap-4">
          {!token ? (
            <>
              <button className="px-5 py-2 rounded-lg border border-[#2f2240] text-[#2f2240] font-semibold uppercase hover:bg-[#f6f4fa] transition">
                Become a Host
              </button>
              <Link
                to="/login"
                className="px-5 py-2 rounded-lg bg-[#2f2240] text-white font-semibold uppercase hover:bg-[#3d3356] transition"
              >
                Login/Sign Up
              </Link>
            </>
          ) : (
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#2f2240] bg-[#3d3356] hover:bg-[#2f2240] transition"
              onClick={() =>
                navigate(
                  profile.role === "admin"
                    ? "/admin/dashboard"
                    : profile.role === "peer-owner"
                    ? "/peer-owner/dashboard"
                    : profile.role === "renter"
                    ? "/renter/dashboard"
                    : "/login"
                )
              }
            >
              <img
                src={
                  profile.photo ||
                  "https://ui-avatars.com/api/?name=" +
                    encodeURIComponent(profile.name || "User")
                }
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="font-semibold text-[#fafafa]">
                {profile.name || "Profile"}
              </span>
            </button>
          )}
        </div>

        {/* Mobile Menu Icon */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 space-y-4 px-4 pb-4 border-t pt-4 bg-white/90 rounded shadow-lg">
          <ul className="flex flex-col gap-4 text-gray-700 font-medium">
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="#">Cars</a>
            </li>
            <li>
              <a href="/about">About</a>
            </li>
            <li>
              <a
                href="/contact-us"
                className="font-semibold underline underline-offset-4"
              >
                Contact Us
              </a>
            </li>
          </ul>
          <div className="flex flex-col gap-2 mt-4">
            {!token ? (
              <>
                <button className="px-4 py-2 rounded-lg border border-[#2f2240] text-[#2f2240] font-semibold uppercase">
                  Become a Host
                </button>
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-lg bg-[#2f2240] text-white font-semibold uppercase hover:bg-[#3d3356] transition flex items-center justify-center"
                >
                  Login/Sign Up
                </Link>
              </>
            ) : (
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2f2240] bg-[#f6f4fa] hover:bg-[#ecebee] transition"
                onClick={() =>
                  navigate(
                    profile.role === "admin"
                      ? "/admin/dashboard"
                      : profile.role === "peer-owner"
                      ? "/peer-owner/dashboard"
                      : profile.role === "renter"
                      ? "/renter/dashboard"
                      : "/login"
                  )
                }
              >
                <img
                  src={profile.photo}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border"
                />
                <span className="font-semibold text-[#2f2240]">
                  {profile.name || "Profile"}
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}