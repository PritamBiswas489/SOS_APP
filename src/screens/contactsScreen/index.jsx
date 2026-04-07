import { useEffect, useState } from 'react';
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
import { useSelector, useDispatch } from 'react-redux';
import { TrustedContactService } from '../../services/trustedContact.service';
import { trustedContactActions } from '../../store/redux/trustedContactList.redux';
import { trustedContactIncommingRequestActions } from '../../store/redux/trustedContactIncommingRequest.redux';
import { trustedContactOutgongRequestActions } from '../../store/redux/trustedContactOutgongRequest.redux';
import useToast from '../../hook/useToast';
import Spinner from 'react-native-loading-spinner-overlay';
const ContactsScreen = () => {
  console.log('Rendering ContactsScreen');
  const [editModal, setEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('contact');
  const [refreshing, setRefreshing] = useState(false);
  const [loader, setLoader] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { showError, showSuccess } = useToast();
  const contacts = useSelector(state => state.trustedContactList);
  const incomingRequests = useSelector(
    state => state.trustedContactIncommingRequest,
  );
  const outgoingRequests = useSelector(
    state => state.trustedContactOutgongRequest,
  );

  const contactRefresh = contacts.refresh;
  const incomingRequestRefresh = incomingRequests.refresh;
  const outgoingRequestRefresh = outgoingRequests.refresh;

  /**
   * This useEffect hook is responsible for fetching the trusted contacts, incoming requests, and outgoing requests whenever their respective refresh flags are set to true. It calls the appropriate service methods to retrieve the data and updates the Redux store with the results. After fetching, it sets the refresh flags back to false to prevent continuous fetching.
   */
  useEffect(() => {
    if (contactRefresh) {
      TrustedContactService.getTrustedContacts(result => {
        if (result.success) {
          dispatch(
            trustedContactActions.setTrustedContactList(result.data.data.rows),
          );
        }
        dispatch(trustedContactActions.setRefresh(false));
      });
    }
    if (incomingRequestRefresh) {
      TrustedContactService.incommingInvitations(result => {
        if (result.success) {
          dispatch(
            trustedContactIncommingRequestActions.setTrustedContactList(
              result.data.data.rows,
            ),
          );
        }
        dispatch(trustedContactIncommingRequestActions.setRefresh(false));
      });
    }
    if (outgoingRequestRefresh) {
      TrustedContactService.outgoingInvitations(result => {
        if (result.success) {
          dispatch(
            trustedContactOutgongRequestActions.setTrustedContactList(
              result.data.data.rows,
            ),
          );
        }
        dispatch(trustedContactOutgongRequestActions.setRefresh(false));
      });
    }
  }, [contactRefresh, incomingRequestRefresh, outgoingRequestRefresh]);

  /**
   * This useEffect hook manages the loading state of the component based on the refresh flags for contacts, incoming requests, and outgoing requests. If any of these flags are true, it sets the loader state to true, which can be used to display a loading spinner. Once all refresh operations are complete (i.e., all flags are false), it sets the loader state back to false, hiding the spinner. This provides visual feedback to the user while data is being fetched.
   */
  useEffect(() => {
    if (contactRefresh || incomingRequestRefresh || outgoingRequestRefresh) {
      setLoader(true);
    } else {
      setLoader(false);
    }
  }, [contactRefresh, incomingRequestRefresh, outgoingRequestRefresh]);

  // useEffect(() => {
  //   return () => {
  //     dispatch(trustedContactActions.resetState());
  //     dispatch(trustedContactIncommingRequestActions.resetState());
  //     dispatch(trustedContactOutgongRequestActions.resetState());
  //   };
  // }, [dispatch]);

  /**
   * This function determines which list of contacts to display based on the currently active tab. If the active tab is 'incoming', it returns the list of incoming requests from the Redux store. If the active tab is 'outgoing', it returns the list of outgoing requests. For any other case (which would be the 'contact' tab), it returns the main trusted contact list. This allows the component to dynamically display the appropriate set of contacts based on user interaction with the tabs.
   */
  const getCurrentList = () => {
    if (activeTab === 'incoming') {
      return incomingRequests.contact_list;
    }
    if (activeTab === 'outgoing') {
      return outgoingRequests.contact_list;
    }
    return contacts.contact_list;
  };
  const currentList = getCurrentList() ?? [];

  const avatarColors = [
    '#2F6BFF',
    '#FF3B5C',
    '#2ED573',
    '#FFA726',
    '#6A4CFF',
    '#00BCD4',
    '#8BC34A',
    '#E91E63',
  ];

  const getAvatarColor = item => {
    const key = `${item?.id ?? ''}-${item?.nickname ?? ''}`;
    let hash = 0;
    for (let i = 0; i < key.length; i += 1) {
      hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    return avatarColors[Math.abs(hash) % avatarColors.length];
  };

  const getActionIcons = () => {
    if (activeTab === 'incoming') {
      return [
        { key: 'accept', icon: 'check', color: '#2ED573' },
        { key: 'cancel', icon: 'close', color: '#FF4757' },
      ];
    }
    if (activeTab === 'outgoing') {
      return [
        { key: 'cancel', icon: 'close', color: '#FF4757' },
      ];
    }
    return [{ key: 'delete', icon: 'delete', color: '#FF4757' }];
  };

  const onActionPress = (action, item, tab) => {
    const actionText = action.charAt(0).toUpperCase() + action.slice(1);
    if (action === 'cancel' && tab === 'outgoing') {
      //need a confirm and cancel alert
      Alert.alert(
        `${actionText} Request`,
        `Are you sure you want to cancel this outgoing trusted contact request?`,
        [
          {
            text: 'No',
            style: 'cancel',
          },
          {
            text: 'Yes',
            onPress: async () => {
              setLoader(true);
              await new Promise((resolve, reject) => {
                TrustedContactService.deleteInvitation(item.id, response => {
                  if (response.success) {
                    showSuccess('SUCCESS', 'Request has been cancelled.');
                    dispatch(trustedContactOutgongRequestActions.setRefresh(true));
                    resolve();
                  } else {
                    showError(
                      'ERROR',
                      response?.error || 'Failed to delete invitation',
                    );
                    reject(new Error(response?.error || 'Failed to delete invitation'));
                  }
                });
              }).catch(() => null);
              setLoader(false);
            },
          },
        ],
      );
      return;
    }
    if (action === 'cancel' && tab === 'incoming') {
      Alert.alert(
        `${actionText} Request`,
        `Are you sure you want to reject this incoming trusted contact request?`,
        [
          {
            text: 'No',
            style: 'cancel',
          },
          {
            text: 'Yes',
            onPress: async () => {
              setLoader(true);
              await new Promise((resolve, reject) => {
                TrustedContactService.deleteInvitation(item.id, response => {
                  if (response.success) {
                    showSuccess(
                      'SUCCESS',
                      'Incoming trusted contact request has been rejected.',
                    );
                    dispatch(trustedContactIncommingRequestActions.setRefresh(true));
                    resolve();
                  } else {
                    showError(
                      'ERROR',
                      response?.error || 'Failed to reject invitation',
                    );
                    reject(new Error(response?.error || 'Failed to reject invitation'));
                  }
                });
              }).catch(() => null);
              setLoader(false);
            },
          },
        ],
      );
      return;
    }
    if (action === 'accept' && tab === 'incoming') {
      Alert.alert(
        `${actionText} Request`,
        `Do you want to accept this incoming trusted contact request?`,
        [
          {
            text: 'No',
            style: 'cancel',
          },
          {
            text: 'Yes',
            onPress: async () => {
              setLoader(true);
              await new Promise((resolve, reject) => {
                TrustedContactService.acceptInvitation(item.id, response => {
                  if (response.success) {
                    showSuccess(
                      'SUCCESS',
                      'Incoming trusted contact request has been accepted.',
                    );
                    dispatch(trustedContactIncommingRequestActions.setRefresh(true));
                    dispatch(trustedContactActions.setRefresh(true));
                    setActiveTab('contact');
                    resolve();
                  } else {
                    showError(
                      'ERROR',
                      response?.error || 'Failed to accept invitation',
                    );
                    reject(new Error(response?.error || 'Failed to accept invitation'));
                  }
                });
              }).catch(() => null);
              setLoader(false);
            },
          },
        ],
      );
      return;
    }
   
    if (action === 'delete' && tab === 'contact') {
      Alert.alert(
        `${actionText} Contact`,
        `Are you sure you want to delete this trusted contact?`,
        [
          {
            text: 'No',
            style: 'cancel',
          },
          {
            text: 'Yes',
             onPress: async () => {
              setLoader(true);
              await new Promise((resolve, reject) => {
                TrustedContactService.deleteInvitation(item.id, response => {
                  if (response.success) {
                    showSuccess(
                      'SUCCESS',
                      'Trusted contact has been deleted.',
                    );
                    dispatch(trustedContactActions.setRefresh(true));
                    resolve();
                  } else {
                    showError(
                      'ERROR',
                      response?.error || 'Failed to delete trusted contact',
                    );
                    reject(new Error(response?.error || 'Failed to delete trusted contact'));
                  }
                });
              }).catch(() => null);
              setLoader(false);
            },
          },
        ],
      );
      return;


    }
  };

  const gotToAddContactScreen = () => {
    navigation.navigate('AddContact');
  };

  const onRefresh = () => {
    setRefreshing(true);
    dispatch(trustedContactActions.setRefresh(true));
    dispatch(trustedContactIncommingRequestActions.setRefresh(true));
    dispatch(trustedContactOutgongRequestActions.setRefresh(true));
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <Spinner
        visible={loader}
        textContent={'Loading...'}
        textStyle={{ color: '#FFF' }}
      />
      {/* Header — fixed */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.title}>Contacts</Text>
          <Text style={styles.subtitle}>{currentList?.length} ITEMS</Text>
        </View>
      </View>

      {/* Tab List — fixed */}
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

      {/* Scrollable contact list only */}
      <ScrollView
        style={styles.contactList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
            colors={['#2F6BFF']}
          />
        }
      >
        {currentList.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Icon
                name={
                  activeTab === 'incoming'
                    ? 'call-received'
                    : activeTab === 'outgoing'
                    ? 'call-made'
                    : 'people-outline'
                }
                size={48}
                color={
                  activeTab === 'incoming'
                    ? '#2ED573'
                    : activeTab === 'outgoing'
                    ? '#2F6BFF'
                    : '#FFA726'
                }
              />
            </View>
            <Text style={styles.emptyTitle}>
              {activeTab === 'incoming'
                ? 'No Incoming Requests'
                : activeTab === 'outgoing'
                ? 'No Outgoing Requests'
                : 'No Trusted Contacts'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'incoming'
                ? 'When someone sends you a trusted contact request, it will appear here.'
                : activeTab === 'outgoing'
                ? 'Requests you send to others will show up here until accepted.'
                : 'Add trusted contacts so they can be alerted during an SOS emergency.'}
            </Text>
          </View>
        )}

        {currentList.map(item => (
          <View key={item.id} style={styles.contactRow}>
            <View
              style={[styles.avatar, { backgroundColor: getAvatarColor(item) }]}
            >
              <Text style={styles.avatarText}>{item.nickname.charAt(0)}</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>
                {activeTab === 'incoming'
                  ? item?.inviter?.name ||
                    `Phone number - ${item?.inviter?.phone_number}`
                  : item.nickname}{' '}
              </Text>
              {/* small text */}
              <Text style={styles.contactRelation}>{item.relationship}</Text>
              <Text style={styles.contactDetails}>
                {activeTab === 'incoming'
                  ? item?.inviter?.phone_number
                  : item?.trusted_contact?.phone_number}
              </Text>
            </View>
            <View style={styles.actionContainer}>
              {getActionIcons().map(action => (
                <TouchableOpacity
                  key={`${item.id}-${action.key}`}
                  style={styles.actionIconButton}
                  onPress={() => onActionPress(action.key, item, activeTab)}
                >
                  <Icon name={action.icon} size={18} color={action.color} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add Trusted Contact — fixed */}
      <TouchableOpacity onPress={gotToAddContactScreen} style={styles.addBtn}>
        <Text style={styles.addText}>+ Add Trusted Contact</Text>
      </TouchableOpacity>

      {/* Emergency Info — fixed */}
      <View style={styles.infoCard}>
        <Icon name="warning" size={18} color="#FFC107" />
        <Text style={styles.infoText}>
          <Text style={{ color: '#2ED573', fontWeight: '600' }}>
            Emergency SOS
          </Text>{' '}
          will instantly notify all contacts with your live GPS location.
        </Text>
      </View>

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
    </View>
  );
};

export default ContactsScreen;
