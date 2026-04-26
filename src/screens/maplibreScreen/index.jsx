import React, {useState, useRef, useEffect, useMemo, useCallback} from 'react';
import {View, Text, TextInput, TouchableOpacity} from 'react-native';
import styles from './style';

// ✅ v11.0.2 exact named exports
// Map        = MapView equivalent
// Camera     = camera control (ref: flyTo, fitBounds, zoomTo, easeTo, jumpTo)
// ViewAnnotation = custom view marker (was MarkerView)
// GeoJSONSource  = shape source (was ShapeSource)
// Layer          = unified layer (was LineLayer / CircleLayer / etc.)
import {
  Map,
  Camera,
  ViewAnnotation,
  GeoJSONSource,
  Layer,
} from '@maplibre/maplibre-react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import MapAvatarList from '../../components/mapAvatarList';
import {useNavigation} from '@react-navigation/native';
import {useUserData} from '../../hook/useUserData';
import {useSelector, useDispatch} from 'react-redux';
import {useContactLocations} from '../../hook/useContactLocations';
import {useChatPresence} from '../../context/ChatContext';
import {useChatContacts} from '../../hook/useChatContacts';
import {mapSelectedContactActions} from '../../store/redux/mapSelectedContact.redux';
import {getProfileImage} from '../../config/utility';
import axios from 'axios';
import {useLocation} from '../../context/LocationContext';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// v11 prop is `mapStyle` (not styleURL)
const DARK_MAP_STYLE = 'https://demotiles.maplibre.org/style.json';
// 🔁 Replace with a dark style, e.g.:
// 'https://api.maptiler.com/maps/dataviz-dark/style.json?key=YOUR_KEY'

// OSRM — free, no key needed
const OSRM_BASE = 'https://router.project-osrm.org/route/v1';

// Nominatim — free geocoding, no key needed
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

