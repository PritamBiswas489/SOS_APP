import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from './style';
import { useSelector, useDispatch } from 'react-redux';
import { healthSelectedContactActions } from '../../store/redux/healthSelectedContact.redux';
import appColors from '../../theme/appColors';
import { useChatPresence } from '../../context/ChatContext';
import { useChatContacts } from '../../hook/useChatContacts';

const HealthAvatarList = ({ chatContacts, fetchChatContacts }) => {
    const ONLINE_COLOR = '#2ED573';

     const [refreshing, setRefreshing] = useState(false);
      const lastOffsetXRef = useRef(0);
      const endReachedFiredRef = useRef(false);
      const flatListRef = useRef(null);
      const lastAutoScrolledIdRef = useRef(null);

     const dispatch = useDispatch();
     const healthSelectedContact = useSelector(state => state.healthSelectedContact);
     console.log("healthSelectedContact?", healthSelectedContact?.item?.id);
    const currentUser = useSelector(state => state.user?.user ?? state.auth?.user ?? null);

    const isMe =  healthSelectedContact?.isMe;

    const selectMe = useCallback(() => {
      console.log('Selected Me');
      dispatch(healthSelectedContactActions.setHealthSelectedContact({isMe: true, item: null}));
    }, [dispatch]);
    const selectContact = useCallback((item) => {
      console.log('Selected contact:', item);
     dispatch(healthSelectedContactActions.setHealthSelectedContact({isMe: false, item}));
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
      console.log('Rendering contact item:', item);
      console.log('Current healthSelectedContact:', healthSelectedContact);
      console.log('Current selected contact ID:', healthSelectedContact?.item?.id);
      const isSelected = healthSelectedContact?.item?.id === item.id;
      const avatarColor = getAvatarColor(item);

      return (
        <TouchableOpacity
          key={item.id}
          style={[styles.avatarItem, isSelected && styles.avatarItemSelected]}
          activeOpacity={0.7}
          onPress={() => selectContact(item)}
        >
          <View style={styles.avatarCircleWrap}>
            <View
              style={[
                styles.avatarCircle,
                {
                  borderColor: isSelected ? appColors.primary : 'rgba(255,255,255,0.35)',
                  backgroundColor: avatarColor,
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

          <View style={styles.avatarMeta}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.avatarLabel, isSelected && styles.avatarLabelSelected]}
            >
              {item.name}
            </Text>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.avatarPhoneNumber, isSelected && styles.avatarPhoneSelected]}
            >
              {item.phone_number || 'No phone'}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }, [healthSelectedContact?.item?.id, selectContact]);
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
      if (!healthSelectedContact?.item?.id || !Array.isArray(chatContacts) || chatContacts.length === 0) {
        return;
      }

      if (lastAutoScrolledIdRef.current === healthSelectedContact.item.id) {
        return;
      }

      const selectedIndex = chatContacts.findIndex(contact => contact?.id === healthSelectedContact.item.id);
      if (selectedIndex < 0) {
        return;
      }

      requestAnimationFrame(() => {
        flatListRef.current?.scrollToIndex({
          index: selectedIndex,
          animated: true,
          viewPosition: 0.5,
        });
      });

      lastAutoScrolledIdRef.current = healthSelectedContact.item.id;
    }, [chatContacts, healthSelectedContact?.item?.id]);

    const handleScrollToIndexFailed = useCallback((info) => {
      const estimatedOffset = Math.max(0, info.averageItemLength * info.index);
      flatListRef.current?.scrollToOffset({ offset: estimatedOffset, animated: true });
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: info.index,
          animated: true,
          viewPosition: 0.5,
        });
      }, 100);
    }, []);

  return (
    <View style={styles.avatarRowContainer}>
      {/* ── Me button ── */}
      <TouchableOpacity
        onPress={selectMe}
        activeOpacity={0.8}
        style={[styles.meBtnWrap, isMe && styles.meBtnWrapSelected]}>
        {isMe ? (
          <LinearGradient
            colors={['#1A6EFF', '#00C2FF']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.meBtnGradient}>
            <View style={styles.meBtnAvatar}>
              {currentUser?.profile_image ? (
                <Image source={{uri: currentUser.profile_image}} style={styles.meBtnAvatarImg} />
              ) : (
                <Text style={styles.meBtnAvatarInitial}>
                  {currentUser?.name?.[0]?.toUpperCase() ?? 'M'}
                </Text>
              )}
            </View>
            <Text style={styles.meBtnTextActive}>Me</Text>
            <View style={styles.meBtnActiveDot} />
          </LinearGradient>
        ) : (
          <View style={styles.meBtnIdle}>
            <View style={styles.meBtnAvatarIdle}>
              {currentUser?.profile_image ? (
                <Image source={{uri: currentUser.profile_image}} style={styles.meBtnAvatarImg} />
              ) : (
                <Text style={styles.meBtnAvatarInitialIdle}>
                  {currentUser?.name?.[0]?.toUpperCase() ?? 'M'}
                </Text>
              )}
            </View>
            <Text style={styles.meBtnTextIdle}>Me</Text>
          </View>
        )}
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        horizontal
        data={chatContacts}
        keyExtractor={item => String(item.id)}
        renderItem={renderContactItem}
        extraData={healthSelectedContact?.item?.id}
        showsHorizontalScrollIndicator={false}
        style={styles.avatarRow}
        contentContainerStyle={styles.avatarRowContent}
        onScroll={handleHorizontalScroll}
        onScrollToIndexFailed={handleScrollToIndexFailed}
        scrollEventThrottle={16}
        refreshControl={
           <RefreshControl
                      refreshing={refreshing}
                      
                      tintColor="#2ED573"
                      colors={['#2ED573']}
                    />
        }
       
        
        
       
      />
      {/* <TouchableOpacity
        onPress={handleRefresh}
        disabled={refreshing}
        style={styles.refreshIconBtn}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Refresh contacts"
      >
        {refreshing
          ? <ActivityIndicator size={16} color={ONLINE_COLOR} />
          : <Icon name="refresh" size={20} color={ONLINE_COLOR} />}
      </TouchableOpacity> */}
    </View>
  );
};

export default React.memo(HealthAvatarList);
