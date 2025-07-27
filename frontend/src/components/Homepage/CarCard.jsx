import React, { useState, useEffect } from "react";

function CarCard({ car, onRent }) {
  const [liked, setLiked] = useState(false);
  
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm hover:shadow-xl transition-shadow duration-300 group relative">
      {/* Favorite Heart */}
      <button
        className="absolute top-4 right-4 z-10 text-gray-400 hover:text-purple-700 transition-colors"
        onClick={() => setLiked((prev) => !prev)}
        aria-label="Add to favorites"
      >
        {liked ? (
          <svg className="w-6 h-6 fill-purple-700" viewBox="0 0 20 20">
            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
            />
          </svg>
        )}
      </button>
      {/* Car Image */}
      <div className="w-full h-36 bg-gray-100 rounded-xl mb-3 overflow-hidden flex items-center justify-center">
        <img
          src={car.image}
          alt={car.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      {/* Car Info */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-gray-900 truncate">{car.name}</h3>
        <div className="flex items-center gap-1">
          <span className="text-yellow-500 text-lg">★</span>
          <span className="text-sm font-medium text-gray-700">{car.rating || "4.7"}</span>
        </div>
      </div>
      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {car.tags?.map((tag, i) => (
          <span
            key={i}
            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium"
          >
            {tag}
          </span>
        ))}
        {/* Example fallback tags */}
        {!car.tags && (
          <>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">Manual</span>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">Diesel</span>
          </>
        )}
      </div>
      {/* Price and Rent Button */}
      <div className="flex items-end justify-between mt-2">
        <div>
          <span className="text-xl font-bold text-gray-900">
            ₹{car.price || 12}
          </span>
          <span className="text-gray-500 ml-1 text-xs">/Day</span>
        </div>
        <button
          className="bg-[#2A1A3B] hover:bg-[#1c1128] text-white px-5 py-2 rounded-lg shadow transition-all duration-200 text-sm font-semibold"
          onClick={onRent}
        >
          Rent Now
        </button>
      </div>
    </div>
  );
}

export default CarCard;