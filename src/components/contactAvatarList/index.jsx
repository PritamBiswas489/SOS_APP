import React, { useCallback, useMemo, useState, useEffect, useRef, use } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from './style';
import { useSelector, useDispatch } from 'react-redux';
import { chatSelectedTrustedContactActions } from '../../store/redux/chatSelectedTrustedContact.redux';
import { useChatPresence } from '../../context/ChatContext';
import { useChatContacts } from '../../hook/useChatContacts';
import appColors from '../../theme/appColors';
 


const ContactAvatarList = ({
  navigation,
  
}) => {
    const ONLINE_COLOR = '#2ED573';
    const ONLINE_BG = '#0B2F2A';
    const OFFLINE_COLOR = '#7A8499';
    const OFFLINE_BG = '#1A2236';

    const onlineUsers = useChatPresence();
     const [refreshing, setRefreshing] = useState(false);
     const [isScrollable, setIsScrollable] = useState(false);
      const lastOffsetXRef = useRef(0);
      const endReachedFiredRef = useRef(false);
      const listWidthRef = useRef(0);
      const contentWidthRef = useRef(0);

     const dispatch = useDispatch();
    const { contactList: chatContactList, fetchChatContacts } = useChatContacts();
     const chatSelectedTrustedContact = useSelector(state => state.chatSelectedTrustedContact);
     const userData = useSelector(state => state.userProviderData);
     const usrId = userData?.id;

     const chatContacts = useMemo(() => {
      const list = chatContactList;
      if (!list || list.length === 0) return [];

      const trustedContacts = [];
      const otherContacts = [];

      for (const contact of list) {
        const roomid = [contact.user_id, contact.trusted_user_id].sort().join(':');
        if (contact.user_id === usrId) {
          const displayName = contact.nickname || contact.trusted_contact.name || contact.relationship || '?';
          trustedContacts.push({
            id: contact.id,
            name: displayName,
            initial: displayName?.charAt(0).toUpperCase(),
            isOnline: onlineUsers[contact.trusted_user_id] || false,
            receipent_id: contact.trusted_user_id,
            phone_number: contact.trusted_contact.phone_number,
            roomId: roomid,
          });
        } else if (contact.trusted_user_id === usrId) {
          const displayName = contact?.inviter?.name || contact?.inviter?.phone_number || 'Unknown';
          otherContacts.push({
            id: contact.id,
            name: displayName,
            initial: displayName.charAt(0).toUpperCase(),
            phone_number: contact?.inviter?.phone_number,
            isOnline: onlineUsers[contact.user_id] || false,
            receipent_id: contact.user_id,
            roomId: roomid,
          });
        }
      }

      const filteredOtherContacts = otherContacts.filter(
        oc => !trustedContacts.some(tc => tc.roomId === oc.roomId),
      );

      return [...trustedContacts, ...filteredOtherContacts].sort((a, b) => {
        if (a.isOnline === b.isOnline) return 0;
        return a.isOnline ? -1 : 1;
      });
    }, [chatContactList, usrId, onlineUsers]);

    const selectContact = useCallback(item => {
      dispatch(chatSelectedTrustedContactActions.setSelectedTrustedContact(item));
    }, [dispatch]);

    const navigateToAddContact = useCallback(() => {
      navigation.navigate('AddContact');
    }, [navigation]);

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
  const key = `${item?.id ?? ''}-${item?.name ?? ''}`;
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

    const renderContactItem = useCallback(({ item }) => {
      const isSelected = chatSelectedTrustedContact?.id === item.id;
      const statusColor =  OFFLINE_COLOR;
      const statusBgColor = item.isOnline ? ONLINE_BG : OFFLINE_BG;
       const avatarColor = getAvatarColor(item);

      return (
        <TouchableOpacity
          key={item.id}
          style={styles.avatarItem}
          activeOpacity={0.7}
          onPress={() => selectContact(item)}
        >
          <View style={styles.avatarCircleWrap}>
            <View
              style={[
                styles.avatarCircle,
                {
                  borderColor: appColors.white,
                  backgroundColor: avatarColor,
                },
                isSelected && {
                  borderWidth: 2.5,
                  borderColor: appColors.primary,
                  shadowColor: appColors.primary,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 8,
                  elevation: 8,
                },
              ]}
            >
              <Text style={[styles.avatarText]}> 
                {item.initial}
              </Text>
            </View>

            {item.isOnline && <View style={styles.onlineDot} />}
          </View>

          <Text style={[styles.avatarLabel,  isSelected && { color: appColors.primary }]}>
            {item.name}
          </Text>
          {item.phone_number && (
            <Text style={[styles.avatarPhoneNumber,    isSelected && { color: appColors.primary }]}>
              {item.phone_number}
            </Text>
          )}
        </TouchableOpacity>
      );
    }, [chatSelectedTrustedContact?.id, selectContact]);
    const handleRefresh = useCallback(async () => {
      if (refreshing) return;
      console.log('Refreshing contact list...');
      setRefreshing(true);

      try {
        await fetchChatContacts();
      } finally {
        setRefreshing(false);
      }
    }, [refreshing, fetchChatContacts]);

    const handleHorizontalScroll = useCallback((event) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      const isMovingRight = contentOffset.x > lastOffsetXRef.current;
      lastOffsetXRef.current = contentOffset.x;
      const distanceFromEnd = contentSize.width - (contentOffset.x + layoutMeasurement.width);
      if (distanceFromEnd <= 5 && isMovingRight && !endReachedFiredRef.current) {
        endReachedFiredRef.current = true;
        handleRefresh();
      }
      if (distanceFromEnd > 40) {
        endReachedFiredRef.current = false;
      }
    }, [handleRefresh]);


    useEffect(() => {
      const stillExists = chatSelectedTrustedContact
        ? chatContacts.some(c => c.id === chatSelectedTrustedContact.id)
        : false;

      if (!stillExists && chatContacts.length > 0) {
        dispatch(chatSelectedTrustedContactActions.setSelectedTrustedContact(chatContacts[0]));
      }
    }, [chatContacts, chatSelectedTrustedContact, dispatch]);

  return (
    <View style={styles.avatarRowContainer}>
      <FlatList
        horizontal
        data={chatContacts}
        keyExtractor={item => String(item.id)}
        renderItem={renderContactItem}
        extraData={chatSelectedTrustedContact?.id}
        showsHorizontalScrollIndicator={false}
        style={styles.avatarRow}
        contentContainerStyle={styles.avatarRowContent}
        onScroll={handleHorizontalScroll}
        scrollEventThrottle={16}
        onLayout={e => {
          listWidthRef.current = e.nativeEvent.layout.width;
          setIsScrollable(contentWidthRef.current > listWidthRef.current);
        }}
        onContentSizeChange={(w) => {
          contentWidthRef.current = w;
          setIsScrollable(w > listWidthRef.current);
        }}
        refreshControl={
           <RefreshControl
                      refreshing={refreshing}
                      
                      tintColor="#2ED573"
                      colors={['#2ED573']}
                    />
        }
       
        
        
        ListFooterComponent={
          <TouchableOpacity
            style={styles.avatarItem}
            activeOpacity={0.7}
            onPress={navigateToAddContact}
          >
            <View style={styles.avatarAdd}>
              <Text style={{ color: '#4DA3FF', fontSize: 20 }}>+</Text>
            </View>
            <Text style={styles.avatarLabel}>Add</Text>
          </TouchableOpacity>
        }
      />
      {!isScrollable && (
        <TouchableOpacity
          onPress={handleRefresh}
          disabled={refreshing}
          style={styles.refreshIconBtn}
          activeOpacity={0.7}
        >
          {refreshing
            ? <ActivityIndicator size={16} color={ONLINE_COLOR} />
            : <Icon name="refresh" size={20} color={ONLINE_COLOR} />}
        </TouchableOpacity>
      )}
    </View>
  );
};

export default React.memo(ContactAvatarList);
