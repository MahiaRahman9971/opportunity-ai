/**
 * Utility functions for scroll-based animations
 * Uses Intersection Observer API to detect when elements enter the viewport
 */

/**
 * Initialize scroll animations for sections
 * This function adds the necessary classes and observers to animate sections on scroll
 * @returns The IntersectionObserver instance or null if not on client side
 */
export function initScrollAnimations(): IntersectionObserver | null {
  // Only run on client side
  if (typeof window === 'undefined') return null;

  // Options for the Intersection Observer
  const options = {
    root: null, // Use the viewport as the root
    rootMargin: '-50px', // Trigger a bit earlier (50px before element enters viewport)
    threshold: 0.05, // Trigger when just 5% of the target is visible
  };

  // Create an observer instance
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      // If the element is in the viewport
      if (entry.isIntersecting) {
        // Add the visible class to trigger the animation
        entry.target.classList.add('animate-section-visible');
        // Once the animation has played, we can stop observing this element
        observer.unobserve(entry.target);
      }
    });
  }, options);

  // Get all sections with the animate-section class
  const sections = document.querySelectorAll('.animate-section');
  
  // Immediately check if any sections are already visible (important for initial load)
  sections.forEach((section) => {
    // Check if the section is already in the viewport
    const rect = section.getBoundingClientRect();
    const isVisible = (
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.bottom >= 0
    );
    
    // If already visible, make it visible immediately without animation
    if (isVisible) {
      section.classList.add('animate-section-visible');
    } else {
      // Otherwise observe it for future visibility
      observer.observe(section);
    }
  });

  return observer;
}

/**
 * Clean up scroll animations by disconnecting the observer
 * @param observer The IntersectionObserver instance to disconnect
 */
export function cleanupScrollAnimations(observer: IntersectionObserver | null) {
  if (observer) {
    observer.disconnect();
  }
}
