import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { PushNotifications } from '@capacitor/push-notifications';

/**
 * Check if the application is running inside a native iOS or Android app wrapper.
 */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Get current platform identifier ('web', 'ios', 'android').
 */
export function getPlatform(): string {
  return Capacitor.getPlatform();
}

/**
 * Trigger subtle haptic feedback for user interactions (e.g. accepting trade, submitting offer).
 */
export async function triggerHaptic(style: ImpactStyle = ImpactStyle.Light): Promise<void> {
  if (isNativePlatform()) {
    try {
      await Haptics.impact({ style });
    } catch {
      // Ignore if haptics unavailable
    }
  }
}

/**
 * Capture a photo using device native camera or gallery picker.
 * Returns base64 image data URL or file URI.
 */
export async function takeNativePhoto(): Promise<string | undefined> {
  if (!isNativePlatform()) {
    return undefined;
  }

  try {
    const image = await Camera.getPhoto({
      quality: 85,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
    });

    return image.dataUrl;
  } catch (error) {
    console.warn("Camera photo capture cancelled or failed:", error);
    return undefined;
  }
}

/**
 * Register native device push notifications for offer alerts and trade messages.
 */
export async function initPushNotifications(onTokenReceived?: (token: string) => void): Promise<void> {
  if (!isNativePlatform()) return;

  try {
    const permStatus = await PushNotifications.requestPermissions();
    if (permStatus.receive === 'granted') {
      await PushNotifications.register();

      PushNotifications.addListener('registration', (token) => {
        if (onTokenReceived) {
          onTokenReceived(token.value);
        }
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received in foreground:', notification);
      });
    }
  } catch (error) {
    console.warn('Push notification initialization error:', error);
  }
}
