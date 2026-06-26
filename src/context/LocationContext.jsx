import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { AppState } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import BackgroundActions from 'react-native-background-actions';
import { useSocket } from './SocketContext';
import { useUserData } from '../hook/useUserData';
import { useContactLocations } from '../hook/useContactLocations';
import { LocationsService } from '../services/locations.service';
import useUserAuth from '../hook/useUserAuth';
import { checkLocationPermission } from '../services/permissions.service';

const LocationContext = createContext(null);

// ─── Background Task Definition ───────────────────────────────────────────────
// Does NOT call Geolocation directly — Android's headless JS context blocks it.
// Instead, sets a global flag so the foreground watchPosition marks updates as bg:true.
// The task's only job is to keep the Android Foreground Service notification alive,
// which prevents the OS from killing the app process while backgrounded.
const backgroundLocationTask = async taskData => {
  await new Promise(resolve => {
    // ✅ Signal foreground watchPosition to mark upcoming updates as background
    global.__isBackgroundTask = true;
    console.log('🟡 BG TASK STARTED — foreground watcher will now emit bg: true');

    const keepAlive = setInterval(() => {}, 10000);

    BackgroundActions.on('expiration', () => {
      global.__isBackgroundTask = false;
      clearInterval(keepAlive);
      console.log('🔴 BG TASK EXPIRED — cleaning up');
      resolve();
    });
  });
};

// ─── Background service options ───────────────────────────────────────────────
const backgroundOptions = {
  taskName: 'LocationSharing',
  taskTitle: 'Location Sharing Active',
  taskDesc: 'Your location is being shared with your Trusted contacts',
  taskIcon: {
    name: 'ic_launcher', // must exist in android/app/src/main/res/mipmap-*
    type: 'mipmap',
  },
  color: '#6C63FF',
  linkingURI: undefined,
  parameters: {},
  foregroundServiceType: ['location'],
};

