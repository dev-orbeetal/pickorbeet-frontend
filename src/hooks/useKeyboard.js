import { useEffect, useCallback } from 'react';

/**
 * Custom hook for keyboard event handling
 * @param {string} key - The key to listen for
 * @param {Function} callback - Callback function when key is pressed
 * @param {Object} options - Options for the event listener
 * @param {boolean} options.ctrl - Require Ctrl/Cmd key
 * @param {boolean} options.shift - Require Shift key
 * @param {boolean} options.alt - Require Alt key
 * @param {boolean} options.preventDefault - Prevent default behavior
 */
export function useKeyboard(key, callback, options = {}) {
  const { ctrl = false, shift = false, alt = false, preventDefault = true } = options;

  const handleKeyDown = useCallback(
    (event) => {
      const isCtrlPressed = event.ctrlKey || event.metaKey;
      const isShiftPressed = event.shiftKey;
      const isAltPressed = event.altKey;

      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        isCtrlPressed === ctrl &&
        isShiftPressed === shift &&
        isAltPressed === alt
      ) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback(event);
      }
    },
    [key, callback, ctrl, shift, alt, preventDefault]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

/**
 * Hook for Escape key handling
 * @param {Function} callback - Callback when Escape is pressed
 */
export function useEscapeKey(callback) {
  useKeyboard('Escape', callback, { preventDefault: false });
}

export default useKeyboard;
