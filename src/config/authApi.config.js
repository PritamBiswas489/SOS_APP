import axios from 'axios';
import { getAuthTokens, setAuthTokens } from './auth';
 
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { getAppUrl } from './utility';
import { getValue } from '@src/utils/localstorage';

const app_url =  getAppUrl();
console.log(app_url + '/api/v1');
const api = axios.create({
	baseURL: app_url + '/api/v1',
	timeout: 15000,
});

const navigateToLogin = () => {
	const navigation = useNavigation();
	navigation.navigate('Login'); // Replace 'Login' with the actual name of your login screen
  };
const resetStateData = ()=>{
	// const dispatch = useDispatch();
	// dispatch(userAccountDataActions.resetState());
}

api.interceptors.request.use(async (config) => {
	const {accessToken, refreshToken} = await getAuthTokens();
    const languageCode = await getValue('languageCode');
	 
	if(config.method!=='get'){
		config.headers = {
            ...config.headers,
			'Content-Type': 'multipart/form-data',
			'Authorization': 'Bearer ' + accessToken,
            'X-localization': languageCode || 'en',  
		};
	}else{
		config.headers = {
            ...config.headers,
			'Authorization': 'Bearer ' + accessToken,
            'X-localization': languageCode || 'en', 
		};
	}
    // console.log(config.headers)
	const fullRequestUrl = `${config.baseURL}${config.url}`;
	console.log('Request URL:', fullRequestUrl);
	
	return config;
});

api.interceptors.response.use(async (res) => {
    const accesstoken = res?.data?.meta?.accesstoken || '';
    const refreshtoken = res?.data?.meta?.refreshtoken || '';

    if (accesstoken && refreshtoken) {
        await setAuthTokens(accesstoken, refreshtoken);
    }
    if (res?.data?.status === 401) {
        resetStateData();
    }
    return res;
}, error => {
    console.error('Response Error:', error);
    if (error.response) {
        // The request was made and the server responded with a status code outside the range of 2xx
        console.error('Response Data:', error.response.data);
        console.error('Response Status:', error.response.status);
        console.error('Response Headers:', error.response.headers);
    } else if (error.request) {
        // The request was made but no response was received
        console.error('Request Data:', error.request);
    } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error Message:', error.message);
    }
    return Promise.reject(error);
});
export default api;
