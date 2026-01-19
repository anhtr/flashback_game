# Copilot instructions for Flashback Game

This file gives concise, actionable guidance to AI coding agents working on the Flashback Game repository.

Summary
- Purpose: Single-page static browser game that asks players to order historical events. UI is in `index.html`, behavior in `script.js`, data in `events.json`, styles in `styles.css`, and compression helper `lz-string.min.js`.
- Runtime: Static site (no server-side code). Changes are visible by opening `index.html` in a browser or serving the directory with a static server.

Big-picture architecture and data flow
- UI: `index.html` contains DOM placeholders: `#ordered-timeline`, `#unsorted-events`, control buttons, and inputs for adding events.
- Behavior: `script.js` controls everything: loading event data (`loadEvents`), randomizing (`randomizeEvents`), selection/placement (`selectEvent`, `showPlacementSlots`, `placeEventAtPosition`), scoring (`checkEventOrder`, `updateScoreDisplay`), serialization (`encodeEventsToURL`, `decodeEventsFromURL`), and persistence (localStorage for `theme` and `editMode`).
- Data: `events.json` is a flat array of {name, date} objects. The UI maintains `eventsData` (in-memory) and DOM elements with `data-date` attributes.
- Share links: The app encodes the combined ordered + unsorted events into the `events` URL parameter using LZString compressed encodedURIComponent strings. Special token `EMPTY` indicates intentionally empty event sets.

Recent UI/CSS notes
- The `show date` control is implemented as `.show-date-toggle` and is rendered inside the main `.container` above the timeline. CSS positions this control to the right using rules targeting `.container .show-date-toggle` (and `.top-controls .show-date-toggle` if moved).
- The checkbox visuals are now implemented with a CSS-drawn monochrome checkbox: the native checkbox is visually hidden (kept accessible), and the box + check are drawn with `label::before`/`label::after`. This guarantees a consistent monochrome appearance across platforms. See `styles.css` for the exact rules (box: `label::before`, check: `input:checked + label::after`).
- Noto fonts: `Noto Serif`, `Noto Emoji`, `Noto Color Emoji` are self-hosted and used in the font stack. The CSS changes around the checkbox ensure emoji fonts are available for glyph fallbacks but the default control is CSS-drawn for visual consistency.

Important files and examples
- index.html: sets initial theme inlined in head to prevent flash — keep that if moving scripts.
- script.js: largest surface area. Key functions to inspect/modify:
  - `loadEvents()` — loads `events.json`, but first attempts to load URL-encoded events with `loadEventsFromURL()`; always loads `events.json` to keep full dataset available for randomize.
  - `encodeEventsToURL(events)` / `decodeEventsFromURL(encodedStr)` — use `LZString.compressToEncodedURIComponent` and decompress counterpart. If modifying encoding, update both.
  - `createEventElement(event, container)` — creates DOM structure and attaches click listeners via `addClickListeners()`; respects `data-edit-mode` for remove-button visibility.
  - `placeEventAtPosition(position)` — moves DOM element, reveals date, and calls `checkEventOrder()`.
  - `checkEventOrder(placedEvent)` — computes correctness by comparing `data-date` timestamps; first placement is tracked via `dataset.initialAnswer` to prevent score double-counting.
- events.json: canonical dataset. Editing or extending changes available eventsData for `randomizeEvents()`.
- lz-string.min.js: third-party lib used for URL compression. Keep this file or import an equivalent if refactoring.

Project-specific conventions and patterns
- DOM-driven state: The authoritative state is both `eventsData` (array) and DOM elements—many operations manipulate DOM directly rather than a separate state-model. When changing UI behavior, update both DOM and `eventsData` where appropriate.
- Dates as YYYY-MM-DD strings: Event `date` values are stored as `YYYY-MM-DD` and parsed with `new Date(...)`. Keep this format when adding events or modifying serialization.
- Edit mode gating: The `data-edit-mode` attribute on `body` toggles visibility of `.remove-button` elements; `window.EditMode.updateRemoveButtonsVisibility()` is used by dynamic additions.
- Shareable link flow: After loading events from URL, the app clears URL params using `clearURLParameters()` to return to data-less state; tests or changes that rely on URL should consider this behavior.

Randomize behavior and duplicates
- `randomizeEvents()` selects a sample without replacement using `shuffleArray(eventsData).slice(0, 7)` (Fisher–Yates shuffle + slice). That prevents selecting the same array element twice during sampling.
- This does not deduplicate content: if `eventsData` itself contains duplicate entries (identical `name`+`date`), the randomized result may include visually duplicate events. Consider deduplicating `eventsData` (by `name`+`date`) before randomizing if strict uniqueness by content is required.

Developer workflows and commands
- No build system or tests are present. To preview locally, serve the folder as static files. Recommended commands:
  - Python 3 simple server: `python -m http.server 8000` then open `http://localhost:8000`.
  - Node `http-server` (if installed): `npx http-server -c-1` to disable caching.
  - VSCode Live Server extension works too.
- Editing `events.json`: After changing, reload page (clear cache if needed) — encoded URL links will be ignored because `loadEvents()` always fetches `events.json` after attempting URL load.

Integration points and external dependencies
- `lz-string.min.js` is required for shareable link encoding/decoding. If replaced with another compression method, ensure `encodeEventsToURL` and `decodeEventsFromURL` use the same APIs and return compact URI-safe strings.
- Events are scraped/generated by `scrape_wikipedia_events.py` and `generate_sample_events.py` (helper scripts). They produce `events.json` or sample data. These are not invoked by the web app at runtime.

Editing and refactor guidance for AI agents
- Preserve behavior-first: Because the app mutates both DOM and `eventsData`, refactors must keep these in sync. Tests are not present — validate manually in browser and via small smoke runs.
- Small, local edits: Modify `script.js` in-place, and prefer adding helper functions rather than large rewrites. Example: to add a new scoring tweak, change `checkEventOrder()` only and keep DOM structure unchanged.
- When changing serialization format (URL), update both encode/decode and search/handling in `loadEventsFromURL()` and `generateShareableLink()`; keep `EMPTY` token semantics.
- To add unit tests: create a small Node-based test harness that imports functions from `script.js` after converting them to exportable modules, or extract pure functions (formatDate, shuffleArray, encode/decode helpers) into a new `lib.js` that can be imported by tests.

Styling and UI change notes for contributors
- The `styles.css` file contains several tweaks that are intentionally behavior-sensitive:
  - The inline theme script in `index.html` must remain to prevent flash-of-theme on load.
  - `.timeline` uses pseudo-elements to draw corner borders and complex background gradients—avoid replacing these with simple borders unless you intend to change the visual design.
  - Placement slots and event behaviors rely on DOM order and CSS classes (`.placement-slot`, `.event`, `.placed`, `.correct`, `.incorrect`). Keep those class names stable when changing logic.

What not to change without confirmation
- Do not remove the inline theme-setting script in `index.html` head — it prevents a flash-of-theme on load.
- Avoid changing the date format stored in `events.json` without coordinating changes to `formatDate()` and all places that call `new Date(...)` on `data-date`.

Examples (quick references)
- How `events` URL param is created: see `generateShareableLink()` in `script.js`.
- How an event element looks: see `createEventElement()` for expected DOM structure (`.event`, `.event-text`, `.event-Date`, `.remove-button`).

If anything is unclear
- Tell me which workflows or CI hooks you expect (e.g., GitHub Pages, Netlify) and whether you want automated tests; I will update this file to include CI and test commands.
