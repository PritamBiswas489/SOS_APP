import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import HealthScreen from '../screens/HealthScreen';
import ContactsScreen from '../screens/ContactsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const tabConfig = {
  Home: {icon: 'home', label: 'Home'},
  Map: {icon: 'map', label: 'Map'},
  Health: {icon: 'favorite', label: 'Health'},
  Contacts: {icon: 'people', label: 'Contacts'},
  Settings: {icon: 'settings', label: 'Settings'},
};

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({focused, color, size}) => {
          const config = tabConfig[route.name];
          return <Icon name={config.icon} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF4757',
        tabBarInactiveTintColor: '#A4B0BE',
        tabBarStyle: {
          backgroundColor: '#16213E',
          borderTopWidth: 0,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 20,
          shadowColor: '#000000',
          shadowOffset: {width: 0, height: -4},
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarLabel: tabConfig[route.name].label,
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Health" component={HealthScreen} />
      <Tab.Screen name="Contacts" component={ContactsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
