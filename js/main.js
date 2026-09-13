/* ============================================================
   MODNEST INTERIORS — MAIN JAVASCRIPT
   Navigation, Animations, Forms, Counters
   ============================================================ */

/* ---- Company Info (single source of truth) ---- */
const COMPANY = {
  name: 'Modnest Interiors',
  phones: ['+971 58 583 8876', '+971 50 884 8001', '+971 52 579 4242'],
  email: 'modnestinteriors.ae@gmail.com',
  address: 'Ajman Free Zone C1 Building, Ajman, United Arab Emirates',
  whatsapp: 'https://wa.me/message/Y6HI7CH6TFZ4J1',
  instagram: 'https://www.instagram.com/modnestinteriors_ae?igsi=MWZ4bWphNGYyOWVhaw==&utm_source=ig_contact_invite',
};

/* ---- DOM Ready ---- */
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileNav();
  initRevealAnimations();
  initCounters();
  initForms();
  initSmoothScroll();
  setActiveNavLink();
  initFileInputs();
  initFAB();
  initServicesSlider();
  initHeroSlider();
});

/* ============================================================
   HEADER — scroll behavior
   ============================================================ */
function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const heroEl = document.querySelector('.hero');

  const update = () => {
    const scrolled = window.scrollY > 60;
    header.classList.toggle('scrolled', scrolled);
    // Only apply transparent mode on homepage hero
    if (heroEl) {
      header.classList.toggle('hero-page', !scrolled);
    } else {
      header.classList.add('scrolled');
    }
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ============================================================
   MOBILE NAVIGATION
   ============================================================ */
function initMobileNav() {
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileLinks = document.querySelectorAll('.mobile-nav .nav-link, .mobile-nav .btn-cta');

  if (!hamburger || !mobileNav) return;

  const toggleNav = (open) => {
    hamburger.classList.toggle('open', open);
    mobileNav.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };

  hamburger.addEventListener('click', () => {
    toggleNav(!hamburger.classList.contains('open'));
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => toggleNav(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggleNav(false);
  });
}

/* ============================================================
   REVEAL ANIMATIONS — Intersection Observer
   ============================================================ */
function initRevealAnimations() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
      el.classList.add('revealed');
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    observer.observe(el);
  });
}

/* ============================================================
   ANIMATED COUNTERS
   ============================================================ */
function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animateCounter = (el, target, suffix) => {
    if (prefersReduced) {
      el.textContent = target + suffix;
      return;
    }
    const duration = 2000;
    const start = performance.now();
    const startVal = 0;

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // cubic ease out
      const current = Math.floor(startVal + (target - startVal) * ease);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.counter, 10);
        const suffix = el.dataset.suffix || '';
        animateCounter(el, target, suffix);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

/* ============================================================
   FORMS — Validation & Submission
   ============================================================ */
function initForms() {
  document.querySelectorAll('.enquiry-form, .application-form').forEach(form => {
    form.addEventListener('submit', handleFormSubmit);
    form.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.closest('.form-group').classList.contains('has-error')) {
          validateField(field);
        }
      });
    });
  });
}

