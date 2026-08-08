# PipeShift

<img src="icons/icon128.png" width="72" align="right" alt="PipeShift icon"/>

A browser extension that rethinks three parts of the YouTube experience — replaces the harsh pitch-black dark mode with a softer grey palette, moves the comments panel to the sidebar alongside related videos, and removes the category chip bar entirely.

No permissions beyond `youtube.com`. No background process, no storage, no network requests. Just CSS and scoped DOM work that runs only where it's needed.

Available on [Firefox Add-ons](https://addons.mozilla.org) · Chrome Web Store *(coming soon)*

---

## What it does

**Soft grey dark mode** — Overrides YouTube's CSS custom properties and element backgrounds to replace the default `#0f0f0f` with a muted `#191919` grey. All swaps are opaque hex values, which eliminates the alpha-blending overhead that YouTube's default `rgba()` backgrounds introduce during compositing.

**Side comments panel** — On watch pages, the `#comments` node is lifted out of the primary column and prepended into `#secondary-inner`, where it becomes a fixed-height scrollable card alongside related videos. Layout is handled entirely through CSS (`position: sticky`, `overflow-y: auto`). The script detects readiness through YouTube's own `yt-navigate-finish` event and a content-length check, then cleans up observers once activated.

**No category chips** — The chip filter bar and YouTube's `#frosted-glass` backdrop-filter overlay are suppressed via CSS at `document_start`, before the first paint. A short-lived MutationObserver handles any elements that YouTube re-inserts during SPA transitions, then auto-disconnects to stay out of the scroll path.

---

## Architecture

```
manifest.json
├── content_scripts [document_start]
│   ├── css/theme.css              # CSS variable overrides + background swaps
│   ├── css/hide-chips.css         # display:none for chips + frosted-glass
│   ├── js/hide-chips.js           # Self-disconnecting observer for chip removal
│   ├── js/fullscreen.js           # Hides popup container in fullscreen
│   └── js/playlist-hide.js        # CSS injection: hides playlist until sidebar is ready
│
└── content_scripts [document_idle]
    ├── css/side-comments.css      # Sidebar layout, sticky header, scrollable card
    └── js/side-comments.js        # Comments relocation + SPA navigation handling
```

There is no background service worker. Every script is a content script scoped to `*://www.youtube.com/*`.

### Performance considerations

The homepage feed was a specific focus. YouTube's infinite scroll continuously injects DOM nodes as you scroll, which makes any always-on MutationObserver a source of frame drops in Chromium.

- **Observers disconnect** — `hide-chips.js` runs a MutationObserver only during page transitions, auto-disconnects once targets are removed (or after a 3-second ceiling), and stays completely inert during steady-state scrolling.
- **CSS containment** — `ytd-rich-grid-row` gets `contain: layout style paint` and each `ytd-rich-item-renderer` gets `content-visibility: auto`, so the browser can skip layout and paint for off-screen video cards.
- **Opaque backgrounds** — Replacing YouTube's semi-transparent `rgba()` backgrounds with opaque hex values lets the compositor skip alpha blending entirely.
- **No backdrop-filter** — YouTube's `#frosted-glass` overlay (which uses `backdrop-filter: blur()`) is killed via CSS before first paint, avoiding Chromium's expensive real-time pixel resampling.

---

## Install

**Firefox** — Install from [Firefox Add-ons](https://addons.mozilla.org).

**Chromium browsers** (Chrome, Brave, Edge, Vivaldi):
1. Download and extract the repository
2. Open `chrome://extensions` → enable **Developer mode**
3. Click **Load unpacked** → select the extracted folder

The extension activates automatically on `youtube.com`. YouTube's built-in dark mode must be enabled — the grey overrides only apply when `html[dark]` is present.

---

## Privacy

PipeShift requests zero API permissions. It does not read, collect, store, or transmit any data. The only capability is DOM access on `youtube.com` via content scripts — the minimum required to modify the page's appearance and layout.

---

## Credits

The side comments feature builds on ideas from [**Sidesy**](https://github.com/abinjohn123/sidesy) by [@abinjohn123](https://github.com/abinjohn123).

Sidesy is the original extension that pioneered moving YouTube comments to a sidebar. After several failed approaches to reliable SPA navigation detection, studying Sidesy's source code was the breakthrough — specifically its use of `yt-navigate-finish` as the sole navigation hook, and the `innerHTML.length > 100` readiness check that distinguishes a loaded comments section from an empty placeholder.

If you want a more full-featured sidebar experience (toggle button, keyboard shortcut, scroll position memory), check out [Sidesy on the Chrome Web Store](https://chromewebstore.google.com/detail/mlceikceecooilkgiikkopipedhjjech).

---

## License

MIT
