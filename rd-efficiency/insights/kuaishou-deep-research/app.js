/* Tab Navigation + Section Overview Sync + Global Controls */
(function () {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const panels  = document.querySelectorAll('.panel');

  function activate(idx) {
    tabBtns.forEach(btn => {
      const isActive = +btn.dataset.tab === idx;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    panels.forEach(p => p.classList.toggle('active', +p.dataset.panel === idx));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  tabBtns.forEach(btn => btn.addEventListener('click', () => activate(+btn.dataset.tab)));

  /* Keyboard navigation for tabs */
  const tabNav = document.querySelector('.tab-nav');
  if (tabNav) {
    tabNav.addEventListener('keydown', (e) => {
      const btns = Array.from(tabBtns);
      const current = btns.findIndex(b => b.classList.contains('active'));
      let next = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        next = (current + 1) % btns.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        next = (current - 1 + btns.length) % btns.length;
      } else if (e.key === 'Home') {
        next = 0;
      } else if (e.key === 'End') {
        next = btns.length - 1;
      }
      if (next >= 0) {
        e.preventDefault();
        btns[next].focus();
        activate(next);
      }
    });
  }
})();

/* Fullscreen toggle */
function toggleFS() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen();
  }
}

/* Mobile preview toggle */
function toggleMobile() {
  document.getElementById('app').classList.toggle('mobile-preview');
}

/* Scroll to top */
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
