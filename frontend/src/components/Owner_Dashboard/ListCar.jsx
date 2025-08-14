import React, { useState, useRef } from "react";
import stateCityMap from "../../assets/stateCityMap.json";
import pincodePrefixMap from "../../assets/pincodePrefixMap.json";
import carBrandData from "../../assets/carbrand.json";
import cityAreaMap from "../../assets/cityAreaMap.json";
import computeMaxPrice from "../../utils/pricePolicy";

function ListCar({ onCarAdded, onClose }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [carForm, setCarForm] = useState({
    title: "",
    brand: "",
    model: "",
    carnumber: "",
    year: "",
    pricePerDay: "",
    fuelType: "",
    transmission: "",
    seats: "",
    location: {
      city: "",
      state: "",
      country: "India",
      addressLine: "",
      pincode: "",
      digipin: "",
    },
    availability: true,
    images: [],
    documents: {
      rc: null,
      insurance: null,
      pollution: null,
      signature: null,
    },
    description: "",
  });
  const [error, setError] = useState("");

  const indianStates = Object.keys(stateCityMap);
  const citiesForSelectedState = stateCityMap[carForm.location.state] || [];
  const pincodePrefix = pincodePrefixMap[carForm.location.city] || "";
  const brandDropdownRef = useRef(null);
  const modelDropdownRef = useRef(null);
  const stateDropdownRef = useRef(null);
  const cityDropdownRef = useRef(null);
  const areaDropdownRef = useRef(null);
  const fuelDropdownRef = useRef(null);
  const transmissionDropdownRef = useRef(null);

  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [showFuelDropdown, setShowFuelDropdown] = useState(false);
  const [showTransmissionDropdown, setShowTransmissionDropdown] =
    useState(false);

  const [brandFilter, setBrandFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [fuelFilter, setFuelFilter] = useState("");
  const [transmissionFilter, setTransmissionFilter] = useState("");

  const filteredBrands = Object.keys(carBrandData).filter((brand) =>
    brand.toLowerCase().includes(brandFilter.toLowerCase())
  );
  const modelsForBrand =
    carForm.brand && carBrandData[carForm.brand]
      ? carBrandData[carForm.brand]
      : [];
  const filteredModels = modelsForBrand.filter((model) =>
    model.toLowerCase().includes(modelFilter.toLowerCase())
  );
  const filteredStates = indianStates.filter((state) =>
    state.toLowerCase().includes(stateFilter.toLowerCase())
  );
  const filteredCities = citiesForSelectedState.filter((city) =>
    city.toLowerCase().includes(cityFilter.toLowerCase())
  );
  const areasForSelectedCity = cityAreaMap[carForm.location.city] || [];
  const filteredAreas = areasForSelectedCity.filter((area) =>
    area.toLowerCase().includes(areaFilter.toLowerCase())
  );
  const fuelOptions = ["Petrol", "Diesel", "Electric", "Hybrid", "CNG"];
  const filteredFuelOptions = fuelOptions.filter((f) =>
    f.toLowerCase().includes(fuelFilter.toLowerCase())
  );
  const transmissionOptions = ["Manual", "Automatic"];
  const filteredTransmissionOptions = transmissionOptions.filter((t) =>
    t.toLowerCase().includes(transmissionFilter.toLowerCase())
  );

  // Click outside to close dropdowns
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (
        brandDropdownRef.current &&
        !brandDropdownRef.current.contains(event.target)
      ) {
        setShowBrandDropdown(false);
      }
      if (
        modelDropdownRef.current &&
        !modelDropdownRef.current.contains(event.target)
      ) {
        setShowModelDropdown(false);
      }
      if (
        stateDropdownRef.current &&
        !stateDropdownRef.current.contains(event.target)
      ) {
        setShowStateDropdown(false);
      }
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(event.target)
      ) {
        setShowCityDropdown(false);
      }
      if (
        areaDropdownRef.current &&
        !areaDropdownRef.current.contains(event.target)
      ) {
        setShowAreaDropdown(false);
      }
      if (
        fuelDropdownRef.current &&
        !fuelDropdownRef.current.contains(event.target)
      ) {
        setShowFuelDropdown(false);
      }
      if (
        transmissionDropdownRef.current &&
        !transmissionDropdownRef.current.contains(event.target)
      ) {
        setShowTransmissionDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCarFormChange = (e) => {
    const { name, value } = e.target;
    if (
      [
        "city",
        "state",
        "country",
        "area",
        "addressLine",
        "pincode",
        "digipin",
      ].includes(name)
    ) {
      setCarForm((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [name]: value,
        },
      }));
    } else {
      setCarForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCarImage = (e) => {
    const files = [...e.target.files].slice(0, 5);
    setCarForm((prev) => ({
      ...prev,
      images: files,
    }));
  };

  const removeImage = (index) => {
    setCarForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleDocumentUpload = (e) => {
    const { name, files } = e.target;
    setCarForm((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [name]: files[0],
      },
    }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    setError(""); // Clear previous error

    // Step 1 validation
    if (step === 1) {
      if (
        !carForm.title ||
        !carForm.brand ||
        (carForm.brand === "Other" && !carForm.brandText) ||
        !carForm.model ||
        ((carForm.model === "Other" || carForm.brand === "Other") &&
          !carForm.modelText) ||
        !carForm.carnumber ||
        !carForm.year ||
        !carForm.pricePerDay ||
        !carForm.fuelType ||
        !carForm.transmission ||
        !carForm.seats
      ) {
        setError("Please fill all required fields in this step.");
        return;
      }
      if (!/^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/i.test(carForm.carnumber.trim())) {
        setError("Car number must be in format like MH01AB1234");
        return;
      }
      const currentYear = new Date().getFullYear();
      const minYear = currentYear - 25;
      if (
        !/^\d{4}$/.test(carForm.year) ||
        +carForm.year < minYear ||
        +carForm.year > currentYear
      ) {
        setError(
          `Year must be a 4 digit number between ${minYear} and ${currentYear}.`
        );
        return;
      }

      // NEW: enforce price cap
      const max = Number(priceCaps?.max || 0);
      const price = Number(carForm.pricePerDay);
      if (max > 0 && price > max) {
        setError(
          `Price exceeds the allowed maximum for ${
            carForm.brand === "Other" ? carForm.brandText : carForm.brand
          } ${carForm.model === "Other" ? carForm.modelText : carForm.model} (${
            carForm.transmission
          }, ${carForm.seats}-seater, ${
            carForm.year
          }). Max allowed is ₹${max.toLocaleString("en-IN")}.`
        );
        return;
      }
    }

    // Step 2 validation
    if (step === 2) {
      if (
        !carForm.location.state ||
        !carForm.location.city ||
        !carForm.location.area ||
        !carForm.location.addressLine ||
        !carForm.location.pincode
      ) {
        setError("Please fill all required fields in this step.");
        return;
      }
      if (!/^\d{6}$/.test(carForm.location.pincode)) {
        setError("Pincode must be a 6 digit number.");
        return;
      }
      const pincodePrefix = pincodePrefixMap[carForm.location.city] || "";
      if (
        pincodePrefix &&
        !carForm.location.pincode.startsWith(pincodePrefix)
      ) {
        setError(
          `Pincode for ${carForm.location.city} must start with ${pincodePrefix}`
        );
        return;
      }
    }

    // Step 3 validation
    if (step === 3) {
      if (
        !carForm.images.length ||
        !carForm.documents.rc ||
        !carForm.documents.insurance ||
        !carForm.documents.pollution ||
        !carForm.documents.signature
      ) {
        setError("Please upload all required images and documents.");
        return;
      }
    }

    setStep((prev) => prev + 1);
  };

  const handlePrev = (e) => {
    e.preventDefault();
    setStep((prev) => prev - 1);
  };

  const handleCarSubmit = async (e) => {
    e.preventDefault();
    const {
      title,
      brand,
      model,
      carnumber,
      pricePerDay,
      year,
      images,
      documents: { rc, insurance, pollution, signature },
    } = carForm;

    if (
      !title ||
      !brand ||
      !model ||
      !carnumber ||
      !pricePerDay ||
      !year ||
      images.length === 0 ||
      !rc ||
      !insurance ||
      !pollution ||
      !signature
    ) {
      alert("Please fill all required fields and upload all documents.");
      return;
    }

    // Re-check price cap on final submit
    const brandName =
      carForm.brand === "Other" ? carForm.brandText || "" : carForm.brand;
    const modelName =
      carForm.model === "Other" ? carForm.modelText || "" : carForm.model;
    const caps = computeMaxPrice({
      brand: brandName,
      model: modelName,
      transmission: carForm.transmission,
      seats: carForm.seats,
      year: carForm.year,
    });
    const max = Number(caps?.max || 0);
    const price = Number(carForm.pricePerDay);
    if (max > 0 && price > max) {
      alert(`Price exceeds maximum allowed: ₹${max.toLocaleString("en-IN")}`);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("title", carForm.title);
      formData.append("brand", carForm.brand);
      formData.append("model", carForm.model);
      formData.append("carnumber", carForm.carnumber);
      formData.append("year", carForm.year);
      formData.append("pricePerDay", carForm.pricePerDay);
      formData.append("fuelType", carForm.fuelType);
      formData.append("transmission", carForm.transmission);
      formData.append("seats", carForm.seats);
      formData.append("location", JSON.stringify(carForm.location));
      formData.append("description", carForm.description);

      carForm.images.forEach((img) => {
        formData.append("images", img);
      });

      if (carForm.documents) {
        formData.append("rc", carForm.documents.rc);
        formData.append("insurance", carForm.documents.insurance);
        formData.append("pollution", carForm.documents.pollution);
        formData.append("signature", carForm.documents.signature);
      }

      const res = await fetch("http://localhost:5000/api/cars/addcar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (onCarAdded) onCarAdded(data.car);
        setLoading(false);
        onClose();
      } else {
        alert(data.message || "Failed to add car");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Please try again.");
      setLoading(false);
    }
  };

  const handleYearChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    setCarForm((prev) => ({
      ...prev,
      year: value,
    }));
  };

  const handlePinCodeChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 6) value = value.slice(0, 6);
    setCarForm((prev) => ({
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
    setCarForm((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        digipin: value,
      },
    }));
  };

  // Compute price caps dynamically
  const priceCaps = React.useMemo(() => {
    const brandName =
      carForm.brand === "Other" ? carForm.brandText || "" : carForm.brand;
    const modelName =
      carForm.model === "Other" ? carForm.modelText || "" : carForm.model;
    return computeMaxPrice({
      brand: brandName,
      model: modelName,
      transmission: carForm.transmission,
      seats: carForm.seats,
      year: carForm.year,
    });
  }, [
    carForm.brand,
    carForm.brandText,
    carForm.model,
    carForm.modelText,
    carForm.transmission,
    carForm.seats,
    carForm.year,
  ]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form
        onSubmit={step === 4 ? handleCarSubmit : handleNext}
        className="bg-[#ecebee] pb-8 rounded-2xl shadow-2xl w-full max-w-lg space-y-5 max-h-[90vh] overflow-y-auto border border-[#e0dbe9] disabledscrollbar"
      >
        <div className="flex justify-between px-2">
          <div></div>
          <div>
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="mt-2 ml-2 rounded-full p-2 hover:bg-[#f7f6fa] transition"
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
          </div>
        </div>

        <div className="mb-4 px-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-[#2F2240] tracking-wide">
              List a New Car
            </h2>
            <span className="text-base text-[#3d3356] font-medium">
              Step {step} of 4
            </span>
          </div>

          {step === 1 && (
            <>
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
                  {carForm.brandText && carForm.brand === "Other"
                    ? carForm.brandText
                    : carForm.brand || "Select Brand"}
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
                            setCarForm((prev) => ({
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
                            setCarForm((prev) => ({
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
                              setCarForm((prev) => ({
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
                {carForm.brand === "Other" && (
                  <input
                    type="text"
                    name="brandText"
                    placeholder="Enter brand"
                    className="w-full border px-4 py-2 rounded-lg mt-2 bg-[#f7f6fa] font-medium"
                    value={carForm.brandText || ""}
                    onChange={(e) =>
                      setCarForm((prev) => ({
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
                    !carForm.brand || carForm.brand === "Other"
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }`}
                  onClick={() => {
                    if (carForm.brand && carForm.brand !== "Other")
                      setShowModelDropdown((v) => !v);
                  }}
                  tabIndex={0}
                >
                  {carForm.modelText && carForm.model === "Other"
                    ? carForm.modelText
                    : carForm.model || "Select Model"}
                </div>
                {showModelDropdown &&
                  carForm.brand &&
                  carForm.brand !== "Other" && (
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
                              setCarForm((prev) => ({
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
                              setCarForm((prev) => ({
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
                                setCarForm((prev) => ({
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
                {(carForm.model === "Other" || carForm.brand === "Other") && (
                  <input
                    type="text"
                    name="modelText"
                    placeholder="Enter model"
                    className="w-full border px-4 py-2 rounded-lg mt-2 bg-[#f7f6fa] font-medium"
                    value={carForm.modelText || ""}
                    onChange={(e) =>
                      setCarForm((prev) => ({
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
                name="title"
                value={carForm.title}
                onChange={handleCarFormChange}
                required
                placeholder="Title"
                className="w-full border px-4 py-2 rounded mb-2"
              />
              <input
                type="text"
                name="carnumber"
                value={carForm.carnumber}
                onChange={handleCarFormChange}
                required
                className="w-full border px-4 py-2 rounded mb-2"
                placeholder="Car Number (e.g. MH01SG2829)"
                pattern="^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$"
                title="Format: MH01SG2829"
              />
              <input
                type="text"
                name="year"
                value={carForm.year}
                onChange={handleYearChange}
                required
                placeholder="Year"
                className="w-full border px-4 py-2 rounded mb-2"
                maxLength={4}
              />
              <input
                type="number"
                name="pricePerDay"
                value={carForm.pricePerDay}
                onChange={handleCarFormChange}
                required
                placeholder="Price Per Day (₹)"
                className="w-full border px-4 py-2 rounded mb-1" // mb-1 (tighter, we add helper below)
              />
              {/* Helper: show max allowed */}
              {Number(carForm.pricePerDay) > 0 && priceCaps?.max ? (
                <div className="text-xs text-gray-600 mb-2">
                  Max allowed for this car:{" "}
                  <b>₹{Number(priceCaps.max).toLocaleString("en-IN")}</b>
                  {priceCaps.recommended ? (
                    <>
                      {" "}
                      • Recommended: ₹
                      {Number(priceCaps.recommended).toLocaleString("en-IN")}
                    </>
                  ) : null}
                </div>
              ) : null}

              {/* Fuel Type Dropdown */}
              <div className="mb-4 relative">
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
                  {carForm.fuelType || "Select Fuel Type"}
                </div>
                {showFuelDropdown && (
                  <div className="absolute z-20 w-full bg-white border rounded-lg shadow-lg mt-1">
                    <ul className="max-h-48 overflow-y-auto">
                      {fuelOptions.map((fuel) => (
                        <li
                          key={fuel}
                          className="px-4 py-2 cursor-pointer hover:bg-[#eceaf6] font-medium"
                          onClick={() => {
                            setCarForm((prev) => ({
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
              <div className="mb-4 relative">
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
                  {carForm.transmission || "Select Transmission"}
                </div>
                {showTransmissionDropdown && (
                  <div className="absolute z-20 w-full bg-white border rounded-lg shadow-lg mt-1">
                    <ul className="max-h-48 overflow-y-auto">
                      {transmissionOptions.map((trans) => (
                        <li
                          key={trans}
                          className="px-4 py-2 cursor-pointer hover:bg-[#eceaf6] font-medium"
                          onClick={() => {
                            setCarForm((prev) => ({
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
              <div className="mb-4 relative">
                <label className="block mb-1 font-semibold text-[#3d3356]">
                  Seating Capacity <span className="text-red-500">*</span>
                </label>
                <div
                  className={`w-full border px-4 py-2 rounded-lg bg-[#f7f6fa] cursor-pointer transition font-medium ${
                    showAreaDropdown ? "ring-2 ring-[#2F2240]" : ""
                  }`}
                  onClick={() => setShowAreaDropdown((v) => !v)}
                  tabIndex={0}
                >
                  {carForm.seats || "Select Seating Capacity"}
                </div>
                {showAreaDropdown && (
                  <div className="absolute z-20 w-full bg-white border rounded-lg shadow-lg mt-1">
                    <ul className="max-h-48 overflow-y-auto">
                      {["4", "6", "7"].map((seat) => (
                        <li
                          key={seat}
                          className="px-4 py-2 cursor-pointer hover:bg-[#eceaf6] font-medium"
                          onClick={() => {
                            setCarForm((prev) => ({
                              ...prev,
                              seats: seat,
                            }));
                            setShowAreaDropdown(false);
                          }}
                        >
                          {seat}-Seater Car
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2 text-center font-semibold shadow">
                  {error}
                </div>
              )}

              <button
                type="button"
                className="bg-[#2F2240] text-white px-6 py-2 rounded font-semibold hover:bg-[#2F1440] transition"
                onClick={handleNext}
              >
                Next
              </button>
            </>
          )}

          {step === 2 && (
            <>
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
                  {carForm.location.state || "Select State"}
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
                            setCarForm((prev) => ({
                              ...prev,
                              location: {
                                ...prev.location,
                                state,
                                city: "",
                              },
                            }));
                            setShowStateDropdown(false);
                            setStateFilter("");
                            setCityFilter("");
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
                    !carForm.location.state
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }`}
                  onClick={() => {
                    if (carForm.location.state) setShowCityDropdown((v) => !v);
                  }}
                  tabIndex={0}
                >
                  {carForm.location.city || "Select City"}
                </div>
                {showCityDropdown && carForm.location.state && (
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
                            setCarForm((prev) => ({
                              ...prev,
                              location: {
                                ...prev.location,
                                city,
                              },
                            }));
                            setShowCityDropdown(false);
                            setCityFilter("");
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
                    !carForm.location.city
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }`}
                  onClick={() => {
                    if (carForm.location.city) setShowAreaDropdown((v) => !v);
                  }}
                  tabIndex={0}
                >
                  {carForm.location.area || "Select Area"}
                </div>
                {showAreaDropdown && carForm.location.city && (
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
                            setCarForm((prev) => ({
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
                name="country"
                value={carForm.location.country}
                onChange={handleCarFormChange}
                placeholder="Country"
                className="w-full border px-4 py-2 rounded mb-2 bg-gray-200"
                disabled
              />
              <input
                type="text"
                name="addressLine"
                value={carForm.location.addressLine}
                onChange={handleCarFormChange}
                placeholder="Address Line"
                className="w-full border px-4 py-2 rounded mb-2"
              />
              <input
                type="number"
                name="pincode"
                value={carForm.location.pincode}
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
                value={carForm.location.digipin || ""}
                onChange={handleDigipinChange}
                placeholder="Digipin (optional, format: XXX-XXX-XXXX)"
              />

              {/* Error message */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2 text-center font-semibold shadow">
                  {error}
                </div>
              )}

              <div className="flex justify-between">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-300"
                  onClick={handlePrev}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="bg-[#2F2240] text-white px-6 py-2 rounded font-semibold hover:bg-[#2F1440] transition"
                  onClick={handleNext}
                >
                  Next
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <label className="block mb-1 font-medium">
                Upload Car Images (Max 5)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleCarImage}
                className="w-full"
                required
              />
              <div className="flex gap-2 mt-2 flex-wrap">
                {carForm.images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={URL.createObjectURL(img)}
                      alt="Car"
                      className="w-16 h-12 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-[-6px] right-[-6px] bg-red-500 text-white text-xs rounded-full px-1"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>

              <label className="block mt-4 font-medium">Upload Documents</label>
              {["rc", "insurance", "pollution", "signature"].map((doc) => (
                <div key={doc}>
                  <label className="block mb-1 font-medium">
                    {doc} Document
                  </label>
                  <input
                    key={doc}
                    type="file"
                    name={doc}
                    accept="application/pdf,image/*"
                    onChange={handleDocumentUpload}
                    className="w-full"
                    required
                  />
                </div>
              ))}

              {/* Error message */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2 text-center font-semibold shadow">
                  {error}
                </div>
              )}
              <div className="flex justify-between">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-300"
                  onClick={handlePrev}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="bg-[#2F2240] text-white px-6 py-2 rounded font-semibold hover:[#2F1440] transition"
                  onClick={handleNext}
                >
                  Next
                </button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <textarea
                name="description"
                value={carForm.description}
                onChange={handleCarFormChange}
                rows={4}
                className="w-full border px-4 py-2 rounded"
                placeholder="Write something about your car (features, condition, rules)"
                required
              />

              {/* GPS Notice and Terms */}
              <div className="bg-yellow-50 border border-yellow-300 text-yellow-900 px-4 py-3 rounded mb-3 mt-4 text-sm">
                <strong className="block mb-1">
                  Please install GPS in your car to avoid location and security
                  issues.
                </strong>
                If you have not installed a GPS device,{" "}
                <a
                  href="https://www.google.com/search?q=gps+installation+for+car"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-700"
                >
                  click here to find GPS installation services
                </a>
                .
                <div className="mt-2">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    required
                    className="mr-2"
                  />
                  <label htmlFor="agreeTerms">
                    I agree with the{" "}
                    <a
                      href="/terms-and-conditions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-blue-700"
                    >
                      terms and conditions
                    </a>{" "}
                    and confirm that my car has a GPS device installed. If not,
                    I will not list my car.
                  </label>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2 text-center font-semibold shadow">
                  {error}
                </div>
              )}
              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-300"
                  onClick={handlePrev}>
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700 transition"
                >
                  {loading ? "Listing..." : "List Car"}
                </button>
              </div>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

export default ListCar;
