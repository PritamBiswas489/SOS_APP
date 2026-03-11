import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HealthScreen = ({navigation}) => {
  const vitals = [
    {
      icon: 'favorite',
      label: 'Heart Rate',
      value: '72',
      unit: 'bpm',
      color: '#FF4757',
      status: 'Normal',
    },
    {
      icon: 'opacity',
      label: 'Blood Oxygen',
      value: '98',
      unit: '%',
      color: '#5352ED',
      status: 'Normal',
    },
    {
      icon: 'thermostat',
      label: 'Temperature',
      value: '36.6',
      unit: '°C',
      color: '#FF6B81',
      status: 'Normal',
    },
    {
      icon: 'speed',
      label: 'Blood Pressure',
      value: '120/80',
      unit: 'mmHg',
      color: '#2ED573',
      status: 'Normal',
    },
  ];

  const medications = [
    {name: 'Vitamin D3', dosage: '1000 IU', time: '8:00 AM', taken: true},
    {name: 'Omega-3', dosage: '500 mg', time: '1:00 PM', taken: true},
    {name: 'Multivitamin', dosage: '1 tablet', time: '8:00 PM', taken: false},
  ];

  const healthTips = [
    {icon: 'directions-walk', tip: 'Walk 10,000 steps today', progress: '6,420'},
    {icon: 'local-drink', tip: 'Drink 8 glasses of water', progress: '5/8'},
    {icon: 'hotel', tip: 'Sleep 8 hours tonight', progress: '7.5 hrs avg'},
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Icon name="menu" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health</Text>
        <TouchableOpacity>
          <Icon name="add-circle-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Overall Status */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Icon name="favorite" size={30} color="#FF4757" />
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>Health Status</Text>
            <Text style={styles.statusValue}>Excellent</Text>
          </View>
        </View>
        <View style={styles.statusBar}>
          <View style={styles.statusFill} />
        </View>
        <Text style={styles.statusDesc}>
          All vitals are within normal range. Keep it up!
        </Text>
      </View>

      {/* Vitals Grid */}
      <Text style={styles.sectionTitle}>Current Vitals</Text>
      <View style={styles.vitalsGrid}>
        {vitals.map((vital, index) => (
          <View key={index} style={styles.vitalCard}>
            <Icon name={vital.icon} size={24} color={vital.color} />
            <Text style={styles.vitalValue}>{vital.value}</Text>
            <Text style={styles.vitalUnit}>{vital.unit}</Text>
            <Text style={styles.vitalLabel}>{vital.label}</Text>
            <View style={[styles.vitalStatus, {backgroundColor: '#2ED57330'}]}>
              <Text style={styles.vitalStatusText}>{vital.status}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Medications */}
      <Text style={styles.sectionTitle}>Today's Medications</Text>
      {medications.map((med, index) => (
        <View key={index} style={styles.medCard}>
          <View style={styles.medLeft}>
            <View
              style={[
                styles.medCheck,
                med.taken && {backgroundColor: '#2ED573'},
              ]}>
              {med.taken && <Icon name="check" size={16} color="#FFFFFF" />}
            </View>
            <View>
              <Text style={styles.medName}>{med.name}</Text>
              <Text style={styles.medDosage}>{med.dosage}</Text>
            </View>
          </View>
          <Text style={styles.medTime}>{med.time}</Text>
        </View>
      ))}

      {/* Health Tips */}
      <Text style={styles.sectionTitle}>Daily Goals</Text>
      {healthTips.map((tip, index) => (
        <View key={index} style={styles.tipCard}>
          <Icon name={tip.icon} size={28} color="#5352ED" />
          <View style={styles.tipInfo}>
            <Text style={styles.tipText}>{tip.tip}</Text>
            <Text style={styles.tipProgress}>{tip.progress}</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#A4B0BE" />
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
  statusCard: {
    backgroundColor: '#16213E',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusInfo: {
    marginLeft: 12,
  },
  statusTitle: {
    fontSize: 14,
    color: '#A4B0BE',
  },
  statusValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2ED573',
  },
  statusBar: {
    height: 6,
    backgroundColor: '#1A1A2E',
    borderRadius: 3,
    marginBottom: 10,
  },
  statusFill: {
    height: 6,
    width: '90%',
    backgroundColor: '#2ED573',
    borderRadius: 3,
  },
  statusDesc: {
    fontSize: 13,
    color: '#A4B0BE',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    marginBottom: 25,
  },
  vitalCard: {
    width: '46%',
    backgroundColor: '#16213E',
    borderRadius: 16,
    padding: 15,
    margin: '2%',
    alignItems: 'center',
  },
  vitalValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  vitalUnit: {
    fontSize: 12,
    color: '#A4B0BE',
  },
  vitalLabel: {
    fontSize: 12,
    color: '#A4B0BE',
    marginTop: 4,
  },
  vitalStatus: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 6,
  },
  vitalStatusText: {
    fontSize: 11,
    color: '#2ED573',
    fontWeight: '600',
  },
  medCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#16213E',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    padding: 15,
  },
  medLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#A4B0BE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  medName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  medDosage: {
    fontSize: 12,
    color: '#A4B0BE',
    marginTop: 2,
  },
  medTime: {
    fontSize: 12,
    color: '#5352ED',
    fontWeight: '600',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213E',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    padding: 15,
  },
  tipInfo: {
    flex: 1,
    marginLeft: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  tipProgress: {
    fontSize: 12,
    color: '#A4B0BE',
    marginTop: 2,
  },
});

export default HealthScreen;
