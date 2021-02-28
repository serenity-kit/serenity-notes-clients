import React, { useRef, useState } from "react";
import { View, StyleSheet, Animated, StyleProp, ViewStyle } from "react-native";

type FadeToParams = {
  animatedValue: Animated.Value;
  targetValue: number;
  isLast: boolean;
  delay?: number;
};

const styles = StyleSheet.create({
  block: {
    width: 10,
    height: 3,
    borderRadius: 1,
    marginTop: 2,
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 5,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
});

type Props = {
  animationActive: boolean;
  color: string;
  style?: StyleProp<ViewStyle>;
};

const opacityTarget = 0.2;

const UploadArrow = (props: Props) => {
  const [animationInProgress, setAnimationInProgress] = useState(false);
  const animatedValue1 = useRef(new Animated.Value(1)).current;
  const animatedValue2 = useRef(new Animated.Value(1)).current;
  const animatedValue3 = useRef(new Animated.Value(1)).current;

  function fadeTo({ animatedValue, targetValue, delay, isLast }: FadeToParams) {
    Animated.timing(animatedValue, {
      toValue: targetValue,
      duration: 1200,
      delay,
      useNativeDriver: false,
    }).start(() => {
      if (targetValue === opacityTarget) {
        // to make sure to finish the animation back to full opacity
        fadeTo({ animatedValue, targetValue: 1, isLast });
      } else if (isLast) {
        // after the last animation set the in progress to false
        setAnimationInProgress(false);
      }
    });
  }

  React.useEffect(() => {
    if (!animationInProgress && props.animationActive) {
      setAnimationInProgress(true);
      fadeTo({
        animatedValue: animatedValue1,
        targetValue: opacityTarget,
        delay: 300,
        isLast: false,
      });
      fadeTo({
        animatedValue: animatedValue2,
        targetValue: opacityTarget,
        delay: 600,
        isLast: false,
      });
      fadeTo({
        animatedValue: animatedValue3,
        targetValue: opacityTarget,
        delay: 900,
        isLast: true,
      });
    }
  }, [props.animationActive, animationInProgress]);

  return (
    <View>
      <Animated.View
        style={[
          styles.triangle,
          { borderBottomColor: props.color, opacity: animatedValue3 },
        ]}
      />
      <Animated.View
        style={[
          styles.block,
          { backgroundColor: props.color, opacity: animatedValue2 },
        ]}
      />
      <Animated.View
        style={[
          styles.block,
          { backgroundColor: props.color, opacity: animatedValue1 },
        ]}
      />
    </View>
  );
};

export default UploadArrow;
