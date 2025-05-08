
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="relative z-20 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-blue-700">Clear</span>
              <span className="ml-1 text-xl font-bold text-blue-500">SKY</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-6">
              <a href="#features" className="text-sm text-gray-700 hover:text-blue-600 transition">Features</a>
              <a href="#testimonials" className="text-sm text-gray-700 hover:text-blue-600 transition">Testimonials</a>
              <a href="#contact" className="text-sm text-gray-700 hover:text-blue-600 transition">Contact</a>
              <Link to="/student" className="text-sm text-gray-700 hover:text-blue-600 transition">Student</Link>
              <Link to="/instructor" className="text-sm text-gray-700 hover:text-blue-600 transition">Instructor</Link>
              <Button variant="outline" size="sm">Log In</Button>
              <Button size="sm">Register</Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 pt-2 pb-3 space-y-1">
            <a href="#features" className="block py-2 text-base text-gray-700 hover:text-blue-600 transition">Features</a>
            <a href="#testimonials" className="block py-2 text-base text-gray-700 hover:text-blue-600 transition">Testimonials</a>
            <a href="#contact" className="block py-2 text-base text-gray-700 hover:text-blue-600 transition">Contact</a>
            <Link to="/student" className="block py-2 text-base text-gray-700 hover:text-blue-600 transition">Student</Link>
            <Link to="/instructor" className="block py-2 text-base text-gray-700 hover:text-blue-600 transition">Instructor</Link>
            <div className="pt-2 flex flex-col space-y-2">
              <Button variant="outline">Log In</Button>
              <Button>Register</Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
