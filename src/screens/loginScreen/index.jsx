import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Spinner from 'react-native-loading-spinner-overlay';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import styles from './style';
import CountryListModal from '../../components/countryListModal';
import { Alert } from 'react-native';
export const getFlagEmoji = (countryCode) => {
  const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};
const LoginScreen = () => {
  const navigation = useNavigation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isGetOtp, setIsGetOtp] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({ name: 'Nigeria', code: 'NG', dial_code: '+234' });
  const [userPhone, setUserPhone] = useState('');
  const [isCountryModalVisible, setIsCountryModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleSelectCountry = (country) => {
    console.log('Selected Country:', country);
    setSelectedCountry(country);
    setIsCountryModalVisible(false);
  }
  const handleCloseCountryModal = () => {
    setIsCountryModalVisible(false);
  }
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
  const getLoginOtp = () => {
    setIsLoading(true);
  //phone number validation
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(userPhone)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Phone Number',
        text2: 'Please enter a valid phone number.',
      });
      setIsLoading(false);
      return;
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
      <Text style={styles.welcome}>Welcome</Text>
      <Text style={styles.subtitle}>SIGN IN TO CONTINUE · SECURE LOGIN</Text>

      {/* MOBILE */}
      <Text style={styles.label}>MOBILE NUMBER</Text>

      <View style={styles.inputBox}>
        <TouchableOpacity onPress={() => setIsCountryModalVisible(true)}>
            <Text style={styles.country}>{getFlagEmoji(selectedCountry.code)} {selectedCountry.dial_code}</Text>
        </TouchableOpacity>
        <TextInput
          placeholder="1234567890"
          placeholderTextColor="#6B7C99"
          style={styles.input}
          keyboardType="phone-pad"
          maxLength={15}
          onChangeText={(text) => {
            setUserPhone(text);
          }}
          editable={isGetOtp ? false : true}
        />
      </View>

      {!isGetOtp && (
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={getLoginOtp}
        >
          <Icon name="sms" size={18} color="#fff" />
          <Text style={styles.loginText}> Get OTP</Text>
        </TouchableOpacity>
      )}

      {isGetOtp && (
        <>
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
                style={[
                  styles.otpBox,
                  activeIndex === index && styles.activeOtp,
                ]}
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
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.replace('Main')}
          >
            <Icon name="verified-user" size={18} color="#fff" />
            <Text style={styles.loginText}> Verify & Sign In</Text>
          </TouchableOpacity>

          {/* RESEND */}
          <Text style={styles.resend}>Didn't receive OTP? Resend in 00:42</Text>
        </>
      )}

      <CountryListModal visible={isCountryModalVisible} onSelectCountry={handleSelectCountry} onClose={handleCloseCountryModal} />

      <View style={{ height: 60 }} />
      <Spinner
          visible={isLoading}
          textContent={'Processing...'}
          textStyle={{ color: '#FFF' }}
        />
    </ScrollView>
  );
};

export default LoginScreen;
