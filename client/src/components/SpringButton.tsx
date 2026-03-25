import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface SpringButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
}

export default function SpringButton({ children, onPressIn, onPressOut, style, ...rest }: SpringButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (e: any) => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    scale.value = withSpring(1.0, { damping: 15, stiffness: 150 });
    onPressOut?.(e);
  };

  return (
    <AnimatedTouchable
      style={[animatedStyle, style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      {...rest}
    >
      {children}
    </AnimatedTouchable>
  );
}
