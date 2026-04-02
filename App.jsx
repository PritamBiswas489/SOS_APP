import React from 'react';
import {StatusBar, useColorScheme, View, Text} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Toast, {BaseToast, ErrorToast} from 'react-native-toast-message';
import DrawerNavigator from './src/navigation/DrawerNavigator';
import SplashScreen from './src/screens/splashScreen/index.jsx';
import LoginScreen from './src/screens/loginScreen/index.jsx';
import AddContactsScreen from './src/screens/addContactsScreen/index.jsx';
import ProcessScreen from './src/screens/processScreen/index.jsx';

const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{borderLeftColor: '#00c48c', backgroundColor: '#111', borderRadius: 8}}
      contentContainerStyle={{paddingHorizontal: 15}}
      text1Style={{color: '#fff', fontSize: 14, fontWeight: 'bold'}}
      text2Style={{color: '#aaa', fontSize: 12}}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{borderLeftColor: '#ff3b5c', backgroundColor: '#111', borderRadius: 8}}
      contentContainerStyle={{paddingHorizontal: 15}}
      text1Style={{color: '#fff', fontSize: 14, fontWeight: 'bold'}}
      text2Style={{color: '#aaa', fontSize: 12}}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={{borderLeftColor: '#4a9eff', backgroundColor: '#111', borderRadius: 8}}
      contentContainerStyle={{paddingHorizontal: 15}}
      text1Style={{color: '#fff', fontSize: 14, fontWeight: 'bold'}}
      text2Style={{color: '#aaa', fontSize: 12}}
    />
  ),
};
const Stack = createNativeStackNavigator();

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{headerShown: false}}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Process" component={ProcessScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="AddContact" component={AddContactsScreen} />
            <Stack.Screen name="Main" component={DrawerNavigator} />
          </Stack.Navigator>
        </NavigationContainer>
        <Toast config={toastConfig} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
