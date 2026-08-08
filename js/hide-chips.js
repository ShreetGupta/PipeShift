(() => {
  const TARGETS = [
    '#frosted-glass',
    'ytd-feed-filter-chip-bar-renderer',
    '#chips-wrapper',
  ];

  let observer = null;
  let disconnectTimer = null;

  function nuke() {
    let found = 0;
    TARGETS.forEach(sel =>
      document.querySelectorAll(sel).forEach(el => { el.remove(); found++; })
    );
    return found;
  }

  /* Start a short-lived observer that auto-disconnects once
     all targets are gone or after a safety timeout.
     This avoids the old pattern of watching the *entire* DOM
     tree forever — which fired on every infinite-scroll
     content load and caused scroll jank in Chromium. */
  function startObserver() {
    // Clean up any previous instance
    stopObserver();

    // Immediate pass — may already be enough
    nuke();

    let raf = null;
    observer = new MutationObserver(() => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const removed = nuke();
        // If nothing was found this pass, the targets are gone — disconnect
        if (removed === 0) stopObserver();
      });
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });

    // Safety net: disconnect after 3 s even if targets keep re-appearing.
    // YouTube only (re-)inserts these elements during navigation transitions,
    // never during steady-state scrolling — 3 s is more than enough.
    disconnectTimer = setTimeout(stopObserver, 3000);
  }

  function stopObserver() {
    if (observer) { observer.disconnect(); observer = null; }
    if (disconnectTimer) { clearTimeout(disconnectTimer); disconnectTimer = null; }
  }

  // Run on initial page load
  startObserver();

  // Re-run only on YouTube SPA navigations (the only time chips get re-inserted)
  document.addEventListener('yt-navigate-finish', startObserver);
})();
