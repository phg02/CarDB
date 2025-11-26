import { useState } from 'react';
import { X, Upload, Eye, EyeOff } from 'lucide-react';

const EditProfile = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [username, setUsername] = useState('JohnDoe123');
  const [profileImage, setProfileImage] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: 'JohnDoe123',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

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

  const handleEditProfile = () => {
    setUsername(formData.username);
    setShowEditModal(false);
  };

  const handleChangePassword = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    console.log('Password changed successfully');
    setShowPasswordModal(false);
    setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div>
      <h2 className="text-white text-xl sm:text-2xl font-semibold mb-4 sm:mb-8">Edit profile</h2>

      {/* Profile Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-800 rounded-[3px] p-4 sm:p-6 mb-4 sm:mb-6 gap-4">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Avatar */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-xl sm:text-2xl font-semibold flex-shrink-0 overflow-hidden">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              username.charAt(0).toUpperCase()
            )}
          </div>
          
          {/* Username Block */}
          <div>
            <p className="text-gray-400 text-xs sm:text-sm mb-1">Username</p>
            <p className="text-white text-base sm:text-lg font-medium">{username}</p>
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
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    formData.username.charAt(0).toUpperCase()
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
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-[3px] transition-colors font-medium"
            >
              Edit
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
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-[3px] transition-colors font-medium"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;
