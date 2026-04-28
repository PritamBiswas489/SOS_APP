import React, { useCallback, useEffect, useRef, useState } from 'react';
import {Alert, StatusBar, DeviceEventEmitter, Platform, AppState} from 'react-native';
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
import { LocationProvider } from './src/context/LocationContext.jsx';
import { TrustedContactsProvider } from './src/context/TrustedProviderContext.jsx';
import HealthProvider from './src/context/HealthProvider.jsx';

import NetInfo from '@react-native-community/netinfo';
import InAppNotificationBanner from './src/components/inAppNotificationBanner/index.jsx'; 
import NoInternetScreen from './src/components/noInternetScreen/index.jsx';
import NoPermissionsScreen from './src/components/noPermissionsScreen/index.jsx';
import { checkRequiredPermissions, requestLocationPermissions, requestMicrophonePermission } from './src/services/permissions.service';
import CompleteProfileScreen from './src/screens/completeProfileScreen/index.jsx';
import {
  createNotificationChannels,
  requestNotificationPermissions,
  subscribeForegroundNotifications,
  subscribeNotificationPress,
  consumePendingNotificationPress,
} from './src/services/notification.service';
import { useDispatch } from 'react-redux';
import { currentScreenActions } from './src/store/redux/currentScreen.redux';