// ---------------------------------------------------------------------------
// Nominatim search widget  (replaces GooglePlacesAutocomplete)
// ---------------------------------------------------------------------------
const PlacesAutocomplete = ({onSelect, onCurrentLocation}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const debounceRef = useRef(null);

  const search = useCallback(text => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(`${NOMINATIM_BASE}/search`, {
          params: {q: text, format: 'json', limit: 6},
          headers: {'Accept-Language': 'en'},
        });
        setResults(res.data ?? []);
      } catch {
        setResults([]);
      }
    }, 300);
  }, []);

  const handleSelect = item => {
    setQuery(item.display_name);
    setResults([]);
    onSelect({
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    });
  };

  return (
    <View style={styles.searchBarWrapper}>
      <View style={styles.placesInputContainer}>
        <View style={styles.searchIconBg}>
          <Icon name="search" size={16} color="#4DA3FF" />
        </View>
        <TextInput
          style={styles.placesInput}
          value={query}
          onChangeText={search}
          placeholder="Search location…"
          placeholderTextColor="#7A8499"
        />
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={onCurrentLocation}
          activeOpacity={0.7}>
          <Icon name="near-me" size={16} color="#4DA3FF" />
        </TouchableOpacity>
      </View>

      {results.length > 0 && (
        <View style={styles.placesList}>
          {results.map(item => (
            <TouchableOpacity
              key={String(item.place_id)}
              style={styles.placesRow}
              onPress={() => handleSelect(item)}
              activeOpacity={0.8}>
              <Text style={styles.placesDescription} numberOfLines={2}>
                {item.display_name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// ---------------------------------------------------------------------------
// MapScreen
// ---------------------------------------------------------------------------
const MapLibreScreen = ({route}) => {
  // v11 Camera ref exposes: flyTo, easeTo, jumpTo, fitBounds, zoomTo
  const cameraRef = useRef(null);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {userData} = useUserData();
  const {updateCurrentLocation, updateMyGprsLocation} = useLocation();

  // ── contact selection ──────────────────────────────────────────────────────
  const selectedMapRecipentId = route?.params?.selectedMapRecipentId;
  const [normalizedSelectedMapRecipentId, setNormalizedSelectedMapRecipentId] =
    useState(null);
  const hasAutoSelectedFromParamRef = useRef(false);

  const onlineUsers = useChatPresence();
  const usrId = userData?.id;
  const {contactList: chatContactList, fetchChatContacts} = useChatContacts();

  useEffect(() => {
    hasAutoSelectedFromParamRef.current = false;
    setNormalizedSelectedMapRecipentId(
      selectedMapRecipentId == null ? null : String(selectedMapRecipentId),
    );
  }, [selectedMapRecipentId]);

  const mappedMapContacts = useMemo(() => {
    const list = chatContactList;
    if (!list || list.length === 0) return [];

    const trustedContacts = [];
    const otherContacts = [];

    for (const contact of list) {
      const roomid = [contact.user_id, contact.trusted_user_id]
        .sort()
        .join(':');

      if (contact.user_id === usrId) {
        const displayName =
          contact.nickname ||
          contact.trusted_contact.name ||
          contact.relationship ||
          '?';
        trustedContacts.push({
          id: contact.id,
          name: displayName,
          initial: displayName?.charAt(0).toUpperCase(),
          isOnline: onlineUsers[contact.trusted_user_id] || false,
          receipent_id: contact.trusted_user_id,
          phone_number: contact.trusted_contact.phone_number,
          roomId: roomid,
          profile_image: contact?.trusted_contact?.profile_photo
            ? getProfileImage(contact.trusted_contact.profile_photo)
            : null,
        });
      } else if (contact.trusted_user_id === usrId) {
        const displayName =
          contact?.inviter?.name ||
          contact?.inviter?.phone_number ||
          'Unknown';
        otherContacts.push({
          id: contact.id,
          name: displayName,
          initial: displayName.charAt(0).toUpperCase(),
          phone_number: contact?.inviter?.phone_number,
          isOnline: onlineUsers[contact.user_id] || false,
          receipent_id: contact.user_id,
          roomId: roomid,
          profile_image: contact?.inviter?.profile_photo
            ? getProfileImage(contact.inviter.profile_photo)
            : null,
        });
      }
    }

    const filteredOther = otherContacts.filter(
      oc => !trustedContacts.some(tc => tc.roomId === oc.roomId),
    );

    return [...trustedContacts, ...filteredOther].sort((a, b) => {
      if (a.isOnline === b.isOnline) return 0;
      return a.isOnline ? -1 : 1;
    });
  }, [chatContactList, usrId, onlineUsers]);

  const mapSelectedContact = useSelector(state => state.mapSelectedContact);

  useEffect(() => {
    if (mappedMapContacts.length === 0) return;

    if (
      normalizedSelectedMapRecipentId &&
      !hasAutoSelectedFromParamRef.current
    ) {
      hasAutoSelectedFromParamRef.current = true;
      const found = mappedMapContacts.find(
        c => String(c.receipent_id) === normalizedSelectedMapRecipentId,
      );
      dispatch(
        mapSelectedContactActions.setMapSelectedContact(
          found ?? mappedMapContacts[0],
        ),
      );
      return;
    }

    const stillExists = mapSelectedContact?.id
      ? mappedMapContacts.some(c => c.id === mapSelectedContact.id)
      : false;

    if (!stillExists) {
      dispatch(
        mapSelectedContactActions.setMapSelectedContact(mappedMapContacts[0]),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mappedMapContacts, normalizedSelectedMapRecipentId, dispatch]);

  // ── map state ──────────────────────────────────────────────────────────────
  const [CONTACT_MARKER, setContactMarkers] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [travelMode, setTravelMode] = useState('driving');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isOffCenter, setIsOffCenter] = useState(false);

  const userLocation = useMemo(
    () => ({
      latitude: userData?.latitude ?? 0,
      longitude: userData?.longitude ?? 0,
    }),
    [userData?.latitude, userData?.longitude],
  );

  const {contactLocations} = useContactLocations();

  const selectedContactLocation = useMemo(() => {
    if (!contactLocations || !mapSelectedContact?.receipent_id) return null;
    return contactLocations[mapSelectedContact.receipent_id] ?? null;
  }, [contactLocations, mapSelectedContact?.receipent_id]);

  // ── fly to user location when it changes ──────────────────────────────────
  // v11 Camera ref: flyTo({ center, zoom, duration, easing })
  // center is { lng, lat } object (NOT an array)
  useEffect(() => {
    if (!userData?.latitude || !userData?.longitude) return;
    cameraRef.current?.flyTo({
      center: [userLocation.longitude, userLocation.latitude],
      zoom: 14,
      duration: 600,
    });
  }, [userLocation]);

  // ── contact marker ─────────────────────────────────────────────────────────
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

  // ── OSRM route fetching ────────────────────────────────────────────────────
  const fetchRoute = useCallback(async () => {
    if (!userLocation.latitude || !userLocation.longitude) return;
    if (
      !selectedContactLocation?.latitude ||
      !selectedContactLocation?.longitude
    )
      return;

    try {
      const profile = travelMode === 'walking' ? 'foot' : 'driving';
      const coords = [
        `${userLocation.longitude},${userLocation.latitude}`,
        `${selectedContactLocation.longitude},${selectedContactLocation.latitude}`,
      ].join(';');

      const res = await axios.get(
        `${OSRM_BASE}/${profile}/${coords}?overview=full&geometries=geojson&steps=false`,
      );

      const osrmRoute = res.data?.routes?.[0];
      if (!osrmRoute) return;

      // GeoJSON coords [lng, lat] → {latitude, longitude}
      const points = osrmRoute.geometry.coordinates.map(([lng, lat]) => ({
        latitude: lat,
        longitude: lng,
      }));
      setRouteCoords(points);

      const durationSec = Math.round(osrmRoute.duration);
      const durationText =
        durationSec < 3600
          ? `${Math.round(durationSec / 60)} min`
          : `${(durationSec / 3600).toFixed(1)} hr`;

      const distM = osrmRoute.distance;
      const distText =
        distM < 1000
          ? `${Math.round(distM)} m`
          : `${(distM / 1000).toFixed(1)} km`;

      setRouteInfo({distance: distText, duration: durationText});

      // v11 fitBounds(bounds, options)
      // bounds = { ne: {lng, lat}, sw: {lng, lat} }
      if (cameraRef.current) {
        const minLng = Math.min(
          userLocation.longitude,
          selectedContactLocation.longitude,
        );
        const maxLng = Math.max(
          userLocation.longitude,
          selectedContactLocation.longitude,
        );
        const minLat = Math.min(
          userLocation.latitude,
          selectedContactLocation.latitude,
        );
        const maxLat = Math.max(
          userLocation.latitude,
          selectedContactLocation.latitude,
        );
        cameraRef.current.fitBounds(
          {ne: {lng: maxLng, lat: maxLat}, sw: {lng: minLng, lat: minLat}},
          {duration: 600, padding: {top: 120, right: 60, bottom: 220, left: 60}},
        );
      }
    } catch (err) {
      console.warn('fetchRoute error:', err?.response?.data ?? err?.message);
    }
  }, [userLocation, selectedContactLocation, travelMode]);

  useEffect(() => {
    if (selectedContactLocation) fetchRoute();
  }, [fetchRoute]);

  // ── camera helpers ─────────────────────────────────────────────────────────
  const centerOnUser = () => {
    setIsOffCenter(false);
    cameraRef.current?.flyTo({
      center: [userLocation.longitude, userLocation.latitude],
      zoom: 14,
      duration: 600,
    });
  };

  const handleZoomIn = () => {
    cameraRef.current?.zoomTo(undefined, {duration: 300});
    // zoomTo requires absolute level; read current zoom first
    // Simpler: use easeTo with delta
    cameraRef.current?.easeTo({zoom: '+1', duration: 300});
  };

  const handleZoomOut = () => {
    cameraRef.current?.easeTo({zoom: '-1', duration: 300});
  };

  // v11 onRegionDidChange event shape: event.nativeEvent = ViewStateChangeEvent
  // { center: {lng, lat}, zoom, bearing, pitch, bounds, animated, userInteraction }
  const handleRegionDidChange = useCallback(
    event => {
      if (!userData?.latitude || !userData?.longitude) return;
      const {center} = event.nativeEvent;
      const latDiff = Math.abs(center.lat - userLocation.latitude);
      const lngDiff = Math.abs(center.lng - userLocation.longitude);
      setIsOffCenter(latDiff > 0.002 || lngDiff > 0.002);
    },
    [userLocation, userData],
  );

  // ── place select ───────────────────────────────────────────────────────────
  const handlePlaceSelect = ({latitude, longitude}) => {
    updateCurrentLocation({latitude, longitude});
  };

  const chooseCurrentLocation = () => {
    updateMyGprsLocation();
  };

  // ── navigation ─────────────────────────────────────────────────────────────
  const navigateToChatRoom = () => {
    if (!mapSelectedContact) return;
    navigation.navigate('Main', {
      screen: 'MainTabs',
      params: {
        screen: 'Chat',
        params: {selectedReceipentId: mapSelectedContact?.receipent_id},
      },
    });
  };

  const navigateAudioRoom = () => {
    if (!mapSelectedContact) return;
    navigation.navigate('Main', {
      screen: 'MainTabs',
      params: {
        screen: 'AudioStream',
        params: {selectedReceipentId: mapSelectedContact.receipent_id},
      },
    });
  };

  // ── simulated movement along route ────────────────────────────────────────
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
    return {lat: toDeg(newLat), lng: toDeg(newLon)};
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
    if (
      !selectedContactLocation?.latitude ||
      !selectedContactLocation?.longitude
    )
      return;
    if (isMoving) {
      stopMoving();
      return;
    }
    const waypoints = routeCoords.length > 0 ? routeCoords : null;
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
        updateCurrentLocation({
          latitude: next.latitude,
          longitude: next.longitude,
        });
        movingStepRef.current = step + 1;
      } else {
        updateCurrentLocation(prev => {
          if (!prev) return prev;
          const from = {lat: prev.latitude, lng: prev.longitude};
          const to = {
            lat: selectedContactLocation.latitude,
            lng: selectedContactLocation.longitude,
          };
          const dist = Math.sqrt(
            Math.pow(to.lat - from.lat, 2) + Math.pow(to.lng - from.lng, 2),
          );
          if (dist < 0.0001) {
            stopMoving();
            return prev;
          }
          const newPos = moveByDistance(from, to, 5);
          return {latitude: newPos.lat, longitude: newPos.lng};
        });
      }
    }, 800);
  }, [
    isMoving,
    selectedContactLocation,
    routeCoords,
    moveByDistance,
    stopMoving,
    updateCurrentLocation,
  ]);

  useEffect(() => () => stopMoving(), [stopMoving]);
  useEffect(() => {
    if (!selectedContactLocation) stopMoving();
  }, [selectedContactLocation, stopMoving]);

  // ── GeoJSON sources ────────────────────────────────────────────────────────
  const routeGeoJSON = useMemo(() => {
    if (routeCoords.length === 0) return null;
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: routeCoords.map(p => [p.longitude, p.latitude]),
          },
        },
      ],
    };
  }, [routeCoords]);

  const userPointGeoJSON = useMemo(
    () => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [userLocation.longitude, userLocation.latitude],
      },
    }),
    [userLocation],
  );

  const contactPointGeoJSON = useMemo(() => {
    if (!selectedContactLocation) return null;
    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [
          selectedContactLocation.longitude,
          selectedContactLocation.latitude,
        ],
      },
    };
  }, [selectedContactLocation]);

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <>
        {/* ── MAP ── v11: prop is `mapStyle` not `styleURL` ── */}
        <Map
          style={styles.map}
          mapStyle={DARK_MAP_STYLE}
          logo={false}
          attribution={false}
          compass={false}
          onRegionDidChange={handleRegionDidChange}>

          {/* v11 Camera — ref methods: flyTo, easeTo, jumpTo, fitBounds, zoomTo */}
          <Camera
            ref={cameraRef}
            initialViewState={{
              center: [userLocation.longitude, userLocation.latitude],
              zoom: 14,
            }}
          />

          {/* Accuracy ring — type="circle", paint props */}
          <GeoJSONSource id="userAccuracy" data={userPointGeoJSON}>
            <Layer
              id="userAccuracyCircle"
              type="circle"
              paint={{
                'circle-radius': 55,
                'circle-color': 'rgba(0,180,150,0.12)',
                'circle-stroke-color': 'rgba(0,200,170,0.25)',
                'circle-stroke-width': 1.5,
                'circle-pitch-alignment': 'map',
              }}
            />
          </GeoJSONSource>

          {/* User dot — ViewAnnotation (custom view) */}
          {/* v11: coordinate is { lng, lat } object */}
          <ViewAnnotation
            coordinate={{
              lng: userLocation.longitude,
              lat: userLocation.latitude,
            }}
            anchor="center">
            <View style={styles.userPulseOuter}>
              <View style={styles.userPulseMid}>
                <View style={styles.userDotOuter}>
                  <View style={styles.userDot} />
                </View>
              </View>
            </View>
          </ViewAnnotation>

          {/* Contact marker */}
          {CONTACT_MARKER && (
            <ViewAnnotation
              coordinate={{
                lng: CONTACT_MARKER.coordinate.longitude,
                lat: CONTACT_MARKER.coordinate.latitude,
              }}
              anchor="bottom">
              <View style={styles.markerWrapper}>
                <View
                  style={[
                    styles.markerPin,
                    {backgroundColor: CONTACT_MARKER.color},
                  ]}>
                  <Text style={styles.markerPinText}>i</Text>
                </View>
                <View
                  style={[
                    styles.markerArrow,
                    {borderTopColor: CONTACT_MARKER.color},
                  ]}
                />
              </View>
            </ViewAnnotation>
          )}

          {/* Route polyline — shadow + main + dashed */}
          {routeGeoJSON && (
            <GeoJSONSource id="routeSource" data={routeGeoJSON}>
              {/* Shadow */}
              <Layer
                id="routeShadow"
                type="line"
                paint={{
                  'line-color': 'rgba(0,0,0,0.25)',
                  'line-width': 6,
                }}
                layout={{
                  'line-cap': 'round',
                  'line-join': 'round',
                }}
              />
              {/* Main */}
              <Layer
                id="routeMain"
                type="line"
                paint={{
                  'line-color': '#4DA3FF',
                  'line-width': 4,
                }}
                layout={{
                  'line-cap': 'round',
                  'line-join': 'round',
                }}
              />
              {/* Dashed accent */}
              <Layer
                id="routeDash"
                type="line"
                paint={{
                  'line-color': 'rgba(130,200,255,0.45)',
                  'line-width': 2,
                  'line-dasharray': [2, 3.5],
                }}
                layout={{'line-cap': 'round'}}
              />
            </GeoJSONSource>
          )}

          {/* Endpoint circles */}
          {routeCoords.length > 0 && selectedContactLocation && (
            <>
              <GeoJSONSource id="endpointUser" data={userPointGeoJSON}>
                <Layer
                  id="endpointUserCircle"
                  type="circle"
                  paint={{
                    'circle-radius': 18,
                    'circle-color': 'rgba(77,163,255,0.25)',
                    'circle-stroke-color': '#4DA3FF',
                    'circle-stroke-width': 2,
                    'circle-pitch-alignment': 'map',
                  }}
                />
              </GeoJSONSource>

              {contactPointGeoJSON && (
                <GeoJSONSource id="endpointContact" data={contactPointGeoJSON}>
                  <Layer
                    id="endpointContactCircle"
                    type="circle"
                    paint={{
                      'circle-radius': 18,
                      'circle-color': 'rgba(255,59,92,0.2)',
                      'circle-stroke-color': '#FF3B5C',
                      'circle-stroke-width': 2,
                      'circle-pitch-alignment': 'map',
                    }}
                  />
                </GeoJSONSource>
              )}
            </>
          )}
        </Map>

        {/* ROUTE INFO BADGE */}
        {routeInfo && (
          <View style={styles.routeInfoBadge}>
            <Icon
              name={
                travelMode === 'walking' ? 'directions-walk' : 'directions-car'
              }
              size={15}
              color="#4DA3FF"
            />
            <Text style={styles.routeInfoText}>{routeInfo.duration}</Text>
            <View style={styles.routeInfoDivider} />
            <Icon name="straighten" size={14} color="#7A8499" />
            <Text style={styles.routeInfoSub}>{routeInfo.distance}</Text>
          </View>
        )}

        {/* RECENTER BUTTON */}
        {isOffCenter && (
          <TouchableOpacity
            style={styles.recenterBtn}
            onPress={centerOnUser}
            activeOpacity={0.8}>
            <Icon name="my-location" size={20} color="#4DA3FF" />
          </TouchableOpacity>
        )}

        {/* TRAVEL MODE BUTTON */}
        <TouchableOpacity
          style={[
            styles.travelModeBtn,
            travelMode === 'walking' && styles.travelModeBtnActive,
          ]}
          onPress={() =>
            setTravelMode(prev => (prev === 'driving' ? 'walking' : 'driving'))
          }
          activeOpacity={0.8}>
          <Icon
            name={
              travelMode === 'walking' ? 'directions-walk' : 'directions-car'
            }
            size={20}
            color={travelMode === 'walking' ? '#ffffff' : '#4DA3FF'}
          />
        </TouchableOpacity>

        {/* FLOATING ACTION MENU */}
        <View style={styles.fabContainer}>
          {menuOpen && (
            <>
              <TouchableOpacity
                onPress={navigateToChatRoom}
                style={styles.fabAction}
                activeOpacity={0.8}>
                <View style={styles.fabActionBtn}>
                  <Icon name="chat" size={20} color="#ffffff" />
                </View>
                <Text style={styles.fabActionLabel}>Chat</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={navigateAudioRoom}
                style={styles.fabAction}
                activeOpacity={0.8}>
                <View style={styles.fabActionBtn}>
                  <Icon name="mic" size={20} color="#ffffff" />
                </View>
                <Text style={styles.fabActionLabel}>Audio</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={startMoving}
                style={styles.fabAction}
                activeOpacity={0.8}>
                <View
                  style={[
                    styles.fabActionBtn,
                    isMoving && styles.fabActionBtnActive,
                  ]}>
                  <Icon
                    name={isMoving ? 'stop' : 'open-with'}
                    size={20}
                    color="#ffffff"
                  />
                </View>
                <Text style={styles.fabActionLabel}>
                  {isMoving ? 'Stop' : 'Move'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={[styles.fabMain, menuOpen && styles.fabMainOpen]}
            onPress={() => setMenuOpen(prev => !prev)}
            activeOpacity={0.8}>
            <Icon
              name={menuOpen ? 'close' : 'more-vert'}
              size={24}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>

        {/* ZOOM CONTROLS */}
        <View style={styles.zoomControls}>
          <TouchableOpacity
            style={styles.zoomBtn}
            onPress={handleZoomIn}
            activeOpacity={0.7}>
            <Icon name="add" size={22} color="#4DA3FF" />
          </TouchableOpacity>
          <View style={styles.zoomDivider} />
          <TouchableOpacity
            style={styles.zoomBtn}
            onPress={handleZoomOut}
            activeOpacity={0.7}>
            <Icon name="remove" size={22} color="#4DA3FF" />
          </TouchableOpacity>
        </View>

        {/* SEARCH — Nominatim */}
        <PlacesAutocomplete
          onSelect={handlePlaceSelect}
          onCurrentLocation={chooseCurrentLocation}
        />

        {/* LOCATION CARD */}
        <View style={styles.locationCard}>
          <View style={styles.cardHandle} />
          <MapAvatarList
            navigation={navigation}
            chatContacts={mappedMapContacts}
            fetchChatContacts={fetchChatContacts}
          />
        </View>
      </>
    </View>
  );
};

export default MapLibreScreen;