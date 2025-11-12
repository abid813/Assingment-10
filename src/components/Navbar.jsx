import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "../hooks/useAuth"; // Firebase Auth Hook

const Navbar = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinksBeforeLogin = [
    { name: "Home", path: "/" },
    { name: "Issues", path: "/issues" },
    { name: "Login", path: "/login" },
    { name: "Register", path: "/signup" },
  ];

  const navLinksAfterLogin = [
    { name: "Home", path: "/" },
    { name: "All Issues", path: "/issues" },
    { name: "Add Issue", path: "/add-issue" },
    { name: "My Issues", path: "/my-issues" },
    { name: "My Contribution", path: "/my-contribution" },
  ];

  const linksToShow = user ? navLinksAfterLogin : navLinksBeforeLogin;

  return (
    <>
      {/* Overlay when mobile menu open */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 md:hidden z-40"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}

      {/* ===== NAVBAR ===== */}
      <nav
        className="fixed top-0 left-0 w-full z-50 text-white shadow-lg p-5"
        style={{ background: "linear-gradient(to right,#666600,#999966)" }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* ---------- Left side: Logo ---------- */}
          <div className="flex items-center gap-2">
            <img
              src="/cleanCity.jpg"
              alt="CleanCity Logo"
              className="w-10 h-10 rounded-full object-cover"
            />
            <h2 className="font-bold text-xl">CleanCity</h2>
          </div>

          {/* ---------- Right side: Nav Links + Buttons ---------- */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white z-50"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center space-x-6">
              {linksToShow.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="font-semibold hover:text-green-300 transition"
                >
                  {link.name}
                </Link>
              ))}

              {/* Profile / Auth Buttons */}
              {user ? (
                <div className="flex items-center gap-3">
                  <img
                    src={user.photoURL || "https://i.pravatar.cc/40"}
                    alt="User"
                    className="w-9 h-9 rounded-full border-2 border-white cursor-pointer"
                  />
                  <button
                    onClick={logout}
                    className="px-3 py-1 rounded text-sm font-semibold"
                    style={{
                      background:
                        "linear-gradient(to right,#6441a5,#2a0845)",
                    }}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-1 rounded font-bold"
                    style={{
                      background: "linear-gradient(to right,#000000,#0f9b0f)",
                    }}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-1 rounded font-bold"
                    style={{
                      background: "linear-gradient(to right,#008000,#32cd32)",
                    }}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* ---------- Mobile Sidebar ---------- */}
          <div
            className={`${
              menuOpen ? "translate-x-0" : "-translate-x-full"
            } fixed md:hidden top-0 left-0 h-full w-64 bg-slate-800 transition-transform duration-300 ease-in-out text-center p-6 z-30`}
          >
            {linksToShow.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block py-2 font-semibold hover:text-green-400"
                onClick={() => setMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            <div className="mt-4">
              {user ? (
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={user.photoURL || "https://i.pravatar.cc/40"}
                    alt="User"
                    className="w-10 h-10 rounded-full border-2 border-white"
                  />
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className="px-3 py-1 rounded text-sm font-semibold"
                    style={{
                      background: "linear-gradient(to right,#6441a5,#2a0845)",
                    }}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 mt-3">
                  <Link
                    to="/login"
                    className="px-4 py-1 rounded font-bold"
                    style={{
                      background: "linear-gradient(to right,#000000,#0f9b0f)",
                    }}
                    onClick={() => setMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-1 rounded font-bold"
                    style={{
                      background: "linear-gradient(to right,#008000,#32cd32)",
                    }}
                    onClick={() => setMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Padding so content doesn’t hide under fixed navbar */}
      <div className="pt-24"></div>
    </>
  );
};

export default Navbar;
