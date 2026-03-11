import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const MapScreen = ({navigation}) => {
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filters = ['All', 'Police', 'Hospital', 'Fire Station'];

  const nearbyPlaces = [
    {
      id: 1,
      name: 'City General Hospital',
      type: 'Hospital',
      distance: '0.8 km',
      icon: 'local-hospital',
      color: '#FF6B81',
    },
    {
      id: 2,
      name: 'Central Police Station',
      type: 'Police',
      distance: '1.2 km',
      icon: 'local-police',
      color: '#5352ED',
    },
    {
      id: 3,
      name: 'Fire Station #5',
      type: 'Fire Station',
      distance: '2.1 km',
      icon: 'local-fire-department',
      color: '#FF4757',
    },
    {
      id: 4,
      name: 'St. Mary Medical Center',
      type: 'Hospital',
      distance: '2.5 km',
      icon: 'local-hospital',
      color: '#FF6B81',
    },
    {
      id: 5,
      name: 'Downtown Police Post',
      type: 'Police',
      distance: '3.0 km',
      icon: 'local-police',
      color: '#5352ED',
    },
  ];

  const filteredPlaces =
    selectedFilter === 'All'
      ? nearbyPlaces
      : nearbyPlaces.filter(p => p.type === selectedFilter);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Icon name="menu" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Map</Text>
        <TouchableOpacity>
          <Icon name="my-location" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Map Placeholder */}
      <View style={styles.mapPlaceholder}>
        <Icon name="map" size={80} color="#5352ED" />
        <Text style={styles.mapText}>Map View</Text>
        <Text style={styles.mapSubText}>
          Interactive map with nearby emergency services
        </Text>

        {/* Fake map pins */}
        <View style={[styles.mapPin, {top: 40, left: 60}]}>
          <Icon name="local-hospital" size={20} color="#FF6B81" />
        </View>
        <View style={[styles.mapPin, {top: 80, right: 50}]}>
          <Icon name="local-police" size={20} color="#5352ED" />
        </View>
        <View style={[styles.mapPin, {bottom: 60, left: 100}]}>
          <Icon name="local-fire-department" size={20} color="#FF4757" />
        </View>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}>
        {filters.map(filter => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterChip,
              selectedFilter === filter && styles.filterChipActive,
            ]}
            onPress={() => setSelectedFilter(filter)}>
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter && styles.filterTextActive,
              ]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Nearby Places */}
      <Text style={styles.sectionTitle}>Nearby Emergency Services</Text>
      <ScrollView style={styles.placesList}>
        {filteredPlaces.map(place => (
          <TouchableOpacity key={place.id} style={styles.placeCard}>
            <View style={[styles.placeIcon, {backgroundColor: place.color}]}>
              <Icon name={place.icon} size={24} color="#FFFFFF" />
            </View>
            <View style={styles.placeInfo}>
              <Text style={styles.placeName}>{place.name}</Text>
              <Text style={styles.placeType}>{place.type}</Text>
            </View>
            <View style={styles.placeDistance}>
              <Text style={styles.distanceText}>{place.distance}</Text>
              <Icon name="directions" size={20} color="#5352ED" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  mapPlaceholder: {
    height: 220,
    backgroundColor: '#16213E',
    marginHorizontal: 20,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    position: 'relative',
    overflow: 'hidden',
  },
  mapText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
  },
  mapSubText: {
    fontSize: 12,
    color: '#A4B0BE',
    marginTop: 5,
  },
  mapPin: {
    position: 'absolute',
    backgroundColor: '#16213ECC',
    borderRadius: 15,
    padding: 5,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
    maxHeight: 45,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#16213E',
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: '#5352ED',
  },
  filterText: {
    color: '#A4B0BE',
    fontSize: 14,
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  placesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213E',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  placeIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  placeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placeType: {
    fontSize: 12,
    color: '#A4B0BE',
    marginTop: 2,
  },
  placeDistance: {
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 12,
    color: '#A4B0BE',
    marginBottom: 4,
  },
});

export default MapScreen;
