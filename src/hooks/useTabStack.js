import { useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function useTabStack() {
  const navigate = useNavigate();
  const location = useLocation();
  const stacksRef = useRef({
    '/': ['/'],
    '/social-analysis': ['/social-analysis'],
    '/thinking-report': ['/thinking-report'],
    '/boundaries': ['/boundaries'],
    '/maslow': ['/maslow'],
    '/self-awareness': ['/self-awareness'],
    '/spiritual': ['/spiritual'],
  });
  const currentTabRef = useRef('/');

  const getCurrentTab = useCallback((pathname) => {
    const tabs = Object.keys(stacksRef.current);
    for (const tab of tabs) {
      if (pathname === tab || stacksRef.current[tab].includes(pathname)) {
        return tab;
      }
    }
    return '/';
  }, []);

  const pushToStack = useCallback((path) => {
    const currentTab = getCurrentTab(location.pathname);
    currentTabRef.current = currentTab;
    
    // Add to current tab's stack
    const stack = stacksRef.current[currentTab];
    if (stack[stack.length - 1] !== path) {
      stack.push(path);
    }
  }, [getCurrentTab, location.pathname]);

  const switchTab = useCallback((tabPath) => {
    const prevTab = currentTabRef.current;
    currentTabRef.current = tabPath;
    
    // Get the last route in the new tab's stack
    const stack = stacksRef.current[tabPath];
    const lastPath = stack[stack.length - 1] || tabPath;
    
    if (lastPath !== location.pathname) {
      navigate(lastPath);
    }
  }, [navigate, location.pathname]);

  const goBack = useCallback(() => {
    const currentTab = getCurrentTab(location.pathname);
    const stack = stacksRef.current[currentTab];
    
    if (stack.length > 1) {
      // Pop from current tab's stack
      stack.pop();
      const previousPath = stack[stack.length - 1];
      navigate(previousPath);
      return true;
    }
    
    return false; // No more stack, allow app exit
  }, [getCurrentTab, location.pathname, navigate]);

  const updateStack = useCallback((pathname) => {
    const currentTab = getCurrentTab(pathname);
    currentTabRef.current = currentTab;
    const stack = stacksRef.current[currentTab];
    
    if (stack[stack.length - 1] !== pathname) {
      stack.push(pathname);
    }
  }, [getCurrentTab]);

  return {
    pushToStack,
    switchTab,
    goBack,
    updateStack,
    getCurrentTab,
    getStack: (tab) => stacksRef.current[tab],
  };
}