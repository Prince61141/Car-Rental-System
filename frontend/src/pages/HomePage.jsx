import React, { useState, useEffect } from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import Hero from "../components/Homepage/Hero";
import SearchBar from "../components/Homepage/Searchbar";
import CarCard from "../components/Homepage/CarCard";
import Features from "../components/Homepage/Feature";
import Chatbot from "../components/Chatbot";
import Testimonial from "../components/Homepage/Testimonal";

function HomePage() {
  const [selectedTab, setSelectedTab] = useState("Popular");
  const [cars, setCars] = useState([]);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/cars/allcars");
        const data = await res.json();
        if (res.ok && data.success) {
          setCars(data.cars);
        }
      } catch (err) {
        console.error("Failed to fetch cars:", err);
      }
    };
    fetchCars();
  }, []);

  const carCategories = ["Popular", "Large Car", "Small Car", "Executive Car"];

  return (
    <div style={{ webkitscrollbar: "none" }}>
      <Header scrollEffect={true} />

      <Hero />

      <SearchBar />

      <Features />

      {/* Car Rental Deals */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Most popular car rental deals
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A high-performing web-based car rental system for any type of car
              rental company and business
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {carCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedTab(category)}
                  className={`px-6 py-3 rounded-md font-medium transition-colors ${
                    selectedTab === category
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cars.map((car) => (
        <CarCard
          key={car._id}
          car={{
            image: car.image?.[0] || "https://via.placeholder.com/300x150?text=No+Image",
            name: car.title || car.model,
            rating: car.rating || 4.7,
            price: car.pricePerDay,
            tags: [car.category, car.transmission, car.fuelType].filter(Boolean),
          }}
          onRent={() => alert(`Renting ${car.title || car.model}`)}
        />
      ))}
          </div>

          <div className="text-center mt-12">
            <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors">
              Show more car
            </button>
          </div>
        </div>
      </section>

      <Testimonial />

      <div className="flex flex-col md:flex-row items-center justify-between px-6 md:px-20 py-20 bg-gradient-to-r from-white to-gray-100 rounded-lg shadow-md">
        <div className="text-center md:text-left max-w-xl">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Want to earn? List your car on{" "}
            <span className="text-purple-900">Auto Connect</span> today!
          </h2>
          <p className="text-gray-600">
            Join our community of car owners and start earning from your vehicle
          </p>
        </div>

        <div className="mt-6 md:mt-0">
          <button className="bg-[#2A1A3B] hover:bg-[#1c1128] text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-300">
            Become a Host
          </button>
        </div>
      </div>

      <Chatbot />
      <Footer />
    </div>
  );
}

export default HomePage;