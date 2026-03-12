import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import styles from './style';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ContactsScreen = () => {
  const [editModal, setEditModal] = useState(false);
  const contacts = [
    {
      id: 1,
      name: 'Mom',
      relation: 'Family',
      phone: '+91 98765 43210',
      avatar: 'M',
      color: '#FF3B5C',
      active: true,
    },
    {
      id: 2,
      name: 'Rahul Kumar',
      relation: 'Friend',
      phone: '+91 87654 32109',
      avatar: 'R',
      color: '#2F6BFF',
      active: true,
    },
    {
      id: 3,
      name: 'Priya Singh',
      relation: 'Colleague',
      phone: '+91 76543 21098',
      avatar: 'P',
      color: '#6A4CFF',
      active: false,
    },
    {
      id: 4,
      name: 'Dad',
      relation: 'Family',
      phone: '+91 65432 10987',
      avatar: 'D',
      color: '#FFA726',
      active: true,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Contacts</Text>
          <Text style={styles.subtitle}>4 TRUSTED CONTACTS</Text>
        </View>

        <TouchableOpacity onPress={() => setEditModal(true)}>
          <Icon name="edit" size={22} color="#FFA726" />
        </TouchableOpacity>
      </View>

      {/* Contacts */}
      {contacts.map(item => (
        <View key={item.id} style={styles.contactRow}>
          <View style={[styles.avatar, { backgroundColor: item.color }]}>
            <Text style={styles.avatarText}>{item.avatar}</Text>
          </View>

          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{item.name}</Text>
            <Text style={styles.contactDetails}>
              {item.relation} • {item.phone}
            </Text>
          </View>

          <View
            style={[
              styles.statusDot,
              { backgroundColor: item.active ? '#1DFF9A' : '#6C7A92' },
            ]}
          />
        </View>
      ))}

      {/* Add Contact */}
      <TouchableOpacity style={styles.addBtn}>
        <Text style={styles.addText}>+ Add Trusted Contact</Text>
      </TouchableOpacity>

      {/* Emergency Info */}
      <View style={styles.infoCard}>
        <Icon name="warning" size={18} color="#FFC107" />
        <Text style={styles.infoText}>
          <Text style={{ color: '#2ED573', fontWeight: '600' }}>
            Emergency SOS
          </Text>{' '}
          will instantly notify all contacts with your live GPS location.
        </Text>
      </View>

      <View style={{ height: 40 }} />

      <Modal visible={editModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Contact</Text>

              <TouchableOpacity onPress={() => setEditModal(false)}>
                <Icon name="close" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Contact Name"
              placeholderTextColor="#6C7A92"
              style={styles.input}
            />

            <TextInput
              placeholder="Relation"
              placeholderTextColor="#6C7A92"
              style={styles.input}
            />

            <TextInput
              placeholder="Phone Number"
              placeholderTextColor="#6C7A92"
              style={styles.input}
              keyboardType="phone-pad"
            />

            <TouchableOpacity style={styles.saveBtn}>
              <Text style={styles.saveText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default ContactsScreen;
