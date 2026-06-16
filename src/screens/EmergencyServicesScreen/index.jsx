import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import { SW, SH } from '../../theme/dimensions';
import appColors from '../../theme/appColors';
import {GOOGLE_MAPS_API_KEY} from '../../../environment';

// ─── Icons as SVG-style Unicode / emoji fallbacks ────────────────────────────
// In a real project swap these with react-native-vector-icons or similar.
const Icon = ({name, size = 18, color = '#fff'}) => {
  const map = {
    back: '‹',
    search: '🔍',
    locate: '◎',
    police: '🚔',
    hospital: '🏥',
    ambulance: '🚑',
    fire: '🚒',
    disaster: '🆘',
    blood: '🩸',
    pharmacy: '💊',
    urgentCare: '👩‍⚕️',
    trauma: '🏥',
    shelter: '🚨',
    roadside: '🔧',
    helpline: '☎️',
    pickup: '🚑',
    flood: '🌊',
    serviceOffice: '⚡',
    child: '🧒',
    women: '👩',
    phone: '📞',
    navigate: '➤',
    pin: '📍',
    close: '✕',
    user: '👤',
    id: '🪪',
    mail: '✉',
    call: '📲',
    address: '🏠',
    emergency: '🚨',
  };
  return (
    <Text style={{fontSize: size, color, lineHeight: size + 4}}>
      {map[name] || '•'}
    </Text>
  );
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  {id: 'medical-emergency', label: 'Medical Emergency', icon: 'ambulance'},
  {id: 'police-station', label: 'Police Station', icon: 'police'},
  {id: 'fire-station', label: 'Fire Station', icon: 'fire'},
  {id: 'disaster-relief-center', label: 'Disaster Relief Center', icon: 'disaster'},
  {id: 'blood-bank', label: 'Blood Bank', icon: 'blood'},
  {id: 'pharmacy-24x7', label: 'Pharmacy (24x7)', icon: 'pharmacy'},
  {id: 'urgent-care-center', label: 'Urgent Care Center', icon: 'urgentCare'},
  {id: 'trauma-center', label: 'Trauma Center', icon: 'trauma'},
  {id: 'emergency-shelter', label: 'Emergency Shelter', icon: 'shelter'},
  {id: 'roadside-assistance', label: 'Roadside Assistance', icon: 'roadside'},
  {id: 'emergency-helpline', label: 'Emergency Helpline', icon: 'helpline'},
  {id: 'ambulance-pickup-point', label: 'Ambulance Pickup Point', icon: 'pickup'},
  {id: 'flood-cyclone-shelter', label: 'Flood/Cyclone Shelter', icon: 'flood'},
  {id: 'emergency-service-office', label: 'Emergency Service Office', icon: 'serviceOffice'},
  {id: 'child-help-center', label: 'Child Help Center', icon: 'child'},
  {id: 'womens-safety-center', label: "Women's Safety Center", icon: 'women'},
];

const SERVICES = [
  {
    id: '1',
    name: 'Emergency Station Nigeria',
    address: '40 NTA Rd, Port Harcourt',
    distance: '3.08 km',
  },
  {
    id: '2',
    name: 'ODC MEDICS',
    address: 'No 123 Owoloma, Haruk Estate Link Road, Port Harcourt',
    distance: '3.96 km',
  },
  {
    id: '3',
    name: 'C.Bennett Specialist Hospital',
    address: '100 Shell location Road, Apirikom Road, Port Harcourt',
    distance: '4.67 km',
  },
  {
    id: '4',
    name: 'Emergency Response Services Nigeria Limited',
    address: '394 Ikwerre Rd, Port Harcourt',
    distance: '5.22 km',
  },
  {
    id: '5',
    name: 'College of Emergency And Paramedic Studies',
    address: '394 Ikwerre Rd, Port Harcourt',
    distance: '5.22 km',
  },
  {
    id: '6',
    name: 'Emergency Response Service Group',
    address: 'Emergency House, Ikwerre Rd, Port Harcourt',
    distance: '5.46 km',
  },
  {
    id: '7',
    name: 'PALMARS Hospital',
    address: 'Ikwerre Rd, Port Harcourt',
    distance: '6.23 km',
  },
];

