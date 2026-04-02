import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  RefreshControl,
} from 'react-native';
import styles from './style';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';

const ContactsScreen = () => {
  const [editModal, setEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('contact');
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const contacts = [
    {
      id: 1,
      name: 'Mr Chinaka',

      phone: '+234812484262',
      avatar: 'M',
      color: '#FF3B5C',
      active: true,
    },
    {
      id: 2,
      name: 'Mr Chima',
      phone: '+234812484262',
      avatar: 'C',
      color: '#2F6BFF',
      active: true,
    },
    {
      id: 3,
      name: 'Mum',
      phone: '+234812484262',
      avatar: 'M',
      color: '#6A4CFF',
      active: false,
    },
    {
      id: 4,
      name: 'Kolean W Sanders',
      phone: '+234812484262',
      avatar: 'K',
      color: '#FFA726',
      active: true,
    },
  ];

  const incomingRequests = [
    {
      id: 101,
      name: 'Sarah Ali',
      phone: '+234900000001',
      avatar: 'S',
      color: '#2ED573',
      active: true,
    },
    {
      id: 102,
      name: 'John Carter',
      phone: '+234900000002',
      avatar: 'J',
      color: '#FF3B5C',
      active: false,
    },
  ];

  const outgoingRequests = [
    {
      id: 201,
      name: 'Nancy Jones',
      phone: '+234900000003',
      avatar: 'N',
      color: '#2F6BFF',
      active: false,
    },
    {
      id: 202,
      name: 'Michael Obi',
      phone: '+234900000004',
      avatar: 'M',
      color: '#FFA726',
      active: true,
    },
  ];

  const getCurrentList = () => {
    if (activeTab === 'incoming') {
      return incomingRequests;
    }
    if (activeTab === 'outgoing') {
      return outgoingRequests;
    }
    return contacts;
  };

  const currentList = getCurrentList();

  const getActionIcons = () => {
    if (activeTab === 'incoming') {
      return [
        { key: 'cancel', icon: 'close', color: '#FF4757' },
        { key: 'accept', icon: 'check', color: '#2ED573' },
        { key: 'delete', icon: 'delete', color: '#FFA726' },
      ];
    }

    if (activeTab === 'outgoing') {
      return [
        { key: 'cancel', icon: 'close', color: '#FF4757' },
        { key: 'delete', icon: 'delete', color: '#FFA726' },
      ];
    }

    return [{ key: 'delete', icon: 'delete', color: '#FF4757' }];
  };

  const onActionPress = (action, item) => {
    const actionText = action.charAt(0).toUpperCase() + action.slice(1);
    Alert.alert(actionText, `${actionText} action for ${item.name}`);
  };

  const gotToAddContactScreen = () => {
    navigation.navigate('AddContact');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Hook API fetch here when backend is connected.
      await new Promise(resolve => setTimeout(resolve, 800));
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#fff"
          colors={['#2F6BFF']}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.title}>Contacts</Text>
          <Text style={styles.subtitle}>{currentList.length} ITEMS</Text>
        </View>

        <TouchableOpacity onPress={() => setEditModal(true)}>
          <Icon name="edit" size={22} color="#FFA726" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'contact' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('contact')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'contact' && styles.activeTabText,
            ]}
          >
            Contact
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'incoming' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('incoming')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'incoming' && styles.activeTabText,
            ]}
          >
            Incoming Request
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'outgoing' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('outgoing')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'outgoing' && styles.activeTabText,
            ]}
          >
            Outgoing Request
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contacts */}
      {currentList.map(item => (
        <View key={item.id} style={styles.contactRow}>
          <View style={[styles.avatar, { backgroundColor: item.color }]}>
            <Text style={styles.avatarText}>{item.avatar}</Text>
          </View>

          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{item.name}</Text>
            <Text style={styles.contactDetails}>{item.phone}</Text>
          </View>

          <View
            style={[
              styles.statusDot,
              { backgroundColor: item.active ? '#1DFF9A' : '#6C7A92' },
            ]}
          />

          <View style={styles.actionContainer}>
            {getActionIcons().map(action => (
              <TouchableOpacity
                key={`${item.id}-${action.key}`}
                style={styles.actionIconButton}
                onPress={() => onActionPress(action.key, item)}
              >
                <Icon name={action.icon} size={18} color={action.color} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Add Contact */}
      <TouchableOpacity onPress={gotToAddContactScreen} style={styles.addBtn}>
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
