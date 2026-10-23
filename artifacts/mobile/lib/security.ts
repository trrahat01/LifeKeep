import * as LocalAuthentication from "expo-local-authentication";
import * as Crypto from "expo-crypto";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LOCK_SETTINGS_KEY = "@lifevault_lock_settings";

export interface LockSettings {
  enabled: boolean;
  useBiometrics: boolean;
  pinHash: string | null;
  autoLockDelay: number; // in seconds (0 = immediately)
}

const DEFAULT_SETTINGS: LockSettings = {
  enabled: false,
  useBiometrics: false,
  pinHash: null,
  autoLockDelay: 0,
};

export async function hashPin(pin: string): Promise<string> {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    pin
  );
}

export async function getLockSettings(): Promise<LockSettings> {
  try {
    const raw = await AsyncStorage.getItem(LOCK_SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveLockSettings(settings: LockSettings): Promise<void> {
  await AsyncStorage.setItem(LOCK_SETTINGS_KEY, JSON.stringify(settings));
}

export async function checkBiometricSupport(): Promise<{
  hasHardware: boolean;
  isEnrolled: boolean;
}> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return { hasHardware, isEnrolled };
  } catch {
    return { hasHardware: false, isEnrolled: false };
  }
}

export async function authenticateWithBiometrics(
  promptMessage = "Unlock LifeKeep"
): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: "Enter PIN",
      cancelLabel: "Cancel",
      disableDeviceFallback: true,
    });
    return result.success;
  } catch {
    return false;
  }
}

// Simple payload obfuscation / light encryption for local storage protection
export async function encryptPayload(data: string, secretKey: string): Promise<string> {
  try {
    const keyHash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, secretKey);
    let result = "";
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i) ^ keyHash.charCodeAt(i % keyHash.length);
      result += String.fromCharCode(charCode);
    }
    return "ENC:" + btoa(result);
  } catch {
    return data;
  }
}

export async function decryptPayload(encryptedData: string, secretKey: string): Promise<string> {
  try {
    if (!encryptedData.startsWith("ENC:")) return encryptedData;
    const rawEnc = atob(encryptedData.slice(4));
    const keyHash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, secretKey);
    let result = "";
    for (let i = 0; i < rawEnc.length; i++) {
      const charCode = rawEnc.charCodeAt(i) ^ keyHash.charCodeAt(i % keyHash.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch {
    return encryptedData;
  }
}
