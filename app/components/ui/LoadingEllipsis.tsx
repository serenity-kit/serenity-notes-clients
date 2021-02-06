import React, { useRef } from "react";
import { Text, StyleSheet, Animated } from "react-native";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderColor: "green",
    borderWidth: 1,
  },
});

type FadeToParams = {
  dot: Animated.Value;
  targetValue: number;
  delay?: number;
};

function fadeTo({ dot, targetValue, delay }: FadeToParams) {
  Animated.timing(dot, {
    toValue: targetValue,
    duration: 1500,
    delay,
    useNativeDriver: false,
  }).start(() => fadeTo({ dot, targetValue: targetValue === 1 ? 0 : 1 }));
}

const LoadingEllipsis = () => {
  const dotOne = useRef(new Animated.Value(0.1)).current;
  const dotTwo = useRef(new Animated.Value(0.1)).current;
  const dotThree = useRef(new Animated.Value(0.1)).current;

  React.useEffect(() => {
    fadeTo({ dot: dotOne, targetValue: 1, delay: 200 });
    fadeTo({ dot: dotTwo, targetValue: 1, delay: 500 });
    fadeTo({ dot: dotThree, targetValue: 1, delay: 800 });
  }, []);

  return (
    <Text>
      <Animated.Text style={{ opacity: dotOne }}>.</Animated.Text>
      <Animated.Text style={{ opacity: dotTwo }}>.</Animated.Text>
      <Animated.Text style={{ opacity: dotThree }}>.</Animated.Text>
    </Text>
  );
};

export default LoadingEllipsis;
