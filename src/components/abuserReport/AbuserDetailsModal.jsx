import React, { useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, Animated, Dimensions,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../components/abuserReport/theme.jsx';
import {
  Avatar, ThreatBadge, SectionDivider, DetailRow, BoolChip,
} from '../../components/abuserReport/UIKit.jsx';

const { height: SCREEN_H } = Dimensions.get('window');
const SHEET_H = SCREEN_H * 0.88;

export default function AbuserDetailsModal({ visible, report, onClose }) {
  const slideAnim = useRef(new Animated.Value(SHEET_H)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: SHEET_H, duration: 260, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!report) return null;
  const { abuser, abuseType, incidentDate, incidentLocation, description,
          witnessInformation, threatLevel, historyOfViolence,
          weaponAccess, restrainingOrder, notes } = report;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose} statusBarTranslucent>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        {/* Handle */}
        <View style={styles.handleWrap}>
          <View style={styles.handle} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Avatar name={abuser?.fullName} size={56} />
          <View style={styles.headerInfo}>
            <Text style={styles.headerName} numberOfLines={1}>{abuser?.fullName || 'Unknown'}</Text>
            {abuser?.aliasName ? (
              <Text style={styles.headerAlias}>aka "{abuser.aliasName}"</Text>
            ) : null}
            <View style={styles.headerMeta}>
              {abuser?.gender ? <View style={styles.metaChip}><Text style={styles.metaChipText}>{abuser.gender}</Text></View> : null}
              {abuser?.dob    ? <View style={styles.metaChip}><Text style={styles.metaChipText}>{abuser.dob}</Text></View> : null}
            </View>
          </View>
          {threatLevel && (
            <View style={styles.badgeAbsolute}>
              <ThreatBadge level={threatLevel} large />
            </View>
          )}
        </View>

        {/* Danger Chips */}
        {(historyOfViolence || weaponAccess || restrainingOrder) && (
          <View style={styles.chipsRow}>
            {historyOfViolence !== undefined && <BoolChip label="History of Violence" value={historyOfViolence} />}
            {weaponAccess      !== undefined && <BoolChip label="Weapon Access"       value={weaponAccess} />}
            {restrainingOrder  !== undefined && <BoolChip label="Restraining Order"   value={restrainingOrder} />}
          </View>
        )}

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Incident Info */}
          <SectionDivider title="Incident Details" />
          <View style={styles.card}>
            <DetailRow label="Type of Abuse"       value={abuseType} accent />
            <DetailRow label="Date of Incident"    value={incidentDate ? new Date(incidentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null} />
            <DetailRow label="Location"            value={incidentLocation} />
          </View>

          {/* Description */}
          {description ? (
            <>
              <SectionDivider title="Description" />
              <View style={styles.textBlock}>
                <Text style={styles.textBlockContent}>{description}</Text>
              </View>
            </>
          ) : null}

          {/* Witness Info */}
          {witnessInformation ? (
            <>
              <SectionDivider title="Witness Information" />
              <View style={styles.textBlock}>
                <Text style={styles.textBlockContent}>{witnessInformation}</Text>
              </View>
            </>
          ) : null}

          {/* Abuser Contact */}
          <SectionDivider title="Abuser Profile" />
          <View style={styles.card}>
            <DetailRow label="Phone"   value={abuser?.phone} />
            <DetailRow label="Email"   value={abuser?.email} />
            <DetailRow label="Address" value={abuser?.address} />
          </View>

          {/* Notes */}
          {notes ? (
            <>
              <SectionDivider title="Internal Notes" />
              <View style={[styles.textBlock, styles.noteBlock]}>
                <Text style={styles.noteIcon}>📝</Text>
                <Text style={styles.textBlockContent}>{notes}</Text>
              </View>
            </>
          ) : null}

          <View style={{ height: Spacing.xxl }} />
        </ScrollView>

        {/* Close Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.closeBtnText}>Close Report</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: SHEET_H,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...Shadow.modal,
    overflow: 'hidden',
  },
  handleWrap: { alignItems: 'center', paddingTop: 12, paddingBottom: 4 },
  handle:     { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.divider },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
    gap: Spacing.base,
  },
  headerInfo:   { flex: 1 },
  headerName:   { ...Typography.heading2, fontSize: 22 },
  headerAlias:  { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  headerMeta:   { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  metaChip: {
    backgroundColor: Colors.surfaceHigh,
    borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: Colors.divider,
  },
  metaChipText: { ...Typography.caption, color: Colors.textSecondary },
  badgeAbsolute: { alignSelf: 'flex-start', marginTop: 4 },

  // Chips
  chipsRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    backgroundColor: Colors.surfaceHigh,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },

  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.base },

  card: {
    backgroundColor: Colors.surfaceHigh,
    borderRadius: Radius.lg, borderWidth: 1,
    borderColor: Colors.divider,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.base,
  },

  textBlock: {
    backgroundColor: Colors.surfaceHigh,
    borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.divider,
    padding: Spacing.base, marginBottom: Spacing.base,
  },
  noteBlock: {
    flexDirection: 'row', gap: Spacing.sm,
    borderColor: Colors.accentMuted,
    backgroundColor: 'rgba(229,62,109,0.04)',
  },
  noteIcon:         { fontSize: 16, marginTop: 2 },
  textBlockContent: { ...Typography.body, lineHeight: 22 },

  footer: {
    paddingHorizontal: Spacing.xl, paddingBottom: 32, paddingTop: Spacing.md,
    borderTopWidth: 1, borderTopColor: Colors.divider,
  },
  closeBtn: {
    height: 52, borderRadius: Radius.lg,
    borderWidth: 1.5, borderColor: Colors.divider,
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { ...Typography.heading3, color: Colors.textSecondary, fontSize: 15 },
});
