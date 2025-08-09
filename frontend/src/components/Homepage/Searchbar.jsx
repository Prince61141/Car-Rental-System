import React, { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {
  const [pickupCity, setPickupCity] = useState("");
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [showPickupDropdown, setShowPickupDropdown] = useState(false);

  const [dropoffCity, setDropoffCity] = useState("");
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const [showDropoffDropdown, setShowDropoffDropdown] = useState(false);

  const [allCities, setAllCities] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllCities = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/bookings/cities");
        const data = await res.json();
        if (res.ok && data.success) {
          setAllCities(data.cities);
        }
      } catch {
        setAllCities([]);
      }
    };
    fetchAllCities();
  }, []);

  // Pickup handlers
  const handlePickupChange = (e) => {
    const value = e.target.value;
    setPickupCity(value);
    if (value) {
      const filtered = allCities.filter((city) =>
        city.toLowerCase().includes(value.toLowerCase())
      );
      setPickupSuggestions(filtered);
      setShowPickupDropdown(true);
    } else {
      setPickupSuggestions([]);
      setShowPickupDropdown(false);
    }
  };

  const handlePickupFocus = () => {
    setPickupSuggestions(allCities);
    setShowPickupDropdown(true);
  };

  const handlePickupChevronClick = () => {
    if (showPickupDropdown) {
      setShowPickupDropdown(false);
    } else {
      setPickupSuggestions(allCities);
      setShowPickupDropdown(true);
    }
  };

  const handlePickupSelect = (city) => {
    setPickupCity(city);
    setShowPickupDropdown(false);
  };

  // Dropoff handlers
  const handleDropoffChange = (e) => {
    const value = e.target.value;
    setDropoffCity(value);
    if (value) {
      const filtered = allCities.filter((city) =>
        city.toLowerCase().includes(value.toLowerCase())
      );
      setDropoffSuggestions(filtered);
      setShowDropoffDropdown(true);
    } else {
      setDropoffSuggestions([]);
      setShowDropoffDropdown(false);
    }
  };

  const handleDropoffFocus = () => {
    setDropoffSuggestions(allCities);
    setShowDropoffDropdown(true);
  };

  const handleDropoffChevronClick = () => {
    if (showDropoffDropdown) {
      setShowDropoffDropdown(false);
    } else {
      setDropoffSuggestions(allCities);
      setShowDropoffDropdown(true);
    }
  };

  const handleDropoffSelect = (city) => {
    setDropoffCity(city);
    setShowDropoffDropdown(false);
  };

  // Add this function for search
  const handleSearch = (e) => {
    e.preventDefault();
    // Store search in localStorage (optional)
    localStorage.setItem(
      "car_search",
      JSON.stringify({ pickupCity, dropoffCity })
    );
    // Navigate to /cars with query params
    navigate(
      `/cars?pickup=${encodeURIComponent(pickupCity)}&dropoff=${encodeURIComponent(
        dropoffCity
      )}`
    );
  };

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white shadow-xl p-4 sm:p-6 rounded-2xl mx-2 md:mx-10 -mt-16 z-20 relative flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4"
    >
      {/* Pick-Up Section */}
      <div className="flex flex-col gap-1 flex-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-4 h-4 rounded-full border-2 border-[#3d3356] flex items-center justify-center">
              <span className="w-2.5 h-2.5 bg-[#3d3356] rounded-full block" />
            </span>
            <span className="font-semibold text-[#3d3356] text-base">
              Pick - Up
            </span>
          </div>
        </div>
        <div className="flex flex-row justify-between">
          <div className="flex flex-col relative">
            <label className="text-sm font-bold text-[#3d3356] mb-0.5">
              Locations
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Select your city"
                className="md:w-44 pr-6 border-0 bg-transparent text-gray-500 text-sm placeholder-gray-400 focus:ring-0"
                style={{ width: "7.5rem" }}
                value={pickupCity}
                onChange={handlePickupChange}
                onFocus={handlePickupFocus}
                autoComplete="off"
              />
              <FaChevronDown
                className="absolute right-1 top-2 text-gray-400 text-xs cursor-pointer"
                onClick={handlePickupChevronClick}
              />
              {showPickupDropdown && (
                <ul className="absolute z-10 left-0 right-0 bg-white border border-gray-200 rounded shadow mt-1 max-h-40 overflow-y-auto">
                  {pickupSuggestions.length > 0 ? (
                    pickupSuggestions.map((city) => (
                      <li
                        key={city}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handlePickupSelect(city)}
                      >
                        {city}
                      </li>
                    ))
                  ) : (
                    <li className="px-2 py-2 text-gray-400 select-none">
                      Not available
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>
          <div className="hidden xl:block h-10 w-px bg-gray-200 mx-2"></div>
          <div className="flex flex-col">
            <label className="text-sm font-bold text-[#3d3356] mb-0.5">
              Date
            </label>
            <div className="relative">
              <input
                type="date"
                placeholder="Select your date"
                className="w-32 md:w-39 pr-6 border-0 bg-transparent text-gray-500 text-sm focus:ring-0"
              />
              <FaChevronDown className="absolute right-1 top-2 text-gray-400 text-xs pointer-events-none" />
            </div>
          </div>
          <div className="hidden xl:block h-10 w-px bg-gray-200 mx-2"></div>
          <div className="flex flex-col">
            <label className="text-sm font-bold text-[#3d3356] mb-0.5">
              Time
            </label>
            <div className="relative">
              <input
                type="time"
                placeholder="Select your time"
                className="w-24 md:w-32 pr-6 border-0 bg-transparent text-gray-500 text-sm focus:ring-0"
              />
              <FaChevronDown className="absolute right-1 top-2 text-gray-400 text-xs pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
      {/* Divider */}
      <div className="hidden xl:block h-16 w-px bg-gray-200 mx-2"></div>
      {/* Drop-Off Section */}
      <div className="flex flex-col gap-1 flex-1">
        <div className="">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-4 h-4 rounded-full border-2 border-[#3d3356] flex items-center justify-center">
              <span className="w-2.5 h-2.5 bg-[#3d3356] rounded-full block" />
            </span>
            <span className="font-semibold text-[#3d3356] text-base">
              Drop - Off
            </span>
          </div>
        </div>
        <div className="flex flex-row justify-between">
          <div className="flex flex-col relative">
            <label className="text-sm font-bold text-[#3d3356] mb-0.5">
              Locations
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Select your city"
                className="md:w-44 pr-6 border-0 bg-transparent text-gray-500 text-sm placeholder-gray-400 focus:ring-0"
                style={{ width: "7.5rem" }}
                value={dropoffCity}
                onChange={handleDropoffChange}
                onFocus={handleDropoffFocus}
                autoComplete="off"
              />
              <FaChevronDown
                className="absolute right-1 top-2 text-gray-400 text-xs cursor-pointer"
                onClick={handleDropoffChevronClick}
              />
              {showDropoffDropdown && (
                <ul className="absolute z-10 left-0 right-0 bg-white border border-gray-200 rounded shadow mt-1 max-h-40 overflow-y-auto">
                  {dropoffSuggestions.length > 0 ? (
                    dropoffSuggestions.map((city) => (
                      <li
                        key={city}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleDropoffSelect(city)}
                      >
                        {city}
                      </li>
                    ))
                  ) : (
                    <li className="px-2 py-2 text-gray-400 select-none">
                      Not available
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>
          <div className="hidden xl:block h-10 w-px bg-gray-200 mx-2"></div>
          <div className="flex flex-col">
            <label className="text-sm font-bold text-[#3d3356] mb-0.5">
              Date
            </label>
            <div className="relative">
              <input
                type="date"
                placeholder="Select your date"
                className="w-32 pr-6 border-0 bg-transparent text-gray-500 text-sm focus:ring-0"
              />
              <FaChevronDown className="absolute right-1 top-2 text-gray-400 text-xs pointer-events-none" />
            </div>
          </div>
          <div className="hidden xl:block h-10 w-px bg-gray-200 mx-2"></div>
          <div className="flex flex-col">
            <label className="text-sm font-bold text-[#3d3356] mb-0.5">
              Time
            </label>
            <div className="relative">
              <input
                type="time"
                placeholder="Select your time"
                className="w-24 md:w-32 pr-6 border-0 bg-transparent text-gray-500 text-sm focus:ring-0"
              />
              <FaChevronDown className="absolute right-1 top-2 text-gray-400 text-xs pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
      {/* Search Button */}
      <div className="flex items-center mt-4 xl:mt-0">
        <button
          type="submit"
          className="bg-[#3d3356] hover:bg-[#2a223e] transition text-white px-8 py-3 rounded-lg font-semibold shadow-xl text-base xl:text-lg"
        >
          Search
        </button>
      </div>
    </form>
  );
}