// ─── RegisterEmergencyModal ────────────────────────────────────────────────────
const RegisterEmergencyModal = ({visible, onClose}) => {
  const [form, setForm] = useState({
    phoneNumber: '',
    location: '',
    address: '',
    categoryId: '',
    placeId: '',
    latitude: null,
    longitude: null,
  });
  const [submitted, setSubmitted] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const selectedCategory = CATEGORIES.find(cat => cat.id === form.categoryId);

  const handleChange = (field, value) => {
    setForm(prev => ({...prev, [field]: value}));
  };

  const handleLocationSelect = (data, details) => {
    const placeName =
      details?.name || data?.structured_formatting?.main_text || data?.description || '';
    const formattedAddress =
      details?.formatted_address || data?.description || '';
    const latitude = details?.geometry?.location?.lat ?? null;
    const longitude = details?.geometry?.location?.lng ?? null;
    const placeId = details?.place_id || data?.place_id || '';
    const placePhoneNumber =
      details?.formatted_phone_number || details?.international_phone_number || '';

    setForm(prev => ({
      ...prev,
      location: placeName,
      address: formattedAddress,
      latitude,
      longitude,
      placeId,
      phoneNumber: placePhoneNumber,
    }));

    console.log('Selected place details:', {
      placeName,
      formattedAddress,
      latitude,
      longitude,
      placeId,
      placePhoneNumber,
    });
  };

  const isFormValid =
    form.phoneNumber.trim().length > 0 &&
    form.location.trim().length > 0 &&
    form.categoryId.trim().length > 0;

  const handleSubmit = () => {
    if (!isFormValid) {
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({
        phoneNumber: '',
        location: '',
        address: '',
        categoryId: '',
        placeId: '',
        latitude: null,
        longitude: null,
      });
      setCategoryOpen(false);
      onClose();
    }, 2000);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          {/* Handle bar */}
          <View style={styles.modalHandle} />

          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleRow}>
              <View style={styles.modalIconBadge}>
                <Text style={styles.modalIconText}>🚨</Text>
              </View>
              <View style={{flex: 1, marginLeft: 12}}>
                <Text style={styles.modalTitle}>Register Emergency Call</Text>
                <Text style={styles.modalSubtitle}>
                  Fill in your details to log an emergency
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
              <Icon name="close" size={14} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          <FlatList
            data={[{id: 'modal-form'}]}
            keyExtractor={item => item.id}
            style={styles.modalBody}
            contentContainerStyle={styles.modalBodyContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            renderItem={() =>
              submitted ? (
                <View style={styles.successBox}>
                  <Text style={styles.successIcon}>✅</Text>
                  <Text style={styles.successTitle}>Request Submitted!</Text>
                  <Text style={styles.successMsg}>
                    Your emergency call has been registered. Help is on the way.
                  </Text>
                </View>
              ) : (
                <>
                 <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>
                      <Icon name="address" size={13} color="#00C49A" />
                      {'  '}Select from Google Places
                    </Text>
                    <GooglePlacesAutocomplete
                      placeholder="Search location"
                      fetchDetails
                      onPress={handleLocationSelect}
                      query={{key: GOOGLE_MAPS_API_KEY, language: 'en'}}
                      textInputProps={{
                        value: form.location,
                        onChangeText: value => handleChange('location', value),
                        placeholderTextColor: '#4B5563',
                      }}
                      styles={{
                        container: styles.placesContainer,
                        textInputContainer: styles.placesInputContainer,
                        textInput: styles.placesInput,
                        listView: styles.placesList,
                        row: styles.placesRow,
                        description: styles.placesDescription,
                        poweredContainer: {display: 'none'},
                        powered: {display: 'none'},
                      }}
                      enablePoweredByContainer={false}
                      debounce={300}
                      minLength={2}
                    />
                  </View>

                   
                    {form.address ? (
                    <View style={styles.fieldGroup}><Text style={styles.fieldLabel}>
                        <Icon name="location" size={13} color="#00C49A" />
                        {'  '}Address
                      </Text>
                      <Text style={styles.addressText}>{form.address}</Text>
                    </View>
                    ) : null}

                    

                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>
                      <Icon name="call" size={13} color="#00C49A" />
                      {'  '}Phone Number
                    </Text>
                    <TextInput
                      style={styles.fieldInput}
                      placeholder="+234 800 000 0000"
                      placeholderTextColor="#4B5563"
                      keyboardType="phone-pad"
                      value={form.phoneNumber}
                      onChangeText={v => handleChange('phoneNumber', v)}
                    />
                  </View>

                 

                  <View style={[styles.fieldGroup, styles.dropdownFieldGroup]}>
                    <Text style={styles.fieldLabel}>
                      <Icon name="emergency" size={13} color="#00C49A" />
                      {'  '}Category
                    </Text>
                    <TouchableOpacity
                      style={styles.dropdownBtn}
                      onPress={() => setCategoryOpen(prev => !prev)}
                      activeOpacity={0.8}>
                      <View style={styles.dropdownBtnContent}>
                        {selectedCategory ? (
                          <Icon name={selectedCategory.icon} size={15} color={C.teal} />
                        ) : (
                          <Icon name="emergency" size={15} color={C.sub} />
                        )}
                        <Text
                          style={[
                            styles.dropdownBtnText,
                            !selectedCategory && styles.dropdownPlaceholder,
                          ]}>
                          {selectedCategory?.label || 'Select category'}
                        </Text>
                      </View>
                      <Text style={styles.dropdownCaret}>{categoryOpen ? '▴' : '▾'}</Text>
                    </TouchableOpacity>

                    {categoryOpen && (
                      <View style={styles.dropdownMenu}>
                        <ScrollView
                          nestedScrollEnabled
                          showsVerticalScrollIndicator={false}
                          keyboardShouldPersistTaps="handled">
                          {CATEGORIES.map(cat => (
                            <TouchableOpacity
                              key={cat.id}
                              style={styles.dropdownOption}
                              onPress={() => {
                                handleChange('categoryId', cat.id);
                                setCategoryOpen(false);
                              }}
                              activeOpacity={0.8}>
                              <View style={styles.dropdownOptionRow}>
                                <Icon name={cat.icon} size={15} color={C.teal} />
                                <Text style={styles.dropdownOptionText}>{cat.label}</Text>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[styles.submitBtn, !isFormValid && styles.submitBtnDisabled]}
                    onPress={handleSubmit}
                    activeOpacity={0.85}
                    disabled={!isFormValid}>
                    <Text style={styles.submitBtnText}>Submit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>

                  <View style={{height: 16}} />
                </>
              )
            }
          />
          </View>
        </View>
      </Modal>
    );
  };

// ─── ServiceCard ──────────────────────────────────────────────────────────────
const ServiceCard = ({item, onCall, onNavigate}) => (
  <View style={styles.card}>
    <View style={styles.cardLeft}>
      <Text style={styles.distance}>{item.distance}</Text>
      <Icon name="pin" size={16} color="#00C49A" />
    </View>
    <View style={styles.cardBody}>
      <Text style={styles.cardName}>{item.name}</Text>
      <Text style={styles.cardAddress}>{item.address}</Text>
    </View>
    <View style={styles.cardActions}>
      <TouchableOpacity style={styles.callBtn} onPress={() => onCall(item)} activeOpacity={0.8}>
        <Icon name="phone" size={16} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navBtn} onPress={() => onNavigate(item)} activeOpacity={0.8}>
        <Icon name="navigate" size={14} color="#fff" />
      </TouchableOpacity>
    </View>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const EmergencyServicesScreen = () => {
  const [activeCategory, setActiveCategory] = useState('medical-emergency');
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  const filtered = SERVICES.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0F14" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Services</Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Icon name="search" size={15} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search location"
            placeholderTextColor="#4B5563"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={styles.locateBtn}>
          <Icon name="locate" size={18} color="#00C49A" />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catRow}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.catChip,
              activeCategory === cat.id && styles.catChipActive,
            ]}
            onPress={() => setActiveCategory(cat.id)}
            activeOpacity={0.8}>
            <Icon
              name={cat.icon}
              size={14}
              color={activeCategory === cat.id ? '#fff' : '#9CA3AF'}
            />
            <Text
              style={[
                styles.catLabel,
                activeCategory === cat.id && styles.catLabelActive,
              ]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results Label */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsLabel}>
          Results:{' '}
          <Text style={styles.resultsLocation}>Rumu-Oparala, Nigeria</Text>
        </Text>
        <Text style={styles.resultsCount}>{filtered.length} found</Text>
      </View>

      {/* Emergency Call Banner */}
      <TouchableOpacity
        style={styles.emergencyBanner}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}>
        <Text style={styles.emergencyBannerIcon}>🚨</Text>
        <View style={{flex: 1, marginLeft: 10}}>
          <Text style={styles.emergencyBannerTitle}>Register an Emergency Call</Text>
          <Text style={styles.emergencyBannerSub}>
            Log your emergency details for faster response
          </Text>
        </View>
        <Text style={styles.emergencyBannerArrow}>›</Text>
      </TouchableOpacity>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({item}) => (
          <ServiceCard
            item={item}
            onCall={s => console.log('Call', s.name)}
            onNavigate={s => console.log('Navigate', s.name)}
          />
        )}
      />

     
      {/* Modal */}
      <RegisterEmergencyModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const C = {
  bg: appColors.DarkPrimary,
  surface: '#161A22',
  card: '#1C2130',
  border: '#252C3B',
  teal: appColors.primary,
  tealDark: '#007F65',
  red: '#E63946',
  text: '#F1F5F9',
  sub: '#8891A4',
  muted: '#4B5563',
  white: '#FFFFFF',
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 4,
    paddingBottom: 12,
    backgroundColor: C.bg,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  backArrow: {fontSize: 26, color: C.text, lineHeight: 34},
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
    letterSpacing: 0.2,
  },
  registerBtn: {
    backgroundColor: C.teal,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  registerBtnText: {fontSize: 12, fontWeight: '700', color: '#000'},

  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 14,
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: C.border,
    gap: 8,
  },
  searchInput: {flex: 1, color: C.text, fontSize: 14},
  locateBtn: {
    width: 46,
    height: 46,
    backgroundColor: C.surface,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.teal + '44',
  },

  // Categories
  catRow: {
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 30,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 6,
    borderWidth: 1,
    borderColor: C.border,
    height: SH(40)
  },
  catChipActive: {
    backgroundColor: C.teal,
    borderColor: C.teal,
  },
  catLabel: {fontSize: 13, fontWeight: '600', color: C.sub},
  catLabelActive: {color: '#000'},

  // Results row
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  resultsLabel: {fontSize: 13, fontWeight: '600', color: C.sub},
  resultsLocation: {color: C.text, fontWeight: '700'},
  resultsCount: {fontSize: 12, color: C.teal, fontWeight: '600'},

  // Emergency banner
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: '#1A0A0A',
    borderWidth: 1,
    borderColor: C.red + '55',
    borderRadius: 14,
    padding: 14,
  },
  emergencyBannerIcon: {fontSize: 22},
  emergencyBannerTitle: {fontSize: 13, fontWeight: '700', color: '#FF6B6B'},
  emergencyBannerSub: {fontSize: 11, color: C.sub, marginTop: 2},
  emergencyBannerArrow: {fontSize: 22, color: '#FF6B6B'},

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  separator: {height: 1, backgroundColor: C.border},
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 0,
  },
  cardLeft: {
    alignItems: 'center',
    width: 52,
    marginRight: 12,
  },
  distance: {
    fontSize: 10,
    fontWeight: '700',
    color: C.teal,
    marginBottom: 4,
    textAlign: 'center',
  },
  cardBody: {flex: 1, marginRight: 10},
  cardName: {fontSize: 14, fontWeight: '700', color: C.text, lineHeight: 20},
  cardAddress: {fontSize: 11, color: C.sub, marginTop: 3, lineHeight: 15},
  cardActions: {flexDirection: 'row', gap: 8},
  callBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.tealDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: C.red,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: C.red,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  fabText: {fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 0.3},

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#12151F',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxHeight: '92%',
    borderWidth: 1,
    borderColor: C.border,
    borderBottomWidth: 0,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: C.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
  },
  modalTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalIconBadge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#2A0A0A',
    borderWidth: 1,
    borderColor: C.red + '44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalIconText: {fontSize: 22},
  modalTitle: {fontSize: 17, fontWeight: '800', color: C.text},
  modalSubtitle: {fontSize: 12, color: C.sub, marginTop: 2},
  modalCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  divider: {height: 1, backgroundColor: C.border, marginHorizontal: 0},
  modalBody: {flexGrow: 0},
  modalBodyContent: {padding: 20},

  // Form fields
  fieldGroup: {marginBottom: 16},
  dropdownFieldGroup: {
    zIndex: 20,
    elevation: 20,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: C.sub,
    marginBottom: 7,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  fieldInput: {
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: C.text,
    fontSize: 14,
  },
  placesContainer: {
    flex: 0,
  },
  placesInputContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 0,
  },
  placesInput: {
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    height: 48,
    color: C.text,
    fontSize: 14,
    marginLeft: 0,
    marginRight: 0,
  },
  placesList: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
    maxHeight: 180,
  },
  placesRow: {
    backgroundColor: C.surface,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  placesDescription: {
    color: C.text,
    fontSize: 13,
  },

  // Dropdown
  dropdownBtn: {
    minHeight: 48,
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownBtnContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownBtnText: {
    color: C.text,
    fontSize: 14,
    flex: 1,
    paddingRight: 10,
  },
  dropdownPlaceholder: {
    color: C.muted,
  },
  dropdownCaret: {
    color: C.sub,
    fontSize: 14,
  },
  dropdownMenu: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
    maxHeight: 220,
    overflow: 'hidden',
    zIndex: 30,
    elevation: 30,
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  dropdownOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownOptionText: {
    color: C.text,
    fontSize: 13,
  },
  textArea: {
    height: 90,
    paddingTop: 12,
  },

  // Priority
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  priorityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  priorityLow: {backgroundColor: '#0F2A1A', borderColor: '#22C55E44'},
  priorityMedium: {backgroundColor: '#1A1A0A', borderColor: '#EAB30844'},
  priorityHigh: {backgroundColor: '#1A0F0A', borderColor: '#F9731644'},
  priorityCritical: {backgroundColor: '#1A0A0A', borderColor: C.red + '88'},
  priorityText: {fontSize: 12, fontWeight: '700', color: C.text},

  // Submit
  submitBtn: {
    backgroundColor: C.red,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: C.red,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  submitBtnText: {fontSize: 15, fontWeight: '800', color: '#fff'},
  submitBtnDisabled: {
    opacity: 0.5,
  },
  cancelBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  cancelBtnText: {fontSize: 14, color: C.sub, fontWeight: '600'},

  // Success
  successBox: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  successIcon: {fontSize: 56, marginBottom: 16},
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: C.teal,
    marginBottom: 10,
  },
  successMsg: {
    fontSize: 14,
    color: C.sub,
    textAlign: 'center',
    lineHeight: 22,
  },
  addressText:{
    color: appColors.white
  }
});

export default EmergencyServicesScreen;
