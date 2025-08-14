import React from "react";

function Notifications() {
  return (
    <div className="bg-[#f7f7fa] py-8 px-2 md:px-8">
      <div className="mx-auto space-y-4">
        {/* Notification 1 */}
        <div className="flex items-start gap-4 bg-white rounded-xl shadow-sm px-5 py-4">
          <div className="flex-shrink-0 mt-1">
            {/* Booking icon */}
            <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-lg font-bold text-[#2F2240] bg-[#f7f6fa]">
              B
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-base">
              New Booking Request Received
            </div>
            <div className="text-gray-600 text-sm mt-1">
              You&apos;ve received a new rental request for your car from [User Name].
            </div>
          </div>
        </div>
        {/* Notification 2 */}
        <div className="flex items-start gap-4 bg-white rounded-xl shadow-sm px-5 py-4">
          <div className="flex-shrink-0 mt-1">
            {/* Timer icon */}
            <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-lg text-[#2F2240] bg-[#f7f6fa]">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
              </svg>
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-base">
              Rental Start Reminder
            </div>
            <div className="text-gray-600 text-sm mt-1">
              Reminder: Your car rental with [Renter Name] starts today at [Time].
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Notifications;