import React, { useCallback, useMemo, useState, useEffect, useRef, use } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from './style';
import { useSelector, useDispatch } from 'react-redux';
import { audioSelectedContactActions } from '../../store/redux/audioSelectedContact.redux';
import { useChatPresence } from '../../context/ChatContext';
import { useChatContacts } from '../../hook/useChatContacts';
import appColors from '../../theme/appColors';
import { useUserData } from '../../hook/useUserData';
import { getProfileImage } from '../../config/utility'; 
import { useListenerMediaSoup } from '../../context/ListenerMediaSoupContext';


const AudioAvatarList = () => {
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
     const audioSelectedContact = useSelector(state => state.audioSelectedContact);
     const {userData} = useUserData();
     const usrId = userData?.id;
     const { currentStreamingRoomIds } = useListenerMediaSoup();

     const chatContacts = useMemo(() => {
      //console.log("currentStreamingRoomIds", currentStreamingRoomIds);
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
            isStreaming: currentStreamingRoomIds?.[`sos-live-${contact.trusted_user_id}`] || false,
            receipent_id: contact.trusted_user_id,
            phone_number: contact.trusted_contact.phone_number,
            roomId: roomid,
            profile_image: contact?.trusted_contact?.profile_photo ? getProfileImage(contact.trusted_contact.profile_photo) : null,
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
            profile_image: contact?.inviter?.profile_photo ? getProfileImage(contact.inviter.profile_photo) : null,
            isStreaming: currentStreamingRoomIds?.[`sos-live-${contact.user_id}`] || false,
          });
        }
      }

      const filteredOtherContacts = otherContacts.filter(
        oc => !trustedContacts.some(tc => tc.roomId === oc.roomId),
      );

      return [...trustedContacts, ...filteredOtherContacts].sort((a, b) => {
        if (a.isStreaming === b.isStreaming) return 0;
        return a.isStreaming ? -1 : 1;
      });
    }, [chatContactList, usrId, onlineUsers, currentStreamingRoomIds]);

    const selectContact = useCallback(item => {
      console.log('Selected contact:', item);
     dispatch(audioSelectedContactActions.setAudioSelectedContact(item));
    }, [dispatch]);
 

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
      const isSelected = audioSelectedContact?.id === item.id;
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
                  borderWidth: 6,
                  borderColor: appColors.primary,
                  shadowColor: appColors.primary,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 8,
                  elevation: 8,
                },
              ]} 
            >
              {item.profile_image ? (
                <Image
                  source={{ uri: item.profile_image }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <Text style={[styles.avatarText, isSelected && { fontWeight: 'bold' }]}> 
                  {item.initial}
                </Text>
              )}
            </View>

            {item.isOnline && <View style={styles.onlineDot} />}
            {item.isStreaming && (
              <View style={styles.streamingBadge}>
                <Icon name="graphic-eq" size={9} color="#fff" />
              </View>
            )}
          </View>

          <Text style={[styles.avatarLabel,  isSelected && { color: appColors.primary, fontWeight: 'bold' }]}>
            {item.name}
          </Text>
          {item.phone_number && (
            <Text style={[styles.avatarPhoneNumber,    isSelected && { color: appColors.primary, fontWeight: 'bold' }]}>
              {item.phone_number}
            </Text>
          )}
        </TouchableOpacity>
      );
    }, [audioSelectedContact?.id, selectContact]);
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
      const stillExists = audioSelectedContact?.id
        ? chatContacts.some(c => c.id === audioSelectedContact.id)
        : false;

      if (!stillExists && chatContacts.length > 0) {
        dispatch(audioSelectedContactActions.setAudioSelectedContact(chatContacts[0]));
      }
    }, [chatContacts, audioSelectedContact, dispatch]);

  return (
    <View style={styles.avatarRowContainer}>
      <FlatList
        horizontal
        data={chatContacts}
        keyExtractor={item => String(item.id)}
        renderItem={renderContactItem}
        extraData={audioSelectedContact?.id}
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

export default React.memo(AudioAvatarList);
