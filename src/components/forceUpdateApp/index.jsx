import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ReactNativeBlobUtil from 'react-native-blob-util';

// Disable Android hardware back button while this screen is mounted
const useBlockBackButton = () => {
  React.useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);
};

const ForceUpdateScreen = ({ apkUrl, latestVersion }) => {
  useBlockBackButton();
  const [progress, setProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);

  const handleUpdate = useCallback(async () => {
    if (downloading) return;
    setDownloading(true);
    setProgress(0);

    try {
      const { dirs } = ReactNativeBlobUtil.fs;
      const targetPath = `${dirs.CacheDir}/kobytech-update.apk`;

      const res = await ReactNativeBlobUtil.config({
            fileCache: true,
            path: targetPath,
            })
            .fetch('GET', apkUrl)
            .progress((received, total) => {
                if (total > 0) {
                setProgress(received / total);
                }
            });
      const filePath = res.path();

      if (Platform.OS === 'android') {
        ReactNativeBlobUtil.android.actionViewIntent(
          filePath,
          'application/vnd.android.package-archive',
        );
      }
    } catch (err) {
      console.warn('[ForceUpdate] download/install failed:', err);
      Alert.alert(
        'Update Failed',
        'We could not download the update. Please check your connection and try again.',
      );
    } finally {
      setDownloading(false);
    }
  }, [apkUrl, downloading]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        {/* Header icon */}
        <View style={styles.iconWrap}>
          <Icon name="system-update" size={48} color="#FF3B5C" />
        </View>

        <Text style={styles.title}>Update Required</Text>
        <Text style={styles.subtitle}>
          A new version of SOS App is available. Please update now to keep
          using the app and stay protected with the latest safety features.
        </Text>

        {/* Info card */}
        <View style={styles.card}>
          <View style={styles.updateItem}>
            <View style={[styles.updateIconWrap, styles.updateIconDenied]}>
              <Icon name="new-releases" size={22} color="#FF3B5C" />
            </View>
            <View style={styles.updateTextWrap}>
              <Text style={styles.updateLabel}>Latest Version</Text>
              <Text style={styles.updateDesc}>
                {latestVersion
                  ? `Version ${latestVersion} is ready to install.`
                  : 'A newer version is ready to install.'}
              </Text>
            </View>
            <View style={styles.rightWrap}>
              <View style={[styles.statusBadge, styles.statusDenied]}>
                <Text style={[styles.statusText, styles.statusTextDenied]}>
                  Required
                </Text>
              </View>
            </View>
          </View>

          {downloading && (
            <>
              <View style={styles.divider} />
              <View style={styles.progressSection}>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.round(progress * 100)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  Downloading… {Math.round(progress * 100)}%
                </Text>
              </View>
            </>
          )}
        </View>

        {!downloading && (
          <TouchableOpacity
            style={styles.enableBtn}
            activeOpacity={0.85}
            onPress={handleUpdate}>
            <Icon
              name="file-download"
              size={16}
              color="#FFFFFF"
              style={styles.enableBtnIcon}
            />
            <Text style={styles.enableBtnText}>Update Now</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.hint}>
          This update is mandatory and cannot be skipped.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020B1B',
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 40,
  },
  iconWrap: {
    height: 88,
    width: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,59,92,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,59,92,0.25)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
    maxWidth: 320,
  },
  card: {
    width: '100%',
    backgroundColor: '#0E1A33',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    marginBottom: 20,
  },
  updateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  updateIconWrap: {
    height: 42,
    width: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  updateIconDenied: {
    backgroundColor: 'rgba(255,59,92,0.12)',
  },
  updateTextWrap: {
    flex: 1,
    marginRight: 8,
  },
  updateLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  updateDesc: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    lineHeight: 16,
  },
  rightWrap: {
    alignItems: 'flex-end',
    minWidth: 70,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusDenied: {
    backgroundColor: 'rgba(255,59,92,0.15)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextDenied: {
    color: '#FF3B5C',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: -4,
  },
  progressSection: {
    paddingVertical: 14,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E6DFF',
    borderRadius: 4,
  },
  progressText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  enableBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E6DFF',
    borderRadius: 13,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: 'rgba(122,167,255,0.65)',
    shadowColor: '#2E6DFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 14,
  },
  enableBtnIcon: {
    marginRight: 8,
  },
  enableBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  hint: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default ForceUpdateScreen;