import api from '../config/authApi.config';
export class SOSService {
  static async createNewSOS(callback) {
    try {
      const response = await api.post(
        '/sos/register-sos',
        {},
      );
      callback({ success: true, data: response.data });
    } catch (error) {
      console.log('❌ Error creating SOS:', error?.message);
      callback({ success: false, error: error.message });
    }
  }
}
