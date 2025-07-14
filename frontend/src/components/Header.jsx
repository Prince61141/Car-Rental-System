function Header() {
  return (
    <header className="bg-white shadow-sm sticky">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Logo</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-700 hover:text-blue-600 transition-colors">Home</a>
              <a href="/about-us" className="text-gray-700 hover:text-blue-600 transition-colors">About Us</a>
              <a href="/service" className="text-gray-700 hover:text-blue-600 transition-colors">Services</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Car Rental</a>
              <a href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">Contact</a>
            </nav>
            <button className="bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <a href="/register" className="no-underline text-white">Sign Up</a>
            </button>
          </div>
        </div>
      </header>
  );
}

export default Header;