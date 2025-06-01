import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Home, User, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="card">
          <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600 mb-4">
            <User className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">Profile Management</h2>
          <p className="text-gray-600 mb-4">
            Update your profile information including your avatar and email address.
          </p>
          <Link to="/profile" className="btn btn-primary block text-center">
            Manage Profile
          </Link>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600 mb-4">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">Security Settings</h2>
          <p className="text-gray-600 mb-4">
            Change your password and manage your account security settings.
          </p>
          <Link to="/change-password" className="btn btn-primary block text-center">
            Security Settings
          </Link>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600 mb-4">
            <Home className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">Account Overview</h2>
          <p className="text-gray-600 mb-4">View your account information and activity.</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Username:</span>
              <span className="font-medium">{currentUser?.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email:</span>
              <span className="font-medium">{currentUser?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Account ID:</span>
              <span className="font-medium">{currentUser?.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;