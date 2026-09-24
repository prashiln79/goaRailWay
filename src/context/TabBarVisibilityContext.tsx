import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import {
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

interface TabBarVisibilityContextType {
  translateY: Animated.Value;
  isTabBarVisible: boolean;
  showTabBar: () => void;
  hideTabBar: () => void;
  handleScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

const TabBarVisibilityContext = createContext<TabBarVisibilityContextType>({
  translateY: new Animated.Value(0),
  isTabBarVisible: true,
  showTabBar: () => {},
  hideTabBar: () => {},
  handleScroll: () => {},
});

export const TabBarVisibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);
  const isVisibleRef = useRef(true);

  // Accumulated scroll tracking to handle both fast flicks and slow drags
  const lastScrollY = useRef(0);
  const accumulatedDistance = useRef(0);

  const showTabBar = useCallback(() => {
    if (!isVisibleRef.current) {
      isVisibleRef.current = true;
      setIsTabBarVisible(true);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [translateY]);

  const hideTabBar = useCallback(() => {
    if (isVisibleRef.current) {
      isVisibleRef.current = false;
      setIsTabBarVisible(false);
      Animated.timing(translateY, {
        toValue: 130, // Fully slides below device viewport
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [translateY]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
      const currentY = contentOffset.y;

      // 1. Always show tab bar if user is near top (or rubber-banding)
      if (currentY <= 20) {
        accumulatedDistance.current = 0;
        lastScrollY.current = Math.max(0, currentY);
        showTabBar();
        return;
      }

      // 2. Always show tab bar if user reaches the bottom of the list
      const isAtBottom =
        layoutMeasurement.height + currentY >= contentSize.height - 25;
      if (isAtBottom) {
        accumulatedDistance.current = 0;
        lastScrollY.current = currentY;
        showTabBar();
        return;
      }

      const dy = currentY - lastScrollY.current;

      // 3. User is scrolling down
      if (dy > 0) {
        if (accumulatedDistance.current < 0) {
          accumulatedDistance.current = 0;
        }
        accumulatedDistance.current += dy;

        // Hide after scrolling down 25px
        if (accumulatedDistance.current > 25 && currentY > 40) {
          hideTabBar();
        }
      }
      // 4. User is scrolling up
      else if (dy < 0) {
        if (accumulatedDistance.current > 0) {
          accumulatedDistance.current = 0;
        }
        accumulatedDistance.current += dy;

        // Show after scrolling up 15px
        if (Math.abs(accumulatedDistance.current) > 15) {
          showTabBar();
        }
      }

      lastScrollY.current = currentY;
    },
    [showTabBar, hideTabBar]
  );

  return (
    <TabBarVisibilityContext.Provider
      value={{
        translateY,
        isTabBarVisible,
        showTabBar,
        hideTabBar,
        handleScroll,
      }}
    >
      {children}
    </TabBarVisibilityContext.Provider>
  );
};

export const useTabBarVisibility = () => useContext(TabBarVisibilityContext);
