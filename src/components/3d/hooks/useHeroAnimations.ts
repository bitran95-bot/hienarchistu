import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import { useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';

export function useHeroAnimations() {
  const scroll = useScroll();
  const reducedMotion = useReducedMotion();
  const previous = useRef({ offset: -1, width: 0, height: 0, reduced: reducedMotion });
  const easedOffset = useRef(0);
  const previousAbout = useRef<boolean | null>(null);
  
  const logoRef = useRef<HTMLElement | null>(null);
  const heroDescRef = useRef<HTMLElement | null>(null);
  const progressBarRef = useRef<HTMLElement | null>(null);
  const aboutSectionRef = useRef<HTMLElement | null>(null);
  const aboutText1Ref = useRef<HTMLElement | null>(null);
  const aboutText2Ref = useRef<HTMLElement | null>(null);
  const aboutDividerRef = useRef<HTMLElement | null>(null);

  useFrame((state, delta) => {
    // Read the element directly: ScrollControls' offset can lag behind a menu jump.
    const target = THREE.MathUtils.clamp(
      scroll.el.scrollTop / Math.max(1, scroll.el.scrollHeight - scroll.el.clientHeight), 0, 1,
    );
    const s = reducedMotion ? target : THREE.MathUtils.damp(easedOffset.current, target, 7, Math.min(delta, 0.05));
    easedOffset.current = s;
    const last = previous.current;
    if (Math.abs(last.offset - s) < .00001 && last.width === state.size.width && last.height === state.size.height && last.reduced === reducedMotion && aboutText1Ref.current && aboutText2Ref.current) return;
    previous.current = { offset: s, width: state.size.width, height: state.size.height, reduced: reducedMotion };

    // Progress Bar
    if (!progressBarRef.current) progressBarRef.current = document.getElementById('scroll-progress-bar');
    const progressBar = progressBarRef.current;
    if (progressBar) progressBar.style.width = `${s * 100}%`;

    // --- Animate Main Logo ---
    if (!logoRef.current) logoRef.current = document.getElementById('main-logo');
    const logo = logoRef.current;
    if (logo) {
      const isMobile = state.size.width < 768;
      const t = Math.min(s / 0.15, 1); 
      const easeT = t * (2 - t); // easeOut quadratic
      
      const startTop = state.size.height * (isMobile ? 0.35 : 0.4);
      const startLeft = state.size.width * (isMobile ? 0.5 : 0.25);
      const endTop = isMobile ? 40 : 60; 
      const endLeft = isMobile ? state.size.width / 2 : 140; 
      
      const currentTop = THREE.MathUtils.lerp(startTop, endTop, easeT);
      const currentLeft = THREE.MathUtils.lerp(startLeft, endLeft, easeT);
      const scale = THREE.MathUtils.lerp(1, isMobile ? 0.3 : 0.15, easeT);
      
      logo.style.top = `${currentTop}px`;
      logo.style.left = `${currentLeft}px`;
      logo.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }

    // --- Fade out Hero Description ---
    if (!heroDescRef.current) heroDescRef.current = document.getElementById('hero-desc');
    const heroDesc = heroDescRef.current;
    if (heroDesc) {
      const t = Math.min(s / 0.1, 1);
      heroDesc.style.opacity = `${1 - t}`;
    }

    // --- Animate About Section ---
    if (!aboutSectionRef.current) aboutSectionRef.current = document.getElementById('about-section');
    const aboutSection = aboutSectionRef.current;
    const isAboutVisible = s > 0.05 && s < 0.42;
    if (aboutSection) {
       // Ease the section's travel while the visitor reads both paragraphs.
       const readableOffset = s <= 0.12 ? s : 0.12 + (s - 0.12) * 0.55;
       const scrollY = state.size.height * (scroll.pages - 1) * readableOffset;
       aboutSection.style.transform = `translate3d(0, calc(-50% - ${scrollY}px), 0)`;
       if (s > 0.355) {
          const fade = 1 - THREE.MathUtils.clamp((s - 0.355) / 0.065, 0, 1);
          aboutSection.style.opacity = `${fade}`;
       } else {
          aboutSection.style.opacity = '1';
       }
    }
    // Dispatch event for header nav highlight (Bug #2 fix)
    if (previousAbout.current !== isAboutVisible) {
      previousAbout.current = isAboutVisible;
      window.dispatchEvent(new CustomEvent('about-section-visible', { detail: { visible: isAboutVisible } }));
    }

    const progress1 = THREE.MathUtils.smoothstep(s, 0.035, 0.105);
    const dividerProgress = THREE.MathUtils.smoothstep(s, 0.11, 0.125);
    const progress2 = THREE.MathUtils.smoothstep(s, 0.13, 0.205);

    const reveal = (element: HTMLElement, progress: number, rise: number) => {
      const amount = reducedMotion ? Number(s > 0.035) : progress;
      element.style.setProperty('--about-ink', `${amount * 112}%`);
      element.style.opacity = amount === 0 ? '0' : '1';
      element.style.transform = `translate3d(0, ${(1 - amount) * rise}px, 0)`;
    };
    
    if (!aboutText1Ref.current) aboutText1Ref.current = document.getElementById('about-text-1');
    const text1 = aboutText1Ref.current;
    if (text1) reveal(text1, progress1, 16);

    if (!aboutDividerRef.current) aboutDividerRef.current = document.getElementById('about-divider');
    const divider = aboutDividerRef.current;
    if (divider) divider.style.transform = `scaleX(${reducedMotion ? Number(s > 0.035) : dividerProgress})`;
    
    if (!aboutText2Ref.current) aboutText2Ref.current = document.getElementById('about-text-2');
    const text2 = aboutText2Ref.current;
    if (text2) reveal(text2, progress2, 20);
  });
}
