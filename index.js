/**
 * @format
 */

import 'react-native-gesture-handler';
import { registerGlobals } from 'react-native-webrtc';
registerGlobals();
import { Alert, AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { Provider } from 'react-redux';
import store from './src/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { EventType } from '@notifee/react-native';
import { setBackgroundMessageHandler, createNotificationChannels } from './src/services/notification.service';

const PENDING_NOTIFICATION_PRESS_KEY = '@pending_notification_press_payload';

// Required for Notifee to handle background/quit-state notification events
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
    const payload = {
      source: 'notifee.background',
      notification: detail?.notification,
      data: detail?.notification?.data,
      pressAction: detail?.pressAction,
      timestamp: Date.now(),
    };

    try {
      await AsyncStorage.setItem(
        PENDING_NOTIFICATION_PRESS_KEY,
        JSON.stringify(payload),
      );
    } catch (error) {
      console.log('Failed to persist background notification press payload:', error);
    }
  }
});

// Create channels at startup so FCM auto-display uses the correct channel with custom sound
createNotificationChannels();

setBackgroundMessageHandler();

const RootApp = () => (
  <Provider store={store}>
    <App />
  </Provider>
);
AppRegistry.registerComponent(appName, () => RootApp);
