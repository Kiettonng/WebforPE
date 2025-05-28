import React from 'react';
import { GraduationCap, Users, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from '../utils/router';

const HomePage: React.FC = () => {
  const { state } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
          Welcome to <span className="text-blue-600">EduPortal</span>
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
          Your gateway to academic excellence. Access your student portal, manage your profile, and stay connected with your educational journey.
        </p>
        {!state.isAuthenticated && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
            >
              Student Registration
            </button>
            <button
              onClick={() => navigate('/login')}
              className="ml-3 px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
            >
              Student Login
            </button>
          </div>
        )}
        {state.isAuthenticated && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => navigate('/profile')}
              className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 flex items-center transition-colors duration-200"
            >
              Go to Student Portal
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-10">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-2xl leading-6 font-bold text-gray-900">
            Student Portal Features
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Access your academic information and manage your student profile
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <div className="flex items-center mb-3">
                <GraduationCap className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="font-semibold text-blue-600">Student Profile</h3>
              </div>
              <p className="text-sm text-gray-700">
                Manage your student information:
              </p>
              <ul className="list-disc pl-5 mt-2 text-sm text-gray-700 space-y-1">
                <li>Update profile picture</li>
                <li>Change email address</li>
                <li>Update password</li>
                <li>View academic status</li>
              </ul>
            </div>
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <div className="flex items-center mb-3">
                <Users className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="font-semibold text-blue-600">Student Services</h3>
              </div>
              <p className="text-sm text-gray-700">
                Access important student services:
              </p>
              <ul className="list-disc pl-5 mt-2 text-sm text-gray-700 space-y-1">
                <li>Course registration</li>
                <li>Grade viewing</li>
                <li>Schedule management</li>
                <li>Academic resources</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-2xl leading-6 font-bold text-gray-900">
            Getting Started
          </h2>
        </div>
        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:px-6">
            <ol className="list-decimal pl-5 text-gray-700 space-y-4">
              <li>
                <span className="font-medium">Create your student account</span> or log in with your existing credentials
              </li>
              <li>
                <span className="font-medium">Complete your profile</span> by adding a profile picture and verifying your information
              </li>
              <li>
                <span className="font-medium">Access student services</span> through your personalized dashboard
              </li>
              <li>
                <span className="font-medium">Stay updated</span> with important announcements and deadlines
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;