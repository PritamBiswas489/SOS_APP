import axios from 'axios';
import { getAuthTokens, setAuthTokens } from './auth';
 
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { getAppUrl } from './utility';
import * as storeage from "../utils/localstorage/index.jsx";

const app_url =  getAppUrl();
console.log(app_url + '/api-mobile/auth');
const api = axios.create({
    baseURL: app_url + '/api-mobile/auth',
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
    const languageCode = await storeage.getValue('languageCode');
     
    config.headers = {
    ...config.headers,
    "Content-Type": "multipart/form-data",
    Authorization: 'Bearer ' + accessToken,
    refreshToken: refreshToken,
    'X-localization': languageCode || 'en',
  };
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
        return Promise.reject(new Error('UNAUTHORIZED'));
         
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
     console.log("================================")
    //console.error(error?.response?.data?.error?.message);
    return Promise.reject(error?.response?.data?.error?.message ?  new Error(error.response.data.error.message) : error);
});
export default api;
