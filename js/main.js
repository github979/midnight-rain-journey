/* ============================================
   MIDNIGHT RAIN — main.js
   Rain · Cursor · Music Player · Scroll FX
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* =====================
     1. CUSTOM CURSOR
     ===================== */
  const cursor    = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursor-ring');

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });

  (function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  })();

  // Hover effect on interactive elements
  const hoverTargets = document.querySelectorAll('a, button, .era-card, .player-btn, input[type=range]');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorRing.style.width  = '56px';
      cursorRing.style.height = '56px';
      cursorRing.style.borderColor = 'rgba(201,168,76,0.75)';
    });
    el.addEventListener('mouseleave', () => {
      cursorRing.style.width  = '36px';
      cursorRing.style.height = '36px';
      cursorRing.style.borderColor = 'rgba(201,168,76,0.4)';
    });
  });


  /* =====================
     2. RAIN CANVAS
     ===================== */
  const canvas = document.getElementById('rain-canvas');
  const ctx    = canvas.getContext('2d');
  let drops    = [];

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resizeCanvas();
  window.addEventListener('resize', () => { resizeCanvas(); initDrops(); });

  function initDrops() {
    drops = [];
    const count = Math.floor((canvas.width * canvas.height) / 14000);
    for (let i = 0; i < count; i++) {
      drops.push(createDrop());
    }
  }

  function createDrop(fromTop = false) {
    return {
      x:       Math.random() * canvas.width,
      y:       fromTop ? -Math.random() * 200 : Math.random() * canvas.height,
      length:  Math.random() * 90 + 20,
      speed:   Math.random() * 2.5 + 1.2,
      opacity: Math.random() * 0.28 + 0.04,
      width:   Math.random() * 0.9 + 0.15,
      angle:   0.12 + Math.random() * 0.06, // slight diagonal
    };
  }

  initDrops();

  function drawRain() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drops.forEach(d => {
      const dx = d.length * d.angle;
      const dy = d.length;

      const grad = ctx.createLinearGradient(d.x, d.y, d.x + dx, d.y + dy);
      grad.addColorStop(0, `rgba(125,163,199,0)`);
      grad.addColorStop(0.4, `rgba(125,163,199,${d.opacity})`);
      grad.addColorStop(1, `rgba(125,163,199,0)`);

      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x + dx, d.y + dy);
      ctx.strokeStyle = grad;
      ctx.lineWidth   = d.width;
      ctx.stroke();

      d.y += d.speed;
      d.x += d.speed * d.angle;

      if (d.y > canvas.height + 120) {
        Object.assign(d, createDrop(true));
      }
    });

    requestAnimationFrame(drawRain);
  }

  drawRain();


  /* =====================
     3. MUSIC PLAYER
     ===================== */
  const audio        = document.getElementById('bg-audio');
  const playBtn      = document.getElementById('play-btn');
  const volSlider    = document.getElementById('vol-slider');
  const musicPlayer  = document.getElementById('music-player');
  const navMusicBtn  = document.getElementById('nav-music-btn');

  let isPlaying = false;

  function togglePlay() {
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      playBtn.textContent = '▶';
      musicPlayer.classList.remove('playing');
      navMusicBtn && navMusicBtn.classList.remove('playing');
    } else {
      audio.play().catch(() => {
        // autoplay blocked — show a hint
        console.log('Autoplay blocked. User interaction needed.');
      });
      playBtn.textContent = '⏸';
      musicPlayer.classList.add('playing');
      navMusicBtn && navMusicBtn.classList.add('playing');
    }
    isPlaying = !isPlaying;
  }

  playBtn && playBtn.addEventListener('click', togglePlay);
  navMusicBtn && navMusicBtn.addEventListener('click', togglePlay);

  volSlider && volSlider.addEventListener('input', (e) => {
    if (audio) audio.volume = e.target.value;
  });

  // Try autoplay on first user interaction (common pattern)
  const autoplayOnce = () => {
    if (!isPlaying && audio) {
      togglePlay();
    }
    document.removeEventListener('click', autoplayOnce);
    document.removeEventListener('keydown', autoplayOnce);
  };
  document.addEventListener('click', autoplayOnce);
  document.addEventListener('keydown', autoplayOnce);


  /* =====================
     4. NAV SCROLL STATE
     ===================== */
  const nav = document.querySelector('nav');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });


  /* =====================
     5. JOURNAL SCROLL REVEAL
     ===================== */
  const journalEntries = document.querySelectorAll('.journal-entry');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 130);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  journalEntries.forEach(el => revealObserver.observe(el));


  /* =====================
     6. ERA CARDS STAGGER
     ===================== */
  const eraCards = document.querySelectorAll('.era-card');

  const eraObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 150);
        eraObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  eraCards.forEach(el => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.7s ease, transform 0.7s ease, background 0.4s ease';
    eraObserver.observe(el);
  });


  /* =====================
     7. SMOOTH ANCHOR LINKS
     ===================== */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});
