import React from "react";
import jsPDF from "jspdf";
import logo from "../../assets/car.png";

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

const upscaleCloudinary = (url, w = 1600) => {
  if (!url?.includes("res.cloudinary.com") || !url.includes("/image/upload/"))
    return url;
  return url.replace("/image/upload/", `/image/upload/w_${w},q_auto:best/`);
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
  const dataUrl = canvas.toDataURL(isPng ? "image/png" : "image/jpeg", quality);
  URL.revokeObjectURL(objectUrl);
  return { dataUrl, width: dw, height: dh };
};

function CarDetailsModal({ car, onClose }) {
  const handleDownloadPDF = async () => {
    if (!car) return;
    const COMPANY_LOGO_URL = logo;

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
      const drawW = 56;
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

    // HEADER
    drawLogoTopRight();
    doc.setFontSize(18);
    doc.text("Car Details", pageW / 2, margin + 12, { align: "center" });

    const startY = margin + 40;
    const gapX = 16;
    const photoTargetW = Math.min(280, contentW * 0.4);
    const leftW = contentW - photoTargetW - gapX;
    const leftX = margin;
    const rightX = margin + leftW + gapX;

    const carImgUrl =
      car.images?.[0] || (Array.isArray(car.image) ? car.image[0] : car.image);
    if (carImgUrl) {
      try {
        const highResUrl = upscaleCloudinary(carImgUrl, 1600);
        const { dataUrl, width, height } = await loadAndEncodeImage(
          highResUrl,
          {
            maxW: photoTargetW * 2,
            maxH: 320 * 2,
            format: "png",
            smoothing: true,
          }
        );

        let drawW = Math.min(photoTargetW, width);
        let drawH = (height / width) * drawW;
        const maxH = 320;
        if (drawH > maxH) {
          const s = maxH / drawH;
          drawW *= s;
          drawH *= s;
        }
        doc.addImage(dataUrl, "PNG", rightX, startY, drawW, drawH);
      } catch {}
    }

    const entries = [
      ["Brand", car.brand],
      ["Model", car.model],
      ["Year", car.year],
      ["Car Number", car.carnumber],
      ["Fuel Type", car.fuelType],
      ["Transmission", car.transmission],
      ["Seats", car.seats],
      [
        "Price Per Day",
        car.pricePerDay != null ? `Rs.${car.pricePerDay}` : "-",
      ],
    ];

    const colGap = 12;
    const colW = Math.floor((leftW - colGap) / 2);
    const col1 = entries.slice(0, Math.ceil(entries.length / 2));
    const col2 = entries.slice(Math.ceil(entries.length / 2));

    const drawCol = (items, x, y0) => {
      let y = y0;
      doc.setFontSize(12);
      const lh = 18;
      for (const [k, v] of items) {
        const line = `${k}: ${v ?? "-"}`;
        const wrapped = doc.splitTextToSize(line, colW);
        wrapped.forEach((w) => {
          doc.text(w, x, y);
          y += lh;
        });
      }
      return y;
    };

    const y1 = drawCol(col1, leftX, startY);
    const y2 = drawCol(col2, leftX + colW + colGap, startY);
    let yBelow = Math.max(y1, y2) + 8;

    // Description (full left width)
    if (car.description) {
      doc.setFontSize(12);
      const descLines = doc.splitTextToSize(
        `Description: ${car.description}`,
        leftW
      );
      descLines.forEach((ln) => {
        if (yBelow > pageH - bottomSafe) {
          doc.addPage();
          drawLogoTopRight();
          yBelow = margin;
        }
        doc.text(ln, leftX, yBelow);
        yBelow += 18;
      });
    }

    // Location (full left width)
    if (car.location) {
      const loc = [
        car.location.addressLine,
        car.location.area,
        car.location.city,
        car.location.state,
        car.location.country,
        car.location.pincode,
      ]
        .filter(Boolean)
        .join(", ");
      const locLines = doc.splitTextToSize(`Location: ${loc}`, leftW);
      locLines.forEach((ln) => {
        if (yBelow > pageH - bottomSafe) {
          doc.addPage();
          drawLogoTopRight();
          yBelow = margin;
        }
        doc.text(ln, leftX, yBelow);
        yBelow += 18;
      });
    }
    const addDocPreview = async (label, url) => {
      if (!url) return;
      doc.addPage();
      drawLogoTopRight();
      let dy = margin;
      doc.setFontSize(16);
      doc.text(label, pageW / 2, dy, { align: "center" });
      dy += 16;

      const previewUrl = toPreviewImageUrl(url) || url;
      try {
        const loaded = await loadAndEncodeImage(previewUrl, {
          format: "png",
          smoothing: false,
        });
        let drawW = contentW;
        let drawH = (loaded.height / loaded.width) * drawW;
        const maxH = pageH - margin - bottomSafe - (dy - margin);
        if (drawH > maxH) {
          const s = maxH / drawH;
          drawW *= s;
          drawH *= s;
        }
        const x = margin + (contentW - drawW) / 2;
        doc.addImage(loaded.dataUrl, "PNG", x, dy, drawW, drawH);
      } catch {
        doc.setFontSize(10);
        doc.text("(Preview failed)", pageW / 2, dy + 12, { align: "center" });
      }
    };

    await addDocPreview("RC", car.documents?.rc);
    await addDocPreview("Insurance", car.documents?.insurance);
    await addDocPreview("Pollution", car.documents?.pollution);

    // Terms last page
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
        "You confirm all car details and documents provided are accurate and valid.",
        "Vehicle must be maintained in roadworthy condition with current RC, Insurance, and PUC.",
        "Renter is responsible for fuel, tolls, fines, penalties and late fees unless otherwise agreed.",
        "Report accidents/damages/theft immediately to the platform and authorities.",
        "Unauthorized modifications or repairs during rental are prohibited.",
        "Data is processed per Privacy Policy; you consent to such processing.",
        "Cancellations/refunds/disputes follow platform policies.",
        "Agreement governed by applicable local laws.",
        "By listing your car, you accept these Terms & Conditions.",
      ];
      const bullet = "•";
      const lineGap = 14;
      const contentW2 = pageW - margin * 2;

      terms.forEach((t) => {
        const wrapped = doc.splitTextToSize(`${bullet} ${t}`, contentW2);
        if (ty + wrapped.length * lineGap > pageH - bottomSafe) {
          doc.addPage();
          drawLogoTopRight();
          ty = margin;
        }
        wrapped.forEach((line) => {
          doc.text(line, margin, ty);
          ty += lineGap;
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

    const sigUrl = car.documents?.signature || car.signature;
    if (sigUrl) {
      try {
        const loaded = await loadAndEncodeImage(sigUrl, {
          format: "png",
          smoothing: true,
        });
        const sigW = 150;
        const sigH = (loaded.height / loaded.width) * sigW;
        const x = pageW - margin - sigW;
        const y = pageH - bottomSafe - 90;
        doc.addImage(loaded.dataUrl, "PNG", x, y, sigW, sigH);
        doc.setFontSize(10);
        doc.text("Owner Signature", x + sigW / 2 + 4, y + sigH - 20, {
          align: "center",
        });
      } catch {}
    }

    doc.save(`${car.brand || "Car"}_${car.model || ""}_details.pdf`);
  };

  const firstImage =
    (car.images && car.images[0]) ||
    (Array.isArray(car.image) ? car.image[0] : car.image) ||
    "https://via.placeholder.com/256x192?text=Car";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onMouseDown={onClose}
    >
      <div
        className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#2F2240]">Car Details</h2>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadPDF}
              className="bg-[#2F2240] text-white px-3 py-2 rounded-lg font-semibold hover:bg-[#1c1128]"
            >
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Wrap image with fixed box sizes per breakpoint */}
          <div className="shrink-0 self-center md:self-start">
            <div className="w-56 h-40 sm:w-64 sm:h-44 md:w-72 md:h-48 rounded-xl overflow-hidden border bg-gray-50">
              <img
                src={firstImage}
                alt={car.model}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
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
              <span className="font-semibold">Price Per Day:</span> ₹
              {car.pricePerDay}
            </div>
            <div className="sm:col-span-2">
              <span className="font-semibold">Location:</span>{" "}
              {car.location?.addressLine}, {car.location?.area},{" "}
              {car.location?.city}, {car.location?.state},{" "}
              {car.location?.country} - {car.location?.pincode}
            </div>
            <div className="sm:col-span-2">
              <span className="font-semibold">Description:</span>{" "}
              {car.description}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold mb-2">Documents</h3>
          <div className="flex flex-wrap gap-3">
            {car.documents?.rc && (
              <a
                className="bg-[#f7f6fa] border px-4 py-2 rounded-lg text-[#2F2240] font-medium hover:bg-[#ecebee]"
                href={car.documents.rc}
                target="_blank"
                rel="noopener noreferrer"
                download
              >
                Download RC
              </a>
            )}
            {car.documents?.insurance && (
              <a
                className="bg-[#f7f6fa] border px-4 py-2 rounded-lg text-[#2F2240] font-medium hover:bg-[#ecebee]"
                href={car.documents.insurance}
                target="_blank"
                rel="noopener noreferrer"
                download
              >
                Download Insurance
              </a>
            )}
            {car.documents?.pollution && (
              <a
                className="bg-[#f7f6fa] border px-4 py-2 rounded-lg text-[#2F2240] font-medium hover:bg-[#ecebee]"
                href={car.documents.pollution}
                target="_blank"
                rel="noopener noreferrer"
                download
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

export default CarDetailsModal;