import { useState, useEffect, useRef } from 'react';

const HTML_IDS = ['home', 'about', 'projects', 'contact'];

function getSectionIndex(id) {
  return HTML_IDS.indexOf(id ?? '');
}

function getInitialSectionId() {
  if (typeof window === 'undefined') return 'home';
  const mid = window.scrollY + window.innerHeight / 2;
  const els = document.querySelectorAll('section[id]');
  let found = 'home';
  for (const el of els) {
    if (mid >= el.offsetTop && mid < el.offsetTop + el.offsetHeight) {
      found = el.id;
      break;
    }
  }
  return found;
}

export function useProjectsAnim() {
  const [dataAnim, setDataAnim] = useState(() =>
    getInitialSectionId() === 'projects' ? 'init' : null,
  );
  const currentIdRef = useRef(getInitialSectionId());
  const clearTimerRef = useRef(null);

  useEffect(() => {
    if (currentIdRef.current === 'projects') {
      clearTimerRef.current = setTimeout(() => setDataAnim(null), 800);
    }
    return () => clearTimeout(clearTimerRef.current);
  }, []);

  useEffect(() => {
    const handleSnapStart = (e) => {
      const targetId = e.detail?.id;
      if (!targetId) return;
      const current = currentIdRef.current;
      clearTimeout(clearTimerRef.current);

      if (current === 'projects' && targetId !== 'projects') {
        const isForward = getSectionIndex(targetId) > getSectionIndex(current);
        setDataAnim(isForward ? 'exit-fwd' : 'exit-bwd');
      } else if (targetId === 'projects' && current !== 'projects') {
        const isForward = getSectionIndex(targetId) > getSectionIndex(current);
        setDataAnim(isForward ? 'enter-fwd' : 'enter-bwd');
      }
    };

    const handleSectionChange = (e) => {
      const newId = e.detail?.id;
      if (!newId) return;
      currentIdRef.current = newId;
      clearTimeout(clearTimerRef.current);
      clearTimerRef.current = setTimeout(() => setDataAnim(null), 80);
    };

    window.addEventListener('page-snap-start', handleSnapStart);
    window.addEventListener('page-section-change', handleSectionChange);
    return () => {
      window.removeEventListener('page-snap-start', handleSnapStart);
      window.removeEventListener('page-section-change', handleSectionChange);
    };
  }, []);

  return dataAnim;
}
