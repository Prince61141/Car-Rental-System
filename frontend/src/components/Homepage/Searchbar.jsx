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

  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [dropoffDate, setDropoffDate] = useState("");
  const [dropoffTime, setDropoffTime] = useState("");

  const [allCities, setAllCities] = useState([]);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  const pad = (n) => n.toString().padStart(2, "0");

  let minPickupTime = "00:00";
  if (pickupDate === today) {
    const now = new Date();
    now.setHours(now.getHours() + 3);
    minPickupTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }

  let minDropoffTime = "00:00";
  if (dropoffDate === today) {
    if (pickupDate === today && pickupTime) {
      const [h, m] = pickupTime.split(":").map(Number);
      const dropMin = new Date();
      dropMin.setHours(h + 3, m, 0, 0);
      minDropoffTime = `${pad(dropMin.getHours())}:${pad(
        dropMin.getMinutes()
      )}`;
    } else {
      const now = new Date();
      now.setHours(now.getHours() + 3);
      minDropoffTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    }
  } else if (dropoffDate === pickupDate && pickupTime) {
    const [h, m] = pickupTime.split(":").map(Number);
    const dropMin = new Date();
    dropMin.setHours(h + 3, m, 0, 0);
    minDropoffTime = `${pad(dropMin.getHours())}:${pad(dropMin.getMinutes())}`;
  }

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

  const handleSearch = (e) => {
    e.preventDefault();
    setError("");
    if (
      !pickupCity ||
      !dropoffCity ||
      !pickupDate ||
      !pickupTime ||
      !dropoffDate ||
      !dropoffTime
    ) {
      setError("Please fill all fields before searching.");
      return;
    }

    const pickupDT = new Date(`${pickupDate}T${pickupTime}`);
    const dropoffDT = new Date(`${dropoffDate}T${dropoffTime}`);
    if (dropoffDT <= pickupDT) {
      setError("Drop-off date and time must be after pick-up.");
      return;
    }

    localStorage.setItem(
      "car_search",
      JSON.stringify({
        pickupCity,
        dropoffCity,
        pickupDate,
        pickupTime,
        dropoffDate,
        dropoffTime,
      })
    );
    navigate(
      `/cars?pickup=${encodeURIComponent(
        pickupCity
      )}&dropoff=${encodeURIComponent(
        dropoffCity
      )}&pickupDate=${pickupDate}&pickupTime=${pickupTime}&dropoffDate=${dropoffDate}&dropoffTime=${dropoffTime}`
    );
  };

  return (
    <form onSubmit={handleSearch}>
      <div className="bg-white shadow-xl p-4 sm:p-6 rounded-2xl mx-2 md:mx-10 -mt-16 z-20 relative flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
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
                  min={today}
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
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
                  min={pickupDate === today ? minPickupTime : undefined}
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
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
                  min={pickupDate || today}
                  value={dropoffDate}
                  onChange={(e) => setDropoffDate(e.target.value)}
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
                  min={minDropoffTime}
                  value={dropoffTime}
                  onChange={(e) => setDropoffTime(e.target.value)}
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
      </div>
      <div>
        {/* Error Message */}
        {error && (
          <div className="w-full flex justify-center mt-1">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-center font-semibold shadow">
              {error}
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
