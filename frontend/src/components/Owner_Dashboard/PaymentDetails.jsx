import React, { useEffect, useState } from "react";
import banksJson from "../../assets/banks.json";

export default function PaymentDetails() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true); // Start as true for initial load
  const [saved, setSaved] = useState(false);
  const [edit, setEdit] = useState(false);
  const [bankSearch, setBankSearch] = useState("");
  const [showBankDropdown, setShowBankDropdown] = useState(false);

  const BANKS = [...banksJson].sort((a, b) => a.name.localeCompare(b.name));

  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoading(true);
    fetch("http://localhost:5000/api/owners/payout", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (data?.payout) setAccount(data.payout);
        else setAccount({});
        setLoading(false);
      })
      .catch(() => {
        setAccount({});
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    setAccount({ ...account, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5000/api/owners/payout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(account),
    });
    setLoading(false);
    if (res.ok) {
      setSaved(true);
      setEdit(false);
    }
  };

  const maskAccount = (num) => {
    if (!num) return "";
    const str = String(num);
    return "xxxx" + str.slice(-4);
  };

  const filteredBanks = BANKS.filter((b) =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase())
  );

  const selectedBank = BANKS.find((b) => b.name === account?.bankName) || null;

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50 rounded-xl">
        <div className="three-body flex gap-2">
          <div className="three-body__dot"></div>
          <div className="three-body__dot"></div>
          <div className="three-body__dot"></div>
        </div>
      </div>
    );
  }

  if (
    account &&
    account.bankName &&
    account.accountNumber &&
    account.accountHolder &&
    !edit
  ) {
    return (
      <div className="max-w-xl ms-3 mt-8 p-6 bg-white rounded shadow flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-[#2f2240]">
          Payout Account Details
        </h2>
        <div className="w-full bg-[#f6f4fa] rounded-lg p-4 mb-4 border flex gap-4">
          {selectedBank && (
            <img
              src={selectedBank.logo}
              alt={selectedBank.name}
              className="w-12 h-12 object-contain rounded bg-white border"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://ui-avatars.com/api/?name=" +
                  encodeURIComponent(selectedBank.name);
              }}
            />
          )}
          <div>
            <div className="mb-2">
              <span className="font-semibold">Bank:</span> {account.bankName}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Account Number:</span>{" "}
              {maskAccount(account.accountNumber)}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Account Holder:</span>{" "}
              {account.accountHolder}
            </div>
          </div>
        </div>
        <button
          className="w-max mx-auto px-5 py-2 rounded bg-[#2f2240] text-white font-semibold"
          onClick={() => setEdit(true)}
        >
          Edit Account Details
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-[#2f2240]">
        {account && account.accountNumber ? "Edit" : "Add"} Payout Account
      </h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="relative">
          <label className="block text-sm font-medium mb-1">Bank Name</label>
          <input
            type="text"
            name="bankName"
            autoComplete="off"
            value={account?.bankName || bankSearch}
            onChange={(e) => {
              setBankSearch(e.target.value);
              setAccount({ ...account, bankName: e.target.value });
              setShowBankDropdown(true);
            }}
            onFocus={() => setShowBankDropdown(true)}
            className="w-full border rounded px-3 py-2"
            placeholder="Search or select your bank"
            required
          />
          {showBankDropdown && filteredBanks.length > 0 && (
            <div className="absolute z-10 bg-white border rounded w-full mt-1 max-h-56 overflow-y-auto shadow-lg">
              {filteredBanks.map((bank) => (
                <div
                  key={bank.name}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setAccount({ ...account, bankName: bank.name });
                    setBankSearch(bank.name);
                    setShowBankDropdown(false);
                  }}
                >
                  <img
                    src={bank.logo}
                    alt={bank.name}
                    className="w-7 h-7 object-contain rounded bg-white border"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://ui-avatars.com/api/?name=" +
                        encodeURIComponent(bank.name);
                    }}
                  />
                  <span>{bank.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Account Number
          </label>
          <input
            type="text"
            name="accountNumber"
            value={account?.accountNumber || ""}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setAccount({ ...account, accountNumber: val });
            }}
            className="w-full border rounded px-3 py-2"
            placeholder="Your bank account number"
            minLength={11}
            maxLength={16}
            required
            pattern="\d{11,16}"
            title="Account number must be 11 to 16 digits"
          />
          {account?.accountNumber &&
            (account.accountNumber.length < 11 ||
              account.accountNumber.length > 16) && (
              <div className="text-red-600 text-xs mt-1">
                Account number must be 11 to 16 digits.
              </div>
            )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">IFSC Code</label>
          <input
            type="text"
            name="ifsc"
            value={account?.ifsc || ""}
            onChange={(e) => {
              const val = e.target.value
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, "")
                .slice(0, 11);
              setAccount({ ...account, ifsc: val });
            }}
            className="w-full border rounded px-3 py-2"
            placeholder={
              BANKS.find((b) => b.name === account?.bankName)?.ifsc ||
              "e.g. HDFC0000001"
            }
            required
            minLength={11}
            maxLength={11}
            pattern="[A-Z0-9]{11}"
            title="IFSC code must be exactly 11 characters (A-Z, 0-9)"
          />
          {account?.ifsc && account.ifsc.length !== 11 && (
            <div className="text-red-600 text-xs mt-1">
              IFSC code must be exactly 11 characters.
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Account Holder Name
          </label>
          <input
            type="text"
            name="accountHolder"
            value={account?.accountHolder || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="As per bank records"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 rounded bg-[#2f2240] text-white font-semibold mt-2"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Account Details"}
        </button>
        {saved && (
          <div className="text-green-600 text-center mt-2">
            Account details saved!
          </div>
        )}
        {account && account.accountNumber && (
          <button
            type="button"
            className="w-full mt-2 py-2 rounded bg-gray-200 text-[#2f2240] font-semibold"
            onClick={() => setEdit(false)}
          >
            Cancel
          </button>
        )}
      </form>
    </div>
  );
}
