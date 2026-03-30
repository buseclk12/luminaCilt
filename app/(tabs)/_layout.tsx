import { Tabs } from "expo-router";
import { View, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

const TAB_ICONS: { name: keyof typeof Ionicons.glyphMap; focusedName: keyof typeof Ionicons.glyphMap }[] = [
  { name: "home-outline", focusedName: "home" },
  { name: "grid-outline", focusedName: "grid" },
  { name: "checkmark-circle-outline", focusedName: "checkmark-circle" },
  { name: "person-outline", focusedName: "person" },
];

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <View style={{
      position: "absolute",
      bottom: Platform.OS === "ios" ? 32 : 20,
      left: 0,
      right: 0,
      alignItems: "center",
    }}>
      <View style={{
        flexDirection: "row",
        backgroundColor: "#1A1A1A",
        borderRadius: 28,
        height: 48,
        alignItems: "center",
        paddingHorizontal: 8,
        gap: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
      }}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const icon = TAB_ICONS[index];

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              activeOpacity={0.7}
              style={{
                width: focused ? 44 : 40,
                height: focused ? 44 : 40,
                borderRadius: focused ? 22 : 20,
                backgroundColor: focused ? "#FFFFFF" : "transparent",
                alignItems: "center",
                justifyContent: "center",
                marginTop: focused ? -4 : 0,
              }}
            >
              <Ionicons
                name={focused ? icon.focusedName : icon.name}
                size={20}
                color={focused ? "#000000" : "#888888"}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: "#FFF" }}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="products" />
        <Tabs.Screen name="routine" />
        <Tabs.Screen name="profile" />
      </Tabs>
    </View>
  );
}
