import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../components/abuserReport/theme.jsx';
import { ThreatBadge } from '../../components/abuserReport/UIKit.jsx';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');

const formatDate = (iso) => {
  if (!iso) return 'Date unknown';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
};

const capitalise = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : null;

// ─── Avatar (photo-aware) ─────────────────────────────────────────────────────
function CardAvatar({ name, photo, size = 44 }) {
  const initials = getInitials(name || '?');
  const fontSize  = size * 0.36;

  if (photo) {
    return (
      <Image
        source={{ uri: photo }}
        style={[styles.avatarImg, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  return (
    <View style={[styles.avatarFallback, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarInitials, { fontSize }]}>{initials}</Text>
    </View>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AbuserReportCard({ report, onPress }) {
  const {
    abuser,
    abuseType,
    incidentDate,
    incidentLocation,
    threatLevel,
    historyOfViolence,
    weaponAccess,
    restrainingOrder,
    evidenceFiles = [],
  } = report;

  const docCount   = evidenceFiles.filter(f => f.file_type === 'document').length;
  const imgCount   = evidenceFiles.filter(f => f.file_type === 'image').length;
  const hasEvidence = evidenceFiles.length > 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.78}>
      {/* Left threat-level accent stripe */}
      <View style={[
        styles.stripe,
        threatLevel === 'High'   && styles.stripeHigh,
        threatLevel === 'Medium' && styles.stripeMed,
        threatLevel === 'Low'    && styles.stripeLow,
      ]} />

      <View style={styles.body}>

        {/* ── Top row: avatar + name + badge ── */}
        <View style={styles.topRow}>
          <CardAvatar name={abuser?.fullName} photo={abuser?.photo} size={46} />

          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {abuser?.fullName || 'Unknown'}
            </Text>
            {abuser?.aliasName ? (
              <Text style={styles.alias} numberOfLines={1}>aka "{abuser.aliasName}"</Text>
            ) : null}
            {abuser?.gender ? (
              <Text style={styles.genderText}>{capitalise(abuser.gender)}</Text>
            ) : null}
          </View>

          {threatLevel ? <ThreatBadge level={threatLevel} /> : null}
        </View>

        {/* ── Meta: abuse type + date ── */}
        <View style={styles.metaRow}>
          {abuseType ? (
            <View style={styles.pill}>
              <Text style={styles.pillText}>{abuseType}</Text>
            </View>
          ) : null}
          <Text style={styles.date}>📅 {formatDate(incidentDate)}</Text>
        </View>

        {/* ── Location ── */}
        {incidentLocation ? (
          <Text style={styles.location} numberOfLines={1}>📍 {incidentLocation}</Text>
        ) : null}

        {/* ── Danger flags ── */}
        {(historyOfViolence || weaponAccess || restrainingOrder) ? (
          <View style={styles.flagsRow}>
            {historyOfViolence && (
              <View style={styles.flag}>
                <Text style={styles.flagText}>⚠ Violence History</Text>
              </View>
            )}
            {weaponAccess && (
              <View style={[styles.flag, styles.flagDanger]}>
                <Text style={[styles.flagText, styles.flagTextDanger]}>🔫 Weapon Access</Text>
              </View>
            )}
            {restrainingOrder && (
              <View style={[styles.flag, styles.flagOrder]}>
                <Text style={[styles.flagText, styles.flagTextOrder]}>🚫 Restraining Order</Text>
              </View>
            )}
          </View>
        ) : null}

        {/* ── Evidence summary ── */}
        {hasEvidence ? (
          <View style={styles.evidenceRow}>
            <Text style={styles.evidenceText}>📎 Evidence: </Text>
            {docCount > 0 && (
              <Text style={styles.evidenceBadge}>{docCount} doc{docCount > 1 ? 's' : ''}</Text>
            )}
            {imgCount > 0 && (
              <Text style={[styles.evidenceBadge, styles.evidenceBadgeImg]}>
                {imgCount} image{imgCount > 1 ? 's' : ''}
              </Text>
            )}
          </View>
        ) : null}

      </View>

      {/* Chevron */}
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
    overflow: 'hidden',
    ...Shadow.card,
  },

  stripe:     { width: 4, backgroundColor: Colors.divider },
  stripeHigh: { backgroundColor: Colors.threatHigh },
  stripeMed:  { backgroundColor: Colors.threatMedium },
  stripeLow:  { backgroundColor: Colors.threatLow },

  body:   { flex: 1, padding: Spacing.base, gap: Spacing.sm },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  info:   { flex: 1 },

  // Avatar
  avatarImg: { resizeMode: 'cover', borderWidth: 1.5, borderColor: Colors.divider },
  avatarFallback: {
    backgroundColor: Colors.accentMuted,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.accent,
  },
  avatarInitials: { color: Colors.accent, fontWeight: '700' },

  // Name / alias
  name:       { ...Typography.heading3 },
  alias:      { ...Typography.caption, color: Colors.textSecondary, marginTop: 1 },
  genderText: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },

  // Meta row
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  pill: {
    backgroundColor: Colors.surfaceHigh, borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 3,
    borderWidth: 1, borderColor: Colors.divider,
  },
  pillText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  date:     { fontSize: 12, color: Colors.textMuted },
  location: { fontSize: 12, color: Colors.textMuted },

  // Flags
  flagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  flag: {
    backgroundColor: Colors.threatMedBg, borderRadius: Radius.sm,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: Colors.threatMedium,
  },
  flagDanger:     { backgroundColor: Colors.threatHighBg, borderColor: Colors.threatHigh },
  flagOrder:      { backgroundColor: 'rgba(99,102,241,0.08)', borderColor: '#6366F1' },
  flagText:       { fontSize: 11, fontWeight: '600', color: Colors.threatMedium },
  flagTextDanger: { color: Colors.threatHigh },
  flagTextOrder:  { color: '#6366F1' },

  // Evidence summary
  evidenceRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  evidenceText: { fontSize: 11, color: Colors.textMuted },
  evidenceBadge: {
    fontSize: 11, fontWeight: '600',
    color: Colors.accent,
    backgroundColor: Colors.accentMuted,
    paddingHorizontal: 6, paddingVertical: 1,
    borderRadius: Radius.sm, overflow: 'hidden',
    marginRight: 4,
  },
  evidenceBadgeImg: { color: '#10B981', backgroundColor: 'rgba(16,185,129,0.1)' },

  chevron: {
    fontSize: 26, color: Colors.textMuted,
    alignSelf: 'center',
    paddingRight: Spacing.base, paddingLeft: 0,
  },
});
