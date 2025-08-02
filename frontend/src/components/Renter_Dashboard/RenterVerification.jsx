import React, { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";

function RenterVerification({ onVerify }) {
  const [citizenship, setCitizenship] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [pan, setPan] = useState("");
  const [passport, setPassport] = useState("");
  const [licenceNumber, setLicenceNumber] = useState("");
  const [licencePhoto, setLicencePhoto] = useState(null);
  const [licencePhotoPreview, setLicencePhotoPreview] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleLicencePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLicencePhoto(file);
      setLicencePhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let res, data;
      if (citizenship === "indian") {
        const formData = new FormData();
        formData.append("aadhar", aadhar);
        formData.append("pan", pan);
        formData.append("licenceNumber", licenceNumber);
        formData.append("licencePhoto", licencePhoto);
        res = await fetch("http://localhost:5000/api/renters/verify-indian", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        });
      } else {
        const formData = new FormData();
        formData.append("passport", passport);
        formData.append("photo", photo);
        formData.append("licenceNumber", licenceNumber);
        formData.append("licencePhoto", licencePhoto);
        res = await fetch(
          "http://localhost:5000/api/renters/verify-foreigner",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: formData,
          }
        );
      }
      data = await res.json();
      setLoading(false);

      if (res.ok && data.verified) {
        setVerified(true);
        if (onVerify) onVerify();
      } else {
        setError(data.message || "Verification failed");
      }
    } catch {
      setLoading(false);
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-20 bg-white p-8 rounded-lg shadow-lg transition-all">
      <h2 className="text-2xl font-bold mb-6 text-[#3d3356]">
        Renter Verification
      </h2>

      <div className="mb-6">
        <label className="block mb-2 font-medium text-gray-700">
          Are you an Indian citizen or a foreigner?
        </label>
        <div className="flex gap-4">
          <button
            type="button"
            className={`px-4 py-2 rounded border ${
              citizenship === "indian"
                ? "bg-[#3d3356] text-white"
                : "bg-gray-100"
            }`}
            onClick={() => {
              setCitizenship("indian");
              setError("");
            }}
          >
            Indian
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded border ${
              citizenship === "foreigner"
                ? "bg-[#3d3356] text-white"
                : "bg-gray-100"
            }`}
            onClick={() => {
              setCitizenship("foreigner");
              setError("");
            }}
          >
            Foreigner
          </button>
        </div>
      </div>

      {citizenship === "indian" && (
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Aadhar Card Number
            </label>
            <input
              type="text"
              value={aadhar}
              onChange={(e) => setAadhar(e.target.value.replace(/\D/g, ""))}
              required
              className="w-full border-2 px-4 py-2 rounded focus:outline-none transition"
              placeholder="Enter 12-digit Aadhar number"
              maxLength={12}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              PAN Card Number
            </label>
            <input
              type="text"
              value={pan}
              onChange={(e) =>
                setPan(e.target.value.toUpperCase().replace(/[^A-Z0-9]/gi, ""))
              }
              required
              className="w-full border-2 px-4 py-2 rounded focus:outline-none transition"
              placeholder="Enter 10-character PAN number"
              maxLength={10}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Driving Licence Number
            </label>
            <input
              type="text"
              value={licenceNumber}
              onChange={(e) =>
                setLicenceNumber(
                  e.target.value.toUpperCase().replace(/[^A-Z0-9]/gi, "")
                )
              }
              required
              className="w-full border-2 px-4 py-2 rounded focus:outline-none transition"
              placeholder="Enter Driving Licence Number"
              maxLength={20}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Upload Driving Licence Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLicencePhotoChange}
              required
              className="w-full border-2 px-4 py-2 rounded focus:outline-none transition"
            />
            {licencePhotoPreview && (
              <img
                src={licencePhotoPreview}
                alt="Licence Preview"
                className="mt-2 w-32 h-32 object-cover rounded border"
              />
            )}
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            className={`w-full bg-[#3d3356] text-white px-6 py-2 rounded font-semibold transition hover:bg-[#2a223e] flex items-center justify-center gap-2 ${
              loading ||
              !(
                aadhar.length === 12 &&
                pan.length === 10 &&
                licenceNumber.length > 5 &&
                licencePhoto
              )
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            disabled={
              loading ||
              !(
                aadhar.length === 12 &&
                pan.length === 10 &&
                licenceNumber.length > 5 &&
                licencePhoto
              )
            }
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify & Continue"
            )}
          </button>
        </form>
      )}

      {citizenship === "foreigner" && (
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Passport Number
            </label>
            <input
              type="text"
              value={passport}
              onChange={(e) =>
                setPassport(
                  e.target.value.toUpperCase().replace(/[^A-Z0-9]/gi, "")
                )
              }
              required
              className="w-full border-2 px-4 py-2 rounded focus:outline-none transition"
              placeholder="Enter Passport Number"
              maxLength={20}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Upload Passport Photo/Identity Proof
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              required
              className="w-full border-2 px-4 py-2 rounded focus:outline-none transition"
            />
            {photoPreview && (
              <img
                src={photoPreview}
                alt="Identity Preview"
                className="mt-2 w-32 h-32 object-cover rounded border"
              />
            )}
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Driving Licence Number
            </label>
            <input
              type="text"
              value={licenceNumber}
              onChange={(e) =>
                setLicenceNumber(
                  e.target.value.toUpperCase().replace(/[^A-Z0-9]/gi, "")
                )
              }
              required
              className="w-full border-2 px-4 py-2 rounded focus:outline-none transition"
              placeholder="Enter Driving Licence Number"
              maxLength={20}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Upload Driving Licence Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLicencePhotoChange}
              required
              className="w-full border-2 px-4 py-2 rounded focus:outline-none transition"
            />
            {licencePhotoPreview && (
              <img
                src={licencePhotoPreview}
                alt="Licence Preview"
                className="mt-2 w-32 h-32 object-cover rounded border"
              />
            )}
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            className={`w-full bg-[#3d3356] text-white px-6 py-2 rounded font-semibold transition hover:bg-[#2a223e] flex items-center justify-center gap-2 ${
              loading ||
              !(
                passport.length >= 6 &&
                photo &&
                licenceNumber.length > 5 &&
                licencePhoto
              )
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            disabled={
              loading ||
              !(
                passport.length >= 6 &&
                photo &&
                licenceNumber.length > 5 &&
                licencePhoto
              )
            }
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify & Continue"
            )}
          </button>
        </form>
      )}

      {verified && (
        <div className="mt-4 text-green-600 font-medium text-center">
          <CheckCircle size={20} className="inline mr-1" />
          You are verified!
        </div>
      )}
    </div>
  );
}

export default RenterVerification;