import React, { useState, useEffect } from "react";

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
        } catch (err) {
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
    } catch (err) {
      setLoading(false);
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-20 bg-white p-8 rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-[#3d3356]">
        Owner Verification
      </h2>
      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Aadhar Card Number</label>
          <input
            type="text"
            value={aadhar}
            onChange={(e) => setAadhar(e.target.value)}
            required
            className="w-full border px-4 py-2 rounded"
            placeholder="Enter your Aadhar number"
            maxLength={12}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">PAN Card Number</label>
          <input
            type="text"
            value={pan}
            onChange={(e) => setPan(e.target.value.toUpperCase())}
            required
            className="w-full border px-4 py-2 rounded"
            placeholder="Enter your PAN number"
            maxLength={10}
          />
        </div>

        {verifiedName && (
          <div className="text-gray-500 mt-2 font-medium">{verifiedName}</div>
        )}

        {lookupLoading && (
          <div className="text-sm text-gray-500">Checking records...</div>
        )}

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <button
          type="submit"
          className="bg-[#3d3356] text-white px-6 py-2 rounded font-semibold hover:bg-[#2a223e] transition"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify & Continue"}
        </button>
      </form>
    </div>
  );
}

export default OwnerVerification;