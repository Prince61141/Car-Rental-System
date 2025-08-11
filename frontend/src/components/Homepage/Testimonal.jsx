import React from "react";
import { FaQuoteLeft } from "react-icons/fa";

const testimonials = Array(8).fill({
  quote:
    "I used to leave my car idle for days. Now, it earns me more than I imagined! The platform is smooth, and support is amazing.",
  name: "Rajesh Sharma",
  title: "AI/ML Engineer",
  image: "https://randomuser.me/api/portraits/men/32.jpg",
});

const TestimonialCard = ({ quote, name, title, image }) => (
  <div className="min-w-[300px] max-w-sm bg-white rounded-xl shadow-md p-5 mx-4 transition duration-300 ease-in-out hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-1 cursor-pointer">
    <FaQuoteLeft className="text-[#2f2240] text-2xl mb-3" />
    <p className="text-gray-700 text-sm mb-5">{quote}</p>
    <div className="flex items-center gap-3">
      <img src={image} alt={name} className="w-10 h-10 rounded-full object-cover" />
      <div>
        <p className="font-semibold text-sm">{name}</p>
        <p className="text-xs text-gray-500">{title}</p>
      </div>
    </div>
  </div>
);

export default function Testimonial() {
  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-12">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
        What Our Car Owners & Renters Say
      </h2>

      {/* Row 1: scroll left to right */}
      <div className="overflow-x-hidden px-4 py-4">
        <div className="flex animate-scroll-x gap-4 w-max">
          {testimonials.map((t, i) => (
            <TestimonialCard key={i} {...t} />
          ))}
          {testimonials.map((t, i) => (
            <TestimonialCard key={i + 100} {...t} />
          ))}
        </div>
      </div>

      {/* Row 2: scroll right to left */}
      <div className="overflow-x-hidden py-4 mt-6">
        <div className="flex animate-scroll-x-reverse gap-4 w-max">
          {testimonials.map((t, i) => (
            <TestimonialCard key={i + 200} {...t} />
          ))}
          {testimonials.map((t, i) => (
            <TestimonialCard key={i + 300} {...t} />
          ))}
        </div>
      </div>
    </section>
  );
}
