import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div>
      <Header />
      <section className="mt-20 py-16 bg-white min-h-[60vh]">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#3d3356] mb-6 text-center">
            Contact Us
          </h2>
          <p className="text-gray-600 mb-10 text-center">
            Have a question or need help? Fill out the form and our team will
            get back to you soon.
          </p>
          {submitted ? (
            <div className="bg-green-100 text-green-800 px-6 py-4 rounded-lg text-center font-semibold animate-fade-in">
              Thank you for contacting us! We will respond as soon as possible.
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-gray-50 p-8 rounded-xl shadow-md space-y-6 animate-fade-in"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3d3356] outline-none"
                  placeholder="Your Name"
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3d3356] outline-none"
                  placeholder="you@email.com"
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3d3356] outline-none resize-none"
                  placeholder="Type your message here..."
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-[#3d3356] text-white py-3 rounded-lg font-semibold hover:bg-[#2a223e] transition flex items-center justify-center ${
                  loading ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                ) : null}
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
          <div className="mt-12 text-center text-gray-500 text-sm">
            Or email us directly at{" "}
            <a
              href="mailto:carrentalsgp@gmail.com"
              className="text-[#3d3356] underline hover:text-[#2a223e] transition"
            >
              carrentalsgp@gmail.com
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
