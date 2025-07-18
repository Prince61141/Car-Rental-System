import React from "react";
import { FaChevronDown } from "react-icons/fa";

export default function SearchBar() {
  return (
    <div className="bg-white shadow-xl p-4 sm:p-6 rounded-2xl mx-2 md:mx-10 -mt-16 z-20 relative flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
      {/* Pick-Up Section */}
      <div className="flex flex-col gap-1 flex-1">
        <div className="">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-4 h-4 rounded-full border-2 border-[#3d3356] flex items-center justify-center">
              <span className="w-2.5 h-2.5 bg-[#3d3356] rounded-full block" />
            </span>
            <span className="font-semibold text-[#3d3356] text-base">Pick - Up</span>
          </div>
        </div>
        <div className="flex flex-row justify-between">
        <div className="flex flex-col">
          <label className="text-sm font-bold text-[#3d3356] mb-0.5">Locations</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Select your city"
              className="w-36 md:w-44 pr-6 border-0 bg-transparent text-gray-500 text-sm placeholder-gray-400 focus:ring-0"
            />
            <FaChevronDown className="absolute right-1 top-2 text-gray-400 text-xs pointer-events-none" />
          </div>
        </div>
        <div className="hidden xl:block h-10 w-px bg-gray-200 mx-2"></div>
        <div className="flex flex-col">
          <label className="text-sm font-bold text-[#3d3356] mb-0.5">Date</label>
          <div className="relative">
            <input
              type="date"
              placeholder="Select your date"
              className="w-32 md:w-40 pr-6 border-0 bg-transparent text-gray-500 text-sm focus:ring-0"
            />
            <FaChevronDown className="absolute right-1 top-2 text-gray-400 text-xs pointer-events-none" />
          </div>
        </div>
        <div className="hidden xl:block h-10 w-px bg-gray-200 mx-2"></div>
        <div className="flex flex-col">
          <label className="text-sm font-bold text-[#3d3356] mb-0.5">Time</label>
          <div className="relative">
            <input
              type="time"
              placeholder="Select your time"
              className="w-24 md:w-32 pr-6 border-0 bg-transparent text-gray-500 text-sm focus:ring-0"
            />
            <FaChevronDown className="absolute right-1 top-2 text-gray-400 text-xs pointer-events-none" />
          </div>
        </div>
        </div>
      </div>
      {/* Divider */}
      <div className="hidden xl:block h-16 w-px bg-gray-200 mx-2"></div>
      {/* Drop-Off Section */}
      <div className="flex flex-col gap-1 flex-1">
        <div className="">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-4 h-4 rounded-full border-2 border-[#3d3356] flex items-center justify-center">
              <span className="w-2.5 h-2.5 bg-[#3d3356] rounded-full block" />
            </span>
            <span className="font-semibold text-[#3d3356] text-base">Drop - Off</span>
          </div>
        </div>
        <div className="flex flex-row justify-between">
        <div className="flex flex-col">
          <label className="text-sm font-bold text-[#3d3356] mb-0.5">Locations</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Select your city"
              className="w-36 md:w-44 pr-6 border-0 bg-transparent text-gray-500 text-sm placeholder-gray-400 focus:ring-0"
            />
            <FaChevronDown className="absolute right-1 top-2 text-gray-400 text-xs pointer-events-none" />
          </div>
        </div>
        <div className="hidden xl:block h-10 w-px bg-gray-200 mx-2"></div>
        <div className="flex flex-col">
          <label className="text-sm font-bold text-[#3d3356] mb-0.5">Date</label>
          <div className="relative">
            <input
              type="date"
              placeholder="Select your date"
              className="w-32 md:w-40 pr-6 border-0 bg-transparent text-gray-500 text-sm focus:ring-0"
            />
            <FaChevronDown className="absolute right-1 top-2 text-gray-400 text-xs pointer-events-none" />
          </div>
        </div>
        <div className="hidden xl:block h-10 w-px bg-gray-200 mx-2"></div>
        <div className="flex flex-col">
          <label className="text-sm font-bold text-[#3d3356] mb-0.5">Time</label>
          <div className="relative">
            <input
              type="time"
              placeholder="Select your time"
              className="w-24 md:w-32 pr-6 border-0 bg-transparent text-gray-500 text-sm focus:ring-0"
            />
            <FaChevronDown className="absolute right-1 top-2 text-gray-400 text-xs pointer-events-none" />
          </div>
        </div>
        </div>
      </div>
      {/* Search Button */}
      <div className="flex items-center mt-4 xl:mt-0">
        <button className="bg-[#3d3356] hover:bg-[#2a223e] transition text-white px-8 py-3 rounded-lg font-semibold shadow-xl text-base xl:text-lg">
          Search
        </button>
      </div>
    </div>
  );
}