import api from '../config/authApi.config';
import apiMultipart from '../config/authApiFormData.config';
import { deleteAuthTokens } from '../config/auth';
export class UserService {
  static async fetchUserProfile(callback) {
    try {
      const response = await api.get('/user/profile/details');
      callback({ success: true, data: response.data });
    } catch (error) {
      callback({ success: false, error: error.message });
    }
  }

  static async logout() {
    await deleteAuthTokens();
  }

  static async saveFcmToken({ token, platform }, callback) {
    try {
      const response = await api.post('/user/profile/save-device-token', {
        device_token: token,
        device_type: platform,
      });
      callback({ success: true, data: response.data });
    } catch (error) {
      callback({ success: false, error: error.message });
    }
  }

  static async updateProfile(formData, callback) {
    try {
      const response = await apiMultipart.post('/user/profile/update', formData);
      callback({ success: true, data: response.data });
    } catch (error) {
      callback({ success: false, error: error.message });
    }
  }
}
