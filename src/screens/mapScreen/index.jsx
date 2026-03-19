import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from './style';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0a1628' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#4a6a8a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a1628' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0f2440' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#0f2440' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0d1f38' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#122a4a' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#060e1a' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#0a1628' }],
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
];

// Example: New York City
const USER_LOCATION = { latitude: 40.7128, longitude: -74.006 };

const CONTACT_MARKERS = [
  {
    id: 1,
    coordinate: { latitude: 40.7138, longitude: -74.001 }, // Manhattan
    color: '#FF3B5C',
    initial: 'R',
  },
  {
    id: 2,
    coordinate: { latitude: 40.709, longitude: -74.012 }, // Lower Manhattan
    color: '#7B61FF',
    initial: 'P',
  },
];

const MapScreen = () => {
  const mapRef = useRef(null);
  const [region] = useState({
    latitude: USER_LOCATION.latitude,
    longitude: USER_LOCATION.longitude,
    latitudeDelta: 0.012,
    longitudeDelta: 0.012,
  });
  // Simulate API key check
  const [mapEnabled] = useState(true); // Set to true if API key is available

  const centerOnUser = () => {
    mapRef.current?.animateToRegion(
      {
        ...USER_LOCATION,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      },
      600,
    );
  };

  return (
    <View style={styles.container}>
      {mapEnabled ? (
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
          >
            {/* Accuracy radius */}
            <Circle
              center={USER_LOCATION}
              radius={150}
              fillColor="rgba(0, 180, 150, 0.12)"
              strokeColor="rgba(0, 200, 170, 0.25)"
              strokeWidth={1.5}
            />

            {/* User blue dot */}
            <Marker coordinate={USER_LOCATION} anchor={{ x: 0.5, y: 0.5 }}>
              <View style={styles.userDotOuter}>
                <View style={styles.userDot} />
              </View>
            </Marker>

            {/* Contact markers */}
            {CONTACT_MARKERS.map(marker => (
              <Marker
                key={marker.id}
                coordinate={marker.coordinate}
                anchor={{ x: 0.5, y: 1 }}
              >
                <View style={styles.markerWrapper}>
                  <View
                    style={[
                      styles.markerPin,
                      { backgroundColor: marker.color },
                    ]}
                  >
                    <Icon name="person" size={16} color="#fff" />
                  </View>
                  <View
                    style={[
                      styles.markerArrow,
                      { borderTopColor: marker.color },
                    ]}
                  />
                </View>
              </Marker>
            ))}
          </MapView>

          {/* SEARCH BAR */}
          <View style={styles.searchBar}>
            <Icon name="location-pin" size={20} color="#FF3B5C" />
            <Text style={styles.searchText}>Current Location</Text>
            <TouchableOpacity style={styles.searchBtn} onPress={centerOnUser}>
              <Icon name="my-location" size={18} color="#4DA3FF" />
            </TouchableOpacity>
          </View>

          {/* LOCATION CARD */}
          <View style={styles.locationCard}>
            <View style={styles.locationLeft}>
              <View style={styles.redDotContainer}>
                <View style={styles.redDot} />
                <View style={styles.redDotLine} />
              </View>

              <View>
                <Text style={styles.locationTitle}>California, US</Text>
                <Text style={styles.locationSub}>
                  Updated 2 sec ago ·{'\n'}Accuracy ±4m
                </Text>
              </View>
            </View>

            <View style={styles.liveBadge}>
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
        </>
      ) : (
        <>
          <View style={styles.container}>
            {/* HEADER (UNCHANGED) */}

            <View style={styles.header}>
              

              <Text style={styles.headerTitle}>Map</Text>

              <TouchableOpacity>
                <Icon name="my-location" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* SEARCH BAR */}

            <View style={styles.searchBar}>
              <Icon name="location-pin" size={18} color="#FF3B5C" />

              <Text style={styles.searchText}>Current Location</Text>

              <View style={styles.searchBtn}>
                <Icon name="search" size={18} color="#fff" />
              </View>
            </View>

            {/* LOCATION CARD */}

            <View style={styles.locationCard}>
              <View style={styles.locationLeft}>
                <View style={styles.redDot} />

                <View>
                  <Text style={styles.locationTitle}>California, US</Text>

                  <Text style={styles.locationSub}>
                    Updated 2 sec ago · Accuracy ±4m
                  </Text>
                </View>
              </View>

              <View style={styles.liveBadge}>
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

export default MapScreen;
