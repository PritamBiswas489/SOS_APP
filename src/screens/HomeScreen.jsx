import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HomeScreen = ({navigation}) => {
  const quickActions = [
    {icon: 'warning', label: 'SOS Alert', color: '#FF4757'},
    {icon: 'local-hospital', label: 'Emergency', color: '#FF6B81'},
    {icon: 'phone', label: 'Call Help', color: '#5352ED'},
    {icon: 'location-on', label: 'Share Location', color: '#2ED573'},
  ];

  const recentAlerts = [
    {id: 1, type: 'SOS Sent', time: '2 hours ago', status: 'Resolved'},
    {id: 2, type: 'Location Shared', time: '5 hours ago', status: 'Active'},
    {id: 3, type: 'Emergency Call', time: '1 day ago', status: 'Resolved'},
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Icon name="menu" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SOS App</Text>
        <TouchableOpacity>
          <Icon name="notifications" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Welcome Card */}
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeText}>Welcome Back!</Text>
        <Text style={styles.welcomeSubText}>
          You are safe. All systems are active.
        </Text>
        <View style={styles.statusBadge}>
          <Icon name="check-circle" size={16} color="#2ED573" />
          <Text style={styles.statusText}>All Safe</Text>
        </View>
      </View>

      {/* SOS Button */}
      <TouchableOpacity style={styles.sosButton}>
        <View style={styles.sosInner}>
          <Icon name="warning" size={40} color="#FFFFFF" />
          <Text style={styles.sosText}>SOS</Text>
          <Text style={styles.sosSubText}>Press & Hold for Emergency</Text>
        </View>
      </TouchableOpacity>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        {quickActions.map((action, index) => (
          <TouchableOpacity key={index} style={styles.quickActionCard}>
            <View
              style={[styles.quickActionIcon, {backgroundColor: action.color}]}>
              <Icon name={action.icon} size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.quickActionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Activity */}
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      {recentAlerts.map(alert => (
        <View key={alert.id} style={styles.alertCard}>
          <View style={styles.alertLeft}>
            <Icon name="history" size={24} color="#A4B0BE" />
            <View style={styles.alertInfo}>
              <Text style={styles.alertType}>{alert.type}</Text>
              <Text style={styles.alertTime}>{alert.time}</Text>
            </View>
          </View>
          <View
            style={[
              styles.alertStatusBadge,
              {
                backgroundColor:
                  alert.status === 'Active' ? '#2ED57333' : '#A4B0BE33',
              },
            ]}>
            <Text
              style={[
                styles.alertStatus,
                {color: alert.status === 'Active' ? '#2ED573' : '#A4B0BE'},
              ]}>
              {alert.status}
            </Text>
          </View>
        </View>
      ))}

      <View style={{height: 30}} />
    </ScrollView>
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
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  welcomeCard: {
    backgroundColor: '#16213E',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  welcomeSubText: {
    fontSize: 14,
    color: '#A4B0BE',
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2ED57320',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#2ED573',
    marginLeft: 6,
    fontWeight: '600',
  },
  sosButton: {
    alignItems: 'center',
    marginBottom: 30,
  },
  sosInner: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FF4757',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#FF4757',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  sosText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 5,
  },
  sosSubText: {
    fontSize: 10,
    color: '#FFFFFFAA',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    marginBottom: 25,
  },
  quickActionCard: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 15,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    color: '#A4B0BE',
    textAlign: 'center',
  },
  alertCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#16213E',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    padding: 15,
  },
  alertLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertInfo: {
    marginLeft: 12,
  },
  alertType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  alertTime: {
    fontSize: 12,
    color: '#A4B0BE',
    marginTop: 2,
  },
  alertStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  alertStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default HomeScreen;
