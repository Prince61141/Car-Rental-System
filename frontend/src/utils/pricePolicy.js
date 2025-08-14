function computeMaxPrice({ brand = "", model = "", transmission = "", seats, year }) {
  const b = String(brand || "").toLowerCase().trim();
  const m = String(model || "").toLowerCase().trim();
  const trans = String(transmission || "").toLowerCase().trim();
  const s = Number(seats || 0);
  const y = Number(year || 0);
  const now = new Date().getFullYear();

  const economy = ["maruti", "maruti suzuki", "hyundai", "tata", "renault", "nissan", "datsun"];
  const mid = ["honda", "toyota", "kia", "mahindra", "skoda", "volkswagen", "mg"];
  const premium = ["bmw", "mercedes", "mercedes-benz", "audi", "volvo", "lexus", "jaguar", "porsche"];

  let base = 3000;
  if (economy.some((x) => b.includes(x))) base = 2000;
  else if (mid.some((x) => b.includes(x))) base = 3500;
  else if (premium.some((x) => b.includes(x))) base = 8000;

  let seatFactor = 1.0;
  if (s >= 7) seatFactor = 1.2;
  else if (s >= 6) seatFactor = 1.15;
  else if (s === 5) seatFactor = 1.05;

  const transFactor = trans === "automatic" ? 1.12 : 1.0;

  // Age adjustment
  const age = y && now ? Math.max(0, now - y) : 5;
  let ageFactor = 1.0;
  if (age <= 2) ageFactor = 1.15;
  else if (age <= 5) ageFactor = 1.0;
  else if (age <= 10) ageFactor = 0.9;
  else ageFactor = 0.8;

  const modelFactorTable = {
    maruti: {
      "jimny": 1.30,
      "grand vitara": 1.25,
      "vitara brezza": 1.16,
      "brezza": 1.16,
      "s-cross": 1.18,
      "xl6": 1.22,
      "ertiga": 1.18,
      "fronx turbo": 1.20,
      "fronx": 1.12,
      "baleno rs": 1.18,
      "swift sport": 1.25,
      "ciaz": 1.12,
      "kizashi": 1.25,
    },
    hyundai: {
      "tucson": 1.22,
      "alcazar": 1.18,
      "creta": 1.15,
      "ioniq": 1.30,
      "kona": 1.25,
    },
    tata: {
      "harrier": 1.18,
      "safari": 1.22,
      "nexon ev": 1.22,
    },
    toyota: {
      "innova": 1.28,
      "fortuner": 1.35,
      "hyryder": 1.22,
    },
    kia: {
      "carnival": 1.30,
      "seltos": 1.16,
    },
    honda: {
      "cr-v": 1.22,
      "city hybrid": 1.22,
    },
  };

  // Look up model bump for the brand
  const brandKey =
    b.includes("maruti") ? "maruti" :
    modelFactorTable[b] ? b : null;

  let modelFactor = 1.0;
  if (brandKey) {
    const entries = modelFactorTable[brandKey];
    for (const key of Object.keys(entries)) {
      if (m.includes(key)) {
        modelFactor = Math.max(modelFactor, entries[key]);
      }
    }
  }

  if (/\bhybrid\b/i.test(m)) modelFactor = Math.max(modelFactor, 1.06);
  if (/\bturbo\b/i.test(m) && !m.includes("fronx turbo")) modelFactor = Math.max(modelFactor, 1.06);

  // Cap to avoid extreme jumps
  modelFactor = Math.min(modelFactor, 1.35);

  let recommended = base * seatFactor * transFactor * ageFactor;

  recommended *= modelFactor;

  const max = Math.round((recommended * 1.1) / 50) * 50; // round to nearest ₹50

  return {
    recommended: Math.max(1000, Math.round(recommended)),
    max: Math.max(1500, max),
  };
}

export default computeMaxPrice;