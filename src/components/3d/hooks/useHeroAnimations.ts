import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

export function useHeroAnimations() {
  const scroll = useScroll();
  
  const logoRef = useRef<HTMLElement | null>(null);
  const heroDescRef = useRef<HTMLElement | null>(null);
  const progressBarRef = useRef<HTMLElement | null>(null);
  const aboutSectionRef = useRef<HTMLElement | null>(null);
  const aboutText1Ref = useRef<HTMLElement | null>(null);
  const aboutText2Ref = useRef<HTMLElement | null>(null);

  useFrame((state) => {
    const s = scroll.offset;

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
    if (aboutSection) {
       if (s > 0.25) {
          const fade = 1 - THREE.MathUtils.clamp((s - 0.25) / 0.05, 0, 1);
          aboutSection.style.opacity = `${fade}`;
       } else {
          aboutSection.style.opacity = '1';
       }
    }

    const progress1 = THREE.MathUtils.clamp((s - 0.05) / 0.1, 0, 1);
    const progress2 = THREE.MathUtils.clamp((s - 0.1) / 0.1, 0, 1); 
    
    if (!aboutText1Ref.current) aboutText1Ref.current = document.getElementById('about-text-1');
    const text1 = aboutText1Ref.current;
    if (text1) {
       const clipRight = (1 - progress1) * 100;
       text1.style.clipPath = `inset(0 ${clipRight}% 0 0)`;
    }
    
    if (!aboutText2Ref.current) aboutText2Ref.current = document.getElementById('about-text-2');
    const text2 = aboutText2Ref.current;
    if (text2) {
       const clipRight = (1 - progress2) * 100;
       text2.style.clipPath = `inset(0 ${clipRight}% 0 0)`;
    }
  });
}
