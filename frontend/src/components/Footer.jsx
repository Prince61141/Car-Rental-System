import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 px-6 py-10 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <h2 className="text-xl font-bold mb-3 text-purple-900 dark:text-purple-300">
            AUTOCONNECT
          </h2>
          <p className="text-sm">
            Our vision is to provide convenience
            <br />
            and help efficient utilization of cars.
          </p>

          {/* Socials */}
          <div className="flex gap-4 mt-4 text-lg text-purple-800 dark:text-purple-400">
            <a href="#">
              <FaFacebookF />
            </a>
            <a href="#">
              <FaTwitter />
            </a>
            <a href="#">
              <FaInstagram />
            </a>
            <a href="#">
              <FaLinkedinIn />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-md font-semibold mb-3 text-purple-900 dark:text-purple-300">
            Quick Links
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/" className="hover:underline">
                Home
              </a>
            </li>
            <li>
              <a href="/cars" className="hover:underline">
                Cars
              </a>
            </li>
            <li>
              <a href="/about" className="hover:underline">
                About
              </a>
            </li>
            <li>
              <a href="/contact-us" className="hover:underline">
                Contact Us
              </a>
            </li>
            <li>
              <a href="/" className="hover:underline">
                Become A Partner
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-md font-semibold mb-3 text-purple-900 dark:text-purple-300">
            Subscribe to Newsletter
          </h3>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col gap-2"
          >
            <input
              type="email"
              placeholder="Your email"
              className="px-3 py-2 rounded-md border border-gray-300 dark:bg-gray-800 dark:border-gray-700 text-sm"
            />
            <button
              type="submit"
              className="bg-purple-800 text-white px-4 py-2 text-sm rounded-md hover:bg-purple-700"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <hr className="my-6 border-purple-200 dark:border-gray-600" />

      <div className="flex flex-col md:flex-row items-center justify-center text-xs text-gray-500 dark:text-gray-400 gap-4">
        <p>©2025 AutoConnect. All rights reserved &nbsp; |</p>
        <div className="flex">
          <a href="#" className="hover:underline gap-2">
            Privacy & Policy &nbsp; | &nbsp;
          </a>
          <a href="#" className="hover:underline">
            Terms & Conditions
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;