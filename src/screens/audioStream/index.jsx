import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from './style';

const AudioStreamScreen = () => {
  const [seconds, setSeconds] = useState(154);

  // waveform base heights
  const baseHeights = [10, 18, 26, 34, 42, 50, 58, 50, 42, 34, 26, 18, 10];

  const bars = useRef(baseHeights.map(h => new Animated.Value(h))).current;

  // blinking recording dot
  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    animateBars();
    animateBlink();

    return () => clearInterval(timer);
  }, []);

  const animateBars = () => {
    const animations = bars.map((bar, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(bar, {
            toValue: baseHeights[index] + Math.random() * 25,
            duration: 300 + Math.random() * 200,
            useNativeDriver: false,
          }),
          Animated.timing(bar, {
            toValue: baseHeights[index],
            duration: 300,
            useNativeDriver: false,
          }),
        ]),
      );
    });

    Animated.stagger(80, animations).start();
  };

  const animateBlink = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const formatTime = sec => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;

    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Audio Stream</Text>
          <Text style={styles.subtitle}>RECORDING · LIVE UPLOAD</Text>
        </View>

        <Icon name="mic" size={26} color="#fff" />
      </View>

      {/* WAVEFORM */}
      <View style={styles.waveContainer}>
        {bars.map((bar, index) => (
          <Animated.View
            key={index}
            style={[styles.waveBar, { height: bar }]}
          />
        ))}
      </View>

      {/* TIMER */}
      <Text style={styles.timer}>{formatTime(seconds)}</Text>

      {/* RECORDING STATUS */}
      <View style={styles.recordingRow}>
        <Animated.Text style={[styles.recordDot, { opacity: blinkAnim }]}>
          ●
        </Animated.Text>

        <Text style={styles.recordingText}>
          RECORDING · Streaming to server
        </Text>
      </View>

      {/* CONTROLS */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn}>
          <Icon name="pause" size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.recordBtn}>
          <Icon name="stop" size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlBtn}>
          <Icon name="mic-off" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* SERVER CARD */}
      <View style={styles.serverCard}>
        <Text style={styles.serverText}>
          ☁ Uploading to Node.js server · 128 kbps · Encrypted
        </Text>
      </View>

      {/* STATS */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>128</Text>
          <Text style={styles.statLabel}>KBPS</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#2ED573' }]}>3.2</Text>
          <Text style={styles.statLabel}>MB SENT</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#FFA502' }]}>5ms</Text>
          <Text style={styles.statLabel}>LATENCY</Text>
        </View>
      </View>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
};

export default AudioStreamScreen;
