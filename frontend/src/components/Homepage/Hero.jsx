import React from "react";
import carImage from "../../assets/car.png";

export default function Hero() {
  return (
    <section
      className="relative w-full h-[90vh] bg-cover bg-center flex items-end"
      style={{ backgroundImage: `url(${carImage})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>

      {/* Hero Content aligned to bottom */}
      <div className="relative w-full mb-20 flex flex-col z-10 text-white px-6 sm:px-10 pb-10">
        <div>
          <p className="text-xs sm:text-sm mb-3">
            100% Trusted Car rental platform in the India
          </p>

          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">
            FAST AND EASY WAY TO <br className="hidden sm:block" /> RENT A CAR
          </h1>
        </div>

        <div className="flex w-full justify-between flex-wrap gap-4">
          <p className="mt-4 text-sm sm:text-base max-w-lg">
            AutoConnect is a peer-to-peer car rental platform that connects car
            owners with people who need a ride. Whether you want to rent out
            your car or book one on the go, AutoConnect makes it simple, secure,
            and seamless.
          </p>
          <button className="mt-4 sm:mt-16 px-6 py-3 bg-[#2f2240] text-white rounded-lg hover:bg-[#3d3356] transition">
            Rent A Car Now
          </button>
        </div>
      </div>
    </section>
  );
}
