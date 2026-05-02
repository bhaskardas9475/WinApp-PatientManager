import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  Animated,
  StyleSheet,
  Text,
  Dimensions,
  ViewStyle,
  TextStyle,
} from "react-native";

const { width } = Dimensions.get("window");

// 1. Types
type ToastType = "success" | "error";
interface ToastOptions {
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastRef {
  show: (options: ToastOptions) => void;
}

// 2. The Static Object (The "Magic" part)
// This holds a reference to the provider's internal 'show' function
let toastRef: ToastRef | null = null;

export const Toast = {
  success: (message: string, duration = 3000) => {
    toastRef?.show({ message, type: "success", duration });
  },
  error: (message: string, duration = 3000) => {
    toastRef?.show({ message, type: "error", duration });
  },
};

// 3. The Animated Component
const ToastComponent = forwardRef<ToastRef>((_, ref) => {
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("success");
  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;

  useImperativeHandle(ref, () => ({
    show({ message, type, duration }) {
      setMessage(message);
      setType(type);
      setVisible(true);

      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.delay(duration || 3000),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => setVisible(false));
    },
  }));

  if (!visible) return null;

  const backgroundColor = type === "success" ? "#2e7d32" : "#d32f2f";

  return (
    <Animated.View style={[styles.toast, { opacity, backgroundColor }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
});

// 4. The Provider
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const internalRef = useRef<ToastRef>(null);

  // Assign the internal ref to our static object when the provider mounts
  React.useEffect(() => {
    toastRef = internalRef.current;
  }, []);

  return (
    <>
      {children}
      <ToastComponent ref={internalRef} />
    </>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    top: 40, // Perfect for Windows window headers
    width: Math.min(width * 0.8, 400),
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    zIndex: 9999,
  } as ViewStyle,
  text: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 14,
  } as TextStyle,
});
