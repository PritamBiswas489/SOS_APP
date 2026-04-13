import React, { useCallback, useEffect, useRef, useState } from 'react';
import {Alert, StatusBar, DeviceEventEmitter} from 'react-native';
import {NavigationContainer, createNavigationContainerRef} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Toast, {BaseToast, ErrorToast} from 'react-native-toast-message';
import DrawerNavigator from './src/navigation/DrawerNavigator';
import SplashScreen from './src/screens/splashScreen/index.jsx';
import LoginScreen from './src/screens/loginScreen/index.jsx';
import AddContactsScreen from './src/screens/addContactsScreen/index.jsx';
import ProcessScreen from './src/screens/processScreen/index.jsx';
import { SocketProvider } from './src/context/SocketContext';
import { ChatProvider } from './src/context/ChatContext';
import { TrustedContactsProvider } from './src/context/TrustedProviderContext.jsx';
import NetInfo from '@react-native-community/netinfo';
import InAppNotificationBanner from './src/components/inAppNotificationBanner/index.jsx'; 
import NoInternetScreen from './src/components/noInternetScreen/index.jsx';
import {
  createNotificationChannels,
  requestNotificationPermissions,
  subscribeForegroundNotifications,
  subscribeNotificationPress,
} from './src/services/notification.service';
import { useDispatch } from 'react-redux';
import { currentScreenActions } from './src/store/redux/currentScreen.redux';

import { useChatContacts } from './src/hook/useChatContacts.jsx';
import { useTrustedContacts } from './src/hook/useTrustedContacts.jsx';
import { useIncommingRequests } from './src/hook/useIncommingRequests.jsx';
import { useOutgoingRequests } from './src/hook/useOutgoingRequests.jsx';

const navigationRef = createNavigationContainerRef();
const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{borderLeftColor: '#00c48c', backgroundColor: '#111', borderRadius: 8}}
      contentContainerStyle={{paddingHorizontal: 15}}
      text1Style={{color: '#fff', fontSize: 14, fontWeight: 'bold'}}
      text2Style={{color: '#aaa', fontSize: 12}}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{borderLeftColor: '#ff3b5c', backgroundColor: '#111', borderRadius: 8}}
      contentContainerStyle={{paddingHorizontal: 15}}
      text1Style={{color: '#fff', fontSize: 14, fontWeight: 'bold'}}
      text2Style={{color: '#aaa', fontSize: 12}}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={{borderLeftColor: '#4a9eff', backgroundColor: '#111', borderRadius: 8}}
      contentContainerStyle={{paddingHorizontal: 15}}
      text1Style={{color: '#fff', fontSize: 14, fontWeight: 'bold'}}
      text2Style={{color: '#aaa', fontSize: 12}}
    />
  ),
};
const Stack = createNativeStackNavigator();

