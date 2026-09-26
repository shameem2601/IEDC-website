import { useState, useEffect } from 'react';

interface ScrollPositionState {
  scrollY: number;
  isScrolled: boolean;
  isPastHero: boolean;
}

/**
 * Custom hook to track scroll position and detect when the user has scrolled
 * past a pixel threshold (default 90px down, 50px up hysteresis) and past the hero section (#home).
 */
export function useScrollPosition(
  threshold = 90,
  resetThreshold = 50
): ScrollPositionState {
  const [scrollState, setScrollState] = useState<ScrollPositionState>({
    scrollY: 0,
    isScrolled: false,
    isPastHero: false,
  });

  useEffect(() => {
    let ticking = false;
    let currentlyScrolled = false;

    const checkScroll = () => {
      const currentScrollY = window.scrollY;

      // Hysteresis calculation to prevent jitter/flicker at the boundary
      let isPastThreshold = currentlyScrolled;
      if (!currentlyScrolled && currentScrollY > threshold) {
        isPastThreshold = true;
      } else if (currentlyScrolled && currentScrollY < resetThreshold) {
        isPastThreshold = false;
      }
      currentlyScrolled = isPastThreshold;

      // Detect if scrolled past the hero section (#home)
      const heroElement = document.getElementById('home');
      let pastHero = false;

      if (heroElement) {
        const heroBottom = heroElement.offsetTop + heroElement.offsetHeight;
        pastHero = currentScrollY >= heroBottom - 90;
      } else {
        pastHero = currentScrollY > window.innerHeight * 0.8;
      }

      setScrollState({
        scrollY: currentScrollY,
        isScrolled: isPastThreshold,
        isPastHero: pastHero,
      });

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(checkScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    checkScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [threshold, resetThreshold]);

  return scrollState;
}
