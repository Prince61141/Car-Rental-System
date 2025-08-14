export const EVENT_OPEN_BOOKING = "renter:open-booking";

export function openBookingDetails(id) {
  try {
    const evt = new CustomEvent(EVENT_OPEN_BOOKING, { detail: { id } });
    window.dispatchEvent(evt);
  } catch {
    const evt = document.createEvent("CustomEvent");
    evt.initCustomEvent(EVENT_OPEN_BOOKING, false, false, { id });
    window.dispatchEvent(evt);
  }
}

export function subscribeOpenBooking(cb) {
  const handler = (e) => cb?.(e?.detail?.id);
  window.addEventListener(EVENT_OPEN_BOOKING, handler);
  return () => window.removeEventListener(EVENT_OPEN_BOOKING, handler);
}