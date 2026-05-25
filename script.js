/* ==========================================================
   Forno Caldo — script.js
   - Scroll animation Canvas (food-rustic, 151 frame .webp)
   - IntersectionObserver: .fade-up e .stagger-card
   - Anno corrente nel footer
   Vanilla JS, no dipendenze esterne.
   ========================================================== */

(function () {
  'use strict';

  // ----------------------------------------------------------
  // Anno corrente nel footer (fallback se 2026 non valorizzato)
  // ----------------------------------------------------------
  var yearEl = document.getElementById('year');
  if (yearEl && (!yearEl.textContent || /^\{\{/.test(yearEl.textContent))) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ----------------------------------------------------------
  // Scroll Animation — food-rustic
  // FRAME_COUNT = 151 (da skill-scroll.md, frame count per food-rustic)
  // ----------------------------------------------------------
  var canvas = document.getElementById('scroll-canvas');
  var section = document.getElementById('scroll-anim');

  if (canvas && section) {
    var ctx = canvas.getContext('2d');

    var FRAME_PATH = 'https://8ispuxmgjxgu2r5q.public.blob.vercel-storage.com/templates/ristoranti-001/frames/';
    var FRAME_COUNT = 151;        // food-rustic — vedi skill-scroll.md
    var FRAME_PREFIX = 'frame_';
    var FRAME_PAD = 4;
    var FRAME_EXT = '.webp';

    var images = [];
    var loaded = 0;

    function setupCanvas() {
      var pin = section.querySelector('.scroll-anim-pin');
      if (!pin) return;
      var dpr = window.devicePixelRatio || 1;
      canvas.width = pin.clientWidth * dpr;
      canvas.height = pin.clientHeight * dpr;
    }

    function render(progress) {
      var idx = Math.min(
        FRAME_COUNT - 1,
        Math.max(0, Math.floor(progress * FRAME_COUNT))
      );
      var img = images[idx];
      if (!img || !img.complete) return;

      var scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
      var dw = img.naturalWidth * scale;
      var dh = img.naturalHeight * scale;
      var dx = (canvas.width - dw) / 2;
      var dy = (canvas.height - dh) / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, dx, dy, dw, dh);
    }

    function onScroll() {
      var rect = section.getBoundingClientRect();
      var scrollable = section.offsetHeight - window.innerHeight;
      if (scrollable <= 0) { render(0); return; }
      var progress = Math.min(1, Math.max(0, -rect.top / scrollable));
      render(progress);
    }

    // Preload frame
    for (var i = 1; i <= FRAME_COUNT; i++) {
      var img = new Image();
      var num = String(i);
      while (num.length < FRAME_PAD) num = '0' + num;
      img.src = FRAME_PATH + FRAME_PREFIX + num + FRAME_EXT;
      img.onload = (function () {
        loaded++;
        if (loaded === 1) {
          setupCanvas();
          onScroll();
        }
      });
      images.push(img);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () {
      setupCanvas();
      onScroll();
    });
  }

  // ----------------------------------------------------------
  // IntersectionObserver — Fade Up
  // ----------------------------------------------------------
  if ('IntersectionObserver' in window) {
    var fadeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.fade-up').forEach(function (el) {
      fadeObserver.observe(el);
    });

    // ----------------------------------------------------------
    // IntersectionObserver — Stagger Cards (menu items)
    // ----------------------------------------------------------
    var staggerObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = parseInt(entry.target.dataset.stagger || 0, 10) * 130;
          setTimeout(function () {
            entry.target.classList.add('visible');
          }, delay);
          staggerObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.stagger-card').forEach(function (el) {
      staggerObserver.observe(el);
    });
  } else {
    // Fallback browser senza IntersectionObserver: mostra tutto subito
    document.querySelectorAll('.fade-up, .stagger-card').forEach(function (el) {
      el.classList.add('visible');
    });
  }
})();

// ----------------------------------------------------------
// Animation Pass — Text Reveal, Image Reveal, Tilt 3D, Typewriter
// ----------------------------------------------------------
(function () {
  'use strict';

  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal-wrapper').forEach(function (el) {
      el.classList.add('visible');
    });
    document.querySelectorAll('.image-reveal').forEach(function (el) {
      el.classList.add('visible');
    });
    return;
  }

  // Text Reveal observer
  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal-wrapper').forEach(function (el) {
    revealObs.observe(el);
  });

  // Image Reveal observer
  var imageRevealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        imageRevealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.image-reveal').forEach(function (el) {
    imageRevealObs.observe(el);
  });

  // Tilt 3D soft — desktop only
  if (!('ontouchstart' in window)) {
    var ROT_MAX = 5;
    document.querySelectorAll('.tilt-soft').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width;
        var y = (e.clientY - rect.top) / rect.height;
        var rotY = (x - 0.5) * ROT_MAX * 2;
        var rotX = (0.5 - y) * ROT_MAX * 2;
        card.style.transform = 'perspective(600px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) scale(1.02)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = 'perspective(600px) rotateX(0) rotateY(0) scale(1)';
      });
    });
  }

  // Typewriter
  var twEl = document.getElementById('tw-hero');
  if (twEl) {
    var words = [];
    try { words = JSON.parse(twEl.getAttribute('data-words') || '[]'); } catch (e) {}
    if (words.length) {
      var cursor = document.createElement('span');
      cursor.className = 'tw-cursor';
      cursor.setAttribute('aria-hidden', 'true');
      twEl.textContent = '';
      twEl.parentNode.insertBefore(cursor, twEl.nextSibling);

      var wordIdx = 0;
      var charIdx = 0;
      var isErasing = false;
      var TYPE_SPEED = 90;
      var ERASE_SPEED = 50;
      var PAUSE = 1400;

      function twTick() {
        var word = words[wordIdx];
        if (!isErasing) {
          charIdx++;
          twEl.textContent = word.substring(0, charIdx);
          if (charIdx === word.length) {
            isErasing = true;
            setTimeout(twTick, PAUSE);
          } else {
            setTimeout(twTick, TYPE_SPEED);
          }
        } else {
          charIdx--;
          twEl.textContent = word.substring(0, charIdx);
          if (charIdx === 0) {
            isErasing = false;
            wordIdx = (wordIdx + 1) % words.length;
            setTimeout(twTick, TYPE_SPEED);
          } else {
            setTimeout(twTick, ERASE_SPEED);
          }
        }
      }

      setTimeout(twTick, PAUSE);
    }
  }

})();

// ----------------------------------------------------------
// Image Fallback — SVG placeholder on onerror
// ----------------------------------------------------------
window.__imgFallback = function (img, label) {
  var wrapper = document.createElement('div');
  wrapper.className = 'img-svg-fallback';
  wrapper.setAttribute('role', 'img');
  wrapper.setAttribute('aria-label', label);
  var gid = 'g' + Date.now() + Math.random().toString(36).substr(2, 4);
  wrapper.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">' +
    '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0%" stop-color="currentColor" stop-opacity="0.12"/>' +
    '<stop offset="100%" stop-color="currentColor" stop-opacity="0.04"/>' +
    '</linearGradient></defs>' +
    '<rect width="800" height="600" fill="url(#' + gid + ')"/>' +
    '<text x="400" y="320" text-anchor="middle" font-family="serif" font-size="28" font-style="italic" fill="currentColor" opacity="0.5">' + label + '</text>' +
    '</svg>';
  img.replaceWith(wrapper);
};
