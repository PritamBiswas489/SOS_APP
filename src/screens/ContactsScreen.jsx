import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ContactsScreen = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const emergencyContacts = [
    {
      id: 1,
      name: 'John Smith',
      relation: 'Father',
      phone: '+1 234-567-8901',
      avatar: 'JS',
      color: '#FF4757',
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      relation: 'Mother',
      phone: '+1 234-567-8902',
      avatar: 'SJ',
      color: '#5352ED',
    },
    {
      id: 3,
      name: 'Mike Wilson',
      relation: 'Brother',
      phone: '+1 234-567-8903',
      avatar: 'MW',
      color: '#2ED573',
    },
  ];

  const otherContacts = [
    {
      id: 4,
      name: 'Dr. Emily Brown',
      relation: 'Doctor',
      phone: '+1 234-567-8904',
      avatar: 'EB',
      color: '#FF6B81',
    },
    {
      id: 5,
      name: 'Officer Davis',
      relation: 'Local Police',
      phone: '+1 234-567-8905',
      avatar: 'OD',
      color: '#1E90FF',
    },
    {
      id: 6,
      name: 'Amy Lee',
      relation: 'Friend',
      phone: '+1 234-567-8906',
      avatar: 'AL',
      color: '#FFA502',
    },
    {
      id: 7,
      name: 'Robert Chen',
      relation: 'Neighbor',
      phone: '+1 234-567-8907',
      avatar: 'RC',
      color: '#A4B0BE',
    },
  ];

  const allContacts = [...emergencyContacts, ...otherContacts];
  const filteredContacts = searchQuery
    ? allContacts.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : null;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Icon name="menu" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contacts</Text>
        <TouchableOpacity>
          <Icon name="person-add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Icon name="search" size={22} color="#A4B0BE" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          placeholderTextColor="#A4B0BE"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close" size={20} color="#A4B0BE" />
          </TouchableOpacity>
        )}
      </View>

      {filteredContacts ? (
        <>
          <Text style={styles.sectionTitle}>
            Search Results ({filteredContacts.length})
          </Text>
          {filteredContacts.map(contact => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </>
      ) : (
        <>
          {/* Emergency Contacts */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
            <View style={styles.emergencyBadge}>
              <Icon name="warning" size={14} color="#FF4757" />
              <Text style={styles.emergencyBadgeText}>Priority</Text>
            </View>
          </View>

          {emergencyContacts.map(contact => (
            <ContactCard key={contact.id} contact={contact} isEmergency />
          ))}

          {/* Quick Dial */}
          <Text style={styles.sectionTitle}>Quick Emergency Dial</Text>
          <View style={styles.quickDialRow}>
            <TouchableOpacity style={styles.quickDialBtn}>
              <Icon name="local-police" size={28} color="#5352ED" />
              <Text style={styles.quickDialText}>Police</Text>
              <Text style={styles.quickDialNumber}>911</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickDialBtn}>
              <Icon name="local-hospital" size={28} color="#FF4757" />
              <Text style={styles.quickDialText}>Ambulance</Text>
              <Text style={styles.quickDialNumber}>911</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickDialBtn}>
              <Icon name="local-fire-department" size={28} color="#FFA502" />
              <Text style={styles.quickDialText}>Fire</Text>
              <Text style={styles.quickDialNumber}>911</Text>
            </TouchableOpacity>
          </View>

          {/* Other Contacts */}
          <Text style={styles.sectionTitle}>Other Contacts</Text>
          {otherContacts.map(contact => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </>
      )}

      <View style={{height: 30}} />
    </ScrollView>
  );
};

const ContactCard = ({contact, isEmergency}) => (
  <View style={[styles.contactCard, isEmergency && styles.emergencyCard]}>
    <View style={[styles.avatar, {backgroundColor: contact.color}]}>
      <Text style={styles.avatarText}>{contact.avatar}</Text>
    </View>
    <View style={styles.contactInfo}>
      <Text style={styles.contactName}>{contact.name}</Text>
      <Text style={styles.contactRelation}>{contact.relation}</Text>
      <Text style={styles.contactPhone}>{contact.phone}</Text>
    </View>
    <View style={styles.contactActions}>
      <TouchableOpacity style={styles.actionBtn}>
        <Icon name="phone" size={20} color="#2ED573" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionBtn}>
        <Icon name="message" size={20} color="#5352ED" />
      </TouchableOpacity>
    </View>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213E',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 10,
    padding: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  emergencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF475720',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emergencyBadgeText: {
    color: '#FF4757',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213E',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    padding: 15,
  },
  emergencyCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#FF4757',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contactRelation: {
    fontSize: 12,
    color: '#A4B0BE',
    marginTop: 1,
  },
  contactPhone: {
    fontSize: 12,
    color: '#5352ED',
    marginTop: 2,
  },
  contactActions: {
    flexDirection: 'row',
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  quickDialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  quickDialBtn: {
    width: '30%',
    backgroundColor: '#16213E',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  quickDialText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  quickDialNumber: {
    color: '#A4B0BE',
    fontSize: 12,
    marginTop: 2,
  },
});

export default ContactsScreen;
