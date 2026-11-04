export const useHaptic = () => {
  const tap = () => {
    if (navigator.vibrate) navigator.vibrate(20);
  };

  const success = () => {
    if (navigator.vibrate) navigator.vibrate([15, 10, 15]);
  };

  const warning = () => {
    if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
  };

  const error = () => {
    if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
  };

  return { tap, success, warning, error };
};