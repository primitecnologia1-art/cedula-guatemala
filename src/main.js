import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initFilm } from './film.js';
import { initSecurity } from './security.js';
import { initLanguage, t } from './i18n.js';

gsap.registerPlugin(ScrollTrigger);
// This module owns resize refreshes, including the temporary viewport changes of native cinema.
ScrollTrigger.config({ ignoreMobileResize: true, autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load' });
initLanguage();
initFilm();
const securityReady = initSecurity();
const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
const desktopQuery = matchMedia('(min-width: 1000px) and (min-height: 650px) and (pointer: fine)');
const mobilePinQuery = matchMedia('(max-width: 999px) and (min-height: 650px)');
const motionButton = document.querySelector('#motion-toggle');
let userMotion;
try { userMotion = localStorage.getItem('guatemala-motion'); } catch { /* Preferences remain usable without storage. */ }
let motionContext;
let desktop = false;
let mobilePinned = false;
let reduced = reducedQuery.matches || userMotion === 'reduced';
let filmOpen = false;
let filmResized = false;
let rebuildTimer;
let lastWidth = innerWidth;
let lastHeight = innerHeight;

function updateMotionButton() {
  motionButton.setAttribute('aria-pressed', String(reduced));
  motionButton.textContent = reduced ? t('Ativar movimento', 'Activar movimiento') : t('Reduzir movimento', 'Reducir movimiento');
  document.documentElement.classList.toggle('reduced-motion', reduced);
}

function buildMotion(preservePosition = false) {
  const readingSections = [...document.querySelectorAll('main > section, .site-footer')];
  const anchor = preservePosition ? readingSections.find(element => {
    const box = element.getBoundingClientRect();
    return box.top <= 100 && box.bottom > 100;
  }) : null;
  const anchorProgress = anchor ? (scrollY - (anchor.getBoundingClientRect().top + scrollY)) / anchor.offsetHeight : 0;
  motionContext?.revert();
  document.body.classList.remove('motion-desktop', 'motion-mobile');
  desktop = desktopQuery.matches && !reduced;
  mobilePinned = mobilePinQuery.matches && !reduced;
  updateMotionButton();
  if (reduced) {
    document.querySelector('.paper-scene').inert = false;
    ScrollTrigger.refresh();
    if (anchor) window.scrollTo({ top: anchor.getBoundingClientRect().top + scrollY + anchorProgress * anchor.offsetHeight, behavior: 'instant' });
    updateReadingState();
    return;
  }
  if (desktop) document.body.classList.add('motion-desktop');
  if (mobilePinned) document.body.classList.add('motion-mobile');
  motionContext = gsap.context(() => {
    if (desktop) {
      // Pins are created in document order so each downstream scene accounts for prior spacing.
      const opening = gsap.timeline({ scrollTrigger: { trigger: '.hero-stage', start: 'top top', end: () => `+=${innerHeight * 1.45}`, pin: true, scrub: .8, invalidateOnRefresh: true } });
      opening.to('.hero-copy', { yPercent: -28, autoAlpha: 0, duration: .3 }, 0)
        .to('.hero-bottom, .hero-caption', { autoAlpha: 0, duration: .18 }, .02)
        .to('.hero-image img', { scale: 1.25, transformOrigin: '61% 31%', duration: 1.2, ease: 'none' }, 0)
        .to('.hero-daylight', { clipPath: 'circle(110% at 61% 31%)', duration: .8, ease: 'power1.inOut' }, .18)
        .fromTo('.hero-daylight img', { scale: 1.16 }, { scale: 1, duration: 1.05, ease: 'none' }, .18)
        .fromTo('.portal-copy', { y: 90, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .35 }, .73)
        .to('.portal-copy', { y: -20, duration: .2 }, 1.08);

      const stage = document.querySelector('.story-stage');
      const track = document.querySelector('.story-track');
      const traversal = gsap.timeline({ scrollTrigger: { trigger: stage, start: 'top top', end: () => `+=${innerWidth * 2.3}`, pin: true, scrub: .85, invalidateOnRefresh: true } });
      traversal.to(track, { x: () => -(track.scrollWidth - stage.clientWidth), ease: 'none', duration: 3 }, 0)
        .fromTo('.story-panel img', { scale: 1.13 }, { scale: 1.01, ease: 'none', duration: 3 }, 0)
        .fromTo('.story-copy', { y: 25 }, { y: -15, ease: 'none', duration: 3 }, 0)
        .to('.story-progress span', { scaleX: 1, ease: 'none', duration: 3 }, 0);

      const paper = document.querySelector('.paper-scene');
      const matter = gsap.timeline({ scrollTrigger: { trigger: '.matter-stage', start: 'top top', end: () => `+=${innerHeight * 1.65}`, pin: true, scrub: .75, invalidateOnRefresh: true, onUpdate: self => { paper.inert = self.progress < .55; } } });
      matter.to('.jaguar-scene img', { scale: 1.23, transformOrigin: '60% 44%', duration: 1.2, ease: 'none' }, 0)
        .to('.jaguar-copy', { y: -50, autoAlpha: 0, duration: .25 }, .05)
        .fromTo(paper, { clipPath: 'circle(0% at 36% 52%)' }, { clipPath: 'circle(110% at 36% 52%)', ease: 'power1.inOut', duration: .65 }, .25)
        .fromTo('.matter-banknote', { scale: 1.5, y: 75, transformOrigin: '23% 51%' }, { scale: 1, y: 0, ease: 'power1.out', duration: .7 }, .3)
        .fromTo('.paper-atmosphere img', { scale: 1.15 }, { scale: 1, ease: 'none', duration: .8 }, .3)
        .fromTo('.paper-copy', { y: 35, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .3 }, .75)
        .fromTo('.paper-link', { autoAlpha: 0 }, { autoAlpha: 1, duration: .2 }, 1);

      gsap.fromTo('.light-title-wrap', { y: 85 }, { y: -45, ease: 'none', scrollTrigger: { trigger: '.light-entry', start: 'top bottom', end: 'bottom top', scrub: .8 } });
      gsap.fromTo('.light-environment', { scale: 1.2, opacity: .2 }, { scale: 1, opacity: .52, ease: 'none', scrollTrigger: { trigger: '.light-entry', start: 'top bottom', end: 'bottom 35%', scrub: .8 } });
      gsap.fromTo('.finale>picture img', { scale: 1.14 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.finale', start: 'top bottom', end: 'bottom bottom', scrub: 1 } });
    } else {
      document.querySelector('.paper-scene').inert = false;
      // Touch gets its own camera movements and one short transformation, rather than a compressed horizontal sequence.
      gsap.fromTo('.hero-image img', { scale: 1, yPercent: 0 }, { scale: 1.16, yPercent: 7, ease: 'none', scrollTrigger: { trigger: '.hero-stage', start: 'top top', end: 'bottom top', scrub: .55 } });
      gsap.to('.hero-copy', { y: -55, ease: 'none', scrollTrigger: { trigger: '.hero-stage', start: 'top top', end: 'bottom top', scrub: .55 } });
      const roots = gsap.timeline({ scrollTrigger: { trigger: '.origin-continuation', start: 'top 90%', end: 'bottom 30%', scrub: .55 } });
      roots.fromTo('.origin-continuation picture', { clipPath: 'inset(12% 8% 10% 8%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 }, 0)
        .fromTo('.origin-continuation img', { scale: 1.18, yPercent: -4 }, { scale: 1.03, yPercent: 2, duration: 1, ease: 'none' }, 0)
        .fromTo('.origin-continuation-copy', { y: 65, opacity: .1 }, { y: 0, opacity: 1, duration: .65 }, .15);
      gsap.utils.toArray('.story-panel').forEach((panel, index) => {
        gsap.fromTo(panel.querySelector('img'), { scale: 1.08 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: panel, start: 'top bottom', end: 'bottom top', scrub: .55 } });
        gsap.fromTo(panel.querySelector('.story-copy'), { x: index % 2 ? 32 : -32, y: 32, opacity: 0 }, { x: 0, y: 0, opacity: 1, ease: 'power2.out', scrollTrigger: { trigger: panel, start: 'top 55%', end: 'top 0%', scrub: .5 } });
      });
      if (mobilePinned) {
        const paper = document.querySelector('.paper-scene');
        const transformation = gsap.timeline({ scrollTrigger: { trigger: '.matter-stage', start: 'top top', end: () => `+=${innerHeight * 1.15}`, pin: true, scrub: .5, invalidateOnRefresh: true, onUpdate: self => { paper.inert = self.progress < .5; } } });
        transformation.to('.jaguar-scene img', { scale: 1.08, transformOrigin: '45% 48%', duration: 1.1, ease: 'none' }, 0)
          .to('.jaguar-copy', { y: -40, opacity: 0, duration: .24 }, .05)
          .fromTo(paper, { clipPath: 'circle(0% at 50% 55%)' }, { clipPath: 'circle(125% at 50% 55%)', duration: .65, ease: 'power1.inOut' }, .22)
          .fromTo('.matter-banknote', { scale: 1.23, y: 35 }, { scale: 1, y: 0, duration: .7, ease: 'power2.out' }, .25)
          .fromTo('.paper-copy', { y: 35, opacity: 0 }, { y: 0, opacity: 1, duration: .35 }, .55)
          .fromTo('.paper-link', { opacity: 0 }, { opacity: 1, duration: .2 }, .85);
      } else {
        gsap.fromTo('.jaguar-scene img', { scale: 1.08 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.jaguar-scene', start: 'top bottom', end: 'bottom top', scrub: .5 } });
        gsap.fromTo('.matter-banknote', { y: 45, scale: .92 }, { y: 0, scale: 1, scrollTrigger: { trigger: '.paper-scene', start: 'top 80%', end: 'top 5%', scrub: .5 } });
      }
      gsap.fromTo('.light-title-wrap', { y: 65 }, { y: -20, ease: 'none', scrollTrigger: { trigger: '.light-entry', start: 'top bottom', end: 'bottom top', scrub: .6 } });
      gsap.fromTo('.light-environment', { scale: 1.2, opacity: .15 }, { scale: 1, opacity: .5, ease: 'none', scrollTrigger: { trigger: '.light-entry', start: 'top bottom', end: 'bottom 30%', scrub: .6 } });
      gsap.fromTo('.finale>picture img', { scale: 1.17, yPercent: -3 }, { scale: 1.02, yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.finale', start: 'top bottom', end: 'bottom bottom', scrub: .7 } });
      gsap.fromTo('.finale-copy', { y: 50, opacity: .2 }, { y: 0, opacity: 1, scrollTrigger: { trigger: '.finale', start: 'top 75%', end: 'top 5%', scrub: .5 } });
    }
    gsap.utils.toArray('.journey-intro h2, .section-heading h2').forEach(heading => {
      gsap.fromTo(heading, { y: 34 }, { y: 0, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: heading, start: 'top 88%', once: true } });
    });
  });
  ScrollTrigger.refresh();
  if (anchor) window.scrollTo({ top: anchor.getBoundingClientRect().top + scrollY + anchorProgress * anchor.offsetHeight, behavior: 'instant' });
  updateReadingState();
}

const header = document.querySelector('.site-header');
const progress = document.querySelector('.journey-progress span');
const paperRegions = ['.journey-intro', '.security-section'].map(s => document.querySelector(s));
let readingFrame;
function updateReadingState() {
  readingFrame = null;
  if (filmOpen) return;
  const distance = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${distance > 0 ? Math.min(1, scrollY / distance) : 0})`;
  const paperHere = paperRegions.some(element => {
    const rect = element.getBoundingClientRect();
    return rect.top <= 92 && rect.bottom > 92;
  });
  header.classList.toggle('is-paper', paperHere);
  header.classList.toggle('is-scrolled', scrollY > 40);
}
addEventListener('scroll', () => { if (!readingFrame) readingFrame = requestAnimationFrame(updateReadingState); }, { passive: true });
document.addEventListener('film:open', () => { filmOpen = true; filmResized = false; clearTimeout(rebuildTimer); });
document.addEventListener('film:close', () => {
  filmOpen = false;
  requestAnimationFrame(() => {
    if (innerWidth !== lastWidth || Math.abs(innerHeight - lastHeight) > 140 || (desktopQuery.matches && !reduced) !== desktop) {
      lastWidth = innerWidth; lastHeight = innerHeight;
      buildMotion(true);
    } else if (filmResized) {
      const restoredY = scrollY;
      buildMotion();
      window.scrollTo({ top: restoredY, behavior: 'instant' });
    } else { ScrollTrigger.update(); updateReadingState(); }
    filmResized = false;
  });
});

document.addEventListener('click', event => {
  const anchor = event.target.closest('a[href^="#"]');
  if (!anchor) return;
  const target = document.getElementById(anchor.hash.slice(1));
  if (!target) return;
  event.preventDefault();
  // Preserve native document reading order and move keyboard focus with chapter navigation.
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  const top = target.getBoundingClientRect().top + scrollY - header.offsetHeight;
  window.scrollTo({ top: Math.max(0, top), behavior: reduced ? 'instant' : 'smooth' });
  history.replaceState(null, '', anchor.hash);
});

motionButton.addEventListener('click', () => {
  reduced = !reduced;
  userMotion = reduced ? 'reduced' : 'full';
  try { localStorage.setItem('guatemala-motion', userMotion); } catch { /* Session-only preference. */ }
  buildMotion(true);
});
reducedQuery.addEventListener('change', () => { reduced = reducedQuery.matches || userMotion === 'reduced'; buildMotion(true); });
document.addEventListener('language:change', () => { buildMotion(true); });
addEventListener('resize', () => {
  if (filmOpen) { filmResized = true; return; }
  const changed = innerWidth !== lastWidth || Math.abs(innerHeight - lastHeight) > 140 || (desktopQuery.matches && !reduced) !== desktop || (mobilePinQuery.matches && !reduced) !== mobilePinned;
  if (!changed) return;
  clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(() => {
    lastWidth = innerWidth; lastHeight = innerHeight;
    buildMotion(true);
  }, 220);
}, { passive: true });

await Promise.allSettled([document.fonts.ready, securityReady]);
buildMotion();
function settleInitialLocation() {
  ScrollTrigger.refresh();
  // Native fragment navigation may run before pinned scenes add their scroll space.
  const initialTarget = document.getElementById(location.hash.slice(1));
  if (initialTarget) {
    window.scrollTo({ top: Math.max(0, initialTarget.getBoundingClientRect().top + scrollY - header.offsetHeight), behavior: 'instant' });
  }
  updateReadingState();
}
if (document.readyState === 'complete') requestAnimationFrame(settleInitialLocation);
else window.addEventListener('load', settleInitialLocation, { once: true });
