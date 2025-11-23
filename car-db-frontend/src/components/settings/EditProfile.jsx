import { useState } from 'react';
import { X } from 'lucide-react';

const EditProfile = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [username, setUsername] = useState('JohnDoe123');
  const [formData, setFormData] = useState({
    username: 'JohnDoe123',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-800 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 gap-4">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Avatar */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-xl sm:text-2xl font-semibold flex-shrink-0">
            {username.charAt(0).toUpperCase()}
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
          className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          Edit
        </button>
      </div>

      {/* Change Password Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-800 rounded-xl p-4 sm:p-6 gap-4">
        <p className="text-white text-sm sm:text-base">Change your password</p>
        <button
          onClick={() => setShowPasswordModal(true)}
          className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          Change
        </button>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 sm:p-8 w-full max-w-md">
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
              <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-3xl font-semibold">
                {formData.username.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Username Input */}
            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">User name</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Edit Button */}
            <button
              onClick={handleEditProfile}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              Edit
            </button>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 sm:p-8 w-full max-w-md">
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
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Current password</label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">New password</label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Confirm new password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleChangePassword}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
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
