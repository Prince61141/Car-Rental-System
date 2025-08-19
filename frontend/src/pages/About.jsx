import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function About() {
  return (
    <div>
      <Header />
      
      {/* Hero Section */}
      <section className="mt-20 py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#3d3356] mb-6">
                Connecting People, One Car at a Time
              </h1>
              <p className="text-gray-700 text-lg leading-relaxed">
                AutoConnect is India's trusted peer-to-peer car rental platform that empowers individuals to rent and share vehicles with ease. We're building a community where mobility connects people through smarter solutions.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="relative w-80 h-80 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl p-8">
                <div className="absolute top-4 right-4 w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="absolute top-20 left-4 w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="absolute top-32 right-8 w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a3.236 3.236 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a3.236 3.236 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="absolute bottom-8 left-8 w-14 h-14 bg-purple-200 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.192-4.377c-.193.59-.393 1.183-.595 1.777a1 1 0 00.726 1.262c.374.098.748.196 1.12.287.374.09.748.18 1.12.287a1 1 0 00.726-1.262c-.202-.594-.402-1.187-.595-1.777a6.981 6.981 0 00-2.05-4.95z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="absolute bottom-20 right-12 w-20 h-12 bg-gray-300 rounded-lg"></div>
                <div className="absolute bottom-16 right-20 w-16 h-10 bg-white rounded-lg"></div>
                <div className="absolute bottom-12 right-28 w-18 h-12 bg-blue-300 rounded-lg"></div>
                <div className="absolute bottom-8 right-36 w-14 h-10 bg-black rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-[#3d3356] mb-8 text-center">
            What We Do
          </h2>
          <p className="text-gray-700 text-lg mb-8 text-center max-w-4xl mx-auto">
            AutoConnect transforms the traditional car rental experience. We offer a seamless, secure, and flexible way for:
          </p>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-[#3d3356] mb-4">Car Owners</h3>
              <p className="text-gray-600">
                Earn passive income by sharing your vehicle when it's not in use. Turn your idle car into a source of revenue while helping others in your community.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-[#3d3356] mb-4">Renters</h3>
              <p className="text-gray-600">
                Find a wide variety of cars nearby at affordable prices—without the hassle of traditional rental agencies. Access vehicles when and where you need them.
              </p>
            </div>
          </div>
          <p className="text-gray-700 text-lg text-center">
            We support all types of cars because mobility should be as diverse as the people who drive.
          </p>
        </div>
      </section>

      {/* Why AutoConnect Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-[#3d3356] mb-8 text-center">
            Why AutoConnect?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#3d3356] mb-2">Peer-to-Peer Advantage</h3>
              <p className="text-gray-600 text-sm">
                No middlemen. No high agency fees. Just real people helping real people.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#3d3356] mb-2">Verified Users</h3>
              <p className="text-gray-600 text-sm">
                Every renter and owner on our platform is identity-verified to ensure safety and trust.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#3d3356] mb-2">Easy Booking & Payments</h3>
              <p className="text-gray-600 text-sm">
                Our user-friendly platform allows you to list, book, and manage rentals with just a few taps.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#3d3356] mb-2">Insurance & Support</h3>
              <p className="text-gray-600 text-sm">
                We provide protection plans and dedicated support so both owners and renters have peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-[#3d3356] mb-8">
            Our Mission
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            To create a sustainable, community-driven mobility ecosystem where every car can be shared, and every journey can be made more accessible, affordable, and responsible.
          </p>
        </div>
      </section>

      {/* The Road Ahead Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-[#3d3356] mb-8">
            The Road Ahead
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            AutoConnect is building a movement toward a smarter, more connected way to travel. We envision cities with fewer idle cars, less traffic congestion, and more meaningful human connections on the road.
          </p>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-[#3d3356] mb-12 text-center">
            What Our Car Owners & Renters Say
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-4xl text-gray-300 mb-4">"</div>
                <p className="text-gray-600 mb-4">
                  I used to leave my car idle for days. Now, it earns me more than I imagined! The platform is smooth, and support is amazing.
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-300 rounded-full mr-3"></div>
                  <div>
                    <p className="font-semibold text-[#3d3356]">Rajesh Sharma</p>
                    <p className="text-sm text-gray-500">AI/ML Engineer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#3d3356] mb-6">
            Join the AutoConnect community today — where your next ride or your next earning opportunity is just around the corner.
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Ready to drive or share?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/rent-car"
              className="inline-block bg-[#3d3356] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#2a223e] transition duration-300"
            >
              Rent A Car
            </a>
            <a
              href="/become-host"
              className="inline-block bg-[#3d3356] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#2a223e] transition duration-300"
            >
              Become a Host
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}