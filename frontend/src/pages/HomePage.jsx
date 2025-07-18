import React, { useState } from 'react';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Hero from '../components/Hero';
import SearchBar from '../components/Searchbar';
import Features from '../components/Feature';
import Chatbot from '../components/Chatbot';
import Testimonial from '../components/Testimonal';

export default function CarRentalWebsite() {
  const [selectedTab, setSelectedTab] = useState('Popular');

  const carCategories = ['Popular', 'Large Car', 'Small Car', 'Executive Car'];
  
  const cars = [
    { id: 1, name: 'Toyota Rush', price: 72, image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' },
    { id: 2, name: 'Honda CR-V', price: 80, image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' },
    { id: 3, name: 'BMW X5', price: 100, image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' },
    { id: 4, name: 'Mercedes GLE', price: 120, image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' },
    { id: 5, name: 'Audi Q7', price: 85, image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' },
    { id: 6, name: 'Range Rover', price: 95, image: 'https://images.unsplash.com/photo-1494905998402-395d579af36f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' },
    { id: 7, name: 'Porsche Cayenne', price: 110, image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' },
    { id: 8, name: 'Tesla Model Y', price: 90, image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' },
  ];

  return (
    <div>
      <Header />

      <Hero />

      <SearchBar />

      <Features />

      {/* Car Rental Deals */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Most popular car rental deals</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A high-performing web-based car rental system for any type of car rental company and business
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
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cars.map((car) => (
              <div key={car.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-full h-48 bg-gray-100 rounded-xl mb-4 overflow-hidden">
                  <img 
                    src={car.image} 
                    alt={car.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-900">{car.name}</h3>
                  <button className="text-gray-400 hover:text-red-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-gray-900">₹{car.price}.00</span>
                    <span className="text-gray-500 ml-1">/day</span>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Rent Now
                  </button>
                </div>
              </div>
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
          Want to earn? List your car on <span className="text-purple-900">Auto Connect</span> today!
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