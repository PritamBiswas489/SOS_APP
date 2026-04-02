import React, { useEffect, useRef } from 'react';
import appColors from '../../theme/appColors';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
 

import styles from './style';

const HomeScreen = ({ navigation }) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const userData = useSelector(state => state.userProviderData);
  console.log('=====================================================');
  console.log('User Data in Home Screen:', userData);
  console.log('=====================================================');

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const scale = pulseAnim.interpolate({
    inputRange: [0, 1.2],
    outputRange: [0, 1.8],
  });

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.3, 0],
  });

  return (
    <ScrollView style={styles.container}>
      {/* Greeting */}
      <View style={styles.greetingContainer}>
        <Text style={styles.goodMorning}>GOOD MORNING,</Text>
        <Text style={styles.userName}>{userData.name} 👋</Text>
      </View>

      {/* SOS Button */}
      <View style={styles.sosWrapper}>
        <Animated.View
          style={[
            styles.glowRing,
            {
              transform: [{ scale }],
              opacity,
            },
          ]}
        />

        <Animated.View
          style={[
            styles.glowRing2,
            {
              transform: [{ scale }],
              opacity,
            },
          ]}
        />

        <TouchableOpacity activeOpacity={0.9}>
          <View style={styles.sosButton}>
            <Text style={styles.sosText}>SOS</Text>
            <Text style={styles.sosSubText}>HOLD TO SEND</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Safe Status */}
      <View style={styles.safeCard}>
        <View style={styles.greenDot} />
        <Text style={styles.safeText}>You're safe · Live tracking ON</Text>
      </View>

      {/* Info Cards */}
      <View style={styles.grid}>
        <View style={styles.card}>
          <Icon name="favorite" size={30} color="#FF4757" />
          <Text style={[styles.cardNumber, { color: appColors.primary }]}>
            74 bpm
          </Text>
          <Text style={styles.cardLabel}>HEART RATE</Text>
        </View>

        <View style={styles.card}>
          <Icon name="psychology" size={30} color="#FFA502" />
          <Text style={[styles.cardNumber, { color: appColors.yellow }]}>
            38%
          </Text>
          <Text style={styles.cardLabel}>STRESS LEVEL</Text>
        </View>

        <View style={styles.card}>
          <Icon name="people" size={30} color="#A4B0BE" />
          <Text style={[styles.cardNumber, { color: appColors.blue }]}>4</Text>
          <Text style={styles.cardLabel}>CONTACTS</Text>
        </View>

        <View style={styles.card}>
          <Icon name="location-on" size={30} color="#2ED573" />
          <Text style={[styles.cardNumber, { color: '#2ED573' }]}>ON</Text>
          <Text style={styles.cardLabel}>GPS TRACK</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
