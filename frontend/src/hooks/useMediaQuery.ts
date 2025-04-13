import { useState, useEffect } from 'react';

/**
 * Custom hook for handling media queries
 * @param query The media query to match
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);
  
  useEffect(() => {
    // Create media query list
    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);
    
    // Create event listener
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Add event listener
    mediaQuery.addEventListener('change', handler);
    
    // Clean up
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);
  
  return matches;
}

// Predefined media queries
export const mediaQueries = {
  xs: '(max-width: 599px)',
  sm: '(min-width: 600px) and (max-width: 959px)',
  md: '(min-width: 960px) and (max-width: 1279px)',
  lg: '(min-width: 1280px) and (max-width: 1919px)',
  xl: '(min-width: 1920px)',
  mobile: '(max-width: 959px)',
  tablet: '(min-width: 600px) and (max-width: 1279px)',
  desktop: '(min-width: 1280px)',
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',
};

/**
 * Custom hook for responsive design
 */
export function useResponsive() {
  const isXs = useMediaQuery(mediaQueries.xs);
  const isSm = useMediaQuery(mediaQueries.sm);
  const isMd = useMediaQuery(mediaQueries.md);
  const isLg = useMediaQuery(mediaQueries.lg);
  const isXl = useMediaQuery(mediaQueries.xl);
  const isMobile = useMediaQuery(mediaQueries.mobile);
  const isTablet = useMediaQuery(mediaQueries.tablet);
  const isDesktop = useMediaQuery(mediaQueries.desktop);
  const isPortrait = useMediaQuery(mediaQueries.portrait);
  const isLandscape = useMediaQuery(mediaQueries.landscape);
  
  return {
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    isMobile,
    isTablet,
    isDesktop,
    isPortrait,
    isLandscape,
  };
}
