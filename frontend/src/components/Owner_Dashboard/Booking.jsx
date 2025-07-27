import React from "react";
import { BsFilter } from "react-icons/bs";
import Topbar from "./Topbar";

const carStatus = [
  {
    carnumber: "6465",
    driver: { name: "Alex Noman", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
    status: "Completed",
    earning: 35.44,
  },
  {
    carnumber: "5665",
    driver: { name: "Razib Rahman", avatar: "https://randomuser.me/api/portraits/men/45.jpg" },
    status: "Pending",
    earning: 0,
  },
  {
    carnumber: "1755",
    driver: { name: "Luke Norton", avatar: "https://randomuser.me/api/portraits/men/65.jpg" },
    status: "In route",
    earning: 23.5,
  },
];

const statusStyles = {
  Completed: "bg-green-500",
  Pending: "bg-purple-800",
  "In route": "bg-red-500",
};

const statusText = {
  Completed: "text-green-700",
  Pending: "text-purple-800",
  "In route": "text-red-600",
};

function Booking() {
  return (
    <div>
      <Topbar />
    <div className="bg-white rounded-xl shadow p-6 mt-6 ml-3 mr-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Live Car Status</h2>
        <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm">
          <BsFilter /> Filter
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-gray-500 font-semibold border-b">
              <th className="py-2 px-3 text-left">No.</th>
              <th className="py-2 px-3 text-left">Car no.</th>
              <th className="py-2 px-3 text-left">Renter</th>
              <th className="py-2 px-3 text-left">Status</th>
              <th className="py-2 px-3 text-left">Earning</th>
              <th className="py-2 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {carStatus.map((row, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="py-2 px-3">{(idx + 1).toString().padStart(2, "0")}</td>
                <td className="py-2 px-3">
                  <span className="bg-gray-100 px-3 py-1 rounded font-semibold shadow text-gray-700">
                    {row.carnumber}
                  </span>
                </td>
                <td className="py-2 px-3 flex items-center gap-2">
                  <img
                    src={row.driver.avatar}
                    alt={row.driver.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <span className="font-medium">{row.driver.name}</span>
                </td>
                <td className="py-2 px-3">
                  <span className={`flex items-center gap-2 font-semibold ${statusText[row.status]}`}>
                    <span className={`w-3 h-3 rounded-full ${statusStyles[row.status]}`}></span>
                    {row.status}
                  </span>
                </td>
                <td className="py-2 px-3 font-semibold">${row.earning.toFixed(2)}</td>
                <td className="py-2 px-3">
                  <button className="bg-[#2f1c53] hover:bg-[#3d3356] text-white px-5 py-2 rounded font-medium text-sm shadow">
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}

export default Booking;