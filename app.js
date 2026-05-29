document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     THEME TOGGLE SYSTEM (LIGHT / DARK MODE)
     ========================================================================== */
  const themeToggleBtn = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('wygrywando_theme') || 'dark';

  // Apply default or saved theme on load
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('light-mode');
      
      const theme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
      localStorage.setItem('wygrywando_theme', theme);
    });
  }

  /* ==========================================================================
     SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
     ========================================================================== */
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Once revealed, we don't need to observe it anymore
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(el => {
      revealObserver.observe(el);
    });
  } else {
    // Fallback if browser doesn't support IntersectionObserver
    revealElements.forEach(el => {
      el.classList.add('active');
    });
  }

  /* ==========================================================================
     PERSISTENT COUNTDOWN TIMER
     ========================================================================== */
  // We calculate a target date and store it in localStorage so the countdown 
  // is persistent and feels active for users reviewing the page.
  let targetDateMs = localStorage.getItem('wygrywando_timer_target');
  const durationDays = 4;
  const durationHours = 12;
  const durationMinutes = 45;
  
  if (!targetDateMs) {
    const now = new Date();
    // Add 4d 12h 45m
    const target = new Date(now.getTime() + 
      (durationDays * 24 * 60 * 60 * 1000) + 
      (durationHours * 60 * 60 * 1000) + 
      (durationMinutes * 60 * 1000)
    );
    targetDateMs = target.getTime();
    localStorage.setItem('wygrywando_timer_target', targetDateMs);
  } else {
    // If target date is in the past, reset it relative to now so it never shows 00:00:00
    const now = new Date().getTime();
    if (Number(targetDateMs) < now) {
      const target = new Date(now + 
        (durationDays * 24 * 60 * 60 * 1000) + 
        (durationHours * 60 * 60 * 1000) + 
        (durationMinutes * 60 * 1000)
      );
      targetDateMs = target.getTime();
      localStorage.setItem('wygrywando_timer_target', targetDateMs);
    }
  }

  const daysVal = document.getElementById('days');
  const hoursVal = document.getElementById('hours');
  const minutesVal = document.getElementById('minutes');
  const secondsVal = document.getElementById('seconds');

  function updateTimer() {
    const now = new Date().getTime();
    const distance = Number(targetDateMs) - now;
    
    if (distance < 0) {
      // Re-initialize if expired
      localStorage.removeItem('wygrywando_timer_target');
      return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    daysVal.textContent = String(days).padStart(2, '0');
    hoursVal.textContent = String(hours).padStart(2, '0');
    minutesVal.textContent = String(minutes).padStart(2, '0');
    secondsVal.textContent = String(seconds).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);

  /* ==========================================================================
     3D TILT EFFECT ON HERO CARD
     ========================================================================== */
  const cardWrapper = document.getElementById('card3DWrapper');
  const card = document.getElementById('card3D');
  
  if (cardWrapper && card) {
    cardWrapper.addEventListener('mousemove', (e) => {
      // Disable transition during tracking to prevent lag/jitter
      card.style.transition = 'none';
      
      const rect = cardWrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate rotation angles (max 10 degrees for a calmer, premium feel)
      const rotateX = ((centerY - y) / centerY) * 10;
      const rotateY = ((x - centerX) / centerX) * 10;
      
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    
    cardWrapper.addEventListener('mouseleave', () => {
      // Re-enable smooth transition for snap-back animation
      card.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)';
      card.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
  }

  /* ==========================================================================
     INTERACTIVE TICKET CALCULATOR
     ========================================================================== */
  const calcSlider = document.getElementById('calcSlider');
  const calcAmount = document.getElementById('calcAmount');
  const calcTickets = document.getElementById('calcTickets');
  const calcVoucher = document.getElementById('calcVoucher');
  const luckyLevelText = document.getElementById('luckyLevelText');
  const luckyMeterFill = document.getElementById('luckyMeterFill');
  const amountButtons = document.querySelectorAll('.quick-amounts .btn-amount');

  function calculateResults(amount) {
    // 1 ticket per 15 PLN base
    let tickets = Math.floor(amount / 15);
    
    // Add progressive bonus tickets
    if (amount >= 500) {
      tickets += 15; // Mega bonus
    } else if (amount >= 200) {
      tickets += 5;
    } else if (amount >= 100) {
      tickets += 2;
    } else if (amount >= 50) {
      tickets += 1;
    }
    
    // Update labels
    calcAmount.textContent = amount;
    calcTickets.textContent = tickets;
    calcVoucher.textContent = `${amount} PLN`;
    
    // Calculate lucky levels and meter fill percentage
    let level = "Brzdąc";
    let pct = 5;
    
    if (amount >= 500) {
      level = "Farciarz Legendarny";
      pct = 100;
    } else if (amount >= 200) {
      level = "Władca Koniczyn";
      pct = 75;
    } else if (amount >= 100) {
      level = "Magik Losu";
      pct = 50;
    } else if (amount >= 50) {
      level = "Poszukiwacz Przygód";
      pct = 30;
    } else {
      level = "Początkujący Farciarz";
      pct = 15;
    }
    
    luckyLevelText.textContent = level;
    luckyMeterFill.style.width = `${pct}%`;
    
    // Color code meter labels
    if (amount >= 500) {
      luckyLevelText.style.color = 'var(--accent-pink)';
    } else if (amount >= 200) {
      luckyLevelText.style.color = 'var(--accent-purple)';
    } else {
      luckyLevelText.style.color = 'var(--accent-cyan)';
    }
  }

  if (calcSlider) {
    calcSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      calculateResults(val);
      
      // Update quick amount buttons active class
      amountButtons.forEach(btn => {
        if (parseInt(btn.getAttribute('data-val')) === val) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    });
  }

  // Quick Amount Buttons Click Events
  amountButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      amountButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const val = parseInt(btn.getAttribute('data-val'));
      calcSlider.value = val;
      calculateResults(val);
    });
  });

  // Init calculator on page load
  if (calcSlider) {
    calculateResults(parseInt(calcSlider.value));
  }

  /* ==========================================================================
     MERCHANDISE SIZE SELECTORS
     ========================================================================== */
  const sizeButtons = document.querySelectorAll('.size-options .btn-size');
  
  sizeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Find siblings of current card container size options
      const siblings = btn.parentElement.querySelectorAll('.btn-size');
      siblings.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  /* ==========================================================================
     ACCORDION LOGIC
     ========================================================================== */
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isActive = item.classList.contains('active');
      
      // Close all other items for a clean accordion effect
      document.querySelectorAll('.accordion-item').forEach(i => {
        i.classList.remove('active');
        i.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
      });
      
      if (!isActive) {
        item.classList.add('active');
        header.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ==========================================================================
     VOD MODAL PREVIEW CONTROLLER
     ========================================================================== */
  const vodThumbs = document.querySelectorAll('.vod-thumb');
  const videoModal = document.getElementById('videoModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalTitle = document.getElementById('modalTitle');
  const modalVideoCover = document.getElementById('modalVideoCover');
  const modalLoader = document.getElementById('modalLoader');
  const videoPlayBtn = document.getElementById('videoPlayBtn');
  const videoPlayhead = document.getElementById('videoPlayhead');
  const videoTimeline = document.getElementById('videoTimeline');
  const videoTime = document.getElementById('videoTime');
  
  let simulatedTimelineInterval = null;
  let isPlaying = true;
  let currentSec = 134; // 02:14
  let totalSec = 1125;  // 18:45

  function openVideoModal(title, coverSrc, durationText) {
    modalTitle.textContent = title;
    modalVideoCover.src = coverSrc;
    modalLoader.classList.add('active');
    videoModal.classList.add('active');
    
    // Parse duration text
    const parts = durationText.split(':');
    totalSec = parseInt(parts[0]) * 60 + parseInt(parts[1]);
    currentSec = 0;
    
    // Reset player elements
    isPlaying = false;
    togglePlayState(false);
    updateTimelineUI();
    
    // Simulate loading delay
    setTimeout(() => {
      modalLoader.classList.remove('active');
      isPlaying = true;
      togglePlayState(true);
      startSimulatedTimeline();
    }, 800);
  }

  function startSimulatedTimeline() {
    clearInterval(simulatedTimelineInterval);
    simulatedTimelineInterval = setInterval(() => {
      if (isPlaying) {
        currentSec += 1;
        if (currentSec >= totalSec) {
          currentSec = 0;
        }
        updateTimelineUI();
      }
    }, 1000);
  }

  function updateTimelineUI() {
    const curMin = Math.floor(currentSec / 60);
    const curSec = currentSec % 60;
    const totMin = Math.floor(totalSec / 60);
    const totSec = totalSec % 60;
    
    videoTime.textContent = `${String(curMin).padStart(2, '0')}:${String(curSec).padStart(2, '0')} / ${String(totMin).padStart(2, '0')}:${String(totSec).padStart(2, '0')}`;
    
    const pct = (currentSec / totalSec) * 100;
    videoPlayhead.style.width = `${pct}%`;
  }

  function togglePlayState(play) {
    const icon = videoPlayBtn.querySelector('i');
    if (play) {
      icon.className = 'fa-solid fa-pause';
      videoPlayBtn.setAttribute('aria-label', 'Wstrzymaj odtwarzanie');
    } else {
      icon.className = 'fa-solid fa-play';
      videoPlayBtn.setAttribute('aria-label', 'Uruchom odtwarzanie');
    }
  }

  vodThumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const title = thumb.getAttribute('data-title');
      const img = thumb.querySelector('.vod-img');
      const coverSrc = img ? img.src : 'assets/hero_car.png';
      const duration = thumb.querySelector('.vod-duration').textContent || "18:45";
      
      openVideoModal(title, coverSrc, duration);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
      videoModal.classList.remove('active');
      clearInterval(simulatedTimelineInterval);
      isPlaying = false;
    });
  }

  if (videoPlayBtn) {
    videoPlayBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      togglePlayState(isPlaying);
    });
  }

  // Click on modal background to close
  if (videoModal) {
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) {
        videoModal.classList.remove('active');
        clearInterval(simulatedTimelineInterval);
        isPlaying = false;
      }
    });
  }

  // Click on Timeline mockup to scrub
  if (videoTimeline) {
    videoTimeline.addEventListener('click', (e) => {
      const rect = videoTimeline.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const pct = clickX / width;
      currentSec = Math.floor(pct * totalSec);
      updateTimelineUI();
    });
  }

  /* ==========================================================================
     SHOPPING CART COUNTER & FEEDBACK
     ========================================================================== */
  const cartBadge = document.getElementById('cartCount');
  const addToCartButtons = document.querySelectorAll('.addToCartBtn');
  let cartCount = 0;

  function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '30px';
    toast.style.right = '30px';
    toast.style.background = 'var(--accent-cyan)';
    toast.style.color = '#000';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = 'var(--border-radius-sm)';
    toast.style.fontWeight = '700';
    toast.style.fontSize = '0.9rem';
    toast.style.boxShadow = 'var(--glow-cyan)';
    toast.style.zIndex = '9999';
    toast.style.fontFamily = 'var(--font-headings)';
    toast.style.textTransform = 'uppercase';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    
    document.body.appendChild(toast);
    
    // Trigger transition
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    }, 50);
    
    // Remove after 3s
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 2500);
  }

  addToCartButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-name');
      const tickets = btn.getAttribute('data-tickets');
      
      cartCount += 1;
      cartBadge.textContent = cartCount;
      cartBadge.classList.add('active');
      
      // Animate badge
      cartBadge.style.transform = 'scale(1.3)';
      setTimeout(() => {
        cartBadge.style.transform = 'scale(1)';
      }, 200);
      
      showToast(`DODANO: ${name} (+${tickets} losów)`);
    });
  });

  /* ==========================================================================
     MOBILE HAMBURGER TOGGLE MENU
     ========================================================================== */
  const menuToggle = document.getElementById('menuToggle');
  const navLinksContainer = document.querySelector('.nav-links');
  
  if (menuToggle && navLinksContainer) {
    menuToggle.addEventListener('click', () => {
      const icon = menuToggle.querySelector('i');
      navLinksContainer.classList.toggle('active');
      
      if (navLinksContainer.classList.contains('active')) {
        icon.className = 'fa-solid fa-xmark';
      } else {
        icon.className = 'fa-solid fa-bars';
      }
    });

    // Close mobile menu when any navigation link is clicked
    const navLinks = navLinksContainer.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navLinksContainer.classList.remove('active');
        const icon = menuToggle.querySelector('i');
        if (icon) {
          icon.className = 'fa-solid fa-bars';
        }
      });
    });
  }
});
