import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SettingsScreen = ({navigation}) => {
  const [notifications, setNotifications] = useState(true);
  const [locationTracking, setLocationTracking] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [autoSOS, setAutoSOS] = useState(false);
  const [shakeDetect, setShakeDetect] = useState(true);

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {icon: 'person', label: 'Profile', subtitle: 'Edit your profile info'},
        {icon: 'security', label: 'Privacy', subtitle: 'Manage your privacy'},
        {icon: 'lock', label: 'Change Password', subtitle: 'Update password'},
      ],
    },
    {
      title: 'General',
      items: [
        {icon: 'language', label: 'Language', subtitle: 'English'},
        {icon: 'text-fields', label: 'Font Size', subtitle: 'Medium'},
        {icon: 'color-lens', label: 'Theme', subtitle: 'Dark'},
      ],
    },
    {
      title: 'Support',
      items: [
        {icon: 'help', label: 'Help Center', subtitle: 'Get help with app'},
        {icon: 'bug-report', label: 'Report a Bug', subtitle: 'Send feedback'},
        {icon: 'info', label: 'About', subtitle: 'Version 1.0.0'},
      ],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Icon name="menu" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{width: 28}} />
      </View>

      {/* Profile Card */}
      <TouchableOpacity style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Icon name="person" size={32} color="#FFFFFF" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Alex Johnson</Text>
          <Text style={styles.profileEmail}>alex.johnson@email.com</Text>
        </View>
        <Icon name="chevron-right" size={24} color="#A4B0BE" />
      </TouchableOpacity>

      {/* Toggle Settings */}
      <Text style={styles.sectionTitle}>Preferences</Text>
      <View style={styles.toggleSection}>
        <ToggleSetting
          icon="notifications"
          label="Notifications"
          subtitle="Push notifications for alerts"
          value={notifications}
          onToggle={setNotifications}
        />
        <ToggleSetting
          icon="location-on"
          label="Location Tracking"
          subtitle="Share location with contacts"
          value={locationTracking}
          onToggle={setLocationTracking}
        />
        <ToggleSetting
          icon="dark-mode"
          label="Dark Mode"
          subtitle="Use dark theme"
          value={darkMode}
          onToggle={setDarkMode}
        />
        <ToggleSetting
          icon="sos"
          label="Auto SOS"
          subtitle="Auto-send SOS on crash detection"
          value={autoSOS}
          onToggle={setAutoSOS}
        />
        <ToggleSetting
          icon="vibration"
          label="Shake to Alert"
          subtitle="Shake phone to trigger SOS"
          value={shakeDetect}
          onToggle={setShakeDetect}
          isLast
        />
      </View>

      {/* Settings Sections */}
      {settingsSections.map((section, sindex) => (
        <View key={sindex}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.settingsGroup}>
            {section.items.map((item, iindex) => (
              <TouchableOpacity
                key={iindex}
                style={[
                  styles.settingItem,
                  iindex < section.items.length - 1 && styles.settingBorder,
                ]}>
                <View style={styles.settingLeft}>
                  <Icon name={item.icon} size={22} color="#5352ED" />
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                    <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <Icon name="chevron-right" size={22} color="#A4B0BE" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn}>
        <Icon name="logout" size={22} color="#FF4757" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <View style={{height: 30}} />
    </ScrollView>
  );
};

const ToggleSetting = ({icon, label, subtitle, value, onToggle, isLast}) => (
  <View style={[styles.toggleItem, !isLast && styles.settingBorder]}>
    <View style={styles.settingLeft}>
      <Icon name={icon} size={22} color="#5352ED" />
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{false: '#3D3D5C', true: '#5352ED'}}
      thumbColor={value ? '#FFFFFF' : '#A4B0BE'}
    />
  </View>
);

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
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213E',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#5352ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileEmail: {
    fontSize: 13,
    color: '#A4B0BE',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#A4B0BE',
    marginHorizontal: 20,
    marginBottom: 10,
    marginTop: 5,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  toggleSection: {
    backgroundColor: '#16213E',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  toggleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  settingsGroup: {
    backgroundColor: '#16213E',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  settingBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2E',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingInfo: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#A4B0BE',
    marginTop: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF475720',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
  },
  logoutText: {
    color: '#FF4757',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default SettingsScreen;
