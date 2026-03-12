import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from './style';

const TrustedContactsScreen = () => {
  const [message, setMessage] = useState('');
  const contacts = [
    {
      name: 'Mom',
      initial: 'M',
      borderColor: '#FF3B5C',
      bgColor: '#2A0F14',
    },
    {
      name: 'Rahul',
      initial: 'R',
      borderColor: '#1E90FF',
      bgColor: '#0F1D2A',
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
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Icon name="arrow-back" size={22} color="#fff" />

          <View style={styles.headerCenter}>
            <Text style={styles.title}>Trusted Contacts</Text>
            <Text style={styles.subtitle}>4 contacts · 3 online</Text>
          </View>

          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live</Text>
          </View>
        </View>

        {/* AVATAR ROW */}

        <View style={styles.avatarRow}>
          {contacts.map((item, index) => (
            <View key={index} style={styles.avatarItem}>
              <View
                style={[
                  styles.avatarCircle,
                  {
                    borderColor: item.borderColor,
                    backgroundColor: item.bgColor,
                  },
                ]}
              >
                <Text style={styles.avatarText}>{item.initial}</Text>
              </View>

              <Text style={styles.avatarLabel}>{item.name}</Text>
            </View>
          ))}

          {/* ADD BUTTON */}

          <View style={styles.avatarItem}>
            <View style={styles.avatarAdd}>
              <Text style={{ color: '#4DA3FF' }}>+</Text>
            </View>
            <Text style={styles.avatarLabel}>Add</Text>
          </View>
        </View>

        {/* TIME */}
        <Text style={styles.dayLabel}>TODAY · 09:41 AM</Text>

        {/* SOS ALERT */}

        <View style={styles.sosCard}>
          <View style={styles.sosBadge}>
            <Text style={styles.sosBadgeText}>🚨 SOS TRIGGERED</Text>
          </View>

          <Text style={styles.sosMessage}>
            I need help! Sending my live location now.
          </Text>
        </View>

        {/* LOCATION */}

        <View style={styles.locationCard}>
          <Icon name="location-pin" size={16} color="#ff3b5c" />
          <Text style={styles.locationText}>Live GPS · MG Road, Bengaluru</Text>
        </View>

        {/* MESSAGE LEFT */}

        <View style={styles.messageRowLeft}>
          <View style={styles.avatarSmallRed}>
            <Text style={styles.avatarSmallText}>M</Text>
          </View>

          <View style={styles.bubbleLeft}>
            <Text style={styles.messageText}>On my way! Stay safe 💙</Text>
          </View>
        </View>

        <Text style={styles.timeLeft}>9:42 AM</Text>

        {/* MESSAGE LEFT */}

        <View style={styles.messageRowLeft}>
          <View style={styles.avatarSmallBlue}>
            <Text style={styles.avatarSmallText}>R</Text>
          </View>

          <View style={styles.bubbleLeft}>
            <Text style={styles.messageText}>Calling you now. Are you ok?</Text>
          </View>
        </View>

        <Text style={styles.timeLeft}>9:42 AM</Text>

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
        <Icon name="attach-file" size={20} color="#6B7C99" />

        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#6B7C99"
          value={message}
          onChangeText={setMessage}
        />

        <TouchableOpacity style={styles.sendBtn}>
          <Icon name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TrustedContactsScreen;
