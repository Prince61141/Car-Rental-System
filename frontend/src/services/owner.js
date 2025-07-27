export const fetchOwner = async () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const res = await fetch("http://localhost:5000/api/owners/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.name) {
      return data.name;
    }
    return null;
  } catch (err) {
    return null;
  }
};