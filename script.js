/**
 * Mawphanlur Natural Lake Guesthouse
 * Vanilla JavaScript Engine
 * 
 * Features:
 * - Dynamic scroll progress bar
 * - Sticky navbar state & active link tracking
 * - Mobile navigation drawer with keyboard/focus management
 * - Hero subtle parallax & smooth transitions
 * - Editorial masonry gallery fullscreen lightbox (Prev, Next, Close, ESC)
 * - Static booking form validation & date constraints
 * - IntersectionObserver scroll reveal animations
 * - Back-to-top button
 */

(function () {
  'use strict';

  // Check prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================================
     1. SCROLL PROGRESS BAR & NAVBAR SCROLLED STATE
     ========================================================================== */
  function initNavbarAndScroll() {
    const navbar = document.getElementById('navbar');
    const scrollProgress = document.getElementById('scrollProgress');
    const backToTopBtn = document.getElementById('backToTopBtn');
    const heroBg = document.getElementById('heroBg');

    function handleScroll() {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

      // Update progress bar
      if (scrollProgress) {
        scrollProgress.style.width = `${progress}%`;
      }

      // Update navbar background
      if (navbar) {
        if (scrollY > 40) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }

      // Back to top button
      if (backToTopBtn) {
        if (scrollY > 400) {
          backToTopBtn.classList.add('is-visible');
        } else {
          backToTopBtn.classList.remove('is-visible');
        }
      }

      // Subtle Hero Parallax
      if (heroBg && !prefersReducedMotion && window.innerWidth > 768 && scrollY < window.innerHeight) {
        heroBg.style.transform = `translate3d(0, ${scrollY * 0.25}px, 0) scale(${1 + (scrollY / 4000)})`;
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      });
    }

    // Active Section Link Tracker
    initActiveNavLinks();
  }

  function initActiveNavLinks() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.desktop-nav .nav-link');

    if (!('IntersectionObserver' in window) || sections.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, {
      rootMargin: '-25% 0px -65% 0px',
      threshold: 0.1
    });

    sections.forEach(sec => observer.observe(sec));
  }

  /* ==========================================================================
     2. MOBILE MENU DRAWER
     ========================================================================== */
  function initMobileMenu() {
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (!mobileBtn || !mobileMenu) return;

    function openMenu() {
      mobileMenu.classList.add('is-open');
      mobileBtn.classList.add('is-active');
      mobileBtn.setAttribute('aria-expanded', 'true');
      mobileMenu.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      mobileMenu.classList.remove('is-open');
      mobileBtn.classList.remove('is-active');
      mobileBtn.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function toggleMenu() {
      const isOpen = mobileMenu.classList.contains('is-open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    mobileBtn.addEventListener('click', toggleMenu);

    // Close on navigation link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });

    // Close on ESC key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
        closeMenu();
        mobileBtn.focus();
      }
    });
  }

  /* ==========================================================================
     3. EDITORIAL MASONRY GALLERY & FULLSCREEN LIGHTBOX
     ========================================================================== */
  function initGalleryLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const modal = document.getElementById('lightboxModal');
    const backdrop = document.getElementById('lightboxBackdrop');
    const imgEl = document.getElementById('lightboxImg');
    const captionEl = document.getElementById('lightboxCaption');
    const counterEl = document.getElementById('lightboxCounter');
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');

    if (!modal || galleryItems.length === 0) return;

    let currentIndex = 0;
    const galleryData = [];
    let lastActiveElement = null;

    galleryItems.forEach((item, index) => {
      const src = item.getAttribute('data-src') || (item.querySelector('img') ? item.querySelector('img').src : '');
      const caption = item.getAttribute('data-caption') || (item.querySelector('img') ? item.querySelector('img').alt : '');
      galleryData.push({ src, caption });

      item.addEventListener('click', () => {
        lastActiveElement = item;
        openLightbox(index);
      });

      // Keyboard accessible click via Enter or Space
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', `View photo: ${caption}`);
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          lastActiveElement = item;
          openLightbox(index);
        }
      });
    });

    function openLightbox(index) {
      currentIndex = index;
      updateLightboxContent();
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    }

    function closeLightbox() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastActiveElement) {
        lastActiveElement.focus();
      }
    }

    function updateLightboxContent() {
      if (!galleryData[currentIndex]) return;
      const data = galleryData[currentIndex];
      imgEl.src = data.src;
      imgEl.alt = data.caption;
      captionEl.textContent = data.caption;
      counterEl.textContent = `${currentIndex + 1} / ${galleryData.length}`;
    }

    function showNext() {
      currentIndex = (currentIndex + 1) % galleryData.length;
      updateLightboxContent();
    }

    function showPrev() {
      currentIndex = (currentIndex - 1 + galleryData.length) % galleryData.length;
      updateLightboxContent();
    }

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (backdrop) backdrop.addEventListener('click', closeLightbox);
    if (nextBtn) nextBtn.addEventListener('click', showNext);
    if (prevBtn) prevBtn.addEventListener('click', showPrev);

    // Keyboard navigation (ESC, Left, Right)
    window.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('is-open')) return;

      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        showNext();
      } else if (e.key === 'ArrowLeft') {
        showPrev();
      }
    });

    // Touch Swipe gestures for mobile lightbox
    let touchStartX = 0;
    let touchEndX = 0;

    modal.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    modal.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const swipeDistance = touchEndX - touchStartX;
      if (swipeDistance < -50) {
        showNext(); // Swipe left to view next
      } else if (swipeDistance > 50) {
        showPrev(); // Swipe right to view prev
      }
    }
  }

  /* ==========================================================================
     4. BOOKING FORM LOGIC & VALIDATION
     ========================================================================== */
  function initBookingForm() {
    const form = document.getElementById('bookingInquiryForm');
    if (!form) return;

    const checkInInput = document.getElementById('checkIn');
    const checkOutInput = document.getElementById('checkOut');
    const nameInput = document.getElementById('fullName');
    const phoneInput = document.getElementById('phone');
    const emailInput = document.getElementById('email');
    const guestsInput = document.getElementById('guests');
    const alertBox = document.getElementById('formAlert');

    // Dynamic min date configuration (today)
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    if (checkInInput) {
      checkInInput.setAttribute('min', todayStr);
    }

    // Set checkout min to at least checkIn + 1 day
    if (checkInInput && checkOutInput) {
      checkInInput.addEventListener('change', () => {
        if (checkInInput.value) {
          const inDate = new Date(checkInInput.value);
          const nextDay = new Date(inDate);
          nextDay.setDate(nextDay.getDate() + 1);
          const nextDayStr = nextDay.toISOString().split('T')[0];
          checkOutInput.setAttribute('min', nextDayStr);
          if (checkOutInput.value && checkOutInput.value <= checkInInput.value) {
            checkOutInput.value = nextDayStr;
          }
        }
      });
    }

    function clearErrors() {
      form.querySelectorAll('.form-control').forEach(el => el.classList.remove('is-invalid'));
      form.querySelectorAll('.field-error').forEach(el => el.textContent = '');
      if (alertBox) {
        alertBox.className = 'form-alert';
        alertBox.textContent = '';
      }
    }

    function setError(inputEl, errorId, msg) {
      inputEl.classList.add('is-invalid');
      const errEl = document.getElementById(errorId);
      if (errEl) errEl.textContent = msg;
    }

    form.addEventListener('submit', (e) => {
      clearErrors();
      let isValid = true;

      // 1. Full Name
      if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
        setError(nameInput, 'fullNameError', 'Please enter your full name.');
        isValid = false;
      }

      // 2. Phone
      const phoneVal = phoneInput.value.trim();
      const phoneDigits = phoneVal.replace(/\D/g, '');
      if (!phoneVal || phoneDigits.length < 10) {
        setError(phoneInput, 'phoneError', 'Please provide a valid 10-digit phone number.');
        isValid = false;
      }

      // 3. Email
      const emailVal = emailInput.value.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailVal || !emailPattern.test(emailVal)) {
        setError(emailInput, 'emailError', 'Please enter a valid email address.');
        isValid = false;
      }

      // 4. Guests
      if (!guestsInput.value) {
        setError(guestsInput, 'guestsError', 'Please select number of guests.');
        isValid = false;
      }

      // 5. Check-in
      if (!checkInInput.value) {
        setError(checkInInput, 'checkInError', 'Please select a check-in date.');
        isValid = false;
      }

      // 6. Check-out
      if (!checkOutInput.value) {
        setError(checkOutInput, 'checkOutError', 'Please select a check-out date.');
        isValid = false;
      } else if (checkInInput.value && checkOutInput.value <= checkInInput.value) {
        setError(checkOutInput, 'checkOutError', 'Check-out date must be after check-in date.');
        isValid = false;
      }

      if (!isValid) {
        e.preventDefault();
        if (alertBox) {
          alertBox.className = 'form-alert error is-visible';
          alertBox.textContent = 'Please fill out all required fields correctly.';
        }
        return;
      }

      // Check if action URL is still placeholder
      const actionUrl = form.getAttribute('action');
      if (actionUrl === 'YOUR_FORM_ACTION_URL') {
        e.preventDefault();
        if (alertBox) {
          alertBox.className = 'form-alert info is-visible';
          alertBox.innerHTML = `<strong>Inquiry Details Validated!</strong><br>The form is ready for static deployment. Replace <code>YOUR_FORM_ACTION_URL</code> in <code>index.html</code> with your Formspree endpoint (e.g. <code>https://formspree.io/f/your_id</code>) or FormSubmit endpoint to receive live inquiries via email.`;
        }
      }
      // If actionUrl has been configured with an external endpoint, allow normal HTML form POST submission!
    });
  }

  /* ==========================================================================
     5. SCROLL REVEAL ANIMATIONS (IntersectionObserver)
     ========================================================================== */
  function initRevealAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    if (reveals.length === 0) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      reveals.forEach(el => el.classList.add('visible'));
      return;
    }

    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    reveals.forEach(el => revealObserver.observe(el));
  }

  /* ==========================================================================
     6. INITIALIZATION
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    initNavbarAndScroll();
    initMobileMenu();
    initGalleryLightbox();
    initBookingForm();
    initRevealAnimations();
  });

})();
