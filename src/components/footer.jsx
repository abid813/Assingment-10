import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer   className="bg-gray-900
     text-gray-300 py-10 px-6 mt-10" style={{ backgroundImage: "url('/Glowing Stars.svg')" }} >
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/*  Logo / Site Name + Short Description */}
        <div>
       
          <div className="flex items-center gap-2 mb-3">
            <img
              src="/cleanCity.jpg"
              alt="Clean City Logo"
              className="w-10 h-10 rounded-full object-cover"
            />
            <h2 className="text-2xl font-bold text-white">
              Clean City Report Portal
            </h2>
          </div>

          <p className="text-sm leading-relaxed">
            A community-driven platform to report garbage, broken roads,
            and other public issues — making our city cleaner and safer
            together.
          </p>
        </div>

        {/*  Useful Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Useful Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-green-400 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/add-issue"
                className="hover:text-green-400 transition-colors"
              >
                Report Issue
              </Link>
            </li>
            <li>
              <Link
                to="/my-issues"
                className="hover:text-green-400 transition-colors"
              >
                My Issues
              </Link>
            </li>
            <li>
              <Link
                to="/my-contribution"
                className="hover:text-green-400 transition-colors"
              >
                My Contribution
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="hover:text-green-400 transition-colors"
              >
                About Us
              </Link>
            </li>
          </ul>
        </div>

        {/*  Copyright */}
        <div className="text-sm md:text-right">
          <p className="text-gray-400">
            © {new Date().getFullYear()} Clean City Report Portal
          </p>
          <p className="text-gray-500">All rights reserved.</p>
          <p className="mt-2 text-gray-400">
            Developed by <span className="text-green-400 font-medium">Abid</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
