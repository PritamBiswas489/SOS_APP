import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from './style';

const LoginScreen = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputs = useRef([]);

  const handleOTP = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputs.current[index + 1].focus();
      setActiveIndex(index + 1);
    }
  };

  const handleBackspace = (value, index) => {
    if (value === '' && index > 0) {
      inputs.current[index - 1].focus();
      setActiveIndex(index - 1);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* LOGO */}
      <View style={styles.logoContainer}>
        <View style={styles.logoBox}>
          <Icon name="security" size={28} color="#fff" />
        </View>

        <Text style={styles.appName}>
          Safe<Text style={{ color: '#ff3b5c' }}>Guard</Text>
        </Text>

        <Text style={styles.tagline}>PERSONAL SAFETY NETWORK</Text>
      </View>

      {/* WELCOME */}
      <Text style={styles.welcome}>Welcome Back</Text>
      <Text style={styles.subtitle}>SIGN IN TO CONTINUE · SECURE LOGIN</Text>

      {/* MOBILE */}
      <Text style={styles.label}>MOBILE NUMBER</Text>

      <View style={styles.inputBox}>
        <Text style={styles.country}>IN</Text>

        <TextInput
          placeholder="+91 98765 4321"
          placeholderTextColor="#6B7C99"
          style={styles.input}
        />
      </View>

      {/* LICENSE */}
      <Text style={styles.label}>LICENSE NUMBER</Text>

      <View style={styles.inputBoxDark}>
        <Icon name="badge" size={18} color="#4DA3FF" />

        <TextInput
          placeholder="DL-2024-MH-0048291"
          placeholderTextColor="#6B7C99"
          style={styles.input}
        />
      </View>

      <View style={styles.otpBoxArea}>
        <Text style={styles.otpTitle}>VERIFY OTP</Text>
        <View style={styles.otpBoxLine}></View>
      </View>
      <Text style={styles.label}>ONE-TIME PASSWORD</Text>

      <View style={styles.otpRow}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => (inputs.current[index] = ref)}
            style={[styles.otpBox, activeIndex === index && styles.activeOtp]}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            placeholder="-"
            placeholderTextColor="#6B7C99"
            onFocus={() => setActiveIndex(index)}
            onChangeText={value => handleOTP(value, index)}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === 'Backspace') {
                handleBackspace('', index);
              }
            }}
          />
        ))}
      </View>

      {/* TERMS */}
      <View style={styles.termsRow}>
        <Icon name="check-box" size={18} color="#ff3b5c" />

        <Text style={styles.termsText}>
          I agree to Terms of Service and Privacy Policy
        </Text>
      </View>

      {/* BUTTON */}
      <TouchableOpacity style={styles.loginBtn}>
        <Icon name="verified-user" size={18} color="#fff" />
        <Text style={styles.loginText}> Verify & Sign In</Text>
      </TouchableOpacity>

      {/* RESEND */}
      <Text style={styles.resend}>Didn't receive OTP? Resend in 00:42</Text>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
};

export default LoginScreen;
