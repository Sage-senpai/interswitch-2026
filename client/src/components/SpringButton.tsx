import React, { useRef } from 'react';
import { Animated, TouchableOpacity, TouchableOpacityProps } from 'react-native';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface SpringButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
}

export default function SpringButton({ children, onPressIn, onPressOut, style, ...rest }: SpringButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = (e: any) => {
    Animated.spring(scale, {
      toValue: 0.95,
      damping: 15,
      stiffness: 150,
      useNativeDriver: true,
    }).start();
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    Animated.spring(scale, {
      toValue: 1.0,
      damping: 15,
      stiffness: 150,
      useNativeDriver: true,
    }).start();
    onPressOut?.(e);
  };

  return (
    <AnimatedTouchable
      style={[{ transform: [{ scale }] }, style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      {...rest}
    >
      {children}
    </AnimatedTouchable>
  );
}
