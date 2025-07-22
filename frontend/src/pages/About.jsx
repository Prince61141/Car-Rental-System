import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function About() {
  return (
    <div>
      <Header />
      <section className="mt-20 py-16 bg-white min-h-[60vh]">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#3d3356] mb-6 text-center">
            About AutoConnect
          </h2>
          <p className="text-gray-700 text-lg mb-8 text-center">
            AutoConnect is a modern car rental platform designed to make renting and sharing vehicles easy, secure, and accessible for everyone. Whether you’re looking for a car for a day, a week, or want to earn by listing your own vehicle, AutoConnect connects car owners and renters with a seamless experience.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-[#3d3356] mb-2 text-xl">Our Mission</h3>
              <p className="text-gray-600">
                To empower individuals and businesses by providing a reliable, transparent, and user-friendly car rental solution. We aim to simplify mobility and help car owners maximize the value of their vehicles.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#3d3356] mb-2 text-xl">Why Choose Us?</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Wide selection of cars for every need and budget</li>
                <li>Easy online booking and instant confirmation</li>
                <li>Secure payments and verified users</li>
                <li>24/7 customer support</li>
                <li>Earn extra income by listing your car</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 text-center">
            <h3 className="font-semibold text-[#3d3356] mb-2 text-xl">Join Our Community</h3>
            <p className="text-gray-600 mb-4">
              Become a part of AutoConnect and experience hassle-free car rentals or start earning by sharing your vehicle. We’re committed to building trust and delivering value for every user.
            </p>
            <a
              href="/contact-us"
              className="inline-block bg-[#3d3356] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2a223e] transition"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}