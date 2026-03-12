import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';

import Icon from 'react-native-vector-icons/MaterialIcons';

import BottomTabNavigator from './BottomTabNavigator';
import AudioStreamScreen from '../screens/audioStream';
import loginScreen from '../screens/loginScreen';
import TrustedContactsScreen from '../screens/trustedContactsScreen';
import AddContactsScreen from '../screens/addContactsScreen';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = props => {
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerContainer}
    >
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileAvatar}>
          <Icon name="person" size={40} color="#FFFFFF" />
        </View>

        <Text style={styles.profileName}>Alex Johnson</Text>
        <Text style={styles.profileEmail}>alex.johnson@email.com</Text>

        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Online</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Drawer Items */}
      <View style={styles.drawerItems}>
        <DrawerItemList {...props} />
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Extra Options */}
      <View style={styles.extraSection}>
        <TouchableOpacity style={styles.extraItem}>
          <Icon name="share" size={22} color="#A4B0BE" />
          <Text style={styles.extraItemText}>Share App</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.extraItem}>
          <Icon name="star" size={22} color="#A4B0BE" />
          <Text style={styles.extraItemText}>Rate Us</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.extraItem}>
          <Icon name="privacy-tip" size={22} color="#A4B0BE" />
          <Text style={styles.extraItemText}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.logoutBtn}>
          <Icon name="logout" size={22} color="#FF4757" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
      </View>
    </DrawerContentScrollView>
  );
};

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#1A1A2E',
          width: 280,
        },
        drawerActiveBackgroundColor: '#5352ED30',
        drawerActiveTintColor: '#5352ED',
        drawerInactiveTintColor: '#A4B0BE',
        drawerLabelStyle: {
          fontSize: 15,
          fontWeight: '500',
          marginLeft: -15,
        },
      }}
    >
      <Drawer.Screen
        name="MainTabs"
        component={BottomTabNavigator}
        options={{
          drawerLabel: 'Home',
          drawerIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="DrawerMap"
        component={BottomTabNavigator}
        options={{
          drawerLabel: 'Map',
          drawerIcon: ({ color, size }) => (
            <Icon name="map" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="DrawerHealth"
        component={BottomTabNavigator}
        options={{
          drawerLabel: 'Health',
          drawerIcon: ({ color, size }) => (
            <Icon name="favorite" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="DrawerContacts"
        component={BottomTabNavigator}
        options={{
          drawerLabel: 'Contacts',
          drawerIcon: ({ color, size }) => (
            <Icon name="people" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="DrawerSettings"
        component={BottomTabNavigator}
        options={{
          drawerLabel: 'Settings',
          drawerIcon: ({ color, size }) => (
            <Icon name="settings" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="DrawerAudio"
        component={AudioStreamScreen}
        options={{
          drawerLabel: 'Audio Stream',
          drawerIcon: ({ color, size }) => (
            <Icon name="audiotrack" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="DrawerLogin"
        component={loginScreen}
        options={{
          drawerLabel: 'Login',
          drawerIcon: ({ color, size }) => (
            <Icon name="login" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="TrustedContactsScreen"
        component={TrustedContactsScreen}
        options={{
          drawerLabel: 'Trusted Contacts',
          drawerIcon: ({ color, size }) => (
            <Icon name="people" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="AddContactsScreen"
        component={AddContactsScreen}
        options={{
          drawerLabel: 'Add Contacts',
          drawerIcon: ({ color, size }) => (
            <Icon name="person-add" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
  },

  profileSection: {
    padding: 20,
    paddingTop: 30,
    alignItems: 'center',
  },

  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#5352ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  profileEmail: {
    fontSize: 13,
    color: '#A4B0BE',
    marginTop: 4,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#2ED57320',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2ED573',
    marginRight: 6,
  },

  statusText: {
    color: '#2ED573',
    fontSize: 12,
    fontWeight: '600',
  },

  divider: {
    height: 1,
    backgroundColor: '#16213E',
    marginHorizontal: 20,
    marginVertical: 10,
  },

  drawerItems: {
    paddingTop: 5,
  },

  extraSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  extraItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },

  extraItemText: {
    color: '#A4B0BE',
    fontSize: 14,
    marginLeft: 15,
  },

  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: 'auto',
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF475715',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
  },

  logoutText: {
    color: '#FF4757',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },

  version: {
    color: '#A4B0BE',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
});
