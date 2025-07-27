import React, { useState, useEffect } from "react";
import { CheckCircle, Loader2 } from "lucide-react"; // Optional icon library

function OwnerVerification({ onVerify, aadhar, setAadhar, pan, setPan }) {
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [error, setError] = useState("");
  const [verifiedName, setVerifiedName] = useState("");
  const [alreadyVerified, setAlreadyVerified] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:5000/api/owners/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.verified) {
          setAlreadyVerified(true);
          onVerify();
        }
      });
  }, [onVerify]);

  useEffect(() => {
    const fetchName = async () => {
      if (aadhar.length === 12 && pan.length === 10) {
        setLookupLoading(true);
        setVerifiedName("");
        try {
          const res = await fetch(
            "http://localhost:5000/api/owners/lookup-document",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ aadhar, pan }),
            }
          );
          const data = await res.json();
          if (res.ok && data.success) {
            setVerifiedName(data.name);
          } else {
            setVerifiedName("");
          }
        } catch {
          setVerifiedName("");
        } finally {
          setLookupLoading(false);
        }
      } else {
        setVerifiedName("");
      }
    };

    fetchName();
  }, [aadhar, pan]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/owners/verify-owner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ aadhar, pan }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok && data.verified) {
        setVerifiedName(data.name);
        setAlreadyVerified(true);
        onVerify();
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
        Owner Verification
      </h2>

      <form onSubmit={handleVerify} className="space-y-4">
        {/* Aadhar Input */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Aadhar Card Number
          </label>
          <input
            type="text"
            value={aadhar}
            onChange={(e) => setAadhar(e.target.value.replace(/\D/g, ""))}
            required
            className={`w-full border-2 px-4 py-2 rounded focus:outline-none transition ${
              aadhar.length === 12
                ? "border-green-500"
                : "border-gray-300 focus:border-[#3d3356]"
            }`}
            placeholder="Enter 12-digit Aadhar number"
            maxLength={12}
          />
        </div>

        {/* PAN Input */}
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
            className={`w-full border-2 px-4 py-2 rounded focus:outline-none transition ${
              pan.length === 10
                ? "border-green-500"
                : "border-gray-300 focus:border-[#3d3356]"
            }`}
            placeholder="Enter 10-character PAN number"
            maxLength={10}
          />
        </div>

        {/* Lookup result */}
        {lookupLoading && (
          <div className="text-sm text-gray-500">🔍 Checking records...</div>
        )}
        {verifiedName && (
          <div className="flex items-center gap-2 text-green-600 font-medium mt-1">
            <CheckCircle size={18} className="text-green-500" />
            Name matched: {verifiedName}
          </div>
        )}

        {/* Error Message */}
        {error && <div className="text-red-600 text-sm">{error}</div>}

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full bg-[#3d3356] text-white px-6 py-2 rounded font-semibold transition hover:bg-[#2a223e] flex items-center justify-center gap-2 ${
            loading || !(aadhar.length === 12 && pan.length === 10)
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          disabled={loading || !(aadhar.length === 12 && pan.length === 10)}
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

      {/* Already verified message */}
      {alreadyVerified && (
        <div className="mt-4 text-green-600 font-medium text-center">
          ✅ You are already verified.
        </div>
      )}
    </div>
  );
}

export default OwnerVerification;