import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from '../utils/router';
import { Upload } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { state, updateUser, updateEmail, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [uploadState, setUploadState] = useState({
    isUploading: false,
    error: null as string | null,
    success: false,
    file: null as File | null,
    preview: null as string | null,
  });
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  React.useEffect(() => {
    if (!state.isAuthenticated) {
      navigate('/login');
    }
  }, [state.isAuthenticated, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadState({
        ...uploadState,
        file,
        preview: URL.createObjectURL(file),
        error: null,
      });
    }
  };

  const handleUpload = () => {
    if (!uploadState.file) {
      setUploadState({
        ...uploadState,
        error: 'Please select a file to upload',
      });
      return;
    }

    setUploadState({
      ...uploadState,
      isUploading: true,
      error: null,
    });

    setTimeout(() => {
      if (state.user) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const updatedUser = {
            ...state.user,
            avatar: reader.result as string,
          };
          
          updateUser(updatedUser);
          
          setUploadState({
            ...uploadState,
            isUploading: false,
            success: true,
            error: null,
          });
        };
        
        reader.readAsDataURL(uploadState.file);
      }
    }, 1500);
  };

  const handleEmailChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEmail) {
      updateEmail(newEmail);
      setNewEmail('');
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword) {
      updatePassword(newPassword);
      setNewPassword('');
    }
  };

  if (!state.isAuthenticated || !state.user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, <span className="font-semibold">{state.user.username}</span>!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Update Profile Picture</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
            {uploadState.preview ? (
              <div className="mb-4">
                <img
                  src={uploadState.preview}
                  alt="Preview"
                  className="h-32 w-32 mx-auto object-cover rounded-full"
                />
                <p className="mt-2 text-sm text-gray-500">
                  {uploadState.file?.name} ({Math.round(uploadState.file?.size / 1024)} KB)
                </p>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Click to select a file or drag and drop</p>
                <p className="mt-1 text-xs text-gray-400">Any file type accepted</p>
              </div>
            )}
            
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileChange}
            />
            
            <div className="mt-4 flex justify-center">
              <label
                htmlFor="file-upload"
                className="cursor-pointer px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200"
              >
                Select File
              </label>
              
              {uploadState.file && (
                <button
                  onClick={handleUpload}
                  disabled={uploadState.isUploading}
                  className={`ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 ${
                    uploadState.isUploading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {uploadState.isUploading ? 'Uploading...' : 'Upload File'}
                </button>
              )}
            </div>
          </div>
          
          {uploadState.error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
              {uploadState.error}
            </div>
          )}
          
          {uploadState.success && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
              File uploaded successfully!
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Change Email</h3>
            <form onSubmit={handleEmailChange}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="new-email" className="block text-sm font-medium text-gray-700">
                    New Email
                  </label>
                  <input
                    type="email"
                    id="new-email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Update Email
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Change Password</h3>
            <form onSubmit={handlePasswordChange}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-yellow-50 p-6 rounded-lg shadow-sm">
        <h4 className="font-semibold text-yellow-800 mb-2">Security Notice:</h4>
        <ul className="list-disc pl-5 text-sm text-yellow-700 space-y-1">
          <li>The file upload system accepts any file type without validation</li>
          <li>Email update functionality is vulnerable to SQL injection</li>
          <li>Password changes are stored without proper hashing</li>
          <li>This implementation is for educational purposes only</li>
        </ul>
      </div>
    </div>
  );
};

export default ProfilePage;