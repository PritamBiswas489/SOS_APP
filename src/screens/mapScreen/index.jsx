import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import styles from './style';
import MapView, { Marker, Circle, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MapAvatarList from '../../components/mapAvatarList';
import { useNavigation } from '@react-navigation/native';
import { useUserData } from '../../hook/useUserData';
import { useSelector } from 'react-redux';
import { useContactLocations } from '../../hook/useContactLocations';
import axios from 'axios';
import { GOOGLE_MAPS_API_KEY } from '../../../environment';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useLocation } from '../../context/LocationContext';
 
import { useDispatch } from 'react-redux';
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0a1628' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#5a7a9a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a1628' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0d1f38' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#0f2847' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0a1e34' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#3a5a7a' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#1a3a60' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0f2545' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4a7aaa' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#0c2240' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#040c18' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#1a3a5a' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#0a1628' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#060f0a' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#1a3a28' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#0a1628' }],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#0a1628' }],
  },
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry.fill',
    stylers: [{ color: '#0c1e38' }],
  },
];

// Example: New York City
 
 

// Decode Google encoded polyline
const decodePolyline = encoded => {
  const points = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0; result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
};

const MapScreen = ({route}) => {
  //console.log('MapScreen route params:', route?.params);
  const mapRef = useRef(null);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {userData} = useUserData();
  const { updateCurrentLocation, updateMyGprsLocation } = useLocation();
  const selectedMapRecipentId = route?.params?.selectedMapRecipentId;

  const [CONTACT_MARKER, setContactMarkers] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null); // { distance, duration }
  const [travelMode, setTravelMode] = useState('driving');
  const [menuOpen, setMenuOpen] = useState(false);

  const userLocation = useMemo(() => ({
    latitude: userData?.latitude ?? 0,
    longitude: userData?.longitude ?? 0,
  }), [userData?.latitude, userData?.longitude]);

  const {contactLocations} = useContactLocations();
  const mapSelectedContact = useSelector(state => state.mapSelectedContact);

  const selectedContactLocation = useMemo(() => {
    if (!contactLocations || !mapSelectedContact?.receipent_id) return null;
    return contactLocations[mapSelectedContact.receipent_id] ?? null;
  }, [contactLocations, mapSelectedContact?.receipent_id]);

  // console.log('Selected Contact Location:', selectedContactLocation);

  useEffect(() => {
      console.log('Map Selected Contact:', mapSelectedContact);
  },[mapSelectedContact]);

  useEffect(() => {
    if (!userData?.latitude || !userData?.longitude) return;
    mapRef.current?.animateToRegion(
      { ...userLocation, latitudeDelta: 0.012, longitudeDelta: 0.012 },
      600,
    );
  }, [userLocation]);

  useEffect(() => {
    if (selectedContactLocation) {
      setContactMarkers({
        coordinate: {
          latitude: selectedContactLocation.latitude,
          longitude: selectedContactLocation.longitude,
        },
        color: '#FF3B5C',
      });
    } else {
      setContactMarkers(null);
      setRouteCoords([]);
      setRouteInfo(null);
    }
  }, [selectedContactLocation]);

  const fetchRoute = useCallback(async () => {
    if (!userLocation.latitude || !userLocation.longitude) return;
    if (!selectedContactLocation?.latitude || !selectedContactLocation?.longitude) return;
    try {
       const origin = `${userLocation.latitude},${userLocation.longitude}`;
      const destination = `${selectedContactLocation.latitude},${selectedContactLocation.longitude}`;
      const res = await axios.get(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=${travelMode}&key=${GOOGLE_MAPS_API_KEY}`,
      );
      const route = res.data?.routes?.[0];
      if (!route) return;
      const points = decodePolyline(route.overview_polyline.points);
      const leg = route.legs?.[0];
      setRouteCoords(points);
      setRouteInfo({
        distance: leg?.distance?.text ?? '',
        duration: leg?.duration?.text ?? '',
      });
      // Fit map to show both ends
      mapRef.current?.fitToCoordinates(
        [userLocation, { latitude: selectedContactLocation.latitude, longitude: selectedContactLocation.longitude }],
        { edgePadding: { top: 120, right: 60, bottom: 220, left: 60 }, animated: true },
      );
    } catch (err) {
      console.warn('fetchRoute error:', err?.response?.data ?? err?.message);
    }
  }, [userLocation, selectedContactLocation, travelMode]);

  useEffect(() => {
    if (selectedContactLocation) {
      fetchRoute();
    }
  }, [fetchRoute]);


  const [isOffCenter, setIsOffCenter] = useState(false);
  const currentRegionRef = useRef({
    latitude: userData?.latitude ?? 0,
    longitude: userData?.longitude ?? 0,
    latitudeDelta: 0.012,
    longitudeDelta: 0.012,
  });

  const centerOnUser = () => {
    setIsOffCenter(false);
    mapRef.current?.animateToRegion(
      { ...userLocation, latitudeDelta: 0.012, longitudeDelta: 0.012 },
      600,
    );
  };

  const handleZoomIn = () => {
    const r = currentRegionRef.current;
    mapRef.current?.animateToRegion(
      { ...r, latitudeDelta: r.latitudeDelta / 2, longitudeDelta: r.longitudeDelta / 2 },
      300,
    );
  };

  const handleZoomOut = () => {
    const r = currentRegionRef.current;
    mapRef.current?.animateToRegion(
      { ...r, latitudeDelta: r.latitudeDelta * 2, longitudeDelta: r.longitudeDelta * 2 },
      300,
    );
  };

  const handleRegionChangeComplete = (newRegion) => {
    currentRegionRef.current = newRegion;
    if (!userData?.latitude || !userData?.longitude) return;
    const latDiff = Math.abs(newRegion.latitude - userLocation.latitude);
    const lngDiff = Math.abs(newRegion.longitude - userLocation.longitude);
    setIsOffCenter(latDiff > 0.002 || lngDiff > 0.002);
  };

  

  const handlePlaceSelect = (data, details) => {
    if (!details?.geometry?.location) return;
    const { lat, lng } = details.geometry.location;
    updateCurrentLocation({ latitude: lat, longitude: lng });

   
  };

  const [region] = useState({
    latitude: userData?.latitude ?? 0,
    longitude: userData?.longitude ?? 0,
    latitudeDelta: 0.012,
    longitudeDelta: 0.012,
  });

  const chooseCurrentLocation = () => {
     updateMyGprsLocation();

  }
  const navigateToChatRoom = () => {
      if (!mapSelectedContact) return;
     
       navigation.navigate('Main', {
        screen: 'MainTabs',
        params: { 
          screen: 'Chat',
          params: { selectedReceipentId: mapSelectedContact?.receipent_id },
        },
        });
  }
  const navigateAudioRoom = () => {
     if (!mapSelectedContact) return;
     navigation.navigate('Main', {
      screen: 'MainTabs',
      params: {
        screen: 'AudioStream',
        params: { selectedMapRecipentId: mapSelectedContact.receipent_id },
      },
    });

      

  }

  const [isMoving, setIsMoving] = useState(false);
  const movingIntervalRef = useRef(null);
  const movingStepRef = useRef(0);

  const moveByDistance = useCallback((from, to, distanceKm) => {
    const R = 6371;
    const toRad = v => (v * Math.PI) / 180;
    const toDeg = v => (v * 180) / Math.PI;
    const lat1 = toRad(from.lat);
    const lon1 = toRad(from.lng);
    const lat2 = toRad(to.lat);
    const lon2 = toRad(to.lng);
    const d = distanceKm / R;
    const bearing = Math.atan2(
      Math.sin(lon2 - lon1) * Math.cos(lat2),
      Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1),
    );
    const newLat = Math.asin(
      Math.sin(lat1) * Math.cos(d) +
        Math.cos(lat1) * Math.sin(d) * Math.cos(bearing),
    );
    const newLon =
      lon1 +
      Math.atan2(
        Math.sin(bearing) * Math.sin(d) * Math.cos(lat1),
        Math.cos(d) - Math.sin(lat1) * Math.sin(newLat),
      );
    return { lat: toDeg(newLat), lng: toDeg(newLon) };
  }, []);

  const stopMoving = useCallback(() => {
    if (movingIntervalRef.current) {
      clearInterval(movingIntervalRef.current);
      movingIntervalRef.current = null;
    }
    movingStepRef.current = 0;
    setIsMoving(false);
  }, []);

  const startMoving = useCallback(() => {
    if (!selectedContactLocation?.latitude || !selectedContactLocation?.longitude) return;

    if (isMoving) {
      stopMoving();
      return;
    }

    // If a route is loaded, walk along polyline points
    const waypoints = routeCoords.length > 0
      ? routeCoords
      : null;

    setIsMoving(true);
    movingStepRef.current = 0;

    movingIntervalRef.current = setInterval(() => {
      if (waypoints) {
        const step = movingStepRef.current;
        if (step >= waypoints.length - 1) {
          stopMoving();
          return;
        }
        const next = waypoints[step + 1];
        updateCurrentLocation({ latitude: next.latitude, longitude: next.longitude });
        movingStepRef.current = step + 1;
      } else {
        // Fallback: straight-line step of 0.05 km per tick
        updateCurrentLocation(prev => {
          if (!prev) return prev;
          const from = { lat: prev.latitude, lng: prev.longitude };
          const to = {
            lat: selectedContactLocation.latitude,
            lng: selectedContactLocation.longitude,
          };
          const dist = Math.sqrt(
            Math.pow(to.lat - from.lat, 2) + Math.pow(to.lng - from.lng, 2),
          );
          if (dist < 0.0001) { stopMoving(); return prev; }
          const newPos = moveByDistance(from, to, 5);
          return { latitude: newPos.lat, longitude: newPos.lng };
        });
      }
    }, 800); // Move every 0.8 seconds
  }, [isMoving, selectedContactLocation, routeCoords, moveByDistance, stopMoving, updateCurrentLocation]);

  // Stop moving if contact changes or unmounts
  useEffect(() => { return () => stopMoving(); }, [stopMoving]);
  useEffect(() => { if (!selectedContactLocation) stopMoving(); }, [selectedContactLocation, stopMoving]);

  return (
    <View style={styles.container}>
       
        <>
          {/* MAP */}
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={region}
            customMapStyle={darkMapStyle}
            showsUserLocation={false}
            showsMyLocationButton={false}
            showsCompass={false}
            toolbarEnabled={false}
            onRegionChangeComplete={handleRegionChangeComplete}
          >
            {/* Accuracy radius */}
            <Circle
              center={userLocation}
              radius={150}
              fillColor="rgba(0, 180, 150, 0.12)"
              strokeColor="rgba(0, 200, 170, 0.25)"
              strokeWidth={1.5}
            />

            {/* User location dot */}
            <Marker coordinate={userLocation} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
              <View style={styles.userPulseOuter}>
                <View style={styles.userPulseMid}>
                  <View style={styles.userDotOuter}>
                    <View style={styles.userDot} />
                  </View>
                </View>
              </View>
            </Marker>

            {/* Contact markers */}
             
             {CONTACT_MARKER && (
               <Marker
                 key={CONTACT_MARKER.id}
                 coordinate={CONTACT_MARKER.coordinate}
                 anchor={{ x: 0.5, y: 1 }}
                 tracksViewChanges={false}
               >
                 <View style={styles.markerWrapper}>
                  <View
                    style={[
                      styles.markerPin,
                      { backgroundColor: CONTACT_MARKER.color },
                    ]}
                  >
                    <Text style={styles.markerPinText}>i</Text>
                  </View>
                  <View
                    style={[
                      styles.markerArrow,
                      { borderTopColor: CONTACT_MARKER.color },
                    ]}
                  />
                </View>
              </Marker>
             )}

            {/* Route polyline */}
            {routeCoords.length > 0 && (
              <>
                {/* Shadow line */}
                <Polyline
                  coordinates={routeCoords}
                  strokeColor="rgba(0,0,0,0.25)"
                  strokeWidth={6}
                  lineCap="round"
                  lineJoin="round"
                />
                {/* Main line */}
                <Polyline
                  coordinates={routeCoords}
                  strokeColor="#4DA3FF"
                  strokeWidth={4}
                  lineCap="round"
                  lineJoin="round"
                />
                {/* Dashed accent */}
                <Polyline
                  coordinates={routeCoords}
                  strokeColor="rgba(130,200,255,0.45)"
                  strokeWidth={2}
                  lineDashPattern={[6, 10]}
                  lineCap="round"
                />
              </>
            )}

            {/* Route endpoint highlights */}
            {routeCoords.length > 0 && selectedContactLocation && (
              <>
                <Circle
                  center={userLocation}
                  radius={25}
                  fillColor="rgba(77,163,255,0.25)"
                  strokeColor="#4DA3FF"
                  strokeWidth={2}
                />
                <Circle
                  center={{ latitude: selectedContactLocation.latitude, longitude: selectedContactLocation.longitude }}
                  radius={25}
                  fillColor="rgba(255,59,92,0.2)"
                  strokeColor="#FF3B5C"
                  strokeWidth={2}
                />
              </>
            )}
          </MapView>

          {/* ROUTE INFO BADGE */}
          {routeInfo && (
            <View style={styles.routeInfoBadge}>
              <Icon name={travelMode === 'walking' ? 'directions-walk' : 'directions-car'} size={15} color="#4DA3FF" />
              <Text style={styles.routeInfoText}>{routeInfo.duration}</Text>
              <View style={styles.routeInfoDivider} />
              <Icon name="straighten" size={14} color="#7A8499" />
              <Text style={styles.routeInfoSub}>{routeInfo.distance}</Text>
            </View>
          )}



          {/* RECENTER BUTTON */}
          {isOffCenter && (
            <TouchableOpacity style={styles.recenterBtn} onPress={centerOnUser} activeOpacity={0.8}>
              <Icon name="my-location" size={20} color="#4DA3FF" />
            </TouchableOpacity>
          )}

          {/* TRAVEL MODE BUTTON */}
          <TouchableOpacity
            style={[styles.travelModeBtn, travelMode === 'walking' && styles.travelModeBtnActive]}
            onPress={() => setTravelMode(prev => prev === 'driving' ? 'walking' : 'driving')}
            activeOpacity={0.8}
          >
            <Icon
              name={travelMode === 'walking' ? 'directions-walk' : 'directions-car'}
              size={20}
              color={travelMode === 'walking' ? '#ffffff' : '#4DA3FF'}
            />
          </TouchableOpacity>

          {/* FLOATING ACTION MENU */}
          <View style={styles.fabContainer}>
            {menuOpen && (
              <>
                <TouchableOpacity onPress={navigateToChatRoom} style={styles.fabAction} activeOpacity={0.8}>
                  <View style={styles.fabActionBtn}>
                    <Icon name="chat" size={20} color="#ffffff" />
                  </View>
                  <Text style={styles.fabActionLabel}>Chat</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={navigateAudioRoom} style={styles.fabAction} activeOpacity={0.8}>
                  <View style={styles.fabActionBtn}>
                    <Icon name="mic" size={20} color="#ffffff" />
                  </View>
                  <Text style={styles.fabActionLabel}>Audio</Text>
                </TouchableOpacity>
                <TouchableOpacity  onPress={startMoving} style={styles.fabAction} activeOpacity={0.8}>
                  <View style={[styles.fabActionBtn, isMoving && styles.fabActionBtnActive]}>
                    <Icon name={isMoving ? 'stop' : 'open-with'} size={20} color="#ffffff" />
                  </View>
                  <Text style={styles.fabActionLabel}>{isMoving ? 'Stop' : 'Move'}</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity
              style={[styles.fabMain, menuOpen && styles.fabMainOpen]}
              onPress={() => setMenuOpen(prev => !prev)}
              activeOpacity={0.8}
            >
              <Icon name={menuOpen ? 'close' : 'more-vert'} size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* ZOOM CONTROLS */}
          <View style={styles.zoomControls}>
            <TouchableOpacity style={styles.zoomBtn} onPress={handleZoomIn} activeOpacity={0.7}>
              <Icon name="add" size={22} color="#4DA3FF" />
            </TouchableOpacity>
            <View style={styles.zoomDivider} />
            <TouchableOpacity style={styles.zoomBtn} onPress={handleZoomOut} activeOpacity={0.7}>
              <Icon name="remove" size={22} color="#4DA3FF" />
            </TouchableOpacity>
          </View>


          {/* SEARCH BAR — Google Places Autocomplete */}
          <View style={styles.searchBarWrapper}>
            <GooglePlacesAutocomplete
              placeholder="Select your current location"
              fetchDetails
              onPress={handlePlaceSelect}
              query={{
                key: GOOGLE_MAPS_API_KEY,
                language: 'en',
              }}
              styles={{
                container: styles.placesContainer,
                textInputContainer: styles.placesInputContainer,
                textInput: styles.placesInput,
                listView: styles.placesList,
                row: styles.placesRow,
                description: styles.placesDescription,
                poweredContainer: { display: 'none' },
                powered: { display: 'none' },
              }}
              renderLeftButton={() => (
                <View style={styles.searchIconBg}>
                  <Icon name="search" size={16} color="#4DA3FF" />
                </View>
              )}
              renderRightButton={() => (
                <TouchableOpacity style={styles.searchBtn} onPress={chooseCurrentLocation} activeOpacity={0.7}>
                  <Icon name="near-me" size={16} color="#4DA3FF" />
                </TouchableOpacity>
              )}
              enablePoweredByContainer={false}
              debounce={300}
              minLength={2}
            />
          </View>

          {/* LOCATION CARD */}
          <View style={styles.locationCard}>
            <View style={styles.cardHandle} />
            <MapAvatarList navigation={navigation} selectedMapRecipentId={selectedMapRecipentId} />
          </View>
        </>
      
    </View>
  );
};

export default MapScreen;
