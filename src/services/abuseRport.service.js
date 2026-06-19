import { uploadMedia } from "../config/apiClient";
export class AbuseReportService {
    static async registerNewAbuser(formData, callback) {
        try {
            const response = await uploadMedia('/abuser-report/register-new-abuser', formData);
            callback({ success: true, data: response.data });
        } catch (error) {
            console.log('❌ Error submitting abuse report:', error?.message);
            callback({ success: false, error: error.message });
        }
    }
    static async registerNewAbuseReport(formData, callback) {
        try {
            const response = await uploadMedia('/abuser-report/register-new-report', formData);
            callback({ success: true, data: response.data });
        } catch (error) {
            console.log('❌ Error submitting abuse report:', error?.message);
            callback({ success: false, error: error.message });
        }
    }
    static async  getExistingAbuser(callback) {
        try {
            const response = await uploadMedia('/abuser-report/get-existing-abuser');
            callback({ success: true, data: response.data });
        } catch (error) {
            console.log('❌ Error fetching existing abuser:', error?.message);
            callback({ success: false, error: error.message });
        }
    }

}