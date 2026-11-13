/**
 * realme Website Interactive Scripts
 * Feature 1: Dark / Light Mode Background Theme Switcher
 * Feature 2: Interactive Smartphone Color Variant Customizer with 3D Tilt & View Toggle
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. FEATURE 1: Background Theme Switcher (Hitam & Putih / Dark & Light)
  // =========================================================================
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIconContainer = document.getElementById('themeIconContainer');
  const themeLabel = document.getElementById('themeLabel');

  const THEME_KEY = 'realme_theme_preference';

  // SVG Icons for Sun & Moon
  const sunIconSVG = `
    <svg class="theme-icon" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0z"/>
    </svg>`;

  const moonIconSVG = `
    <svg class="theme-icon" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
    </svg>`;

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);

    if (theme === 'light') {
      if (themeIconContainer) themeIconContainer.innerHTML = moonIconSVG;
      if (themeLabel) themeLabel.textContent = 'Mode Gelap';
    } else {
      if (themeIconContainer) themeIconContainer.innerHTML = sunIconSVG;
      if (themeLabel) themeLabel.textContent = 'Mode Terang';
    }
  }

  // Detect system preference or saved theme
  const savedTheme = localStorage.getItem(THEME_KEY) ||
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  applyTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  }

  // =========================================================================
  // 2. FEATURE 2: Smartphone Color Switcher & 3D Interactive Stage
  // =========================================================================
  const phoneVariants = {
    gold: {
      name: 'Sunburst Gold (Emas Matahari)',
      desc: 'Terinspirasi dari kilauan fajar keemasan. Menghadirkan tekstur sutra metalik dengan pantulan cahaya keemasan khas realme yang memikat dan mewah di setiap sudut.',
      bodyBg: 'linear-gradient(135deg, #FFDF79 0%, #FFB000 45%, #E58300 85%, #FFCE52 100%)',
      frameBorder: '4px solid #DF9C17',
      cameraRing: '#E5A800',
      price: 'Rp 3.499.000',
      specs: {
        chipset: 'Dimensity 7300-Energy 5G',
        camera: '108MP Studio AI Ultra-Clear',
        battery: '5000mAh + 67W SUPERVOOC',
        display: '6.72" 120Hz Ultra Smooth'
      }
    },
    green: {
      name: 'Oasis Emerald (Hijau Zamrud)',
      desc: 'Dibalut material Vegan Leather ramah lingkungan dengan tekstur butir kerikil premium. Tahan goresan dan sidik jari dengan nuansa alam yang menyejukkan.',
      bodyBg: 'linear-gradient(135deg, #164e3d 0%, #0d382b 50%, #08241c 100%)',
      frameBorder: '4px solid #1c5e4a',
      cameraRing: '#d4af37',
      price: 'Rp 3.499.000',
      specs: {
        chipset: 'Dimensity 7300-Energy 5G',
        camera: '108MP Studio AI Ultra-Clear',
        battery: '5000mAh + 67W SUPERVOOC',
        display: '6.72" 120Hz Ultra Smooth'
      }
    },
    silver: {
      name: 'Titanium Silver (Perak Futuristik)',
      desc: 'Proses pelapisan kaca AG (Anti-Glare) cermin aerospace dengan tekstur mikro nano. Memberikan pantulan perak futuristik yang sejuk dan elegan.',
      bodyBg: 'linear-gradient(135deg, #F8FAFC 0%, #CBD5E1 50%, #94A3B8 100%)',
      frameBorder: '4px solid #94A3B8',
      cameraRing: '#64748B',
      price: 'Rp 3.499.000',
      specs: {
        chipset: 'Dimensity 7300-Energy 5G',
        camera: '108MP Studio AI Ultra-Clear',
        battery: '5000mAh + 67W SUPERVOOC',
        display: '6.72" 120Hz Ultra Smooth'
      }
    },
    black: {
      name: 'Obsidian Midnight (Hitam Obsidian)',
      desc: 'Finishing matte beludru hitam pekat bertabur partikel mikro kosmik yang berkilau di bawah cahaya. Tampil misterius, tegas, dan bebas dari noda minyak.',
      bodyBg: 'linear-gradient(135deg, #252833 0%, #15171e 60%, #0c0e12 100%)',
      frameBorder: '4px solid #323746',
      cameraRing: '#3b82f6',
      price: 'Rp 3.499.000',
      specs: {
        chipset: 'Dimensity 7300-Energy 5G',
        camera: '108MP Studio AI Ultra-Clear',
        battery: '5000mAh + 67W SUPERVOOC',
        display: '6.72" 120Hz Ultra Smooth'
      }
    }
  };

  // Elements
  const phoneBody = document.getElementById('phoneBody');
  const cameraModule = document.getElementById('cameraModule');
  const activeColorName = document.getElementById('activeColorName');
  const colorDescription = document.getElementById('colorDescription');
  const colorSwatchButtons = document.querySelectorAll('.color-swatch-btn');
  const phoneStage = document.getElementById('phoneDisplayStage');
  const phoneWrapper = document.getElementById('phone3DWrapper');
  const frontScreen = document.getElementById('phoneFrontScreen');
  const tabBackView = document.getElementById('tabBackView');
  const tabFrontView = document.getElementById('tabFrontView');

  // Change Color Function
  function selectColor(colorKey) {
    const variant = phoneVariants[colorKey];
    if (!variant) return;

    // Update Phone Elements with Animation
    if (phoneBody) {
      phoneBody.style.background = variant.bodyBg;
      phoneBody.style.border = variant.frameBorder;
    }

    if (cameraModule) {
      cameraModule.style.boxShadow = `0 10px 25px rgba(0, 0, 0, 0.5), inset 0 0 0 3px ${variant.cameraRing}, inset 0 0 15px rgba(0,0,0,0.8)`;
    }

    // Update Text
    if (activeColorName) {
      activeColorName.textContent = variant.name;
    }
    if (colorDescription) {
      colorDescription.textContent = variant.desc;
    }

    // Update Active Button
    colorSwatchButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-color') === colorKey);
    });
  }

  // Bind Swatches
  colorSwatchButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const colorKey = btn.getAttribute('data-color');
      selectColor(colorKey);
    });
  });

  // Switch Between Back View & Front View
  if (tabBackView && tabFrontView) {
    tabBackView.addEventListener('click', () => {
      tabBackView.classList.add('active');
      tabFrontView.classList.remove('active');
      if (frontScreen) frontScreen.style.display = 'none';
      if (phoneBody) phoneBody.style.display = 'block';
    });

    tabFrontView.addEventListener('click', () => {
      tabFrontView.classList.add('active');
      tabBackView.classList.remove('active');
      if (frontScreen) frontScreen.style.display = 'block';
      if (phoneBody) phoneBody.style.display = 'none';
    });
  }

  // 3D Tilt Effect on Mouse Move
  if (phoneStage && phoneWrapper) {
    phoneStage.addEventListener('mousemove', (e) => {
      const rect = phoneStage.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const rotateY = (x / (rect.width / 2)) * 18; // Max 18 deg
      const rotateX = -(y / (rect.height / 2)) * 18; // Max 18 deg

      phoneWrapper.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    phoneStage.addEventListener('mouseleave', () => {
      phoneWrapper.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
    });
  }

  // Clock Update for Front Screen View
  function updatePhoneClock() {
    const clockEl = document.getElementById('phoneClock');
    const dateEl = document.getElementById('phoneDate');
    if (!clockEl) return;

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    clockEl.textContent = `${hours}:${minutes}`;

    if (dateEl) {
      const options = { weekday: 'short', month: 'short', day: 'numeric' };
      dateEl.textContent = now.toLocaleDateString('id-ID', options);
    }
  }
  updatePhoneClock();
  setInterval(updatePhoneClock, 1000);

  // Cart / Pre-order Alert Toast
  const btnBuy = document.getElementById('btnBuyNow');
  if (btnBuy) {
    btnBuy.addEventListener('click', () => {
      const activeColor = document.querySelector('.color-swatch-btn.active');
      const colorName = activeColor ? activeColor.getAttribute('data-name') : 'Sunburst Gold';
      alert(`🎉 Terima kasih! realme C100 varian "${colorName}" telah ditambahkan ke keranjang belanja Anda.`);
    });
  }

})();
