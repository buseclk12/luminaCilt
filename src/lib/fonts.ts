import { TextStyle } from "react-native";

const FONT = "Inter";

export const F = {
  h1: { fontFamily: `${FONT}_600SemiBold`, fontSize: 32, letterSpacing: -0.5, color: "#000" } as TextStyle,
  h2: { fontFamily: `${FONT}_500Medium`, fontSize: 24, letterSpacing: -0.3, color: "#000" } as TextStyle,
  h3: { fontFamily: `${FONT}_500Medium`, fontSize: 20, color: "#000" } as TextStyle,

  body: { fontFamily: `${FONT}_300Light`, fontSize: 14, color: "#000" } as TextStyle,
  bodyMedium: { fontFamily: `${FONT}_400Regular`, fontSize: 14, color: "#000" } as TextStyle,
  bodySemibold: { fontFamily: `${FONT}_500Medium`, fontSize: 14, color: "#000" } as TextStyle,
  bodyBold: { fontFamily: `${FONT}_600SemiBold`, fontSize: 14, color: "#000" } as TextStyle,

  caption: { fontFamily: `${FONT}_300Light`, fontSize: 12, color: "#999" } as TextStyle,
  captionMedium: { fontFamily: `${FONT}_400Regular`, fontSize: 12, color: "#999" } as TextStyle,

  label: { fontFamily: `${FONT}_500Medium`, fontSize: 13, color: "#000" } as TextStyle,
  button: { fontFamily: `${FONT}_600SemiBold`, fontSize: 15, color: "#FFF" } as TextStyle,

  light: `${FONT}_300Light`,
  regular: `${FONT}_400Regular`,
  medium: `${FONT}_500Medium`,
  semibold: `${FONT}_600SemiBold`,

  // Playfair Display — only for big headings, names, hero numbers
  heading: "PlayfairDisplay_600SemiBold",
  headingRegular: "PlayfairDisplay_400Regular",
};
