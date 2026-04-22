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
import notifee, { EventType } from '@notifee/react-native';
import { setBackgroundMessageHandler, createNotificationChannels } from './src/services/notification.service';

// Required for Notifee to handle background/quit-state notification events
notifee.onBackgroundEvent(async ({ type, detail }) => {
  // Returning without action is sufficient — this registration is mandatory
  // for Notifee to display notifications when the app is in the background.
   
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
