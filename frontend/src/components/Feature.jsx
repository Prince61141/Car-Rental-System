import React from "react";
import { FaUsers, FaPaperPlane, FaMapMarkerAlt } from "react-icons/fa";

export default function Features() {
  return (
    <section className="py-12 px-6 bg-white mt-20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-20">
        {/* Feature 1 */}
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-red-100 mx-auto">
            <FaUsers className="text-red-600 text-2xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Customer Satisfaction</h3>
          <p className="text-gray-500 text-sm">
            We are committed to delivering a seamless and reliable car rental experience. From booking to return, our top priority is your satisfaction at every step of the journey.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-yellow-100 mx-auto">
            <FaPaperPlane className="text-yellow-600 text-2xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Faster Bookings</h3>
          <p className="text-gray-500 text-sm">
            With our simplified rental process, you can book your preferred vehicle in just a few clicks. No long forms or delays—just quick and easy reservations.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-blue-100 mx-auto">
            <FaMapMarkerAlt className="text-blue-600 text-2xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Any Pickup Location</h3>
          <p className="text-gray-500 text-sm">
           Enjoy the flexibility to pick up your rental car from any location that suits you—home, office, airport, or anywhere else. We make mobility convenient for you.
          </p>
        </div>
      </div>
    </section>
  );
}