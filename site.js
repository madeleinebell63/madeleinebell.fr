(() => {
  'use strict';
  const buttons = [...document.querySelectorAll('[data-set]')];
  const video = document.getElementById('nakaya');
  const videoButton = document.getElementById('vbtn');
  const copyButton = document.getElementById('copy');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let manuallyPaused = false;
  let copyTimer;

  function videoLabel() {
    const paused = video.paused;
    videoButton.querySelector('[lang="fr"]').textContent = paused ? 'Lecture' : 'Pause';
    videoButton.querySelector('[lang="en"]').textContent = paused ? 'Play' : 'Pause';
    videoButton.setAttribute('aria-label', document.documentElement.lang === 'fr'
      ? (paused ? 'Lire la vidéo' : 'Mettre la vidéo en pause')
      : (paused ? 'Play video' : 'Pause video'));
  }

  function setLanguage(language) {
    if (!['fr', 'en'].includes(language)) return;
    document.body.dataset.lang = language;
    document.documentElement.lang = language;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.set === language)));
    try { localStorage.setItem('madeleine-bell-language', language); } catch {}
    videoLabel();
  }
  buttons.forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.set)));
  let savedLanguage;
  try { savedLanguage = localStorage.getItem('madeleine-bell-language'); } catch {}
  setLanguage(new URLSearchParams(location.search).get('lang') || savedLanguage || 'fr');

  video.muted = true;
  video.addEventListener('play', videoLabel);
  video.addEventListener('pause', videoLabel);
  video.addEventListener('error', () => {
    videoButton.hidden = true;
    video.controls = true;
  });
  videoButton.addEventListener('click', async () => {
    if (video.paused) {
      manuallyPaused = false;
      try { await video.play(); } catch { video.controls = true; }
    } else {
      manuallyPaused = true;
      video.pause();
    }
    videoLabel();
  });
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting && !manuallyPaused && !reducedMotion.matches) {
        video.play().catch(() => videoLabel());
      } else {
        video.pause();
      }
    }
  }, {threshold: 0.2});
  observer.observe(video);

  copyButton.setAttribute('aria-live', 'polite');
  copyButton.addEventListener('click', async () => {
    const email = document.getElementById('mail').textContent.trim();
    try {
      const field = document.createElement('textarea');
      field.value = email;
      field.setAttribute('readonly', '');
      field.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.append(field);
      field.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } catch {}
      field.remove();
      if (!copied) await navigator.clipboard.writeText(email);
      copyButton.querySelector('[lang="fr"]').textContent = 'Copié';
      copyButton.querySelector('[lang="en"]').textContent = 'Copied';
    } catch {
      const range = document.createRange();
      range.selectNodeContents(document.getElementById('mail'));
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      copyButton.querySelector('[lang="fr"]').textContent = 'Sélectionné';
      copyButton.querySelector('[lang="en"]').textContent = 'Selected';
    }
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      copyButton.querySelector('[lang="fr"]').textContent = 'Copier';
      copyButton.querySelector('[lang="en"]').textContent = 'Copy';
    }, 2200);
  });
})();
