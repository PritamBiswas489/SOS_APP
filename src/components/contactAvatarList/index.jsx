import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import styles from './style';
import { useSelector, useDispatch } from 'react-redux';
import { chatSelectedTrustedContactActions } from '../../store/redux/chatSelectedTrustedContact.redux';
import { useChat } from '../../context/ChatContext';
const ContactAvatarList = ({
  navigation,
}) => {
    const ONLINE_COLOR = '#2ED573';
    const ONLINE_BG = '#0B2F2A';
    const OFFLINE_COLOR = '#7A8499';
    const OFFLINE_BG = '#1A2236';

    const chatContext = useChat();
    const onlineUsers = chatContext?.onlineUsers || {}; 

    console.log("=============== Online Users Updated in ContactAvatarList ======================");
    console.log('Online Users:', onlineUsers);
    console.log("=====================================================");

     const dispatch = useDispatch();
     const [chatContacts, setChatContacts] = useState([]);
     const chatContactList = useSelector(state => state.chatContactList);
     const chatSelectedTrustedContact = useSelector(state => state.chatSelectedTrustedContact);
     //selected contact handler
     const selectContact = (item) => {
         console.log('Selected contact:', item);
         dispatch(chatSelectedTrustedContactActions.setSelectedTrustedContact(item));
     }
     const userData = useSelector(state => state.userProviderData);
     const usrId = userData?.id;

     useEffect(() => {
        const list = chatContactList?.contact_list;
        console.log("=============== Chat Contact List Updated in ContactAvatarList ======================");
        console.log('Chat Contact List:', list);
        console.log("=====================================================");
        if (!list || list.length === 0) return;

        const trustedContacts = [];
        const otherContacts = [];
        for (let contact of list) {
            const roomid = [contact.user_id, contact.trusted_user_id].sort().join(':');
            if (contact.user_id === usrId) {
                trustedContacts.push({
                    id: contact.id,
                    name: contact.nickname || contact.trusted_contact.name,
                    initial: (contact.nickname || contact.trusted_contact.name).charAt(0).toUpperCase(),
                    isOnline: onlineUsers[contact.trusted_user_id] || false,
                    receipent_id: contact.trusted_user_id,
                    phone_number: contact.trusted_contact.phone_number,
                    roomId: roomid,
                });
            } else if (contact.trusted_user_id === usrId) {
                otherContacts.push({
                    id: contact.id,
                    name: contact?.inviter?.name || contact?.inviter?.phone_number || 'Unknown',
                    initial: (contact?.inviter?.name || 'U').charAt(0).toUpperCase(),
                    phone_number: contact?.inviter?.phone_number,
                    isOnline: onlineUsers[contact.user_id] || false,
                    receipent_id: contact.user_id,
                    roomId: roomid,
                });
            }
        }
        // remove duplicate roomId contacts
        const filteredOtherContacts = otherContacts.filter(
            oc => !trustedContacts.some(tc => tc.roomId === oc.roomId)
        );
        
        const d = [...trustedContacts, ...filteredOtherContacts];
        //showing online user first by sorting
        d.sort((a, b) => {
            if (a.isOnline === b.isOnline) return 0;
            return a.isOnline ? -1 : 1;
        });
        setChatContacts(d);
        // only update selection if nothing is selected or previous selection no longer exists
        const stillExists = chatSelectedTrustedContact
            ? d.some(c => c.id === chatSelectedTrustedContact.id)
            : false;
        if (!stillExists) {
            dispatch(chatSelectedTrustedContactActions.setSelectedTrustedContact(d[0] || null));
        }
    }, [chatContactList, usrId, onlineUsers, chatSelectedTrustedContact, dispatch]);
  return (
    <View style={styles.avatarRowContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.avatarRow}
        contentContainerStyle={styles.avatarRowContent}
      >
        {chatContacts.length > 0 && chatContacts.map((item, index) => {
          const isSelected = chatSelectedTrustedContact?.id === item.id;
          const statusColor = item.isOnline ? ONLINE_COLOR : OFFLINE_COLOR;
          const statusBgColor = item.isOnline ? ONLINE_BG : OFFLINE_BG;
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.avatarItem}
              activeOpacity={0.7}
              onPress={selectContact.bind(null, item, index)}
            >
              <View
                style={[
                  styles.avatarCircle,
                  {
                    borderColor: statusColor,
                    backgroundColor: statusBgColor,
                  },
                  isSelected && {
                    borderWidth: 2.5,
                    shadowColor: statusColor,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 8,
                    elevation: 8,
                  },
                ]}
              >
                <Text style={[styles.avatarText, {color: statusColor}]}>
                  {item.initial}
                </Text>
              </View>

              {isSelected && (
                <View style={[styles.selectedDot]} />
              )}

              <Text style={[styles.avatarLabel,item.isOnline ? {color: ONLINE_COLOR} : {color: OFFLINE_COLOR}]}>
                {item.name}
              </Text>
              {item.phone_number && (
                <Text style={[styles.avatarPhoneNumber,item.isOnline ? {color: ONLINE_COLOR} : {color: OFFLINE_COLOR}]}>
                  {item.phone_number}
                </Text>
              )}
              
            </TouchableOpacity>
          );
        })}

        {/* ADD BUTTON */}
        <TouchableOpacity
          style={styles.avatarItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('AddContact')}
        >
          <View style={styles.avatarAdd}>
            <Text style={{ color: '#4DA3FF', fontSize: 20 }}>+</Text>
          </View>
          <Text style={styles.avatarLabel}>Add</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default ContactAvatarList;
