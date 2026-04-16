import React from 'react';
import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Spinner from 'react-native-loading-spinner-overlay';
import { UserService } from '../../services/user.service';
import { useDispatch } from 'react-redux';
import { useUserData } from '../../hook/useUserData';
import { requestUserPermission, getFCMToken } from '../../services/notification.service';
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
  const { fetchUserData } = useUserData();
  

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

        const isPermissionGranted = await requestUserPermission();
        if (isPermissionGranted) {
          const fcmToken = await getFCMToken();
          console.log("fcmToken in process screen:", fcmToken);
          if (fcmToken) {
            saveFcmTokenData(fcmToken);
          }
        }
         


       console.log('=====================================================');
       console.log('Fetching user profile data after login');
       console.log('=====================================================');
        const data =  await fetchUserData();
        console.log('=====================================================');
        console.log('User profile data fetched successfullyyyyyy:', data);
        console.log('=====================================================');
        console.log("Trusted Contacts for Join Socket Room need to be fetched here");
        console.log('=====================================================');
        await fetchChatContacts();
        console.log('=====================================================');
        console.log('Data retrieval successful, navigating to Main screen');
        console.log('=====================================================');

        if(!data?.id){
            console.log('❌ User data is missing id after login. Navigating back to Login screen.');
            navigation.replace('Login');
            return;
        }
        if(data?.first_time_login){
            console.log('First time login detected, navigating to CompleteProfile screen');
            navigation.replace('CompleteProfile');
            return;
        }
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
