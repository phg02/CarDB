import { useState, useEffect } from 'react';
import { X, Upload, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const EditProfile = () => {
  const { auth } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    profileImage: null
  });
  const [profileImage, setProfileImage] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!auth?.accessToken) return;

      try {
        const response = await axios.get('/api/users/profile', {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${auth.accessToken}`
          }
        });
        const user = response.data.data.user;
        setUserData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          profileImage: user.profileImage || null
        });
        setFormData(prev => ({
          ...prev,
          username: user.name || ''
        }));
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to load user profile');
      }
    };

    fetchUserProfile();
  }, [auth]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileImageUpload = async (file) => {
    const formDataObj = new FormData();
    formDataObj.append('profileImage', file);

    const response = await axios.post('/api/users/profile-image', formDataObj, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${auth.accessToken}`
      },
    });

    // Update userData with new profile image URL
    setUserData(prev => ({
      ...prev,
      profileImage: response.data.data.profileImage
    }));
    setProfileImage(null); // Clear the preview
    return response;
  };

  const handleEditProfile = async () => {
    if (!formData.username.trim()) {
      toast.error('Username cannot be empty');
      return;
    }

    setLoading(true);
    try {
      // Update profile name
      await axios.patch('/api/users/profile', {
        name: formData.username.trim()
      }, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${auth.accessToken}`
        }
      });

      // Update local state
      setUserData(prev => ({
        ...prev,
        name: formData.username.trim()
      }));

      // If there's a new profile image to upload
      if (profileImage && profileImage.startsWith('data:')) {
        // Convert data URL to file
        const response = await fetch(profileImage);
        const blob = await response.blob();
        const file = new File([blob], 'profile-image.jpg', { type: 'image/jpeg' });
        
        await handleProfileImageUpload(file);
      }

      toast.success('Profile updated successfully');
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/users/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      }, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${auth.accessToken}`
        }
      });

      toast.success('Password changed successfully');
      setShowPasswordModal(false);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-white text-xl sm:text-2xl font-semibold mb-4 sm:mb-8">Edit profile</h2>

      {/* Profile Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-800 rounded-[3px] p-4 sm:p-6 mb-4 sm:mb-6 gap-4">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Avatar */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-xl sm:text-2xl font-semibold flex-shrink-0 overflow-hidden">
            {userData.profileImage || profileImage ? (
              <img 
                src={profileImage || userData.profileImage} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            ) : (
              userData.name ? userData.name.charAt(0).toUpperCase() : 'U'
            )}
          </div>
          
          {/* Username Block */}
          <div>
            <p className="text-gray-400 text-xs sm:text-sm mb-1">Username</p>
            <p className="text-white text-base sm:text-lg font-medium">{userData.name || 'Loading...'}</p>
          </div>
        </div>

        {/* Edit Button */}
        <button
          onClick={() => setShowEditModal(true)}
          className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[3px] transition-colors font-medium"
        >
          Edit
        </button>
      </div>

      {/* Change Password Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-800 rounded-[3px] p-4 sm:p-6 gap-4">
        <p className="text-white text-sm sm:text-base">Change your password</p>
        <button
          onClick={() => setShowPasswordModal(true)}
          className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[3px] transition-colors font-medium"
        >
          Change
        </button>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-black rounded-[3px] p-6 sm:p-8 w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-xl font-semibold">Edit profile</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Avatar */}
            <div className="flex justify-center mb-6">
              <label className="relative cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-3xl font-semibold overflow-hidden">
                  {profileImage || userData.profileImage ? (
                    <img src={profileImage || userData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    formData.username ? formData.username.charAt(0).toUpperCase() : 'U'
                  )}
                </div>
                {/* Upload Icon Overlay */}
                <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              </label>
            </div>

            {/* Username Input */}
            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">User name</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-[3px] text-white focus:outline-none"
              />
            </div>

            {/* Edit Button */}
            <button
              onClick={handleEditProfile}
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-[3px] transition-colors font-medium"
            >
              {loading ? 'Updating...' : 'Edit'}
            </button>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-black rounded-[3px] p-6 sm:p-8 w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-xl font-semibold">Change password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Password Inputs */}
            <div className="space-y-4 mb-8">
              <div className="pb-4">
                <label className="block text-gray-400 text-sm mb-2">Current password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-[3px] text-white focus:outline-none pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showCurrentPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">New password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-[3px] text-white focus:outline-none pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showNewPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Confirm new password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-[3px] text-white focus:outline-none pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleChangePassword}
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-[3px] transition-colors font-medium"
            >
              {loading ? 'Changing...' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;
