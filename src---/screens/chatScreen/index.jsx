import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import styles from './style';

const ChatScreen = () => {
  const [message, setMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState(0);
  const navigation = useNavigation();
  const contacts = [
    {
      name: 'Mom',
      initial: 'M',
      borderColor: '#2ED573',
      bgColor: '#0B2F2A',
    },
    {
      name: 'Rahul',
      initial: 'R',
      borderColor: '#FF3B5C',
      bgColor: '#2A0F14',
    },
    {
      name: 'Priya',
      initial: 'P',
      borderColor: '#7B61FF',
      bgColor: '#1B1430',
    },
    {
      name: 'Dad',
      initial: 'D',
      borderColor: '#FFA502',
      bgColor: '#2A200F',
    },
  ];

  return (
    <View style={styles.container}>
      {/* FIXED HEADER */}
      <View style={styles.header}>
        

        <View style={styles.headerCenter}>
          <Text style={styles.title}>Trusted Contacts</Text>
          <Text style={styles.subtitle}>4 contacts · 3 online</Text>
        </View>

        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live</Text>
        </View>
      </View>

      {/* FIXED AVATAR ROW */}
      <View style={styles.avatarRow}>
        {contacts.map((item, index) => {
          const isSelected = selectedContact === index;
          return (
            <TouchableOpacity
              key={index}
              style={styles.avatarItem}
              activeOpacity={0.7}
              onPress={() => setSelectedContact(isSelected ? null : index)}
            >
              <View
                style={[
                  styles.avatarCircle,
                  {
                    borderColor: item.borderColor,
                    backgroundColor: item.bgColor,
                  },
                  isSelected && {
                    borderWidth: 2.5,
                    shadowColor: item.borderColor,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 8,
                    elevation: 8,
                  },
                ]}
              >
                <Text style={[styles.avatarText, {color: item.borderColor}]}>
                  {item.initial}
                </Text>
              </View>

              {isSelected && (
                <View style={[styles.selectedDot, {backgroundColor: item.borderColor}]} />
              )}

              <Text style={[
                styles.avatarLabel,
                isSelected && {color: item.borderColor},
              ]}>
                {item.name}  
              </Text>
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
      </View>

      {/* SCROLLABLE CHAT */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.chatScroll}>
        {/* Time */}
        <Text style={styles.dayLabel}>TODAY · 09:41 AM</Text>

        {/* SOS ALERT - Right aligned (sent by user) */}

        <View style={styles.sosContainer}>
          <View style={styles.sosCard}>
            <View style={styles.sosBadge}>
              <Text style={styles.sosBadgeText}>🚨 SOS TRIGGERED</Text>
            </View>

            <Text style={styles.sosMessage}>
              I need help! Sending my live location now.
            </Text>
          </View>
        </View>

        {/* LOCATION */}

        <View style={styles.locationContainer}>
          <View style={styles.locationCard}>
            <Icon name="location-pin" size={16} color="#ff3b5c" />
            <Text style={styles.locationText}>Live GPS · MG Road, Bengaluru</Text>
          </View>
        </View>

        {/* SOS TIMESTAMP */}
        <View style={styles.sosTimeRow}>
          <Text style={styles.sosTimeText}>9:41 AM · Sent to all</Text>
          <View style={styles.avatarSmallPink}>
            <Text style={styles.avatarSmallText}>S</Text>
          </View>
        </View>

        {/* MESSAGE LEFT - Mom */}

        <View style={styles.bubbleLeftWrapper}>
          <View style={styles.bubbleLeft}>
            <Text style={styles.messageText}>On my way! Stay safe 💙</Text>
          </View>

          <View style={styles.messageFooterLeft}>
            <View style={styles.avatarSmallRed}>
              <Text style={styles.avatarSmallText}>M</Text>
            </View>
            <Text style={styles.timeLeftInline}>9:42 AM</Text> 
          </View>
        </View>

        {/* MESSAGE LEFT - Rahul */}

        <View style={styles.bubbleLeftWrapper}>
          <View style={styles.bubbleLeft}>
            <Text style={styles.messageText}>Calling you now. Are you ok?</Text>
          </View>

          <View style={styles.messageFooterLeft}>
            <View style={styles.avatarSmallBlue}>
              <Text style={styles.avatarSmallText}>R</Text>
            </View>
            <Text style={styles.timeLeftInline}>9:42 AM</Text>
          </View>
        </View>

        {/* MESSAGE RIGHT */}

        <View style={styles.messageRowRight}>
          <View style={styles.bubbleRight}>
            <Text style={styles.messageText}>
              Yes I'm okay, please come fast 🙏
            </Text>
          </View>

          <View style={styles.avatarSmallPink}>
            <Text style={styles.avatarSmallText}>S</Text>
          </View>
        </View>

        <Text style={styles.timeRight}>9:43 AM ✓✓</Text>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* INPUT BAR */}

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.micBtn}>
          <Icon name="mic" size={22} color="#6B7C99" />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#6B7C99"
          value={message}
          onChangeText={setMessage}
        />

        <Icon name="push-pin" size={18} color="#6B7C99" style={{marginRight: 8}} />

        <TouchableOpacity style={styles.sendBtn}>
          <Icon name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatScreen;
