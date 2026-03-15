/* Tab 切换 + 章节概览联动 + 全局控制 */
(function () {
  const tabs = document.querySelectorAll('.tab-btn');
  const chips = document.querySelectorAll('.chip');
  const panels = document.querySelectorAll('.panel');

  function activate(idx) {
    tabs.forEach(t => t.classList.toggle('active', +t.dataset.tab === idx));
    chips.forEach(c => c.classList.toggle('active', +c.dataset.tab === idx));
    panels.forEach(p => p.classList.toggle('active', +p.dataset.panel === idx));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  tabs.forEach(t => t.addEventListener('click', () => activate(+t.dataset.tab)));
  chips.forEach(c => c.addEventListener('click', () => activate(+c.dataset.tab)));
})();

/* 全屏切换 */
function toggleFS() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
}

/* 移动端预览 */
function toggleMobile() {
  document.getElementById('app').classList.toggle('mobile-preview');
}

/* 回顶部 */
function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
