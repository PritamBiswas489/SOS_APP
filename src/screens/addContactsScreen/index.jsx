import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from './style';

const AddContactsScreen = () => {
  const [relationship, setRelationship] = useState('Friend');
  const [sosAlert, setSosAlert] = useState(true);
  const [shareLocation, setShareLocation] = useState(true);

  const relations = ['Family', 'Friend', 'Colleague', 'Other'];

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <Icon name="arrow-back" size={22} color="#fff" />

        <View style={styles.headerText}>
          <Text style={styles.title}>Add Contact</Text>
          <Text style={styles.subtitle}>ADD TRUSTED CONTACT</Text>
        </View>

        <Icon name="person" size={24} color="#6B7C99" />
      </View>

      {/* PHOTO */}

      <View style={styles.photoContainer}>
        <TouchableOpacity style={styles.photoCircle}>
          <Icon name="person" size={28} color="#A4B0BE" />
        </TouchableOpacity>

        <Text style={styles.photoText}>TAP TO ADD PHOTO</Text>
      </View>

      {/* FULL NAME */}

      <Text style={styles.label}>FULL NAME</Text>

      <View style={styles.inputBoxActive}>
        <Icon name="person" size={18} color="#6B7C99" />
        <TextInput
          style={styles.input}
          placeholder="Ananya Sharma"
          placeholderTextColor="#A4B0BE"
        />
      </View>

      {/* MOBILE */}

      <Text style={styles.label}>MOBILE NUMBER</Text>

      <View style={styles.inputBox}>
        <Icon name="phone-android" size={18} color="#4DA3FF" />
        <TextInput
          style={styles.input}
          placeholder="+91 99887 76655"
          placeholderTextColor="#A4B0BE"
        />
      </View>

      {/* RELATIONSHIP */}

      <Text style={styles.label}>RELATIONSHIP</Text>

      <View style={styles.relationRow}>
        {relations.map(item => (
          <TouchableOpacity
            key={item}
            style={[
              styles.relationTab,
              relationship === item && styles.relationTabActive,
            ]}
            onPress={() => setRelationship(item)}
          >
            <Text
              style={[
                styles.relationText,
                relationship === item && styles.relationTextActive,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* EMAIL */}

      <Text style={styles.label}>EMAIL (OPTIONAL)</Text>

      <View style={styles.inputBox}>
        <Icon name="email" size={18} color="#6B7C99" />
        <TextInput
          style={styles.input}
          placeholder="ananya@email.com"
          placeholderTextColor="#A4B0BE"
        />
      </View>

      {/* SOS ALERT */}

      <View style={styles.toggleCard}>
        <View style={styles.toggleLeft}>
          <Icon name="notifications" size={18} color="#FF4757" />
          <View style={styles.toggleLeftInner}>
            <Text style={styles.toggleTitle}>SOS Alerts</Text>
            <Text style={styles.toggleSubtitle}>
              Notify on emergency trigger
            </Text>
          </View>
        </View>

        <Switch
          value={sosAlert}
          onValueChange={setSosAlert}
          trackColor={{ true: '#2ED573' }}
        />
      </View>

      {/* SHARE LOCATION */}

      <View style={styles.toggleCard}>
        <View style={styles.toggleLeft}>
          <Icon name="location-pin" size={18} color="#FF4757" />
          <View style={styles.toggleLeftInner}>
            <Text style={styles.toggleTitle}>Share Location</Text>
            <Text style={styles.toggleSubtitle}>
              Live GPS during emergencies
            </Text>
          </View>
        </View>

        <Switch
          value={shareLocation}
          onValueChange={setShareLocation}
          trackColor={{ true: '#2ED573' }}
        />
      </View>

      {/* SAVE BUTTON */}

      <TouchableOpacity style={styles.saveBtn}>
        <Text style={styles.saveText}>✓ Save Trusted Contact</Text>
      </TouchableOpacity>

      <Text style={styles.cancel}>Cancel</Text>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
};

export default AddContactsScreen;
