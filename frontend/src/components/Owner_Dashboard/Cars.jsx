import React, { useState, useEffect } from "react";
import Topbar from "./Topbar";
import { MdWarningAmber, MdEdit, MdAdd } from "react-icons/md";
import { FaStar } from "react-icons/fa";
import jsPDF from "jspdf";
import logo from "../../assets/car.png";

function CarDetailsModal({ car, onClose }) {
  const COMPANY_LOGO_URL = logo;

  const toPreviewImageUrl = (url) => {
    if (!url) return null;
    if (/\.(png|jpg|jpeg|gif|webp)$/i.test(url)) return url;
    const isCloudinaryPdf =
      /\.pdf(\?.*)?$/i.test(url) &&
      url.includes("res.cloudinary.com") &&
      url.includes("/image/upload/");
    if (isCloudinaryPdf) {
      return url.replace(
        "/image/upload/",
        "/image/upload/pg_1,f_png,w_2480,c_fit/"
      );
    }
    return null;
  };

  const loadAndEncodeImage = async (
    url,
    { maxW, maxH, format = "jpeg", quality = 0.8, smoothing = true } = {}
  ) => {
    const res = await fetch(url, { mode: "cors" });
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = objectUrl;
    });

    let dw = img.width;
    let dh = img.height;
    if (maxW || maxH) {
      const sW = maxW ? maxW / dw : 1;
      const sH = maxH ? maxH / dh : 1;
      const s = Math.min(sW || 1, sH || 1, 1);
      dw = Math.max(1, Math.floor(dw * s));
      dh = Math.max(1, Math.floor(dh * s));
    }

    const canvas = document.createElement("canvas");
    canvas.width = dw;
    canvas.height = dh;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = smoothing;
    ctx.drawImage(img, 0, 0, dw, dh);

    const isPng = format === "png";
    const dataUrl = canvas.toDataURL(
      isPng ? "image/png" : "image/jpeg",
      quality
    );
    URL.revokeObjectURL(objectUrl);
    return { dataUrl, width: dw, height: dh };
  };

  const handleDownloadPDF = async () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 40;
    const contentW = pageW - margin * 2;
    const bottomSafe = 40;

    let logoImg = null;
    try {
      logoImg = await loadAndEncodeImage(COMPANY_LOGO_URL, {
        format: "png",
        smoothing: true,
      });
    } catch {}

    const drawLogoTopRight = () => {
      if (!logoImg) return;
      const drawW = 56; // small size (pt)
      const drawH = (logoImg.height / logoImg.width) * drawW;
      doc.addImage(
        logoImg.dataUrl,
        "PNG",
        pageW - margin - drawW,
        margin - 22,
        drawW,
        drawH
      );
    };

    drawLogoTopRight();
    doc.setFontSize(18);
    doc.text("Car Details", pageW / 2, margin + 12, { align: "center" });

    // Details
    let y = 100;
    const gap = 20;
    doc.setFontSize(12);
    doc.text(`Brand: ${car.brand || ""}`, margin, y);
    y += gap;
    doc.text(`Model: ${car.model || ""}`, margin, y);
    y += gap;
    doc.text(`Year: ${car.year || ""}`, margin, y);
    y += gap;
    doc.text(`Car Number: ${car.carnumber || ""}`, margin, y);
    y += gap;
    doc.text(`Fuel Type: ${car.fuelType || ""}`, margin, y);
    y += gap;
    doc.text(`Transmission: ${car.transmission || ""}`, margin, y);
    y += gap;
    doc.text(`Seats: ${car.seats || ""}`, margin, y);
    y += gap;
    doc.text(`Price Per Day: Rs.${car.pricePerDay ?? ""}`, margin, y);
    y += gap;
    if (car.description) {
      doc.text(`Description: ${car.description}`, margin, y);
      y += gap;
    }
    if (car.location) {
      doc.text(
        `Location: ${car.location.addressLine || ""}, ${
          car.location.area || ""
        }, ${car.location.city || ""}, ${car.location.state || ""}, ${
          car.location.country || ""
        } - ${car.location.pincode || ""}`,
        margin,
        y
      );
      y += gap;
    }

    // Car photo
    const carImgUrl =
      car.images?.[0] || (Array.isArray(car.image) ? car.image[0] : car.image);
    if (carImgUrl) {
      try {
        const { dataUrl, width, height } = await loadAndEncodeImage(carImgUrl, {
          maxW: 220,
          maxH: 150,
          format: "jpeg",
          quality: 0.85,
          smoothing: true,
        });
        doc.addImage(
          dataUrl,
          "JPEG",
          pageW - margin - width,
          95,
          width,
          height
        );
      } catch {}
    }

    // Documents
    y += 120;
    doc.setFontSize(20);
    doc.text("Documents", margin, y);
    y += 6;

    const addDocPreview = async (label, url) => {
      if (!url) return;
      doc.addPage();
      drawLogoTopRight();
      y = margin;

      doc.setFontSize(16);
      doc.text(label, pageW / 2, y, { align: "center" });
      y += 10;

      const previewUrl = toPreviewImageUrl(url) || url;
      try {
        const loaded = await loadAndEncodeImage(previewUrl, {
          format: "png",
          smoothing: false,
        });

        let drawW = contentW;
        let drawH = (loaded.height / loaded.width) * drawW;

        const maxH = pageH - margin - bottomSafe - (y - margin);
        if (drawH > maxH) {
          const s = maxH / drawH;
          drawW *= s;
          drawH *= s;
        }

        const x = margin + (contentW - drawW) / 2;
        doc.addImage(loaded.dataUrl, "PNG", x, y, drawW, drawH);
        y += drawH;
      } catch {
        doc.setFontSize(10);
        doc.text("(Preview failed)", pageW / 2, y + 12, { align: "center" });
      }
    };

    await addDocPreview("RC", car.documents?.rc);
    await addDocPreview("Insurance", car.documents?.insurance);
    await addDocPreview("Pollution", car.documents?.pollution);

    const addTermsPage = () => {
      doc.addPage();
      drawLogoTopRight();

      let ty = margin + 30;
      try {
        doc.setFont("helvetica", "bold");
      } catch {}
      doc.setFontSize(20);
      doc.text("Terms & Conditions", pageW / 2, ty, { align: "center" });
      try {
        doc.setFont("helvetica", "normal");
      } catch {}
      ty += 22;

      doc.setFontSize(12);

      const terms = [
        "You confirm all car details and documents provided are accurate and valid. Any falsified information may lead to delisting.",
        "Vehicle must be maintained in roadworthy condition with current Registration Certificate (RC), Insurance, and Pollution Under Control (PUC) documents.",
        "You agree to install and keep an active GPS tracker for security and recovery purposes. You consent to location tracking during rentals.",
        "Fuel, mileage limits, late return fees, cleaning fees, tolls, fines, and penalties are the renter’s responsibility unless otherwise agreed.",
        "Any mechanical issues must be reported immediately. Unauthorized modifications or repairs during rental are prohibited.",
        "Accidents, damages, or theft during rental must be reported to the platform and local authorities as applicable.",
        "You consent to the platform storing and processing your vehicle and personal data in accordance with our Privacy Policy.",
        "Cancellations, refunds, and dispute handling are governed by platform policies in effect at the time of rental.",
        "This agreement is governed by applicable local laws. Parties agree to cooperate with lawful requests from authorities.",
        "By listing your car, you acknowledge and accept these Terms & Conditions.",
      ];

      const gap = 14;
      const bullet = "•";
      terms.forEach((t) => {
        const wrapped = doc.splitTextToSize(`${bullet} ${t}`, contentW);
        if (ty + wrapped.length * gap > pageH - bottomSafe) {
          doc.addPage();
          drawLogoTopRight();
          ty = margin;
        }
        wrapped.forEach((line) => {
          doc.text(line, margin, ty);
          ty += gap;
        });
        ty += 2;
      });

      if (ty + 40 > pageH - bottomSafe) {
        doc.addPage();
        drawLogoTopRight();
        ty = margin;
      }
      doc.setFontSize(10);
      doc.text(
        "I have read and agree to the Terms & Conditions stated above.",
        margin,
        ty + 10
      );
    };
    addTermsPage();

    // Signature
    const sigUrl = car.documents?.signature || car.signature;
    if (sigUrl) {
      try {
        const { dataUrl, width, height } = await loadAndEncodeImage(sigUrl, {
          maxW: 180,
          maxH: 70,
          format: "png",
          smoothing: true,
        });
        if (y + height + 30 > pageH - bottomSafe) {
          doc.addPage();
          drawLogoTopRight();
          y = margin;
        }
        doc.addImage(
          dataUrl,
          "PNG",
          pageW - margin - width,
          pageH - bottomSafe - height - 8,
          width,
          height
        );
        doc.setFontSize(10);
        doc.text(
          "Owner Signature",
          pageW - margin - 110,
          pageH - bottomSafe + 8
        );
      } catch {}
    }

    doc.save(`${car.brand || "Car"}_${car.model || ""}_details.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl text-gray-500"
        >
          &times;
        </button>
        <button
          onClick={handleDownloadPDF}
          className="absolute top-4 left-4 bg-[#2F2240] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#1c1128]"
        >
          Download PDF
        </button>
        <h2 className="text-2xl font-bold mb-4 text-[#2F2240]">Car Details</h2>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Car Image */}
          <div className="flex-shrink-0">
            <img
              src={
                car.images && car.images.length > 0
                  ? car.images[0]
                  : "https://via.placeholder.com/128x128?text=Car"
              }
              alt={car.model}
              className="w-32 h-32 rounded-xl object-cover border border-gray-200"
            />
          </div>
          {/* Car Info */}
          <div className="flex-1 space-y-2">
            <div>
              <span className="font-semibold">Brand:</span> {car.brand}
            </div>
            <div>
              <span className="font-semibold">Model:</span> {car.model}
            </div>
            <div>
              <span className="font-semibold">Year:</span> {car.year}
            </div>
            <div>
              <span className="font-semibold">Car Number:</span> {car.carnumber}
            </div>
            <div>
              <span className="font-semibold">Fuel Type:</span> {car.fuelType}
            </div>
            <div>
              <span className="font-semibold">Transmission:</span>{" "}
              {car.transmission}
            </div>
            <div>
              <span className="font-semibold">Seats:</span> {car.seats}
            </div>
            <div>
              <span className="font-semibold">Description:</span>{" "}
              {car.description}
            </div>
            <div>
              <span className="font-semibold">Location:</span>{" "}
              {car.location?.addressLine}, {car.location?.area},{" "}
              {car.location?.city}, {car.location?.state},{" "}
              {car.location?.country} - {car.location?.pincode}
            </div>
            <div>
              <span className="font-semibold">Price Per Day:</span> ₹
              {car.pricePerDay}
            </div>
            <div>
              <span className="font-semibold">Rating:</span>{" "}
              {car.rating || "4.5"}
            </div>
          </div>
        </div>
        {/* Documents */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Documents :</h3>
          <div className="flex flex-wrap gap-4">
            {car.documents?.rc && (
              <a
                href={car.documents.rc}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="bg-[#f7f6fa] border px-4 py-2 rounded-lg text-[#2F2240] font-medium hover:bg-[#ecebee] transition"
              >
                Download RC
              </a>
            )}
            {car.documents?.insurance && (
              <a
                href={car.documents.insurance}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="bg-[#f7f6fa] border px-4 py-2 rounded-lg text-[#2F2240] font-medium hover:bg-[#ecebee] transition"
              >
                Download Insurance
              </a>
            )}
            {car.documents?.pollution && (
              <a
                href={car.documents.pollution}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="bg-[#f7f6fa] border px-4 py-2 rounded-lg text-[#2F2240] font-medium hover:bg-[#ecebee] transition"
              >
                Download Pollution
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Cars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);

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
      setLoading(false);
    };
    fetchCars();
  }, []);

  // Handle Maintenance button click
  const handleMaintenance = async (carId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:5000/api/cars/${carId}/availability`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ available: false }),
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setCars((prev) =>
          prev.map((car) =>
            car._id === carId ? { ...car, availability: false } : car
          )
        );
      } else {
        alert(data.message || "Failed to update availability");
      }
    } catch (err) {
      alert("Error updating availability");
    }
  };

  // Handle List Car button click
  const handleListCar = async (carId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:5000/api/cars/${carId}/availability`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ available: true }),
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setCars((prev) =>
          prev.map((car) =>
            car._id === carId ? { ...car, availability: true } : car
          )
        );
      } else {
        alert(data.message || "Failed to update availability");
      }
    } catch (err) {
      alert("Error updating availability");
    }
  };

  return (
    <div>
      <Topbar />
      <div className="mt-8 md:mt-10 ml-3 mr-3">
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center bg-white shadow-md rounded-xl px-4 py-3 animate-pulse"
              >
                <div className="w-16 h-16 rounded-full bg-gray-200" />
                <div className="flex-1 ml-4 min-w-0">
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="flex gap-2">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-4 bg-gray-100 rounded w-24 mt-2"></div>
                </div>
                <div className="h-8 w-20 bg-gray-200 rounded ml-4"></div>
                <div className="h-8 w-28 bg-gray-100 rounded ml-4"></div>
              </div>
            ))
          ) : cars.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No cars listed yet.
            </div>
          ) : (
            cars.map((car, idx) => (
              <div
                key={car._id || idx}
                className="flex items-center bg-white shadow-md rounded-xl shadow px-4 py-3 cursor-pointer hover:ring-2 hover:ring-[#2F2240]/30 transition"
                onClick={() => setSelectedCar(car)}
              >
                {/* Car Image */}
                <img
                  src={
                    car.images && car.images.length > 0
                      ? car.images[0]
                      : "https://via.placeholder.com/64x64?text=Car"
                  }
                  alt={car.model}
                  className="w-16 h-16 rounded-full object-cover border border-gray-200"
                />

                {/* Car Info */}
                <div className="flex-1 ml-4 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg text-gray-800 truncate">
                      {car.brand} {car.model}
                    </span>
                    <span className="flex items-center text-yellow-500 text-sm font-semibold ml-2">
                      <FaStar className="mr-1" />
                      {car.rating || "4.5"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex gap-2 flex-wrap mt-2">
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                      {car.transmission}
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                      {car.fuelType}
                    </span>
                    <div className="text-xs text-gray-600 mt-1">
                      <span className="font-medium">Car No:</span>{" "}
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                        {car.carnumber}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center flex-col gap-2 lg:flex-row">
                  <a
                    className="flex items-center gap-1 border border-[#2f1c53] text-white bg-[#2f2240] px-3 py-2 rounded-lg font-medium ml-4"
                    href={`/edit-car/${car._id}`}
                  >
                    <MdEdit className="text-lg" />
                    Edit
                  </a>

                  {/* Status Button */}
                  {car.availability !== false ? (
                    <button
                      className="flex items-center gap-1 border border-[#2f1c53] text-[#2f1c53] bg-[#f7f6f2] px-4 py-2 rounded-lg font-medium ml-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMaintenance(car._id);
                      }}
                    >
                      <MdWarningAmber className="text-lg" />
                      Maintenance
                    </button>
                  ) : (
                    <button
                      className="flex items-center gap-1 border border-[#2f1c53] text-[#2f1c53] bg-[#e6fbe6] px-4 py-2 rounded-lg font-medium ml-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleListCar(car._id);
                      }}
                    >
                      <MdAdd className="text-lg" />
                      Put On Rent
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Car Details Modal */}
      {selectedCar && (
        <CarDetailsModal
          car={selectedCar}
          onClose={() => setSelectedCar(null)}
        />
      )}
    </div>
  );
}

export default Cars;