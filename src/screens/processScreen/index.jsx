import React from 'react';
import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Spinner from 'react-native-loading-spinner-overlay';
import { UserService } from '../../services/user.service';
import { useDispatch } from 'react-redux';
import { userActions } from '../../store/redux/user.redux';
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { useChatContacts } from '../../hook/useChatContacts';

const ProcessScreen = payload => {
  const { action } = payload.route.params;
  const dispatch = useDispatch();
  const { fetchChatContacts } = useChatContacts();
  console.log('=====================================================');
  console.log('Process Screen Action:', action);
  console.log('=====================================================');
  const navigation = useNavigation();

  const saveFcmTokenData = async fcmToken => {
    // TODO: Replace this with actual API integration to store token on backend.
    console.log('=====================================================');
    console.log('Saving FCM token to server:', fcmToken);
    console.log('Platform:', Platform.OS);
    console.log('=====================================================');
    try{
        await new Promise((resolve, reject) => {
            UserService.saveFcmToken({ token: fcmToken, platform: Platform.OS }, response => {
              if (response.success) {
                resolve(response.data);
                console.log('FCM token saved successfully on server');
              } else {
                reject(
                  new Error(response?.error || 'Failed to save FCM token'),
                );
              }
            });
        });
    } catch (error) {
        console.log('❌ Error saving FCM token:', error?.message);
        if(error?.message === 'UNAUTHORIZED'){
            console.log('Unauthorized error detected while saving FCM token. Logging out user.');
            navigation.replace('Login');
        }
    }
    
  };

  useEffect(() => {
    const fetchData = async () => {
      if (action === 'retrieveDataAfterLogin') {
        
        console.log('=====================================================');
        console.log('Device token need to be sent to server here');
        console.log('=====================================================');

        const requestUserPermission = async () => {
          try {
            const authStatus = await messaging().requestPermission();
            const enabled =
              authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
              authStatus === messaging.AuthorizationStatus.PROVISIONAL;

            if (enabled) {
              console.log('Authorization status:', authStatus);
            }
            return enabled;
          } catch (error) {
            console.log('❌ Error requesting notification permission:', error);
            return false;
          }
        };

        const getFCMToken = async () => {
          try {
            const fcmToken = await messaging().getToken();
            if (fcmToken) {
              saveFcmTokenData(fcmToken);
            } else {
              console.log('Failed to get FCM token');
            }
          } catch (error) {
            console.log('❌ Error getting FCM token:', error);
          }
        };

        const isPermissionGranted = await requestUserPermission();
        if (isPermissionGranted) {
          await getFCMToken();
        }


       console.log('=====================================================');
       console.log('Fetching user profile data after login');
       console.log('=====================================================');
        try {
          const fetchUserProfile = await new Promise((resolve, reject) => {
            UserService.fetchUserProfile(response => {
              if (response.success) {
                resolve(response.data);
              } else {
                reject(
                  new Error(response?.error || 'Failed to fetch user profile'),
                );
              }
            });
          });
          console.log('=====================================================');
          console.log('User profile data fetched successfully:', fetchUserProfile);
          console.log('=====================================================');
          dispatch(userActions.setFullData(fetchUserProfile?.data));
        } catch (error) {
          //need to logout user and navigate to login screen
          navigation.replace('Login');
          console.log('❌ Data Retrieval Error:', error?.message);
          return;
        }


        console.log('=====================================================');
        console.log("Trusted Contacts for Join Socket Room need to be fetched here");
        console.log('=====================================================');
        await fetchChatContacts();
        console.log('=====================================================');
        console.log('Data retrieval successful, navigating to Main screen');
        console.log('=====================================================');

        navigation.replace('Main');
      }
    };
    fetchData();
  }, [action, dispatch, fetchChatContacts, navigation]);
  return (
    <View style={styles.container}>
      <Spinner
        visible={true}
        textContent={''}
        textStyle={{ color: '#FFF' }}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 300,
    height: 200,
  },
});

export default ProcessScreen;
