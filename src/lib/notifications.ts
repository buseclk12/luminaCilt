import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import i18n from "../i18n";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleRoutineReminders(
  morningHour: number = 8,
  morningMinute: number = 0,
  eveningHour: number = 21,
  eveningMinute: number = 0
) {
  // Cancel existing
  await Notifications.cancelAllScheduledNotificationsAsync();

  const lang = i18n.language;

  // Morning reminder
  await Notifications.scheduleNotificationAsync({
    content: {
      title: lang === "tr" ? "Sabah Rutini Vakti! ☀️" : "Morning Routine Time! ☀️",
      body: lang === "tr"
        ? "Gunaydın! Cildini uyandırma vakti. Temizleyicini hazırla ve güneş kremini unutma!"
        : "Good morning! Time to wake up your skin. Prepare your cleanser and don't forget sunscreen!",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: morningHour,
      minute: morningMinute,
    },
  });

  // Evening reminder
  await Notifications.scheduleNotificationAsync({
    content: {
      title: lang === "tr" ? "Akşam Rutini Vakti! 🌙" : "Evening Routine Time! 🌙",
      body: lang === "tr"
        ? "Günün yorgunluğunu cildinden atma vakti. Çift aşamalı temizliğe ne dersin?"
        : "Time to cleanse the day away. How about a double cleanse tonight?",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: eveningHour,
      minute: eveningMinute,
    },
  });
}

export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
