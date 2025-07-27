import { MdAdd, MdDirectionsCar } from "react-icons/md";
import { useState, useEffect } from "react";
import ListCar from "./ListCar";
import { fetchOwner } from "../../services/owner";

function Topbar() {
  const [cars, setCars] = useState([]);
  const [showListCar, setShowListCar] = useState(false);
  const [ownerName, setOwnerName] = useState("");

  useEffect(() => {
    const fetchCars = async () => {
      const token = localStorage.getItem("token");
      if (!token) return alert("Authentication token not found");

      try {
        const res = await fetch("http://localhost:5000/api/cars/mycars", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok && data.success) {
          const carsWithImages = data.cars.map((car) => ({
            ...car,
            images: car.image || [],
          }));
          setCars(carsWithImages);
        } else {
          alert(data.message || "Failed to fetch cars");
        }
      } catch (err) {
        console.error(err);
        alert("Error fetching cars");
      }
    };
    fetchCars();

    fetchOwner().then((ownerName) => {
      if (ownerName) setOwnerName(ownerName);
    });
  }, []);

  return (
    <>
      <div className="bg-white rounded-xl shadow flex flex-col md:flex-row md:items-center md:justify-between p-6 mb-6 shadow-md ml-3 mr-3">
        <div>
          <h1 className="text-2xl font-bold mb-1">Welcome, {ownerName}!</h1>
          <p className="text-base text-gray-700">
            Keep up the great work! Your cars are helping&nbsp; people travel
          </p>
        </div>
        <div className="flex flex-col md:items-end gap-2 mt-4 md:mt-0">
          <button
            className="flex items-center gap-2 bg-[#2f1c53] hover:bg-[#3d3356] text-white font-medium text-sm px-3 py-2 rounded-lg shadow transition"
            onClick={() => setShowListCar(true)}
          >
            <MdAdd size={20} />
            List A new Car
          </button>
          <span className="flex items-center gap-2 text-gray-800 text-sm mt-1 md:mt-0">
            <MdDirectionsCar size={20} />
            {cars.length} Active Listing
          </span>
        </div>
      </div>
      {showListCar && (
        <ListCar
          onCarAdded={(car) => setCars((prev) => [...prev, car])}
          onClose={() => setShowListCar(false)}
        />
      )}
    </>
  );
}

export default Topbar;