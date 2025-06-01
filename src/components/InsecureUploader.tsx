import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UploadState } from '../types';

// This component intentionally has security flaws for educational purposes
const InsecureUploader: React.FC = () => {
  const { state: authState, updateUser } = useAuth();
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    error: null,
    success: false,
    file: null,
    preview: null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // VULNERABILITY: No proper file type validation
      // This allows any file type to be uploaded, including potentially malicious files
      
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

    // Simulate upload
    setTimeout(() => {
      // VULNERABILITY: File is "stored" without validation
      // In a real app, this would allow arbitrary file types to be uploaded
      
      if (authState.user) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const updatedUser = {
            ...authState.user,
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-red-500">Insecure Avatar Upload</h3>
      <p className="text-gray-600 mb-4">
        This uploader has <span className="font-bold">intentional security vulnerabilities</span> for
        demonstration purposes. It allows any file type to be uploaded without validation.
      </p>
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
          id="file-upload-insecure"
          className="hidden"
          onChange={handleFileChange}
        />
        
        <div className="mt-4 flex justify-center">
          <label
            htmlFor="file-upload-insecure"
            className="cursor-pointer px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200"
          >
            Select File
          </label>
          
          {uploadState.file && (
            <button
              onClick={handleUpload}
              disabled={uploadState.isUploading}
              className={`ml-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 ${
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
      
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-100 rounded-md">
        <h4 className="font-semibold text-yellow-800 mb-2">Security Vulnerability:</h4>
        <ul className="list-disc pl-5 text-sm text-yellow-700 space-y-1">
          <li>No file type validation allows uploading of potentially malicious files</li>
          <li>No file size restrictions could lead to denial of service</li>
          <li>No content validation could allow uploading of malicious scripts</li>
        </ul>
      </div>
    </div>
  );
};

export default InsecureUploader;