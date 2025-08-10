import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import stateCityMap from "../../assets/stateCityMap.json";
import pincodePrefixMap from "../../assets/pincodePrefixMap.json";
import carBrandData from "../../assets/carbrand.json";
import cityAreaMap from "../../assets/cityAreaMap.json";

function EditCar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    brand: "",
    brandText: "",
    model: "",
    modelText: "",
    carnumber: "",
    year: "",
    pricePerDay: "",
    fuelType: "",
    transmission: "",
    seats: "",
    description: "",
    location: {
      state: "",
      city: "",
      area: "",
      addressLine: "",
      pincode: "",
      digipin: "",
      country: "India",
    },
  });

  const brandDropdownRef = useRef(null);
  const modelDropdownRef = useRef(null);
  const stateDropdownRef = useRef(null);
  const cityDropdownRef = useRef(null);
  const areaDropdownRef = useRef(null);
  const fuelDropdownRef = useRef(null);
  const transmissionDropdownRef = useRef(null);
  const seatsDropdownRef = useRef(null);

  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [showFuelDropdown, setShowFuelDropdown] = useState(false);
  const [showTransmissionDropdown, setShowTransmissionDropdown] = useState(
    false
  );
  const [showSeatsDropdown, setShowSeatsDropdown] = useState(false);
  // NEW: deleting state
  const [deleting, setDeleting] = useState(false);

  const [brandFilter, setBrandFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");

  // Data for dropdowns
  const indianStates = Object.keys(stateCityMap);
  const filteredBrands = Object.keys(carBrandData).filter((brand) =>
    brand.toLowerCase().includes(brandFilter.toLowerCase())
  );
  const modelsForBrand =
    form.brand && carBrandData[form.brand] ? carBrandData[form.brand] : [];
  const filteredModels = modelsForBrand.filter((model) =>
    model.toLowerCase().includes(modelFilter.toLowerCase())
  );
  const filteredStates = indianStates.filter((state) =>
    state.toLowerCase().includes(stateFilter.toLowerCase())
  );
  const citiesForSelectedState = stateCityMap[form.location.state] || [];
  const filteredCities = citiesForSelectedState.filter((city) =>
    city.toLowerCase().includes(cityFilter.toLowerCase())
  );
  const areasForSelectedCity = cityAreaMap[form.location.city] || [];
  const filteredAreas = areasForSelectedCity.filter((area) =>
    area.toLowerCase().includes(areaFilter.toLowerCase())
  );
  const pincodePrefix = pincodePrefixMap[form.location.city] || "";

  useEffect(() => {
    function handleClickOutside(event) {
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(event.target)) setShowBrandDropdown(false);
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target)) setShowModelDropdown(false);
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(event.target)) setShowStateDropdown(false);
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) setShowCityDropdown(false);
      if (areaDropdownRef.current && !areaDropdownRef.current.contains(event.target)) setShowAreaDropdown(false);
      if (fuelDropdownRef.current && !fuelDropdownRef.current.contains(event.target)) setShowFuelDropdown(false);
      if (transmissionDropdownRef.current && !transmissionDropdownRef.current.contains(event.target)) setShowTransmissionDropdown(false);
      if (seatsDropdownRef.current && !seatsDropdownRef.current.contains(event.target)) setShowSeatsDropdown(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchCar = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`http://localhost:5000/api/cars/${id}/details`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setCar(data.car);
          setForm({
            brand: data.car.brand || "",
            brandText: "",
            model: data.car.model || "",
            modelText: "",
            carnumber: data.car.carnumber || "",
            year: data.car.year || "",
            pricePerDay: data.car.pricePerDay || "",
            fuelType: data.car.fuelType || "",
            transmission: data.car.transmission || "",
            seats: data.car.seats || "",
            description: data.car.description || "",
            location: {
              state: data.car.location?.state || "",
              city: data.car.location?.city || "",
              area: data.car.location?.area || "",
              addressLine: data.car.location?.addressLine || "",
              pincode: data.car.location?.pincode || "",
              digipin: data.car.location?.digipin || "",
              country: data.car.location?.country || "India",
            },
          });
        } else {
          setMsg(data.message || "Failed to fetch car details");
        }
      } catch {
        setMsg("Error fetching car details");
      }
      setLoading(false);
    };
    fetchCar();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (
      [
        "state",
        "city",
        "area",
        "addressLine",
        "pincode",
        "digipin",
        "country",
      ].includes(name)
    ) {
      setForm((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [name]: value,
        },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleYearChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    setForm((prev) => ({
      ...prev,
      year: value,
    }));
  };

  const handlePinCodeChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 6) value = value.slice(0, 6);
    setForm((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        pincode: value,
      },
    }));
  };

  const handleDigipinChange = (e) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (value.length > 3) value = value.slice(0, 3) + "-" + value.slice(3);
    if (value.length > 7) value = value.slice(0, 7) + "-" + value.slice(7);
    if (value.length > 12) value = value.slice(0, 12);
    setForm((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        digipin: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    if (
      !form.brand ||
      (form.brand === "Other" && !form.brandText) ||
      !form.model ||
      ((form.model === "Other" || form.brand === "Other") && !form.modelText) ||
      !form.carnumber ||
      !form.year ||
      !form.pricePerDay ||
      !form.fuelType ||
      !form.transmission ||
      !form.seats ||
      !form.location.state ||
      !form.location.city ||
      !form.location.area ||
      !form.location.addressLine ||
      !form.location.pincode ||
      !form.description
    ) {
      setError("Please fill all required fields.");
      return;
    }
    if (!/^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/i.test(form.carnumber.trim())) {
      setError("Car number must be in format like MH01SG2829.");
      return;
    }
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 25;
    if (
      !/^\d{4}$/.test(form.year) ||
      +form.year < minYear ||
      +form.year > currentYear
    ) {
      setError(`Year must be a 4 digit number between ${minYear} and ${currentYear}.`);
      return;
    }
    if (!/^\d{6}$/.test(form.location.pincode)) {
      setError("Pincode must be a 6 digit number.");
      return;
    }
    if (
      pincodePrefix &&
      !form.location.pincode.startsWith(pincodePrefix)
    ) {
      setError(
        `Pincode for ${form.location.city} must start with ${pincodePrefix}`
      );
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/cars/${id}/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMsg("Car updated successfully!");
        setTimeout(() => navigate("/peer-owner/dashboard"), 1200);
      } else {
        setMsg(data.message || "Failed to update car");
      }
    } catch {
      setMsg("Error updating car");
    }
  };

  // NEW: delete handler
  const handleDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete this car${
          form.carnumber ? ` (${form.carnumber})` : ""
        }? This action cannot be undone.`
      )
    ) {
      return;
    }
    setDeleting(true);
    setMsg("");
    setError("");
    const token = localStorage.getItem("token");
    try {
      // NOTE: If your API path differs, change to: `/api/cars/${id}`
      const res = await fetch(`http://localhost:5000/api/cars/${id}/delete`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      let data = {};
      try {
        data = await res.json();
      } catch {}
      if (res.ok && (data.success ?? true)) {
        setMsg("Car deleted successfully.");
        setTimeout(() => navigate("/peer-owner/dashboard"), 800);
      } else {
        setError(data.message || "Failed to delete car.");
      }
    } catch {
      setError("Error deleting car.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600">{msg || "Car not found"}</div>
      </div>
    );
  }

  const fuelOptions = ["Petrol", "Diesel", "Electric", "Hybrid", "CNG"];
  const transmissionOptions = ["Manual", "Automatic"];
  const seatsOptions = ["4", "6", "7"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="relative bg-[#ecebee] px-8 pb-8 rounded-2xl shadow-2xl w-full max-w-lg space-y-5 max-h-[90vh] overflow-y-auto border border-[#e0dbe9]"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => navigate("/peer-owner/dashboard")}
          className="absolute top-4 right-4 text-[#2F2240] bg-white rounded-full p-2 shadow hover:bg-[#f7f6fa] transition"
          aria-label="Close"
          style={{ zIndex: 10 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[#2F2240] tracking-wide">
            Edit Car
          </h2>
          {/* Optional top delete button */}
          {/* <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="ml-3 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-60"
            title="Delete this car"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button> */}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2 text-center font-semibold shadow">
            {error}
          </div>
        )}
        {msg && (
          <div className={msg.includes("success") ? "text-green-600 text-center" : "text-red-600 text-center"}>
            {msg}
          </div>
        )}

        {/* Brand Dropdown */}
        <div className="mb-4 relative" ref={brandDropdownRef}>
          <label className="block mb-1 font-semibold text-[#3d3356]">
            Car Brand <span className="text-red-500">*</span>
          </label>
          <div
            className={`w-full border px-4 py-2 rounded-lg bg-[#f7f6fa] cursor-pointer transition font-medium ${
              showBrandDropdown ? "ring-2 ring-[#2F2240]" : ""
            }`}
            onClick={() => setShowBrandDropdown((v) => !v)}
            tabIndex={0}
          >
            {form.brandText && form.brand === "Other"
              ? form.brandText
              : form.brand || "Select Brand"}
          </div>
          {showBrandDropdown && (
            <div className="absolute z-20 w-full bg-white border rounded-lg shadow-lg mt-1">
              <input
                type="text"
                className="w-full px-3 py-2 border-b focus:outline-none focus:ring-2 focus:ring-[#2F2240] rounded-t-lg"
                placeholder="Search brand"
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                autoFocus
              />
              <ul className="max-h-48 overflow-y-auto">
                {filteredBrands.length === 0 && (
                  <li
                    className="px-4 py-2 cursor-pointer hover:bg-[#eceaf6] font-medium"
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        brand: "Other",
                        model: "",
                        brandText: "",
                        modelText: "",
                      }));
                      setShowBrandDropdown(false);
                      setBrandFilter("");
                      setModelFilter("");
                    }}
                  >
                    Other
                  </li>
                )}
                {filteredBrands.map((brand) => (
                  <li
                    key={brand}
                    className="px-4 py-2 cursor-pointer hover:bg-[#eceaf6] font-medium"
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        brand,
                        model: "",
                        brandText: "",
                        modelText: "",
                      }));
                      setShowBrandDropdown(false);
                      setBrandFilter("");
                      setModelFilter("");
                    }}
                  >
                    {brand}
                  </li>
                ))}
                {filteredBrands.length > 0 &&
                  !filteredBrands.includes("Other") && (
                    <li
                      className="px-4 py-2 cursor-pointer hover:bg-[#eceaf6] font-medium"
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          brand: "Other",
                          model: "",
                          brandText: "",
                          modelText: "",
                        }));
                        setShowBrandDropdown(false);
                        setBrandFilter("");
                        setModelFilter("");
                      }}
                    >
                      Other
                    </li>
                  )}
              </ul>
            </div>
          )}
          {form.brand === "Other" && (
            <input
              type="text"
              name="brandText"
              placeholder="Enter brand"
              className="w-full border px-4 py-2 rounded-lg mt-2 bg-[#f7f6fa] font-medium"
              value={form.brandText || ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  brand: "Other",
                  brandText: e.target.value,
                }))
              }
              required
            />
          )}
        </div>

        {/* Model Dropdown */}
        <div className="mb-4 relative" ref={modelDropdownRef}>
          <label className="block mb-1 font-semibold text-[#3d3356]">
            Car Model <span className="text-red-500">*</span>
          </label>
          <div
            className={`w-full border px-4 py-2 rounded-lg bg-[#f7f6fa] cursor-pointer transition font-medium ${
              showModelDropdown ? "ring-2 ring-[#2F2240]" : ""
            } ${
              !form.brand || form.brand === "Other"
                ? "opacity-50 pointer-events-none"
                : ""
            }`}
            onClick={() => {
              if (form.brand && form.brand !== "Other")
                setShowModelDropdown((v) => !v);
            }}
            tabIndex={0}
          >
            {form.modelText && form.model === "Other"
              ? form.modelText
              : form.model || "Select Model"}
          </div>
          {showModelDropdown &&
            form.brand &&
            form.brand !== "Other" && (
              <div className="absolute z-20 w-full bg-white border rounded-lg shadow-lg mt-1">
                <input
                  type="text"
                  className="w-full px-3 py-2 border-b focus:outline-none focus:ring-2 focus:ring-[#2F2240] rounded-t-lg"
                  placeholder="Search model"
                  value={modelFilter}
                  onChange={(e) => setModelFilter(e.target.value)}
                  autoFocus
                />
                <ul className="max-h-48 overflow-y-auto">
                  {filteredModels.length === 0 && (
                    <li
                      className="px-4 py-2 cursor-pointer hover:bg-[#eceaf6] font-medium"
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          model: "Other",
                          modelText: "",
                        }));
                        setShowModelDropdown(false);
                        setModelFilter("");
                      }}
                    >
                      Other
                    </li>
                  )}
                  {filteredModels.map((model) => (
                    <li
                      key={model}
                      className="px-4 py-2 cursor-pointer hover:bg-[#eceaf6] font-medium"
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          model,
                          modelText: "",
                        }));
                        setShowModelDropdown(false);
                        setModelFilter("");
                      }}
                    >
                      {model}
                    </li>
                  ))}
                  {filteredModels.length > 0 &&
                    !filteredModels.includes("Other") && (
                      <li
                        className="px-4 py-2 cursor-pointer hover:bg-[#eceaf6] font-medium"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            model: "Other",
                            modelText: "",
                          }));
                          setShowModelDropdown(false);
                          setModelFilter("");
                        }}
                      >
                        Other
                      </li>
                    )}
                </ul>
              </div>
            )}
          {(form.model === "Other" || form.brand === "Other") && (
            <input
              type="text"
              name="modelText"
              placeholder="Enter model"
              className="w-full border px-4 py-2 rounded-lg mt-2 bg-[#f7f6fa] font-medium"
              value={form.modelText || ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  model: "Other",
                  modelText: e.target.value,
                }))
              }
              required
            />
          )}
        </div>

        <input
          type="text"
          name="carnumber"
          value={form.carnumber}
          onChange={handleChange}
          required
          className="w-full border px-4 py-2 rounded mb-2"
          placeholder="Car Number (e.g. MH01SG2829)"
          pattern="^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$"
          title="Format: MH01SG2829"
        />
        <input
          type="text"
          name="year"
          value={form.year}
          onChange={handleYearChange}
          required
          placeholder="Year"
          className="w-full border px-4 py-2 rounded mb-2"
          maxLength={4}
        />
        <input
          type="number"
          name="pricePerDay"
          value={form.pricePerDay}
          onChange={handleChange}
          required
          placeholder="Price Per Day (₹)"
          className="w-full border px-4 py-2 rounded mb-2"
        />

        {/* State Dropdown */}
        <div className="mb-4 relative" ref={stateDropdownRef}>
          <label className="block mb-1 font-semibold text-[#3d3356]">
            State <span className="text-red-500">*</span>
          </label>
          <div
            className={`w-full border px-4 py-2 rounded-lg bg-[#f7f6fa] cursor-pointer transition font-medium ${
              showStateDropdown ? "ring-2 ring-[#2F2240]" : ""
            }`}
            onClick={() => setShowStateDropdown((v) => !v)}
            tabIndex={0}
          >
            {form.location.state || "Select State"}
          </div>
          {showStateDropdown && (
            <div className="absolute z-20 w-full bg-white border rounded-lg shadow-lg mt-1">
              <input
                type="text"
                className="w-full px-3 py-2 border-b focus:outline-none focus:ring-2 focus:ring-[#2F2240] rounded-t-lg"
                placeholder="Search state"
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                autoFocus
              />
              <ul className="max-h-48 overflow-y-auto">
                {filteredStates.length === 0 && (
                  <li className="px-4 py-2 text-gray-400 font-medium">
                    No state found
                  </li>
                )}
                {filteredStates.map((state) => (
                  <li
                    key={state}
                    className="px-4 py-2 cursor-pointer hover:bg-[#eceaf6] font-medium"
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        location: {
                          ...prev.location,
                          state,
                          city: "",
                          area: "",
                        },
                      }));
                      setShowStateDropdown(false);
                      setStateFilter("");
                      setCityFilter("");
                      setAreaFilter("");
                    }}
                  >
                    {state}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* City Dropdown */}
        <div className="mb-4 relative" ref={cityDropdownRef}>
          <label className="block mb-1 font-semibold text-[#3d3356]">
            City <span className="text-red-500">*</span>
          </label>
          <div
            className={`w-full border px-4 py-2 rounded-lg bg-[#f7f6fa] cursor-pointer transition font-medium ${
              showCityDropdown ? "ring-2 ring-[#2F2240]" : ""
            } ${
              !form.location.state ? "opacity-50 pointer-events-none" : ""
            }`}
            onClick={() => {
              if (form.location.state) setShowCityDropdown((v) => !v);
            }}
            tabIndex={0}
          >
            {form.location.city || "Select City"}
          </div>
          {showCityDropdown && form.location.state && (
            <div className="absolute z-20 w-full bg-white border rounded-lg shadow-lg mt-1">
              <input
                type="text"
                className="w-full px-3 py-2 border-b focus:outline-none focus:ring-2 focus:ring-[#2F2240] rounded-t-lg"
                placeholder="Search city"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                autoFocus
              />
              <ul className="max-h-48 overflow-y-auto">
                {filteredCities.length === 0 && (
                  <li className="px-4 py-2 text-gray-400 font-medium">
                    No city found
                  </li>
                )}
                {filteredCities.map((city) => (
                  <li
                    key={city}
                    className="px-4 py-2 cursor-pointer hover:bg-[#eceaf6] font-medium"
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        location: {
                          ...prev.location,
                          city,
                          area: "",
                        },
                      }));
                      setShowCityDropdown(false);
                      setCityFilter("");
                      setAreaFilter("");
                    }}
                  >
                    {city}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Area Dropdown */}
        <div className="mb-4 relative" ref={areaDropdownRef}>
          <label className="block mb-1 font-semibold text-[#3d3356]">
            Area <span className="text-red-500">*</span>
          </label>
          <div
            className={`w-full border px-4 py-2 rounded-lg bg-[#f7f6fa] cursor-pointer transition font-medium ${
              showAreaDropdown ? "ring-2 ring-[#2F2240]" : ""
            } ${
              !form.location.city ? "opacity-50 pointer-events-none" : ""
            }`}
            onClick={() => {
              if (form.location.city) setShowAreaDropdown((v) => !v);
            }}
            tabIndex={0}
          >
            {form.location.area || "Select Area"}
          </div>
          {showAreaDropdown && form.location.city && (
            <div className="absolute z-20 w-full bg-white border rounded-lg shadow-lg mt-1">
              <input
                type="text"
                className="w-full px-3 py-2 border-b focus:outline-none focus:ring-2 focus:ring-[#2F2240] rounded-t-lg"
                placeholder="Search area"
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                autoFocus
              />
              <ul className="max-h-48 overflow-y-auto">
                {filteredAreas.length === 0 && (
                  <li className="px-4 py-2 text-gray-400 font-medium">
                    No area found
                  </li>
                )}
                {filteredAreas.map((area) => (
                  <li
                    key={area}
                    className="px-4 py-2 cursor-pointer hover:bg-[#eceaf6] font-medium"
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        location: {
                          ...prev.location,
                          area,
                        },
                      }));
                      setShowAreaDropdown(false);
                      setAreaFilter("");
                    }}
                  >
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <input
          type="text"
          name="addressLine"
          value={form.location.addressLine}
          onChange={handleChange}
          placeholder="Address Line"
          className="w-full border px-4 py-2 rounded mb-2"
        />
        <input
          type="number"
          name="pincode"
          value={form.location.pincode}
          onChange={handlePinCodeChange}
          placeholder={
            pincodePrefix
              ? `Pincode (starts with ${pincodePrefix})`
              : "Pincode"
          }
          maxLength={6}
          className="w-full border px-4 py-2 rounded mb-2"
          pattern="^\d{6}$"
          title="Enter 6 digit pincode"
          required
        />
        <input
          type="text"
          name="digipin"
          pattern="^[A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]{4}$"
          className="w-full border px-4 py-2 rounded mb-2"
          value={form.location.digipin || ""}
          onChange={handleDigipinChange}
          placeholder="Digipin (optional, format: XXX-XXX-XXXX)"
        />

        {/* Fuel Type Dropdown */}
        <div className="mb-4 relative" ref={fuelDropdownRef}>
          <label className="block mb-1 font-semibold text-[#3d3356]">
            Fuel Type <span className="text-red-500">*</span>
          </label>
          <div
            className={`w-full border px-4 py-2 rounded-lg bg-[#f7f6fa] cursor-pointer transition font-medium ${
              showFuelDropdown ? "ring-2 ring-[#2F2240]" : ""
            }`}
            onClick={() => setShowFuelDropdown((v) => !v)}
            tabIndex={0}
          >
            {form.fuelType || "Select Fuel Type"}
          </div>
          {showFuelDropdown && (
            <div className="absolute z-20 w-full bg-white border rounded-lg shadow-lg mt-1">
              <ul className="max-h-48 overflow-y-auto">
                {fuelOptions.map((fuel) => (
                  <li
                    key={fuel}
                    className="px-4 py-2 cursor-pointer hover:bg-[#eceaf6] font-medium"
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        fuelType: fuel,
                      }));
                      setShowFuelDropdown(false);
                    }}
                  >
                    {fuel}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Transmission Dropdown */}
        <div className="mb-4 relative" ref={transmissionDropdownRef}>
          <label className="block mb-1 font-semibold text-[#3d3356]">
            Transmission <span className="text-red-500">*</span>
          </label>
          <div
            className={`w-full border px-4 py-2 rounded-lg bg-[#f7f6fa] cursor-pointer transition font-medium ${
              showTransmissionDropdown ? "ring-2 ring-[#2F2240]" : ""
            }`}
            onClick={() => setShowTransmissionDropdown((v) => !v)}
            tabIndex={0}
          >
            {form.transmission || "Select Transmission"}
          </div>
          {showTransmissionDropdown && (
            <div className="absolute z-20 w-full bg-white border rounded-lg shadow-lg mt-1">
              <ul className="max-h-48 overflow-y-auto">
                {transmissionOptions.map((trans) => (
                  <li
                    key={trans}
                    className="px-4 py-2 cursor-pointer hover:bg-[#eceaf6] font-medium"
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        transmission: trans,
                      }));
                      setShowTransmissionDropdown(false);
                    }}
                  >
                    {trans}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Seating Capacity Dropdown */}
        <div className="mb-4 relative" ref={seatsDropdownRef}>
          <label className="block mb-1 font-semibold text-[#3d3356]">
            Seating Capacity <span className="text-red-500">*</span>
          </label>
          <div
            className={`w-full border px-4 py-2 rounded-lg bg-[#f7f6fa] cursor-pointer transition font-medium ${
              showSeatsDropdown ? "ring-2 ring-[#2F2240]" : ""
            }`}
            onClick={() => setShowSeatsDropdown((v) => !v)}
            tabIndex={0}
          >
            {form.seats ? `${form.seats}-Seater Car` : "Select Seating Capacity"}
          </div>
          {showSeatsDropdown && (
            <div className="absolute z-20 w-full bg-white border rounded-lg shadow-lg mt-1">
              <ul className="max-h-48 overflow-y-auto">
                {seatsOptions.map((seat) => (
                  <li
                    key={seat}
                    className="px-4 py-2 cursor-pointer hover:bg-[#eceaf6] font-medium"
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        seats: seat,
                      }));
                      setShowSeatsDropdown(false);
                    }}
                  >
                    {seat}-Seater Car
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          className="w-full border px-4 py-2 rounded"
          placeholder="Write something about your car (features, condition, rules)"
          required
        />

        {/* ACTIONS: Delete (left) + Save (right) */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold transition disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete Car"}
          </button>
          <button
            type="submit"
            className="bg-[#2F2240] hover:bg-[#3d3356] text-white px-4 py-2 rounded font-semibold transition"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditCar;