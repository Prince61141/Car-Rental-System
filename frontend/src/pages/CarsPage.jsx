import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CarCard from "../components/Homepage/CarCard";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function CarsPage() {
  const API_URL = process.env.REACT_APP_API_URL;
  const query = useQuery();
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [carType, setCarType] = useState("");
  const [transmission, setTransmission] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [sortBy, setSortBy] = useState("");

  // Dropdown UI states
  const transmissionDropdownRef = useRef(null);
  const fuelDropdownRef = useRef(null);
  const carTypeDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);

  const [showTransmissionDropdown, setShowTransmissionDropdown] =
    useState(false);
  const [showFuelDropdown, setShowFuelDropdown] = useState(false);
  const [showCarTypeDropdown, setShowCarTypeDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Search params
  const pickupCity = query.get("pickup");
  const dropoffCity = query.get("dropoff");
  const pickupDate = query.get("pickupDate");
  const pickupTime = query.get("pickupTime");
  const dropoffDate = query.get("dropoffDate");
  const dropoffTime = query.get("dropoffTime");

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        transmissionDropdownRef.current &&
        !transmissionDropdownRef.current.contains(event.target)
      )
        setShowTransmissionDropdown(false);
      if (
        fuelDropdownRef.current &&
        !fuelDropdownRef.current.contains(event.target)
      )
        setShowFuelDropdown(false);
      if (
        carTypeDropdownRef.current &&
        !carTypeDropdownRef.current.contains(event.target)
      )
        setShowCarTypeDropdown(false);
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target)
      )
        setShowSortDropdown(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizeCar = (c) => {
    const rawImages = []
      .concat(Array.isArray(c.images) ? c.images : [])
      .concat(Array.isArray(c.image) ? c.image : [])
      .concat(Array.isArray(c.photos) ? c.photos : [])
      .concat(Array.isArray(c.gallery) ? c.gallery : [])
      .concat(Array.isArray(c.media) ? c.media : [])
      .concat(typeof c.image === "string" ? [c.image] : [])
      .concat(typeof c.imageUrl === "string" ? [c.imageUrl] : [])
      .concat(typeof c.img === "string" ? [c.img] : []);
    const toUrl = (x) =>
      typeof x === "string"
        ? x
        : x && typeof x === "object"
        ? x.url || x.secure_url || x.path || x.src || ""
        : "";
    const images = rawImages.map(toUrl).filter(Boolean);
    const first = images[0] || "";

    const brand = c.brand || "";
    const model = c.model || "";

    const fuelTypeVal =
      c.fueltype ||
      "";
    const transmissionVal =
      c.transmission ||
      "";

    const cap = (s) =>
      s ? String(s).charAt(0).toUpperCase() + String(s).slice(1) : "";

    return {
      ...c,
      images,
      image: images,
      img: first,
      imageUrl: first,

      // Identity
      name: c.name || c.title || [brand, model].filter(Boolean).join(" "),
      title: c.title || c.name || [brand, model].filter(Boolean).join(" "),
      brand,
      model,
      carnumber: c.carnumber || c.carNumber || c.registration || "",

      // Specs
      fuelType: fuelTypeVal,
      transmission: transmissionVal,
      seats:
        c.seats ??
        c.capacity ??
        c.seating ??
        c.seaters ??
        c.seat ??
        "",

      pricePerDay: c.pricePerDay ?? c.price ?? 0,
      price: c.price ?? c.pricePerDay ?? 0,

      tags:
        Array.isArray(c.tags) && c.tags.length
          ? c.tags
          : [cap(transmissionVal), cap(fuelTypeVal)].filter(Boolean),

      location: c.location || {},
      availability: c.availability !== false,
    };
  };

  useEffect(() => {
    if (
      !pickupCity ||
      !dropoffCity ||
      !pickupDate ||
      !pickupTime ||
      !dropoffDate ||
      !dropoffTime
    ) {
      setCars([]);
      setLoading(false);
      return;
    }
    const fetchCars = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/api/cars/search?pickup=${encodeURIComponent(
            pickupCity
          )}&dropoff=${encodeURIComponent(
            dropoffCity
          )}&pickupDate=${pickupDate}&pickupTime=${pickupTime}&dropoffDate=${dropoffDate}&dropoffTime=${dropoffTime}`
        );
        const data = await res.json();
        if (res.ok && data.success) {
          setCars((Array.isArray(data.cars) ? data.cars : []).map(normalizeCar));
        } else {
          setCars([]);
        }
      } catch {
        setCars([]);
      }
      setLoading(false);
    };
    fetchCars();
  }, [
    pickupCity,
    dropoffCity,
    pickupDate,
    pickupTime,
    dropoffDate,
    dropoffTime,
  ]);

  const norm = (v) => String(v || "").trim().toLowerCase();
  const filteredCars = cars
    .filter((car) => {
      if (car.availability === false) return false; // hide unavailable
      const price = Number(car.pricePerDay) || 0;
      if (price < priceRange[0] || price > priceRange[1]) return false;

      if (carType && norm(car.type) !== norm(carType)) return false;

      if (transmission) {
        const c = norm(car.transmission);
        const w = norm(transmission);
        const ok =
          (w === "automatic" && (c === "automatic" || c === "auto")) ||
          (w === "manual" && (c === "manual" || c === "mt")) ||
          c === w;
        if (!ok) return false;
      }

      if (fuelType) {
        const c = norm(car.fuelType);
        const w = norm(fuelType);
        const ok =
          (w === "diesel" && c.includes("diesel")) ||
          (w === "petrol" && (c.includes("petrol") || c.includes("gasoline"))) ||
          (w === "electric" && (c.includes("electric") || c.includes("ev"))) ||
          (w === "cng" && c.includes("cng")) ||
          (w === "hybrid" && c.includes("hybrid")) ||
          c === w;
        if (!ok) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "low-high") return (a.pricePerDay || 0) - (b.pricePerDay || 0);
      if (sortBy === "high-low") return (b.pricePerDay || 0) - (a.pricePerDay || 0);
      return 0;
    });

  // Options
  const carTypeOptions = ["SUV", "Sedan", "Hatchback", "Luxury"];
  const transmissionOptions = ["Automatic", "Manual"];
  const fuelOptions = ["Petrol", "Diesel", "Electric"];
  const sortOptions = [
    { value: "", label: "Default" },
    { value: "low-high", label: "Price: Low to High" },
    { value: "high-low", label: "Price: High to Low" },
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <button
        className="mb-4 text-[#2A1A3B] hover:underline"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <h2 className="text-3xl font-bold mb-6 text-[#3d3356]">Available Cars</h2>
      <p className="text-gray-700 mb-6">
        <span className="font-semibold">Pickup:</span> {pickupCity} {pickupDate}{" "}
        {pickupTime} <br />
        <span className="font-semibold">Dropoff:</span> {dropoffCity}{" "}
        {dropoffDate} {dropoffTime}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="md:col-span-1 bg-white rounded-lg shadow-lg p-4 sticky top-4 h-fit">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>

          {/* Price */}
          <div className="mb-6">
            <label className="text-sm font-medium">Price Range</label>
            <input
              type="range"
              min="0"
              max="10000"
              step="500"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
              className="w-full accent-[#2F2240]"
              style={{
                accentColor: "#2F2240",
              }}
            />
            <p className="text-xs text-gray-500">Up to ₹{priceRange[1]}</p>
          </div>

          {/* Car Type Dropdown */}
          <div className="mb-4 relative" ref={carTypeDropdownRef}>
            <label className="text-sm font-medium mb-2">Car Type</label>
            <div
              className={`w-full border px-4 py-2 rounded-lg bg-[#f7f6fa] cursor-pointer transition font-medium ${
                showCarTypeDropdown ? "ring-2 ring-[#2F2240]" : ""
              }`}
              onClick={() => setShowCarTypeDropdown((v) => !v)}
              tabIndex={0}
            >
              {carType || "All"}
            </div>
            {showCarTypeDropdown && (
              <div className="absolute z-20 w-full bg-white border rounded-lg shadow-lg mt-1">
                <ul className="max-h-48 overflow-y-auto">
                  <li
                    className="px-4 py-2 cursor-pointer hover:bg-[#eceaf6] font-medium"
                    onClick={() => {
                      setCarType("");
                      setShowCarTypeDropdown(false);
                    }}
                  >
                    All
                  </li>
                  {carTypeOptions.map((type) => (
                    <li
                      key={type}
                      className="px-4 py-2 cursor-pointer hover:bg-[#eceaf6] font-medium"
                      onClick={() => {
                        setCarType(type);
                        setShowCarTypeDropdown(false);
                      }}
                    >
                      {type}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Transmission Dropdown */}
          <div className="mb-4 relative" ref={transmissionDropdownRef}>
            <label className="text-sm font-medium">Transmission</label>
            <div
              className={`w-full border px-4 py-2 rounded-lg bg-[#f7f6fa] cursor-pointer transition font-medium ${
                showTransmissionDropdown ? "ring-2 ring-[#2F2240]" : ""
              }`}
              onClick={() => setShowTransmissionDropdown((v) => !v)}
              tabIndex={0}
            >
              {transmission || "All"}
            </div>
            {showTransmissionDropdown && (
              <div className="absolute z-20 w-full bg-white border rounded-lg shadow-lg mt-1">
                <ul className="max-h-48 overflow-y-auto">
                  <li
                    className="px-4 py-2 cursor-pointer hover:bg-[#eceaf6] font-medium"
                    onClick={() => {
                      setTransmission("");
                      setShowTransmissionDropdown(false);
                    }}
                  >
                    All
                  </li>
                  {transmissionOptions.map((option) => (
                    <li
                      key={option}
                      className="px-4 py-2 cursor-pointer hover:bg-[#eceaf6] font-medium"
                      onClick={() => {
                        setTransmission(option);
                        setShowTransmissionDropdown(false);
                      }}
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Fuel Type Dropdown */}
          <div className="mb-4 relative" ref={fuelDropdownRef}>
            <label className="text-sm font-medium">Fuel Type</label>
            <div
              className={`w-full border px-4 py-2 rounded-lg bg-[#f7f6fa] cursor-pointer transition font-medium ${
                showFuelDropdown ? "ring-2 ring-[#2F2240]" : ""
              }`}
              onClick={() => setShowFuelDropdown((v) => !v)}
              tabIndex={0}
            >
              {fuelType || "All"}
            </div>
            {showFuelDropdown && (
              <div className="absolute z-20 w-full bg-white border rounded-lg shadow-lg mt-1">
                <ul className="max-h-48 overflow-y-auto">
                  <li
                    className="px-4 py-2 cursor-pointer hover:bg-[#eceaf6] font-medium"
                    onClick={() => {
                      setFuelType("");
                      setShowFuelDropdown(false);
                    }}
                  >
                    All
                  </li>
                  {fuelOptions.map((option) => (
                    <li
                      key={option}
                      className="px-4 py-2 cursor-pointer hover:bg-[#eceaf6] font-medium"
                      onClick={() => {
                        setFuelType(option);
                        setShowFuelDropdown(false);
                      }}
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="mb-2 relative" ref={sortDropdownRef}>
            <label className="text-sm font-medium">Sort By</label>
            <div
              className={`w-full border px-4 py-2 rounded-lg bg-[#f7f6fa] cursor-pointer transition font-medium ${
                showSortDropdown ? "ring-2 ring-[#2F2240]" : ""
              }`}
              onClick={() => setShowSortDropdown((v) => !v)}
              tabIndex={0}
            >
              {sortOptions.find((o) => o.value === sortBy)?.label || "Default"}
            </div>
            {showSortDropdown && (
              <div className="absolute z-20 w-full bg-white border rounded-lg shadow-lg mt-1">
                <ul className="max-h-48 overflow-y-auto">
                  {sortOptions.map((option) => (
                    <li
                      key={option.value}
                      className="px-4 py-2 cursor-pointer hover:bg-[#eceaf6] font-medium"
                      onClick={() => {
                        setSortBy(option.value);
                        setShowSortDropdown(false);
                      }}
                    >
                      {option.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Cars Grid */}
        <div className="md:col-span-3">
          {loading ? (
            <div className="text-gray-500 text-center">Loading cars...</div>
          ) : filteredCars.length === 0 ? (
            <div className="text-gray-500 text-center">
              No cars found. Try adjusting filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCars.map((car) => (
                <CarCard key={car._id || car.id} car={car} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CarsPage;