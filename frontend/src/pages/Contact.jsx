
import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Contact() {
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    phone: "",
    subject: "",
    message: "" 
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

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

  const contactMethods = [
    {
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
        </svg>
      ),
      title: "Email Support",
      description: "Get quick responses to your queries",
      contact: "support@autoconnect.com",
      action: "Send Email",
      link: "mailto:support@autoconnect.com"
    },
    {
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
        </svg>
      ),
      title: "Phone Support",
      description: "Speak directly with our team",
      contact: "+91 98765 43210",
      action: "Call Now",
      link: "tel:+919876543210"
    },
    {
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.552l1.562-1.562a4.006 4.006 0 001.788.027zm-4.677-2.796a4.002 4.002 0 01-.041-2.08l-.08.08-1.53-1.533A5.98 5.98 0 004 10c0 .954.223 1.856.619 2.657l1.54-1.54z" clipRule="evenodd" />
        </svg>
      ),
      title: "Live Chat",
      description: "Real-time assistance available",
      contact: "Available 24/7",
      action: "Start Chat",
      link: "#"
    }
  ];

  const officeLocations = [
    {
      city: "Mumbai",
      address: "Bandra Kurla Complex, Mumbai, Maharashtra 400051",
      phone: "+91 22 1234 5678",
      email: "mumbai@autoconnect.com"
    },
    {
      city: "Delhi",
      address: "Connaught Place, New Delhi, Delhi 110001",
      phone: "+91 11 1234 5678",
      email: "delhi@autoconnect.com"
    },
    {
      city: "Bangalore",
      address: "Koramangala, Bangalore, Karnataka 560034",
      phone: "+91 80 1234 5678",
      email: "bangalore@autoconnect.com"
    }
  ];

  const faqData = {
    general: [
      {
        question: "How does AutoConnect work?",
        answer: "AutoConnect is a peer-to-peer car rental platform where car owners can list their vehicles for rent and renters can book them. We handle verification, payments, and insurance to ensure a safe and smooth experience."
      },
      {
        question: "Is it safe to rent cars from strangers?",
        answer: "Yes, we have strict verification processes for both owners and renters. All users are identity-verified, and we provide comprehensive insurance coverage for added security."
      },
      {
        question: "What happens if there's an accident?",
        answer: "We provide comprehensive insurance coverage for all rentals. In case of an accident, our support team will guide you through the claims process and ensure you're protected."
      }
    ],
    owners: [
      {
        question: "How much can I earn by listing my car?",
        answer: "Earnings depend on your car type, location, and availability. On average, car owners earn 15-25% of their car's value annually through our platform."
      },
      {
        question: "What if my car gets damaged?",
        answer: "All rentals include comprehensive insurance coverage. Any damage to your car during a rental period is covered, and you'll receive compensation for repairs."
      },
      {
        question: "Can I set my own rental rates?",
        answer: "Yes, you have full control over your pricing. We provide market rate suggestions, but you can set rates that work for you and your vehicle."
      }
    ],
    renters: [
      {
        question: "What documents do I need to rent a car?",
        answer: "You'll need a valid driving license, government-issued ID, and proof of address. International renters may need additional documentation."
      },
      {
        question: "Can I cancel my booking?",
        answer: "Yes, you can cancel bookings according to our cancellation policy. Most cancellations made 24 hours before the rental start time are free of charge."
      },
      {
        question: "What if the car breaks down?",
        answer: "We provide 24/7 roadside assistance. If your rental car breaks down, contact our support team immediately, and we'll arrange alternative transportation or repairs."
      }
    ]
  };

  return (
    <div>
      <Header />
      
      {/* Hero Section */}
      <section className="mt-20 py-16 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#3d3356] mb-6">
            Get in Touch
          </h1>
          <p className="text-gray-700 text-lg max-w-3xl mx-auto">
            Have questions about AutoConnect? Need help with your account? Want to partner with us? 
            We're here to help you every step of the way. Reach out to our dedicated support team.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#3d3356] mb-12 text-center">
            Multiple Ways to Reach Us
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl text-center hover:shadow-lg transition duration-300">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {method.icon}
                </div>
                <h3 className="text-xl font-semibold text-[#3d3356] mb-2">{method.title}</h3>
                <p className="text-gray-600 mb-4">{method.description}</p>
                <p className="text-[#3d3356] font-semibold mb-4">{method.contact}</p>
                <a
                  href={method.link}
                  className="inline-block bg-[#3d3356] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#2a223e] transition duration-300"
                >
                  {method.action}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#3d3356] mb-12 text-center">
            Our Office Locations
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {officeLocations.map((office, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition duration-300">
                <h3 className="text-xl font-semibold text-[#3d3356] mb-4">{office.city}</h3>
                <div className="space-y-3 text-gray-600">
                  <p className="flex items-start">
                    <svg className="w-5 h-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {office.address}
                  </p>
                  <p className="flex items-center">
                    <svg className="w-5 h-5 text-purple-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    {office.phone}
                  </p>
                  <p className="flex items-center">
                    <svg className="w-5 h-5 text-purple-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    {office.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#3d3356] mb-8 text-center">
            Send Us a Message
          </h2>
          {submitted ? (
            <div className="bg-green-100 text-green-800 px-8 py-6 rounded-xl text-center font-semibold">
              <svg className="w-16 h-16 text-green-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <h3 className="text-xl mb-2">Thank you for contacting us!</h3>
              <p>We've received your message and will respond within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-gray-50 p-8 rounded-xl shadow-md space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3d3356] focus:border-transparent outline-none transition duration-300"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3d3356] focus:border-transparent outline-none transition duration-300"
                    placeholder="you@email.com"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3d3356] focus:border-transparent outline-none transition duration-300"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3d3356] focus:border-transparent outline-none transition duration-300"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing & Payments</option>
                    <option value="partnership">Partnership</option>
                    <option value="feedback">Feedback & Suggestions</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3d3356] focus:border-transparent outline-none resize-none transition duration-300"
                  placeholder="Tell us how we can help you..."
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-[#3d3356] text-white py-4 rounded-lg font-semibold hover:bg-[#2a223e] transition duration-300 flex items-center justify-center text-lg ${
                  loading ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <svg className="animate-spin h-6 w-6 mr-3 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                ) : null}
                {loading ? "Sending Message..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#3d3356] mb-12 text-center">
            Frequently Asked Questions
          </h2>
          
          {/* FAQ Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setActiveTab("general")}
                className={`px-6 py-3 rounded-md font-semibold transition duration-300 ${
                  activeTab === "general"
                    ? "bg-[#3d3356] text-white"
                    : "text-gray-600 hover:text-[#3d3356]"
                }`}
              >
                General
              </button>
              <button
                onClick={() => setActiveTab("owners")}
                className={`px-6 py-3 rounded-md font-semibold transition duration-300 ${
                  activeTab === "owners"
                    ? "bg-[#3d3356] text-white"
                    : "text-gray-600 hover:text-[#3d3356]"
                }`}
              >
                Car Owners
              </button>
              <button
                onClick={() => setActiveTab("renters")}
                className={`px-6 py-3 rounded-md font-semibold transition duration-300 ${
                  activeTab === "renters"
                    ? "bg-[#3d3356] text-white"
                    : "text-gray-600 hover:text-[#3d3356]"
                }`}
              >
                Renters
              </button>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {faqData[activeTab].map((faq, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-[#3d3356] mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Support Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#3d3356] mb-12 text-center">
            What Can We Help You With?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Account Issues", icon: "👤", description: "Login, registration, and profile problems" },
              { title: "Booking Help", icon: "🚗", description: "Reservations, cancellations, and modifications" },
              { title: "Payment Support", icon: "💳", description: "Billing, refunds, and payment methods" },
              { title: "Safety & Insurance", icon: "🛡️", description: "Security, verification, and coverage" },
              { title: "Technical Problems", icon: "🔧", description: "App issues, website problems, and bugs" },
              { title: "Partnership", icon: "🤝", description: "Business opportunities and collaborations" },
              { title: "Feedback", icon: "💬", description: "Suggestions, complaints, and reviews" },
              { title: "Emergency", icon: "🚨", description: "Urgent issues requiring immediate attention" }
            ].map((category, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg text-center hover:shadow-md transition duration-300">
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="text-lg font-semibold text-[#3d3356] mb-2">{category.title}</h3>
                <p className="text-gray-600 text-sm">{category.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Response Time Info */}
      <section className="py-16 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-[#3d3356] mb-8">
            Our Response Times
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-purple-600 mb-2">24h</div>
              <p className="text-gray-600">General Inquiries</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-purple-600 mb-2">4h</div>
              <p className="text-gray-600">Technical Support</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-purple-600 mb-2">1h</div>
              <p className="text-gray-600">Emergency Issues</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}