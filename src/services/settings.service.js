import api from '../config/authApi.config';

export class SettingsService {
  static async getSettings(callback) {
    try {
      const response = await api.get('/settings/get-settings');
      callback({ success: true, data: response.data });
    } catch (error) {
      console.log('❌ Error fetching settings:', error?.message);
      callback({ success: false, error: error.message });
    }
  }
}
