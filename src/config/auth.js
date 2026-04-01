// import Cookies from 'universal-cookie';
// const cookies = new Cookies();
import AsyncStorage from '@react-native-async-storage/async-storage';

export const setAuthTokens = async (accessToken = null, refreshToken = null) => {
	try {
	  await AsyncStorage.setItem('tourbus_access_token', accessToken || '');
	  await AsyncStorage.setItem('tourbus_refresh_token', refreshToken || '');
	  return true;
	} catch (error) {
	  console.error('Error setting authentication tokens:', error);
	  return false;
	}
  };

export const getAuthTokens = async () => {
	try {
	  const accessToken = await AsyncStorage.getItem('tourbus_access_token') || null;
	  const refreshToken = await AsyncStorage.getItem('tourbus_refresh_token') || null;
  
	  return { accessToken, refreshToken };
	} catch (error) {
	  console.error('Error retrieving authentication tokens:', error);
	  return { accessToken: null, refreshToken: null };
	}
  };

  export const deleteAuthTokens = async () => {
	try {
	  await AsyncStorage.removeItem('tourbus_access_token');
	  await AsyncStorage.removeItem('tourbus_refresh_token');
	  return true; // Indicate successful deletion
	} catch (error) {
	  console.error('Error deleting authentication tokens:', error);
	  return false; // Indicate failure
	}
  };