import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, LogOut } from 'lucide-react';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUser) return null;

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center">
              <User className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-semibold text-gray-900">SecureApp</span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              <Link 
                to="/dashboard" 
                className={`navbar-link ${location.pathname === '/dashboard' ? 'navbar-link-active' : ''}`}
              >
                Dashboard
              </Link>
              <Link 
                to="/profile" 
                className={`navbar-link ${location.pathname === '/profile' ? 'navbar-link-active' : ''}`}
              >
                Profile
              </Link>
              <Link 
                to="/change-password" 
                className={`navbar-link ${location.pathname === '/change-password' ? 'navbar-link-active' : ''}`}
              >
                Change Password
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex items-center">
              {currentUser.avatar && (
                <img 
                  src={currentUser.avatar} 
                  alt="Profile" 
                  className="h-8 w-8 rounded-full" 
                />
              )}
              <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">
                {currentUser.username}
              </span>
            </div>
            <button 
              onClick={handleLogout}
              className="ml-4 inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <LogOut className="h-5 w-5" />
              <span className="ml-1 text-sm font-medium hidden md:block">Logout</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      <div className="md:hidden border-t border-gray-200">
        <div className="pt-2 pb-3 space-y-1">
          <Link 
            to="/dashboard" 
            className={`block pl-3 pr-4 py-2 text-base font-medium ${
              location.pathname === '/dashboard' 
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
            }`}
          >
            Dashboard
          </Link>
          <Link 
            to="/profile" 
            className={`block pl-3 pr-4 py-2 text-base font-medium ${
              location.pathname === '/profile' 
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
            }`}
          >
            Profile
          </Link>
          <Link 
            to="/change-password" 
            className={`block pl-3 pr-4 py-2 text-base font-medium ${
              location.pathname === '/change-password' 
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
            }`}
          >
            Change Password
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;