function validateField(field) {
  const group = field.closest('.form-group');
  if (!group) return true;

  const errorEl = group.querySelector('.form-error');
  let valid = true;
  let errorMsg = '';

  if (field.hasAttribute('required') && !field.value.trim()) {
    valid = false;
    errorMsg = 'This field is required.';
  } else if (field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
    valid = false;
    errorMsg = 'Please enter a valid email address.';
  } else if (field.type === 'tel' && field.value && !/^[\+\d\s\-\(\)]{7,}$/.test(field.value)) {
    valid = false;
    errorMsg = 'Please enter a valid phone number.';
  } else if (field.type === 'url' && field.value && !/^https?:\/\/.+/.test(field.value)) {
    valid = false;
    errorMsg = 'Please enter a valid URL (starting with http:// or https://).';
  }

  group.classList.toggle('has-error', !valid);
  field.classList.toggle('error', !valid);
  if (errorEl) errorEl.textContent = errorMsg;

  return valid;
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;

  /* ---- Enquiry form → WhatsApp redirect ---- */
  if (form.classList.contains('enquiry-form')) {
    const data = Object.fromEntries(new FormData(form).entries());

    // Build a nicely formatted WhatsApp message from whatever the user filled in
    const lines = ['Hello Modnest Interiors! I would like to enquire about your services.\n'];
    if (data.fullName)    lines.push(`*Name:* ${data.fullName}`);
    if (data.phone)       lines.push(`*Phone:* ${data.phone}`);
    if (data.email)       lines.push(`*Email:* ${data.email}`);
    if (data.projectType && data.projectType !== 'Select project type') lines.push(`*Project Type:* ${data.projectType}`);
    if (data.service     && data.service     !== 'Select a service')    lines.push(`*Service Required:* ${data.service}`);
    if (data.location)    lines.push(`*Project Location:* ${data.location}`);
    if (data.budget && data.budget !== 'Select a budget range (optional)') lines.push(`*Estimated Budget:* ${data.budget}`);
    if (data.message)     lines.push(`\n*Message:*\n${data.message}`);

    const text = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/971585838876?text=${text}`, '_blank', 'noopener,noreferrer');

    // Show success state
    const successEl = form.closest('.form-card')?.querySelector('.form-success');
    const formContent = form.closest('.form-card')?.querySelector('.form-content');
    if (successEl) {
      if (formContent) formContent.style.display = 'none';
      successEl.classList.add('active');
      successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    form.reset();
    return;
  }

  /* ---- All other forms (e.g. application form) ---- */
  const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
  let allValid = true;

  fields.forEach(field => {
    if (!validateField(field)) allValid = false;
  });

  if (!allValid) {
    const firstError = form.querySelector('.has-error input, .has-error select, .has-error textarea');
    if (firstError) firstError.focus();
    return;
  }

  // Show loading state
  const submitBtn = form.querySelector('[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';

  const actionUrl = form.getAttribute('action');

  const handleSuccess = () => {
    const successEl = form.closest('.form-card')?.querySelector('.form-success');
    const formContent = form.closest('.form-card')?.querySelector('.form-content');

    if (successEl) {
      if (formContent) formContent.style.display = 'none';
      successEl.classList.add('active');
      successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    form.reset();
  };

  if (actionUrl) {
    const formData = new FormData(form);
    try {
      const response = await fetch(actionUrl, {
        method: form.getAttribute('method') || 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        handleSuccess();
      } else {
        const data = await response.json();
        let errorMessage = 'Oops! There was a problem submitting your form.';
        if (data && Object.hasOwn(data, 'errors')) {
          errorMessage = data.errors.map(error => error.message).join(', ');
        }
        alert(errorMessage);
      }
    } catch (error) {
      alert('Oops! There was a problem submitting your form.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  } else {
    // Simulate async submission (fallback if no backend action provided)
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      handleSuccess();
    }, 1200);
  }
}


/* ============================================================
   FILE INPUT LABELS
   ============================================================ */
function initFileInputs() {
  document.querySelectorAll('.file-input-wrap').forEach(wrap => {
    const input = wrap.querySelector('input[type="file"]');
    const label = wrap.querySelector('.file-input-label');
    const btn = wrap.querySelector('.file-btn');

    if (!input) return;

    if (btn) btn.addEventListener('click', () => input.click());
    wrap.addEventListener('click', (e) => {
      if (e.target === wrap) input.click();
    });

    input.addEventListener('change', () => {
      if (input.files.length && label) {
        label.textContent = Array.from(input.files).map(f => f.name).join(', ');
      }
    });
  });
}

/* ============================================================
   SMOOTH SCROLL for anchor links
   ============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const headerH = document.querySelector('.site-header')?.offsetHeight || 80;
        const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* ============================================================
   ACTIVE NAV LINK
   ============================================================ */
function setActiveNavLink() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    link.classList.toggle('active', href === page || (page === '' && href === 'index.html'));
  });
}

/* ============================================================
   FLOATING ACTION BUTTON
   ============================================================ */
function initFAB() {
  const fabContainer = document.querySelector('.fab-container');
  const fabMain = document.querySelector('.fab-main');
  
  if (!fabContainer || !fabMain) return;
  
  fabMain.addEventListener('click', (e) => {
    e.preventDefault();
    fabContainer.classList.toggle('active');
  });
  
  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!fabContainer.contains(e.target)) {
      fabContainer.classList.remove('active');
    }
  });
}

/* ============================================================
   SERVICES SLIDER
   ============================================================ */
function initServicesSlider() {
  const slider = document.getElementById('servicesSlider');
  if (!slider) return;

  const track = document.getElementById('servicesSliderTrack');
  const originalSlides = Array.from(slider.querySelectorAll('.service-slide'));
  const prevBtn = document.getElementById('srvPrevBtn');
  const nextBtn = document.getElementById('srvNextBtn');

  if (!originalSlides.length) return;

  // Clone slides for infinite loop
  const numClones = 3; // Clone enough for wide screens
  // Prepend last 3
  for (let i = originalSlides.length - numClones; i < originalSlides.length; i++) {
    const clone = originalSlides[i].cloneNode(true);
    clone.classList.add('is-clone');
    track.prepend(clone);
  }
  // Append first 3
  for (let i = 0; i < numClones; i++) {
    const clone = originalSlides[i].cloneNode(true);
    clone.classList.add('is-clone');
    track.appendChild(clone);
  }

  const allSlides = Array.from(slider.querySelectorAll('.service-slide'));
  let activeIndex = numClones; // Start at the first original slide
  let autoScrollInterval;
  let isJumping = false;
  let isScrolling = false;
  let scrollTimeout;

  const getSlideCenter = (slide) => slide.offsetLeft + slide.clientWidth / 2;

  const updateActiveSlide = () => {
    if (isJumping) return;
    
    const sliderCenter = slider.scrollLeft + slider.clientWidth / 2;
    let minDistance = Infinity;
    let closestIndex = activeIndex;

    allSlides.forEach((slide, index) => {
      const distance = Math.abs(sliderCenter - getSlideCenter(slide));
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== activeIndex) {
      allSlides[activeIndex]?.classList.remove('active');
      activeIndex = closestIndex;
      allSlides[activeIndex]?.classList.add('active');
    }
  };

  const jumpToSlide = (index) => {
    isJumping = true;
    slider.classList.add('no-smooth');
    const slide = allSlides[index];
    const scrollPos = slide.offsetLeft - (slider.clientWidth / 2) + (slide.clientWidth / 2);
    slider.scrollLeft = scrollPos;
    
    allSlides.forEach(s => s.classList.remove('active'));
    activeIndex = index;
    allSlides[activeIndex]?.classList.add('active');

    // Force reflow before restoring smooth scroll
    slider.offsetHeight; 
    slider.classList.remove('no-smooth');
    setTimeout(() => { isJumping = false; }, 50);
  };

  const scrollToSlide = (index) => {
    if (index < 0 || index >= allSlides.length) return;
    const slide = allSlides[index];
    const scrollPos = slide.offsetLeft - (slider.clientWidth / 2) + (slide.clientWidth / 2);
    slider.scrollTo({ left: scrollPos, behavior: 'smooth' });
  };

  slider.addEventListener('scroll', () => {
    if (!isJumping) {
      requestAnimationFrame(updateActiveSlide);
      
      // Infinite scroll boundary checks when scrolling stops
      isScrolling = true;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
        // Jump if we landed on a clone
        if (activeIndex < numClones) {
          jumpToSlide(activeIndex + originalSlides.length);
        } else if (activeIndex >= originalSlides.length + numClones) {
          jumpToSlide(activeIndex - originalSlides.length);
        }
      }, 150);
    }
  });

  // Init first slide
  setTimeout(() => {
    jumpToSlide(numClones);
  }, 100);

  // Auto scroll
  const startAutoScroll = () => {
    stopAutoScroll();
    autoScrollInterval = setInterval(() => {
      let nextIndex = activeIndex + 1;
      scrollToSlide(nextIndex);
    }, 2000);
  };

  const stopAutoScroll = () => {
    if (autoScrollInterval) clearInterval(autoScrollInterval);
  };

  startAutoScroll();

  slider.addEventListener('mouseenter', stopAutoScroll);
  slider.addEventListener('mouseleave', startAutoScroll);
  slider.addEventListener('touchstart', stopAutoScroll, { passive: true });
  slider.addEventListener('touchend', startAutoScroll, { passive: true });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      stopAutoScroll();
      let prevIndex = activeIndex - 1;
      scrollToSlide(prevIndex);
      startAutoScroll();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      stopAutoScroll();
      let nextIndex = activeIndex + 1;
      scrollToSlide(nextIndex);
      startAutoScroll();
    });
  }

  // Click on slide to center it
  allSlides.forEach((slide, index) => {
    slide.addEventListener('click', () => {
      if (index !== activeIndex) {
        stopAutoScroll();
        scrollToSlide(index);
        startAutoScroll();
      }
    });
  });
}

/* ============================================================
   HERO SLIDER
   ============================================================ */
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dots .dot');
  if (!slides.length) return;

  let currentIdx = 0;
  let sliderInterval;

  const goToSlide = (idx) => {
    slides[currentIdx].classList.remove('active');
    if (dots[currentIdx]) dots[currentIdx].classList.remove('active');
    
    currentIdx = (idx + slides.length) % slides.length;
    
    slides[currentIdx].classList.add('active');
    if (dots[currentIdx]) dots[currentIdx].classList.add('active');
  };

  const nextSlide = () => goToSlide(currentIdx + 1);

  const startSlider = () => {
    stopSlider();
    sliderInterval = setInterval(nextSlide, 5000); // 5 seconds
  };

  const stopSlider = () => {
    if (sliderInterval) clearInterval(sliderInterval);
  };

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      goToSlide(idx);
      startSlider();
    });
  });

  startSlider();
}
