import React, { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Navbar({ scrollEffect }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!scrollEffect) return;
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollEffect]);

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
        <div className="text-2xl font-bold text-purple-900 tracking-tight">
          AutoConnect
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-10 text-gray-700 font-medium">
          <li>
            <a href="/" className="hover:text-purple-900">
              Home
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-purple-900">
              Cars
            </a>
          </li>
          <li>
            <a href="/about" className="hover:text-purple-900">
              About
            </a>
          </li>
          <li>
            <a
              href="/contact-us"
              className="hover:text-purple-900 font-semibold underline underline-offset-4"
            >
              Contact Us
            </a>
          </li>
        </ul>

        {/* Desktop Buttons */}
        <div className="hidden md:flex gap-4">
          <button className="px-5 py-2 rounded-lg border border-purple-900 text-purple-900 font-semibold uppercase hover:bg-purple-50 transition">
            Become a Host
          </button>
            <Link
              to="/login"
              className="px-5 py-2 rounded-lg bg-purple-900 text-white font-semibold uppercase hover:bg-purple-800 transition"
            >
              Login/Sign Up
            </Link>
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
              <a href="#">Home</a>
            </li>
            <li>
              <a href="#">Cars</a>
            </li>
            <li>
              <a href="#">About</a>
            </li>
            <li>
              <a
                href="#"
                className="font-semibold underline underline-offset-4"
              >
                Contact Us
              </a>
            </li>
          </ul>
          <div className="flex flex-col gap-2 mt-4">
            <button className="px-4 py-2 rounded-lg border border-purple-900 text-purple-900 font-semibold uppercase">
              Become a Host
            </button>
            <Link
              to="/login"
              className="px-5 py-2 rounded-lg bg-purple-900 text-white font-semibold uppercase hover:bg-purple-800 transition flex items-center justify-center"
            >
              Login/Sign Up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