import { useChatContacts } from './src/hook/useChatContacts.jsx';
import { useTrustedContacts } from './src/hook/useTrustedContacts.jsx';
import { useIncommingRequests } from './src/hook/useIncommingRequests.jsx';
import { useOutgoingRequests } from './src/hook/useOutgoingRequests.jsx';
import { CreatorMediaSoupProvider } from './src/context/CreatorMediaSoupContext.jsx';
import { ListenerMediaSoupProvider } from './src/context/ListenerMediaSoupContext.jsx';
import SOSAlertModal, { DUMMY_INCOMING_SOS, DUMMY_OUTGOING_SOS } from './src/components/sosAlertModal/index.jsx';
import SosFab from './src/components/sosFab/index.jsx';
import { useIncomingSosNotifications } from './src/hook/useIncomingSosNotifications.jsx';
import { useMySosSessions } from './src/hook/useMySosSessions.jsx';
import { initCrashLogger, logError } from './src/middleware/nativeCrashLogger.js';
// initCrashLogger();
// logError(new Error('Test error from App.jsx to verify crash logging is working correctly')); 
// Isolated so that opening from FAB only re-renders this component logic
const SOSController = React.memo(({ fabVisible, navigationRef, sosModalVisible, setSosModalVisible }) => {
  const [isOpening, setIsOpening] = useState(false);

  const handleFabPress = () => {
    setIsOpening(true); 
    setSosModalVisible(true);
  };

  const handleOpened = () => setIsOpening(false);

  return (
    <>
      <SosFab
        visible={fabVisible}
        onPress={handleFabPress}
        loading={isOpening}
      />
      <SOSAlertModal
        visible={sosModalVisible}
        navigationRef={navigationRef}
        onClose={() => setSosModalVisible(false)}
        onOpened={handleOpened}
      />
    </>
  );
});
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
  console.log('App rendered');
  const dispatch = useDispatch();
  
  const [isConnected, setIsConnected] = useState(true);
  const [sosModalVisible, setSosModalVisible] = useState(false);
  const [missingPermissions, setMissingPermissions] = useState(null); // null = checking
  const appStateRef = useRef(AppState.currentState);
  const pendingNavigationRef = useRef(null);
  const pendingSosRef = useRef(false);
  const routeNameRef = useRef(null);
  const [activeScreen, setActiveScreen] = useState(null);
  const [banner, setBanner] = useState({ visible: false, title: '', body: '' });
  const [incomingVictims, setIncomingVictims] = useState(DUMMY_INCOMING_SOS);
  const [outgoingVictims, setOutgoingVictims] = useState(DUMMY_OUTGOING_SOS);
  const { fetchSosNotifications } = useIncomingSosNotifications();
  const { fetchMySosSessions } = useMySosSessions();

  const openSosModalFromNotification = useCallback(() => {
    if (AppState.currentState === 'active') {
      pendingSosRef.current = false;
      setSosModalVisible(true);
      return;
    }

    pendingSosRef.current = true;
    // Handles resume race: notification press can arrive before appStateRef is updated.
    setTimeout(() => {
      if (pendingSosRef.current && AppState.currentState === 'active') {
        pendingSosRef.current = false;
        setSosModalVisible(true);
      }
    }, 450);
  }, []);

  const handleCheckPermissions = useCallback(async () => {
    // First, prompt the user to grant permissions, then check what is still missing
    await requestLocationPermissions();
    await requestNotificationPermissions();
    await requestMicrophonePermission();
    const missing = await checkRequiredPermissions();
    setMissingPermissions(missing);
  }, []);

  // Check permissions on mount
  useEffect(() => {
    handleCheckPermissions();
  }, [handleCheckPermissions]);

  // Re-check permissions when app comes back to foreground (user returns from Settings)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async nextState => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextState === 'active'
      ) {
        // Flush any SOS modal that was triggered from a background notification tap
        if (pendingSosRef.current) {
          pendingSosRef.current = false;
          setSosModalVisible(true);
        }

        // Only update state if missingPermissions actually changes
        const missing = await checkRequiredPermissions();
        setMissingPermissions(prev => {
          if (Array.isArray(prev) && Array.isArray(missing) && prev.length === missing.length && prev.every((v, i) => v === missing[i])) {
            return prev;
          }
          return missing;
        });
      }
      appStateRef.current = nextState;
    });
    return () => subscription.remove();
  }, []);

  const syncCurrentScreen = useCallback(() => {
    
    const routeName = navigationRef.getCurrentRoute()?.name;
    if (!routeName || routeNameRef.current === routeName) {
      return;
    }
     
    console.log('Current screen changed:', routeName); 
    routeNameRef.current = routeName;
    setActiveScreen(routeName);
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

  const navigateToChat = useCallback(() => {
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

  const notificationAction = useCallback((payload) => {
     
    const payloadData =
      payload?.data ||
      payload?.remoteMessage?.data ||
      payload?.notification?.data ||
      {};
    const messageType = String(payloadData?.messageType || payloadData?.type || '').toUpperCase();
    const refreshMessageTypes = [
      'ACCEPTED_TRUSTED_CONTACT',
      'DELETED_TRUSTED_CONTACT',
      'REMOVED_BY_TRUSTED_CONTACT',
      'NEW_TRUSTED_CONTACT_INVITATION',
    ];

    if (refreshMessageTypes.includes(messageType)) {
      navigateToContacts();
    }
    if (payloadData?.fetchSOS) {
        fetchSosNotifications();
      }

    if (messageType === 'SOS') {
      
      openSosModalFromNotification();
    }
    if (payloadData?.fetchVictimSOS) {
        fetchMySosSessions();
    }
    if (messageType === 'VICTIM') {
     
    }

    if (messageType === 'CHAT_MESSAGE') {
      navigateToChat();
    }
  }, [fetchMySosSessions, fetchSosNotifications, navigateToContacts, navigateToChat, openSosModalFromNotification]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async nextState => {
      if (nextState !== 'active') {
        return;
      }

      const pendingPressPayload = await consumePendingNotificationPress();
      if (pendingPressPayload) {
        console.log('Consumed pending background notification press:', pendingPressPayload);
        notificationAction(pendingPressPayload);
      }
    });

    return () => subscription.remove();
  }, [notificationAction]);

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
      setIsConnected(prev => (prev !== internetAvailable ? internetAvailable : prev));
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
      
    };
    

    const bannerSubscription = DeviceEventEmitter.addListener(
      'chat:new-message-banner',
      payload => {
        const title = payload?.title || 'New Message';
        const body = payload?.body || 'You have received a new message.';
        showBanner(title, body);
      },
    );

    const handleNotificationPress = payload => {
      console.log('Notification clicked:', payload);
      notificationAction(payload);
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
      notificationAction(payload);
    };

    setupNotifications();
    const unsubscribe = subscribeForegroundNotifications(handleForegroundNotification);
    const unsubscribePress = subscribeNotificationPress(handleNotificationPress);

    return () => {
      unsubscribe();
      unsubscribePress();
      bannerSubscription.remove();
    };
  }, [navigateToContacts, notificationAction]);

  const handleRetryConnection = () => {
    NetInfo.fetch().then(state => {
      const internetAvailable = Boolean(
        state?.isConnected && state?.isInternetReachable !== false,
      );
      setIsConnected(internetAvailable);
    });
  };

  const renderContent = () => {
    if (!isConnected) {
      return (
        <>
          <StatusBar barStyle="light-content" backgroundColor="#020B1B" />
          <NoInternetScreen onRetry={handleRetryConnection} />
        </>
      );
    }

    // Still checking permissions on first load
    if (missingPermissions === null) {
      return null;
    }

    if (missingPermissions.length > 0) {
      return (
        <>
          <StatusBar barStyle="light-content" backgroundColor="#020B1B" />
          <NoPermissionsScreen
            missingPermissions={missingPermissions}
            onRetry={handleCheckPermissions}
          />
        </>
      );
    }

    return (
      <>
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
            <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
            <Stack.Screen
              name="AddContact"
              component={AddContactsScreen}
            />
            <Stack.Screen name="Main" component={DrawerNavigator} />
          </Stack.Navigator>
        </NavigationContainer>
        <Toast config={toastConfig} />
      </>
    );
  };

  return (
    <SocketProvider>
      <CreatorMediaSoupProvider>
      <ListenerMediaSoupProvider>
      <TrustedContactsProvider>
        <ChatProvider>
          <LocationProvider>
            <HealthProvider
              userAge={28}              // user's age → used for max HR calculation
              criticalThreshold={80}   // stress score that triggers SOS alert
              gfRefreshMs={30_000}     // Google Fit polling interval
              onSos={() => {}}         // called when user confirms SOS

            >
            <GestureHandlerRootView style={{ flex: 1 }}>
              <SafeAreaProvider>
                {renderContent()}
              </SafeAreaProvider>
              {/* Floating SOS alert button + modal — isolated component so open/close never re-renders App */}
              <SOSController
                fabVisible={
                  isConnected &&
                  Array.isArray(missingPermissions) &&
                  missingPermissions.length === 0 &&
                  activeScreen !== null &&
                  !['Splash', 'Process', 'Login', 'CompleteProfile'].includes(activeScreen)
                }
                navigationRef={navigationRef}
                sosModalVisible={sosModalVisible}
                setSosModalVisible={setSosModalVisible}
              />
            </GestureHandlerRootView>
            </HealthProvider>
          </LocationProvider>
        </ChatProvider>
      </TrustedContactsProvider>
      </ListenerMediaSoupProvider>
      </CreatorMediaSoupProvider>
    </SocketProvider>
  );
};

export default App;
