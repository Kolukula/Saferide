import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const userName = localStorage.getItem("userName") || "User";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const getRoleColor = () => {
    switch (role) {
      case "admin": return "from-red-500 to-pink-600";
      case "driver": return "from-green-500 to-teal-600";
      case "student": return "from-blue-500 to-indigo-600";
      default: return "from-gray-500 to-gray-700";
    }
  };

  return (
    <nav className={`bg-gradient-to-r ${getRoleColor()} text-white shadow-lg`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="bg-white p-2 rounded-full group-hover:scale-110 transition-transform duration-200">
              <span className="text-2xl">🚍</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Saferide</h1>
              <p className="text-xs opacity-90">Bus Tracking System</p>
            </div>
          </div>

          {/* Navigation & User Info */}
          <div className="flex items-center space-x-4">
            {token && (
              <div className="flex items-center space-x-4">
                {/* User Info with better contrast */}
                <div className="text-right hidden sm:block">
                  <p className="font-semibold capitalize text-white drop-shadow-sm">
                    {userName}
                  </p>
                  <p className="text-xs font-medium capitalize text-white text-opacity-95 drop-shadow-sm">
                    {role}
                  </p>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            {token ? (
              <button 
                onClick={handleLogout}
                className="bg-white text-gray-800 hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg border border-gray-200 hover:border-gray-300 min-w-20"
              >
                Logout
              </button>
            ) : (
              location.pathname !== "/register" && (
                <button 
                  onClick={() => navigate("/register")}
                  className="bg-white text-gray-800 hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg border border-gray-200 hover:border-gray-300"
                >
                  Register
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;