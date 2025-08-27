import React, { useEffect, useState } from "react";
import { listUsers, getUserById, verifyUser, uploadUserDoc } from "../../utils/adminApi";

const DocRow = ({ label, value, url }) => (
  <div className="flex items-center justify-between border rounded px-3 py-2">
    <div>
      <div className="text-sm font-medium">{label}</div>
      <div className="text-xs text-gray-600 break-all">{value || "-"}</div>
      {url ? (
        <a href={url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 underline">
          View file
        </a>
      ) : null}
    </div>
  </div>
);

export default function Users() {
  const [items, setItems] = useState([]);
  const [verified, setVerified] = useState(""); // "", "true", "false"
  const [citizenship, setCitizenship] = useState("all"); // "all" | "indian" | "foreigner"
  const [role, setRole] = useState("all"); // "all" | "owner" | "renter"
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [modalUser, setModalUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState("Aadhar");
  const [docValue, setDocValue] = useState("");

  const load = async (p = page) => {
    setLoading(true);
    try {
      const params = { page: p, limit };
      if (verified) params.verified = verified;
      if (citizenship !== "all") params.citizenship = citizenship;
      if (role !== "all") params.role = role;
      const data = await listUsers(params);
      if (data?.success) {
        setItems(data.items || []);
        setTotal(data.total || 0);
        setPage(data.page || 1);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verified, citizenship, role]);

  const openUser = async (u) => {
    const data = await getUserById(u._id);
    if (data?.success) setModalUser(data.user);
  };

  const toggleVerify = async (u) => {
    const res = await verifyUser(u._id, !u.verified);
    if (res?.success) {
      setModalUser((m) => (m && m._id === u._id ? res.user : m));
      load();
    }
  };

  const doUpload = async () => {
    if (!modalUser?._id) return;
    if (!docType) return alert("Select a document type");
    setUploading(true);
    try {
      const res = await uploadUserDoc(modalUser._id, {
        type: docType,
        value: docValue,
        file,
      });
      if (res?.success) {
        setModalUser(res.user);
        setDocValue("");
        setFile(null);
        load();
      } else {
        alert(res?.message || "Upload failed");
      }
    } catch (e) {
      alert(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Verification</label>
          <select
            value={verified}
            onChange={(e) => setVerified(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="">All</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Citizenship</label>
          <select
            value={citizenship}
            onChange={(e) => setCitizenship(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="all">All</option>
            <option value="indian">Indian</option>
            <option value="foreigner">Foreigner</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="all">All</option>
            <option value="peer-owner">Owner</option>
            <option value="renter">Renter</option>
          </select>
        </div>

        <button className="ml-auto px-3 py-1 rounded bg-gray-200" onClick={() => load()} disabled={loading}>
          Refresh
        </button>
      </div>

      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2">User</th>
              <th className="text-left p-2">Contact</th>
              <th className="text-left p-2">Role</th>
              <th className="text-left p-2">Verified</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u._id} className="border-t">
                <td className="p-2">
                  <div className="font-medium">{u.name || u.fullName || u.username || "-"}</div>
                  <div className="text-xs text-gray-500">{new Date(u.createdAt).toLocaleString()}</div>
                  {(u.Citizenship || u.citizenship || u.nationality) && (
                    <div className="mt-1 text-[11px] text-gray-600">
                      Citizenship: {u.Citizenship || u.citizenship || u.nationality}
                    </div>
                  )}
                </td>
                <td className="p-2">
                  <div className="text-xs">{u.email || "-"}</div>
                  <div className="text-xs">{u.phone || "-"}</div>
                </td>
                <td className="p-2 capitalize">{u.role}</td>
                <td className="p-2">{u.verified ? "Yes" : "No"}</td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <button className="px-2 py-1 rounded bg-indigo-600 text-white" onClick={() => openUser(u)}>
                      View
                    </button>
                    <button className="px-2 py-1 rounded bg-emerald-600 text-white" onClick={() => toggleVerify(u)}>
                      {u.verified ? "Unverify" : "Verify"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-sm text-gray-500">
                  {loading ? "Loading..." : "No users"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalUser && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl p-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <div className="text-lg font-semibold">
                  {modalUser.name || modalUser.fullName || modalUser.username || "-"}
                </div>
                <div className="text-xs text-gray-600">
                  {modalUser.email || "-"} • {modalUser.phone || "-"} • {modalUser.role}
                </div>
                {(modalUser.Citizenship || modalUser.citizenship || modalUser.nationality) && (
                  <div className="text-xs text-gray-600">
                    Citizenship: {modalUser.Citizenship || modalUser.citizenship || modalUser.nationality}
                  </div>
                )}
              </div>
              <button className="text-gray-600" onClick={() => setModalUser(null)}>
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <DocRow label="Aadhar" value={modalUser.document?.Aadhar} url={modalUser.document?.Aadhar_URL} />
              <DocRow label="PAN" value={modalUser.document?.PAN} url={modalUser.document?.PAN_URL} />
              <DocRow
                label="Driving License"
                value={modalUser.document?.Driving_License}
                url={modalUser.document?.Driving_License_URL}
              />
              <DocRow label="Passport" value={modalUser.document?.Passport} url={modalUser.document?.Passport_URL} />
            </div>

            <div className="mt-4 border-t pt-3">
              <div className="font-medium mb-2">Upload/Update document</div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                <div>
                  <label className="text-xs text-gray-600">Type</label>
                  <select className="w-full border rounded px-2 py-2 text-sm" value={docType} onChange={(e) => setDocType(e.target.value)}>
                    <option>Aadhar</option>
                    <option>PAN</option>
                    <option>Driving_License</option>
                    <option>Passport</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600">Number (optional)</label>
                  <input
                    className="w-full border rounded px-2 py-2 text-sm"
                    value={docValue}
                    onChange={(e) => setDocValue(e.target.value)}
                    placeholder="Enter document number"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">File</label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="w-full border rounded px-2 py-1.5 text-sm"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={doUpload}
                    disabled={uploading}
                    className="px-3 py-2 rounded bg-indigo-600 text-white text-sm disabled:opacity-60"
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                  <button
                    onClick={() => {
                      setDocValue("");
                      setFile(null);
                    }}
                    className="px-3 py-2 rounded bg-gray-200 text-sm"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                className={`px-3 py-2 rounded text-white text-sm ${modalUser.verified ? "bg-emerald-600" : "bg-gray-400"}`}
                onClick={() => toggleVerify(modalUser)}
              >
                {modalUser.verified ? "Mark Unverified" : "Mark Verified"}
              </button>
              <button className="px-3 py-2 rounded bg-gray-200 text-sm" onClick={() => setModalUser(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-sm">
        <div>
          Page {page}, showing {items.length} of {total}
        </div>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
            onClick={() => load(page - 1)}
          >
            Prev
          </button>
          <button
            disabled={page * limit >= total}
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
            onClick={() => load(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
