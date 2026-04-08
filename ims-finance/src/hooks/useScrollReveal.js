import { useEffect, useRef } from 'react';

/**
 * Adds .revealed class to every .reveal element as it enters the viewport.
 * Call once at the root App level.
 */
export function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    );

    const elements = document.querySelectorAll('.reveal');
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  });
}
