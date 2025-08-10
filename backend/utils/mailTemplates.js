export const buildCarCreatedEmail = ({
  appName,
  userName,
  car,
  firstImage,
}) => {
  const price = car.pricePerDay != null ? `₹${car.pricePerDay}` : "-";
  const title = car.title || `${car.brand || ""} ${car.model || ""}`.trim();
  const loc = [
    car.location?.addressLine,
    car.location?.area,
    car.location?.city,
    car.location?.state,
  ]
    .filter(Boolean)
    .join(", ");

  const row = (k, v) =>
    `<tr><td style="padding:6px 10px;color:#666">${k}</td><td style="padding:6px 10px;color:#111;font-weight:600">${
      v || "-"
    }</td></tr>`;

  return `
  <div style="font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f7f7fb;padding:20px">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #eee;overflow:hidden">
      <tr>
        <td style="padding:16px 18px;border-bottom:1px solid #f0f0f0">
          <div style="float:right"><span style="display:inline-block;padding:6px 10px;border:1px solid #ddd;border-radius:999px;font-size:12px;color:#333">${appName}</span></div>
          <h2 style="margin:0;font-size:18px;color:#222">Car Listed Successfully</h2>
          <div style="font-size:13px;color:#666;margin-top:4px">Hello ${
            userName || "Owner"
          }, your car has been added to listings.</div>
        </td>
      </tr>
      <tr>
        <td style="padding:18px">
          <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">
            <tr>
              <td style="width:160px;vertical-align:top;padding-right:16px">
                ${
                  firstImage
                    ? `<img src="${firstImage}" alt="Car" style="width:160px;height:120px;object-fit:cover;border:1px solid #eee;border-radius:8px" />`
                    : `<div style="width:160px;height:120px;background:#f0f0f0;border:1px solid #eee;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#999;font-size:12px">No Image</div>`
                }
              </td>
              <td style="vertical-align:top">
                <table width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #f2f2f2;border-radius:8px">
                  ${row("Title", title)}
                  ${row("Brand", car.brand)}
                  ${row("Model", car.model)}
                  ${row("Year", car.year)}
                  ${row("Car Number", car.carnumber)}
                  ${row("Fuel", car.fuelType)}
                  ${row("Transmission", car.transmission)}
                  ${row("Seats", car.seats)}
                  ${row("Price/Day", price)}
                  ${row("Location", loc)}
                </table>
                <div style="margin-top:10px;font-size:12px;color:#666">Your car is now visible to renters based on availability and search filters.</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:14px 18px;background:#fafafa;border-top:1px solid #f0f0f0;font-size:11px;color:#888">
          © ${new Date().getFullYear()} ${appName}. This is an automated notification.
        </td>
      </tr>
    </table>
  </div>`;
};

export const buildCarDeletedEmail = ({
  appName,
  userName,
  car,
  firstImage,
}) => {
  const docs = car.documents || {};
  const price = car.pricePerDay != null ? `₹${car.pricePerDay}` : "-";
  const title = car.title || `${car.brand || ""} ${car.model || ""}`.trim();
  const loc = [
    car.location?.addressLine,
    car.location?.area,
    car.location?.city,
    car.location?.state,
  ]
    .filter(Boolean)
    .join(", ");

  const row = (k, v) =>
    `<tr><td style="padding:6px 10px;color:#666">${k}</td><td style="padding:6px 10px;color:#111;font-weight:600">${
      v || "-"
    }</td></tr>`;

  return `
  <div style="font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f7f7fb;padding:20px">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #eee;overflow:hidden">
      <tr>
        <td style="padding:16px 18px;border-bottom:1px solid #f0f0f0">
          <div style="float:right"><span style="display:inline-block;padding:6px 10px;border:1px solid #ddd;border-radius:999px;font-size:12px;color:#333">${appName}</span></div>
          <h2 style="margin:0;font-size:18px;color:#222">Car Listing Deleted</h2>
          <div style="font-size:13px;color:#666;margin-top:4px">Hello ${
            userName || "Owner"
          }, your car has been removed from listings.</div>
        </td>
      </tr>
      <tr>
        <td style="padding:18px">
          <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">
            <tr>
              <td style="width:160px;vertical-align:top;padding-right:16px">
                ${
                  firstImage
                    ? `<img src="${firstImage}" alt="Car" style="width:160px;height:120px;object-fit:cover;border:1px solid #eee;border-radius:8px" />`
                    : `<div style="width:160px;height:120px;background:#f0f0f0;border:1px solid #eee;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#999;font-size:12px">No Image</div>`
                }
              </td>
              <td style="vertical-align:top">
                <table width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #f2f2f2;border-radius:8px">
                  ${row("Title", title)}
                  ${row("Brand", car.brand)}
                  ${row("Model", car.model)}
                  ${row("Year", car.year)}
                  ${row("Car Number", car.carnumber)}
                  ${row("Fuel", car.fuelType)}
                  ${row("Transmission", car.transmission)}
                  ${row("Seats", car.seats)}
                  ${row("Price/Day", price)}
                  ${row("Location", loc)}
                </table>
                ${
                  Object.keys(docs).length
                    ? `<div style="margin-top:10px;font-size:12px;color:#666">
                        Documents on file:
                        <ul style="margin:6px 0 0 18px;color:#444">
                          ${docs.rc ? `<li>RC</li>` : ""}
                          ${docs.insurance ? `<li>Insurance</li>` : ""}
                          ${docs.pollution ? `<li>Pollution</li>` : ""}
                        </ul>
                      </div>`
                    : ""
                }
              </td>
            </tr>
          </table>
          <p style="font-size:12px;color:#777;margin-top:14px">
            If this was unintentional, you can re‑add your car anytime from your dashboard.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:14px 18px;background:#fafafa;border-top:1px solid #f0f0f0;font-size:11px;color:#888">
          © ${new Date().getFullYear()} ${appName}. This is an automated notification.
        </td>
      </tr>
    </table>
  </div>`;
};