export const LocationProvider = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [isBackground, setIsBackground] = useState(false);
  const { on, emitNoAck, emit, isConnected } = useSocket();

  const watchIdRef = useRef(null);
  const onLocationUpdateRef = useRef(null);
  const isTrackingRef = useRef(false);
  const locationIntervalRef = useRef(null);
  const currentLocationRef = useRef(null);
  const isBackgroundRef = useRef(false);
  const startTrackingRef = useRef(null);
  const stopTrackingRef = useRef(null);
  const bgStartingRef = useRef(false);

  const { setUserData: updateUserCurrentLocation } = useUserData();
  const updateUserCurrentLocationRef = useRef(updateUserCurrentLocation);
  useEffect(() => {
    updateUserCurrentLocationRef.current = updateUserCurrentLocation;
  });

  const { updateContactLocations } = useContactLocations();
  const { userData } = useUserData();
  const { isAuthenticated } = useUserAuth();

  // ── Global location callback ───────────────────────────────────────────────
  // Called by foreground watchPosition on every location update.
  // Reads global.__isBackgroundTask to determine if app is currently backgrounded.
  useEffect(() => {
    global.__locationUpdateCallback = (location, bg) => {
      // ✅ Override bg flag with the global background task flag
      const isInBackground = bg || global.__isBackgroundTask === true;
      console.log(
        '📍 LOCATION UPDATE | bg:',
        isInBackground,
        '| lat:',
        location.coords.latitude,
      );
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude,
        accuracy: location.coords.accuracy,
        heading: location.coords.heading,
        speed: location.coords.speed,
        isBackground: isInBackground,
        timestamp: location.timestamp,
      };
      setCurrentLocation(coords);
      currentLocationRef.current = coords;
      setIsBackground(isInBackground);
      isBackgroundRef.current = isInBackground;
      onLocationUpdateRef.current?.(coords);
    };

    return () => {
      global.__locationUpdateCallback = null;
    };
  }, []);

  // ── Permission helpers ─────────────────────────────────────────────────────
  const requestPermissions = useCallback(async () => {
    try {
      const status = await checkLocationPermission();
      console.log('Location permission status:', status);
      setPermissionStatus(status);
      return status;
    } catch (err) {
      setLocationError(err.message);
      return 'denied';
    }
  }, []);

  // ── Start Tracking ─────────────────────────────────────────────────────────
  const startTracking = useCallback(
    async onUpdate => {
      if (isTrackingRef.current) return;

      if (AppState.currentState !== 'active') {
        console.warn('startTracking: app not in foreground, skipping');
        return;
      }

      isTrackingRef.current = true;
      onLocationUpdateRef.current = onUpdate;

      let granted;
      try {
        granted = await requestPermissions();
        console.log('Starting location tracking with permission status:', granted);
      } catch (err) {
        console.error('requestPermissions threw:', err);
        isTrackingRef.current = false;
        return;
      }

      if (granted === 'denied') {
        isTrackingRef.current = false;
        return;
      }

      try {
        // ✅ Foreground watchPosition — this is the ONLY location source.
        // When the app is backgrounded, global.__isBackgroundTask = true
        // causes the callback to mark coords as isBackground: true.
        watchIdRef.current = Geolocation.watchPosition(
          location => {
            const isBg = global.__isBackgroundTask === true;
            console.log(
              '📍 FG WATCHER FIRED | bg:',
              isBg,
              '| lat:',
              location.coords.latitude,
            );
            global.__locationUpdateCallback?.(location, isBg);
          },
          error => {
            console.error('Foreground location error:', error.message);
            setLocationError(error.message);
          },
          {
            accuracy: { android: 'high', ios: 'hundredMeters' },
            distanceFilter: 10,
            forceRequestLocation: true,
            interval: 5000,
            fastestInterval: 3000,
            allowsBackgroundLocationUpdates: true,   // ✅ iOS critical
            pausesLocationUpdatesAutomatically: false,
            showsBackgroundLocationIndicator: true,
          },
        );

        // ✅ Start background foreground service (keeps process alive on Android)
        const isAppInForeground = AppState.currentState === 'active';
        const running = await BackgroundActions.isRunning();

        if (
          granted === 'full' &&
          !running &&
          isAppInForeground &&
          !bgStartingRef.current
        ) {
          console.log('BackgroundActions: Starting background location task...');
          bgStartingRef.current = true;
          try {
            await BackgroundActions.start(backgroundLocationTask, backgroundOptions);
            console.log(
              'BackgroundActions is running:',
              await BackgroundActions.isRunning(),
            );
          } catch (err) {
            console.error('Failed to start background location service:', err);
          } finally {
            bgStartingRef.current = false;
          }
        } else if (granted === 'full' && !isAppInForeground) {
          console.log(
            'BackgroundActions: Skipped start — app is in background. Will start when app returns to foreground.',
          );
        }

        setIsTracking(true);
        setLocationError(null);
      } catch (err) {
        console.error('startTracking error:', err);
        isTrackingRef.current = false;
        setLocationError(err.message);
      }
    },
    [requestPermissions],
  );
  startTrackingRef.current = startTracking;

  // ── Stop Tracking ──────────────────────────────────────────────────────────
  const stopTracking = useCallback(async () => {
    if (watchIdRef.current !== null) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    const running = await BackgroundActions.isRunning();
    if (running) {
      await BackgroundActions.stop().catch(() => {});
    }

    // ✅ Reset global background flag on stop
    global.__isBackgroundTask = false;

    onLocationUpdateRef.current = null;
    isTrackingRef.current = false;
    setIsTracking(false);
    setCurrentLocation(null);
  }, []);
  stopTrackingRef.current = stopTracking;

  // ── One-shot current position ──────────────────────────────────────────────
  const getCurrentPosition = useCallback(async () => {
    return new Promise(resolve => {
      Geolocation.getCurrentPosition(
        loc => {
          resolve({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            altitude: loc.coords.altitude,
            accuracy: loc.coords.accuracy,
            heading: loc.coords.heading,
            speed: loc.coords.speed,
          });
        },
        error => {
          setLocationError(error.message);
          resolve(null);
        },
        {
          accuracy: { android: 'balanced', ios: 'hundredMeters' },
          timeout: 5000,
          maximumAge: 30000,
          forceRequestLocation: false,
        },
      );
    });
  }, []);

  const updateCurrentLocation = useCallback(
    async location => {
      console.log('Updating current location in context:', location);
      if (location?.latitude && location?.longitude) {
        const updatedLocation = {
          latitude: location.latitude,
          longitude: location.longitude,
          altitude: location.altitude || 0,
          accuracy: location.accuracy || 0,
          heading: location.heading || 0,
          speed: location.speed || 0.5,
          isBackground: isBackgroundRef.current,
        };
        emitNoAck('location:update', JSON.stringify({ loc: updatedLocation }));
      }
    },
    [emitNoAck],
  );

  const updateMyGprsLocation = useCallback(async () => {
    console.log('Updating current location from GPRS...');
    const location = await getCurrentPosition();
    if (location?.latitude && location?.longitude) {
      const updatedLocation = {
        latitude: location.latitude,
        longitude: location.longitude,
        altitude: location.altitude || 0,
        accuracy: location.accuracy || 0,
        heading: location.heading || 0,
        speed: location.speed || 0.5,
        isBackground: isBackgroundRef.current,
      };
      emitNoAck('location:update', JSON.stringify({ loc: updatedLocation }));
    }
  }, [emitNoAck, getCurrentPosition]);

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  // ── AppState listener — reset bg flag + restart service on foreground ──────
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async nextAppState => {
      if (nextAppState === 'active') {
        // ✅ App returned to foreground — reset background flag
        global.__isBackgroundTask = false;
        console.log('📱 App foregrounded — bg flag reset to false');

        // Restart background service if it died while app was backgrounded
        const running = await BackgroundActions.isRunning();
        if (
          isTrackingRef.current &&
          permissionStatus === 'full' &&
          !running &&
          !bgStartingRef.current
        ) {
          bgStartingRef.current = true;
          await new Promise(resolve => setTimeout(resolve, 300));
          try {
            console.log('App returned to foreground, starting background location task...');
            await BackgroundActions.start(backgroundLocationTask, backgroundOptions);
          } catch (err) {
            console.error('Failed to start background service on foreground return:', err);
          } finally {
            bgStartingRef.current = false;
          }
        }
      } else if (nextAppState === 'background') {
        // ✅ App going to background — set flag so watcher emits bg: true
        console.log('📱 App backgrounded — bg flag set to true');
        global.__isBackgroundTask = true;
      }
    });

    return () => subscription?.remove();
  }, [permissionStatus]);

  // ── Socket connection handling ─────────────────────────────────────────────
  useEffect(() => {
    if (!isConnected) {
      isTrackingRef.current = false;
      return;
    }

    const onPersonalRoomJoined = () => {
      console.log('Joined personal room, starting location tracking...');
      startTrackingRef.current(location => {
        console.log('Emitting location update to server:', location);
        emitNoAck('location:update', JSON.stringify({ loc: location }));
      });
    };

    const onLocationUpdated = payload => {
      updateContactLocations({ [payload.userId]: payload.location });
    };

    const onMyLocationUpdated = ({ location }) => {
      updateUserCurrentLocationRef.current({
        latitude: location.latitude,
        longitude: location.longitude,
      });
    };

    const unsubs = [
      on('personal:room:joined', onPersonalRoomJoined),
      on('location:updated', onLocationUpdated),
      on('location:my-updated', onMyLocationUpdated),
    ];

    emitNoAck('join:personal');

    return () => {
      unsubs.forEach(unsub => unsub());
      stopTrackingRef.current();
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
        locationIntervalRef.current = null;
      }
    };
  }, [isConnected, on, emitNoAck]);

  // ── Fetch contacts' last known locations ───────────────────────────────────
  const getContactsLastLocations = useCallback(async () => {
    console.log('Fetching contacts last locations from server...');
    try {
      const response = await Promise.race([
        new Promise((resolve, reject) => {
          LocationsService.getContactsLastLocations(result => {
            if (result.success) resolve(result.data);
            else reject(new Error(result.error || 'Unknown error'));
          });
        }),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('getContactsLastLocations timeout')),
            10000,
          ),
        ),
      ]);

      if (response?.data) {
        const initialLocations = {};
        response.data.forEach(locData => {
          initialLocations[locData.user_id] = {
            latitude: locData.latitude,
            longitude: locData.longitude,
            altitude: locData.altitude || 0,
            accuracy: locData.accuracy || 0,
            heading: locData.heading || 0,
            speed: locData.speed || 0.5,
            isBackground: true,
          };
        });
        updateContactLocations(initialLocations);
      }
    } catch (err) {
      console.error('Failed to get contacts locations:', err.message);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setTimeout(() => {
      getContactsLastLocations();
    }, 2000);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  const value = {
    currentLocation,
    locationError,
    isTracking,
    isBackground,
    permissionStatus,
    startTracking,
    stopTracking,
    getCurrentPosition,
    requestPermissions,
    getContactsLastLocations,
    updateCurrentLocation,
    updateMyGprsLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export default LocationContext;