const App = () => {
  const dispatch = useDispatch();
  const [isConnected, setIsConnected] = useState(true);
  const pendingNavigationRef = useRef(null);
  const routeNameRef = useRef(null);
  const [banner, setBanner] = useState({ visible: false, title: '', body: '' });
  const {  fetchChatContacts } = useChatContacts();
  const { fetchTrustedContacts } = useTrustedContacts();
  const { fetchIncommingRequests } = useIncommingRequests();
  const { fetchOutgoingRequests } = useOutgoingRequests();

  const syncCurrentScreen = useCallback(() => {
    
    const routeName = navigationRef.getCurrentRoute()?.name;
    if (!routeName || routeNameRef.current === routeName) {
      return;
    }
     
    console.log('Current screen changed:', routeName); 
    routeNameRef.current = routeName;
    dispatch(currentScreenActions.setCurrentScreen(routeName));
  }, [dispatch]);

  const navigateToContacts = useCallback(() => {
    if (navigationRef.isReady()) {
      navigationRef.navigate('Main', { screen: 'Contacts' });
      return;
    }

    pendingNavigationRef.current = () => {
      navigationRef.navigate('Main', { screen: 'Contacts' });
    };
  }, []);

  const navigateToChat =useCallback(() => {
    if (navigationRef.isReady()) {
      
        navigationRef.navigate('Main', {
        screen: 'MainTabs',
        params: { screen: 'Chat' },
        });
      return;
    }

    pendingNavigationRef.current = () => {
       navigationRef.navigate('Main', {
        screen: 'MainTabs',
        params: { screen: 'Chat' },
        });
    };
  }, []);

  const showBanner = (title, body) => {
    setBanner({ visible: true, title, body });
  };

  const closeBanner = () => {
    setBanner(prev => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    const syncConnectionState = state => {
      const internetAvailable = Boolean(
        state?.isConnected && state?.isInternetReachable !== false,
      );
      setIsConnected(internetAvailable);
    };

    NetInfo.fetch().then(syncConnectionState);
    const unsubscribeNetInfo = NetInfo.addEventListener(syncConnectionState);

    return () => {
      unsubscribeNetInfo();
    };
  }, []);

  useEffect(() => {
    const setupNotifications = async () => {
      await createNotificationChannels();
      await requestNotificationPermissions();
    };

    const bannerSubscription = DeviceEventEmitter.addListener(
      'chat:new-message-banner',
      payload => {
        const title = payload?.title || 'New Message';
        const body = payload?.body || 'You have received a new message.';
        showBanner(title, body);
      },
    );

    const notificationAction = (payload, source) => {
      const messageType = payload?.data?.messageType;
      const refreshMessageTypes = [
        'ACCEPTED_TRUSTED_CONTACT',
        'DELETED_TRUSTED_CONTACT',
        'REMOVED_BY_TRUSTED_CONTACT',
        'NEW_TRUSTED_CONTACT_INVITATION'
      ];

      if (refreshMessageTypes.includes(messageType)) {
        //  fetchChatContacts();
        //  fetchTrustedContacts();
        //  fetchIncommingRequests();
        //  fetchOutgoingRequests();
         if (source === 'mobilenotification') {
          navigateToContacts();
         }
      }
      if(messageType === 'CHAT_MESSAGE') {
       // Alert.alert('New Message', 'You have received a new message.');
        if (source === 'mobilenotification') { 
           navigateToChat();
        }

      }
    };

    const handleNotificationPress = payload => {
      console.log('Notification clicked:', payload);
      notificationAction(payload, 'mobilenotification');
    };

    const handleForegroundNotification = payload => {
      console.log('Foreground notification received:', payload);
      const title =
        payload?.remoteMessage?.notification?.title ||
        payload?.data?.title ||
        'SOS App';
      const body =
        payload?.remoteMessage?.notification?.body ||
        payload?.data?.body ||
        '';
      showBanner(title, body);
      notificationAction(payload, 'foreground');
    };

    setupNotifications();
    const unsubscribe = subscribeForegroundNotifications(handleForegroundNotification);
    const unsubscribePress = subscribeNotificationPress(handleNotificationPress);

    return () => {
      unsubscribe();
      unsubscribePress();
      bannerSubscription.remove();
    };
  }, [
    fetchChatContacts,
    fetchTrustedContacts,
    fetchIncommingRequests,
    fetchOutgoingRequests,
    navigateToContacts,
  ]);

  const handleRetryConnection = () => {
    NetInfo.fetch().then(state => {
      const internetAvailable = Boolean(
        state?.isConnected && state?.isInternetReachable !== false,
      );
      setIsConnected(internetAvailable);
    });
  };

  if (!isConnected) {
    return (
      <GestureHandlerRootView style={{flex: 1}}>
        <SafeAreaProvider>
          <StatusBar barStyle="light-content" backgroundColor="#020B1B" />
          <NoInternetScreen onRetry={handleRetryConnection} />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <SocketProvider>
      <TrustedContactsProvider>
        <ChatProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
              <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />
              <InAppNotificationBanner
                visible={banner.visible}
                title={banner.title}
                body={banner.body}
                onClose={closeBanner}
              />
              <NavigationContainer
                ref={navigationRef}
                onReady={() => {
                  if (pendingNavigationRef.current) {
                    pendingNavigationRef.current();
                    pendingNavigationRef.current = null;
                  }
                  syncCurrentScreen();
                }}
                onStateChange={syncCurrentScreen}
              >
                <Stack.Navigator
                  initialRouteName="Splash"
                  screenOptions={{ headerShown: false }}
                >
                  <Stack.Screen name="Splash" component={SplashScreen} />
                  <Stack.Screen name="Process" component={ProcessScreen} />
                  <Stack.Screen name="Login" component={LoginScreen} />
                  <Stack.Screen
                    name="AddContact"
                    component={AddContactsScreen}
                  />
                  <Stack.Screen name="Main" component={DrawerNavigator} />
                </Stack.Navigator>
              </NavigationContainer>
              <Toast config={toastConfig} />
            </SafeAreaProvider>
          </GestureHandlerRootView>
        </ChatProvider>
      </TrustedContactsProvider>
    </SocketProvider>
  );
};

export default App;
