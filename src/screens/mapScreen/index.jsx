import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import styles from './style';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';

const MapScreen = ({ navigation }) => {
  const [region, setRegion] = useState({
    latitude: 22.7,
    longitude: 88.45,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  return (
    <View style={styles.container}>
      {/* HEADER (UNCHANGED) */}

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Icon name="menu" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Map</Text>

        <TouchableOpacity>
          <Icon name="my-location" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* MAP */}

      {/* <MapView style={styles.map} region={region} showsUserLocation={false}>


        <Marker coordinate={{ latitude: 22.7, longitude: 88.45 }}>
          <View style={styles.userDot} />
        </Marker>



        <Marker coordinate={{ latitude: 22.701, longitude: 88.451 }}>
          <View style={styles.markerContainer}>
            <Icon name="person-pin-circle" size={34} color="#FF3B5C" />
          </View>
        </Marker>



        <Marker coordinate={{ latitude: 22.6985, longitude: 88.448 }}>
          <View style={styles.markerContainer}>
            <Icon name="person-pin-circle" size={34} color="#7B61FF" />
          </View>
        </Marker>
      </MapView> */}

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
            <Text style={styles.locationTitle}>Madhyamgram, WB</Text>

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
  );
};

export default MapScreen;
