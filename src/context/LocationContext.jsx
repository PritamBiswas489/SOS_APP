
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { Platform, AppState } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { requestLocationPermissions } from '../services/permissions.service';
import BackgroundActions from 'react-native-background-actions';
import { useSocket } from './SocketContext';
import { useUserData } from '../hook/useUserData';
import { useContactLocations } from '../hook/useContactLocations';
import { LocationsService } from '../services/locations.service';
import useUserAuth from '../hook/useUserAuth';



const LocationContext = createContext(null);

// ─── Background Task Definition ───────────────────────────────────────────────
// react-native-background-actions runs a JS task; we use the global callback
// pattern identical to the Expo version so SocketContext wiring is unchanged.
const backgroundLocationTask = async taskData => {
  console.log('Background location task started with data:', taskData);
  await new Promise(resolve => {
    const watchId = Geolocation.watchPosition(
      position => {
        if (global.__locationUpdateCallback) {
          global.__locationUpdateCallback(position, true);
        }
      },
      error => {
        console.error('Background location error:', error.message);
      },
      {
        accuracy: {
          android: 'balanced', // PRIORITY_BALANCED_POWER_ACCURACY
          ios: 'hundredMeters',
        },
        interval: 10000, // every 10 seconds in background
        fastestInterval: 5000,
        distanceFilter: 10,
        showsBackgroundLocationIndicator: true,
        forceRequestLocation: true,
      },
    );

    // Keep the task alive; it resolves only when BackgroundActions.stop() is called.
    BackgroundActions.on('expiration', () => {
      Geolocation.clearWatch(watchId);
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
  linkingURI: undefined, // set to your deep-link scheme if needed
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
  const onLocationUpdateRef = useRef(null); // callback from SocketContext
  const isTrackingRef = useRef(false); // synchronous guard — state is async and races
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

  // Register the global callback for the background task
  useEffect(() => {
    global.__locationUpdateCallback = (location, bg) => {
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude,
        accuracy: location.coords.accuracy,
        heading: location.coords.heading,
        speed: location.coords.speed,
        isBackground: bg,
        timestamp: location.timestamp,
      };
      setCurrentLocation(coords);
      currentLocationRef.current = coords;
      setIsBackground(bg);
      isBackgroundRef.current = bg;
      onLocationUpdateRef.current?.(coords);
    };

    return () => {
      global.__locationUpdateCallback = null;
    };
  }, []);




  // ── Permission helpers ─────────────────────────────────────────────────────
  const requestPermissions = useCallback(async () => {
    try {
      const status = await requestLocationPermissions();
      console.log('Location permission status:', status);
      setPermissionStatus(status);
      return status;
    } catch (err) {
      setLocationError(err.message);
      return 'denied';
    }
  }, []);

  const startTracking = useCallback(
  async onUpdate => {
    if (isTrackingRef.current) return; // synchronous guard against multiple watchers

    // Guard: permissions API requires an active Activity on Android
    if (AppState.currentState !== 'active') {
      console.warn('startTracking: app not in foreground, skipping');
      return;
    }

    isTrackingRef.current = true;
    onLocationUpdateRef.current = onUpdate;

    // Wrap requestPermissions in its own try/catch so a throw resets the guard
    let granted;
    try {
      granted = await requestPermissions();
      console.log('Starting location tracking with permission status:', granted);
    } catch (err) {
      console.error('requestPermissions threw:', err);
      isTrackingRef.current = false;
      return;
    }

    // requestPermissions returns 'full' | 'foreground-only' | 'denied'
    if (granted === 'denied') {
      isTrackingRef.current = false;
      return;
    }

    try {
      // Foreground watch
      watchIdRef.current = Geolocation.watchPosition(
        location => {
          global.__locationUpdateCallback?.(location, false);
        },
        error => {
          console.error('Foreground location error:', error.message);
          setLocationError(error.message);
        },
        {
          accuracy: {
            android: 'high',
            ios: 'best',
          },
          interval: 3000,
          fastestInterval: 2000,
          distanceFilter: 5,
          forceRequestLocation: true,
          showsBackgroundLocationIndicator: true,
        },
      );

      // Background service (only when full background permission is available)
      // CRITICAL: Android 15 forbids starting location-type services from background
      const isAppInForeground = AppState.currentState === 'active';
      const running = await BackgroundActions.isRunning(); // await — may return a Promise

      if (granted === 'full' && !running && isAppInForeground && !bgStartingRef.current) {
        console.log('BackgroundActions: Starting background location task...');
        bgStartingRef.current = true;
        try {
          await BackgroundActions.start(backgroundLocationTask, backgroundOptions);
          console.log('BackgroundActions is running:', await BackgroundActions.isRunning());
        } catch (err) {
          console.error('Failed to start background location service:', err);
        } finally {
          bgStartingRef.current = false;
        }
      } else if (granted === 'full' && !isAppInForeground) {
        console.log('BackgroundActions: Skipped start — app is in background. Will start when app returns to foreground.');
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

  const stopTracking = useCallback(async () => {
    if (watchIdRef.current !== null) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (BackgroundActions.isRunning()) {
      await BackgroundActions.stop().catch(() => { });
    }

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
          accuracy: { android: 'high', ios: 'best' },
          timeout: 15000,
          maximumAge: 10000,
          forceRequestLocation: true,
        },
      );
    });
  }, []);

  const updateCurrentLocation = useCallback(async (location) => {
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
  }, [emit]);


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

  }, [emit]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  // Android 15: Start background service when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async nextAppState => {
      // ✅ Only start on true foreground return AND only on 'background' → 'active' transition
      if (
        nextAppState === 'active' &&
        isTrackingRef.current &&
        permissionStatus === 'full' &&
        !BackgroundActions.isRunning() &&
        !bgStartingRef.current
      ) {
        bgStartingRef.current = true;
        await new Promise(resolve => setTimeout(resolve, 300)); // ✅ settle delay
        try {
          console.log('App returned to foreground, starting background location task...');
          await BackgroundActions.start(backgroundLocationTask, backgroundOptions);
        } catch (err) {
          console.error('Failed to start background service on foreground return:', err);
        } finally {
          bgStartingRef.current = false;
        }
      }
    });

    return () => subscription?.remove();
  }, [permissionStatus]);

  useEffect(() => {
    if (!isConnected) {
      // Socket dropped — reset tracking guard so it restarts after reconnect
      isTrackingRef.current = false;
      return;
    }

    // Start tracking once the server confirms the personal room was joined.
    // SocketContext already emits join:personal on connect, so this fires
    // automatically after every (re)connect.
    const onPersonalRoomJoined = () => {
      console.log('Joined personal room, starting location tracking...');
      startTrackingRef.current(location => {
        console.log('Emitting location update to server:', location);
        emitNoAck('location:update', JSON.stringify({ loc: location }));
      });

      // Fallback interval for Android background — watchPosition is unreliable
      // when the app is backgrounded, so re-emit the last known location every 10s.

      // locationIntervalRef.current = setInterval(() => {
      //   console.log('Emitting periodic location update to server:');
      //  emitNoAck('location:update');
      // }, 90000); // every 90 seconds
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

    // Emit AFTER registering the listener — guarantees the server's
    // personal:room:joined response is never missed due to a race condition.
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
        setTimeout(() => reject(new Error('getContactsLastLocations timeout')), 10000)
      ), // ✅ 10s max wait
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



  // Fetch contacts' last locations on mount
  useEffect(() => {
    if (isAuthenticated) {
      getContactsLastLocations();
    }
  }, [getContactsLastLocations, isAuthenticated]);




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
    updateMyGprsLocation

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
