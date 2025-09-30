import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Chatbot from "../components/Chatbot";

const NotFound = () => {
  const [rotate, setRotate] = useState(0);

  const handleHover = () =>
    setInterval(() => {
      setRotate((prev) => (prev + 10) % 360);
    }, 100);

  return (
    <div>
      <Header scrollEffect={false} />

      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div
          className="bg-white p-10 rounded-2xl shadow-2xl text-center max-w-md w-full"
          onMouseEnter={handleHover}
        >
          <div
            className="text-6xl mb-4 inline-block transition-transform duration-300"
            style={{ transform: `rotate(${rotate}deg)` }}
          >
            🚗
          </div>
          <h1 className="text-6xl font-bold text-gray-800">404</h1>
          <p className="text-gray-500 text-lg mt-2">Oops! Page not found.</p>
          <Link
            to="/"
            className="no-underline inline-block mt-6 px-6 py-2 bg-[#2f2240] text-white rounded-lg hover:bg-[#3d3356] transition"
          >
            🏠 Go to Home
          </Link>
        </div>
      </div>

      <Chatbot />
      <Footer />
    </div>
  );
};

export default NotFound;