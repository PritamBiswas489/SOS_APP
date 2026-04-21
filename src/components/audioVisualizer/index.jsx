/**
 * AudioVisualizer
 *
 * Animated frequency-bar visualizer for audio streams.
 * Simulates a spectrum analyser using staggered Animated loops.
 *
 * Props:
 *   active  {boolean}  — animate when true, settle to flat when false
 *   color   {string}   — bar fill colour
 *   label   {string}   — small caption rendered above the bars
 *   height  {number}   — total container height (default 64)
 *   bars    {number}   — number of bars (default 28)
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

const DEFAULT_BARS   = 28;
const DEFAULT_HEIGHT = 64;
const MIN_BAR_H      = 3;
const BAR_GAP        = 2;

export default function AudioVisualizer({
  active  = false,
  color   = '#7c6ff7',
  label   = null,
  height  = DEFAULT_HEIGHT,
  bars: BAR_COUNT = DEFAULT_BARS,
}) {
  // One Animated.Value per bar — initialised once
  const animValues = useRef(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(MIN_BAR_H)),
  ).current;

  // Pre-generate stable random parameters so they don't change between renders
  const barParams = useMemo(
    () =>
      Array.from({ length: BAR_COUNT }, (_, i) => ({
        // Sine-wave baseline so edge bars are shorter (visual balance)
        maxFrac:  0.25 + Math.abs(Math.sin((i / BAR_COUNT) * Math.PI)) * 0.75,
        duration: 300 + Math.floor(Math.random() * 500),
        delay:    Math.floor((i / BAR_COUNT) * 200),  // stagger across bars
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const runningAnims = useRef([]);

  useEffect(() => {
    // Stop any previous animations
    runningAnims.current.forEach(a => a.stop());
    runningAnims.current = [];

    if (active) {
      animValues.forEach((val, i) => {
        const { maxFrac, duration, delay } = barParams[i];
        const maxH   = MIN_BAR_H + (height - MIN_BAR_H) * maxFrac;
        const troughH = MIN_BAR_H + (maxH - MIN_BAR_H) * 0.15;

        const anim = Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(val, {
              toValue:         maxH,
              duration,
              useNativeDriver: false,
            }),
            Animated.timing(val, {
              toValue:         troughH,
              duration:        duration * 0.8,
              useNativeDriver: false,
            }),
          ]),
        );
        anim.start();
        runningAnims.current.push(anim);
      });
    } else {
      // Settle all bars to minimum
      animValues.forEach(val => {
        const settle = Animated.timing(val, {
          toValue:         MIN_BAR_H,
          duration:        400,
          useNativeDriver: false,
        });
        settle.start();
        runningAnims.current.push(settle);
      });
    }

    return () => {
      runningAnims.current.forEach(a => a.stop());
    };
  }, [active, height]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={[styles.wrapper, { height: label ? height + 20 : height }]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.barsRow, { height }]}>
        {animValues.map((val, i) => (
          <Animated.View
            key={i}
            style={[
              styles.bar,
              {
                height:          val,
                backgroundColor: color,
                // Slight opacity variation for depth
                opacity: 0.55 + (i % 4) * 0.1,
                flex:    1,
                marginHorizontal: BAR_GAP / 2,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper:  {
    backgroundColor: '#17171a',
    borderRadius:    10,
    borderWidth:     1,
    borderColor:     '#2a2a30',
    paddingHorizontal: 10,
    paddingVertical:   8,
    overflow:        'hidden',
  },
  label:    {
    fontSize:      10,
    fontWeight:    '600',
    color:         '#6b6b7a',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom:  6,
  },
  barsRow:  {
    flexDirection: 'row',
    alignItems:    'flex-end',
  },
  bar:      {
    borderRadius: 2,
  },
});
