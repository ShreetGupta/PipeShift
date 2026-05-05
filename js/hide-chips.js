(() => {
  const TARGETS = [
    '#frosted-glass',
    'ytd-feed-filter-chip-bar-renderer',
    '#chips-wrapper',
  ];

  function nuke() {
    TARGETS.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => el.remove());
    });
  }

  // Run immediately
  nuke();

  // Watch for elements being (re)added by YouTube's SPA
  new MutationObserver(nuke).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  // Belt-and-suspenders: also poll every 500ms
  setInterval(nuke, 500);
})();
