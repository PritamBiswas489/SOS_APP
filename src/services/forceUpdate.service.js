import DeviceInfo from 'react-native-device-info';
import { APK_DOWNLOAD_URL } from '../../environment';

const CHECK_UPDATE_URL =
  APK_DOWNLOAD_URL; // Replace with your backend endpoint that returns the latest version info

// Compares "a.b.c" style version strings.
// Returns: -1 if a < b, 0 if equal, 1 if a > b
export const compareVersions = (a, b) => {
  const pa = String(a).split('.').map(Number);
  const pb = String(b).split('.').map(Number);
  const len = Math.max(pa.length, pb.length);

  for (let i = 0; i < len; i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
};

/**
 * Checks the backend for the latest APK version and compares it
 * against the currently installed app version.
 *
 * Returns:
 *  { updateRequired: boolean, latestVersion: string, apkUrl: string, installedVersion: string }
 */
export const checkForUpdate = async () => {
  const installedVersion = DeviceInfo.getVersion(); // reads versionName from build.gradle

  const response = await fetch(CHECK_UPDATE_URL);
  if (!response.ok) {
    throw new Error(`Update check failed with status ${response.status}`);
  }

  const json = await response.json();
  const latestVersion = json?.data?.version;
  const apkUrl = json?.data?.apkFile;

  if (!latestVersion || !apkUrl) {
    throw new Error('Malformed update-check response: missing version or apkFile');
  }

  const updateRequired = compareVersions(installedVersion, latestVersion) < 0;

  return { updateRequired, latestVersion, apkUrl, installedVersion };
};