import api from '../config/authApi.config';
export class TrustecContactService {
    static async saveTrustedContact(contactData, callback) {
         console.log('Saving trusted contact with data:', contactData);
        try {
            const response = await api.post('/trusted-contact/send-contact-invitation', contactData);
            console.log('Server response for saving trusted contact:', response.data);
            callback({ success: true, data: response.data });
        } catch (error) {
            console.log('❌ Error saving trusted contact:', error?.message);
            callback({ success: false, error: error.message });
        }

    }
}