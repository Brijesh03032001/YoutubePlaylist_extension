/**
 * DOM utility functions for safe element manipulation
 */

const DOMUtils = {
  /**
   * Wait for element to appear in DOM
   * @param {string} selector - CSS selector
   * @param {number} timeout - Max wait time in ms
   * @returns {Promise<Element|null>}
   */
  waitForElement(selector, timeout = 10000) {
    return new Promise((resolve) => {
      // Check if element already exists
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      // Set up observer
      const observer = new MutationObserver((mutations, obs) => {
        const element = document.querySelector(selector);
        if (element) {
          obs.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Timeout fallback
      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    });
  },

  /**
   * Safely query selector with error handling
   * @param {string} selector - CSS selector
   * @param {Element} parent - Parent element (default: document)
   * @returns {Element|null}
   */
  safeQuery(selector, parent = document) {
    try {
      return parent.querySelector(selector);
    } catch (error) {
      console.error(`[DOM] Error querying selector "${selector}":`, error);
      return null;
    }
  },

  /**
   * Safely query all elements
   * @param {string} selector - CSS selector
   * @param {Element} parent - Parent element (default: document)
   * @returns {Element[]}
   */
  safeQueryAll(selector, parent = document) {
    try {
      return Array.from(parent.querySelectorAll(selector));
    } catch (error) {
      console.error(`[DOM] Error querying selector "${selector}":`, error);
      return [];
    }
  },

  /**
   * Create element with attributes and content
   * @param {string} tag - HTML tag name
   * @param {object} attributes - Element attributes
   * @param {string|Element} content - Inner content
   * @returns {Element}
   */
  createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    // Set attributes
    Object.keys(attributes).forEach(key => {
      if (key === 'class') {
        element.className = attributes[key];
      } else if (key === 'style' && typeof attributes[key] === 'object') {
        Object.assign(element.style, attributes[key]);
      } else {
        element.setAttribute(key, attributes[key]);
      }
    });

    // Set content
    if (typeof content === 'string') {
      element.innerHTML = content;
    } else if (content instanceof Element) {
      element.appendChild(content);
    }

    return element;
  },

  /**
   * Remove element safely
   * @param {string|Element} elementOrSelector - Element or selector
   */
  removeElement(elementOrSelector) {
    try {
      const element = typeof elementOrSelector === 'string' 
        ? document.querySelector(elementOrSelector)
        : elementOrSelector;
      
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    } catch (error) {
      console.error('[DOM] Error removing element:', error);
    }
  },

  /**
   * Add class with animation support
   * @param {Element} element - Target element
   * @param {string} className - Class to add
   */
  addClassWithAnimation(element, className) {
    if (!element) return;
    
    requestAnimationFrame(() => {
      element.classList.add(className);
    });
  },

  /**
   * Remove class with animation support
   * @param {Element} element - Target element
   * @param {string} className - Class to remove
   */
  removeClassWithAnimation(element, className) {
    if (!element) return;
    
    requestAnimationFrame(() => {
      element.classList.remove(className);
    });
  },

  /**
   * Inject styles into page
   * @param {string} css - CSS string
   * @param {string} id - Style element ID
   */
  injectStyles(css, id = 'ytpp-styles') {
    // Remove existing if present
    const existing = document.getElementById(id);
    if (existing) {
      existing.remove();
    }

    const style = document.createElement('style');
    style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
  },

  /**
   * Get text content safely
   * @param {Element} element - Element
   * @returns {string}
   */
  getTextContent(element) {
    if (!element) return '';
    return element.textContent?.trim() || '';
  },

  /**
   * Check if element is visible
   * @param {Element} element - Element to check
   * @returns {boolean}
   */
  isVisible(element) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && 
           window.getComputedStyle(element).visibility !== 'hidden';
  },

  /**
   * Smooth scroll to element
   * @param {Element} element - Target element
   * @param {string} behavior - Scroll behavior
   */
  scrollToElement(element, behavior = 'smooth') {
    if (!element) return;
    
    element.scrollIntoView({
      behavior,
      block: 'center'
    });
  },

  /**
   * Debounce function
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in ms
   * @returns {Function}
   */
  debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle function
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in ms
   * @returns {Function}
   */
  throttle(func, limit = 300) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DOMUtils;
}
