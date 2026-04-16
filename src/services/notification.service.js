import { Platform } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {
  getMessaging,
  requestPermission,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
  setBackgroundMessageHandler as setFCMBackgroundHandler,
  AuthorizationStatus,
  getToken,
} from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';

// Modular API: get the messaging instance once
const getMsg = () => getMessaging(getApp());

export const NOTIFICATION_CHANNELS = {
  CHAT: 'chat_channel',
  SOS: 'sos_channel',
};

let onNotificationPress = null;

const getChannelByMessage = remoteMessage => {
  const type = remoteMessage?.data?.type || remoteMessage?.data?.category || '';
  const normalizedType = String(type).toLowerCase();

  if (normalizedType === 'sos' || normalizedType === 'emergency' || normalizedType === 'danger') {
    return NOTIFICATION_CHANNELS.SOS;
  }

  return NOTIFICATION_CHANNELS.CHAT;
};

export const createNotificationChannels = async () => {
  if (Platform.OS !== 'android') {
    return;
  }

  // Add matching files to android/app/src/main/res/raw:
  // chat_tone.mp3 and sos_alert.mp3

  await notifee.createChannel({
    id: NOTIFICATION_CHANNELS.CHAT,
    name: 'Chat Notifications',
    importance: AndroidImportance.HIGH,
    sound: 'chat_tone',
    vibration: true,
  });

  await notifee.createChannel({
    id: NOTIFICATION_CHANNELS.SOS,
    name: 'SOS Notifications',
    importance: AndroidImportance.HIGH,
    sound: 'sos_alert',
    vibration: true,
  });
};

export const requestNotificationPermissions = async () => {
  await notifee.requestPermission();
  await requestPermission(getMsg());
};

export const requestUserPermission = async () => {
  try {
    const authStatus = await requestPermission(getMsg());
    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;
    return enabled;
  } catch (error) {
    console.log('❌ Error requesting notification permission:', error);
    return false;
  }
};

export const getFCMToken = async () => {
  try {
    const fcmToken = await getToken(getMsg());
    if (fcmToken) {
      return fcmToken;
    }
    console.log('Failed to get FCM token');
    return null;
  } catch (error) {
    console.log('❌ Error getting FCM token:', error);
    return null;
  }
};

export const displayRemoteNotification = async remoteMessage => {
  const channelId = getChannelByMessage(remoteMessage);
  const title = remoteMessage?.notification?.title || remoteMessage?.data?.title || 'SOS App';
  const body = remoteMessage?.notification?.body || remoteMessage?.data?.body || '';

  await notifee.displayNotification({
    title,
    body,
    data: remoteMessage?.data,
    android: {
      channelId,
      smallIcon: 'ic_launcher',
      pressAction: {
        id: 'default',
      },
    },
  });
};

export const subscribeForegroundNotifications = onForegroundMessage => {
  return onMessage(getMsg(), async remoteMessage => {
    if (typeof onForegroundMessage === 'function') {
      onForegroundMessage({
        source: 'messaging.foreground',
        remoteMessage,
        data: remoteMessage?.data,
      });
    }

    await displayRemoteNotification(remoteMessage);
  });
};

export const setBackgroundMessageHandler = () => {
  setFCMBackgroundHandler(getMsg(), async remoteMessage => {
    await createNotificationChannels();
    await displayRemoteNotification(remoteMessage);
  });
};

export const subscribeNotificationPress = handler => {
  onNotificationPress = handler;

  const triggerPressCallback = payload => {
    if (typeof onNotificationPress === 'function') {
      onNotificationPress(payload);
    }
  };

  const notifeeUnsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
      triggerPressCallback({
        source: 'notifee.foreground',
        notification: detail?.notification,
        data: detail?.notification?.data,
        pressAction: detail?.pressAction,
      });
    }
  });

  const messagingUnsubscribe = onNotificationOpenedApp(getMsg(), remoteMessage => {
    triggerPressCallback({
      source: 'messaging.opened',
      remoteMessage,
      data: remoteMessage?.data,
    });
  });

  getInitialNotification(getMsg()).then(remoteMessage => {
    if (remoteMessage) {
      triggerPressCallback({
        source: 'messaging.initial',
        remoteMessage,
        data: remoteMessage?.data,
      });
    }
  });

  notifee
    .getInitialNotification()
    .then(initialNotification => {
      if (initialNotification?.notification) {
        triggerPressCallback({
          source: 'notifee.initial',
          notification: initialNotification.notification,
          data: initialNotification.notification?.data,
          pressAction: initialNotification.pressAction,
        });
      }
    });

  return () => {
    notifeeUnsubscribe();
    messagingUnsubscribe();
    onNotificationPress = null;
  };
};
