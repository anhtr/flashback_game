/**
 * THEME TOGGLE FUNCTIONALITY
 * 
 * Manages dark/light theme switching for the entire application.
 * The theme is applied via data-theme attribute on <html> element which triggers
 * CSS custom property changes defined in styles.css.
 * 
 * Theme is persisted in localStorage and applied immediately on page load via
 * inline script in index.html (prevents flash of wrong theme).
 * 
 * Integration points:
 * - Changes CSS variables defined in :root and [data-theme="dark"] in styles.css
 * - Persists preference in localStorage with key 'theme'
 * - Updates button text/emoji and aria labels for accessibility
 */
(function() {
    const themeToggle = document.getElementById('theme-toggle');
    
    // Exit early if theme toggle element doesn't exist (defensive programming)
    if (!themeToggle) {
        console.warn('Theme toggle button not found');
        return;
    }
    
    // Get current theme (already set in HTML head)
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    updateToggleButton(currentTheme);
    
    // Toggle theme on button click
    themeToggle.addEventListener('click', () => {
        const activeTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateToggleButton(newTheme);
    });
    
    function updateToggleButton(theme) {
        if (theme === 'dark') {
            themeToggle.innerHTML = '<span class="btn-emoji">🌙</span><span class="btn-text"> Dark mode: ON</span>';
            themeToggle.setAttribute('aria-label', 'Dark mode is on, click to switch to light mode');
            themeToggle.setAttribute('title', 'Dark mode: ON');
        } else {
            themeToggle.innerHTML = '<span class="btn-emoji">☀</span><span class="btn-text"> Dark mode: OFF</span>';
            themeToggle.setAttribute('aria-label', 'Dark mode is off, click to switch to dark mode');
            themeToggle.setAttribute('title', 'Dark mode: OFF');
        }
    }
})();

/**
 * DEBUG MODE TOGGLE FUNCTIONALITY
 * 
 * Enables display of sequential event index numbers on event cards.
 * Used during development and testing to track event ordering and help
 * identify specific events in the timeline.
 * 
 * When enabled:
 * - Shows .event-debug-index elements (normally hidden) on each event card
 * - Index numbers are assigned sequentially as events are added (see nextEventIndex)
 * - Persisted in localStorage so debug state survives page reloads
 * 
 * Integration points:
 * - data-debug-mode attribute on body controls CSS visibility rules
 * - window.DebugMode.updateDebugIndicesVisibility() can be called when events are dynamically added
 * - Debug indices are created in createEventElement() function
 */
(function() {
    const debugToggle = document.getElementById('debug-toggle');
    
    // Exit early if debug toggle element doesn't exist (defensive programming)
    if (!debugToggle) {
        console.warn('Debug toggle button not found');
        return;
    }
    
    // Debug mode is off by default, or use saved preference
    const savedDebugMode = localStorage.getItem('debugMode');
    const currentDebugMode = savedDebugMode ?? 'off';
    
    // Apply the debug mode
    document.body.setAttribute('data-debug-mode', currentDebugMode);
    updateDebugModeButton(currentDebugMode);
    updateDebugIndicesVisibility(currentDebugMode);
    
    // Toggle debug mode on button click
    debugToggle.addEventListener('click', () => {
        const activeDebugMode = document.body.getAttribute('data-debug-mode');
        const newDebugMode = activeDebugMode === 'on' ? 'off' : 'on';
        
        document.body.setAttribute('data-debug-mode', newDebugMode);
        localStorage.setItem('debugMode', newDebugMode);
        updateDebugModeButton(newDebugMode);
        updateDebugIndicesVisibility(newDebugMode);
    });
    
    function updateDebugModeButton(mode) {
        if (mode === 'on') {
            debugToggle.innerHTML = '<span class="btn-emoji">🪲</span><span class="btn-text"> Debug mode: ON</span>';
            debugToggle.setAttribute('aria-label', 'Debug mode is on, click to turn off');
            debugToggle.setAttribute('title', 'Debug mode: ON');
        } else {
            debugToggle.innerHTML = '<span class="btn-emoji">🪲</span><span class="btn-text"> Debug mode: OFF</span>';
            debugToggle.setAttribute('aria-label', 'Debug mode is off, click to turn on');
            debugToggle.setAttribute('title', 'Debug mode: OFF');
        }
    }
    
    function updateDebugIndicesVisibility(mode) {
        const debugIndices = document.querySelectorAll('.event-debug-index');
        debugIndices.forEach(index => {
            if (mode === 'on') {
                index.classList.remove('hidden');
            } else {
                index.classList.add('hidden');
            }
        });
    }
    
    // Make the update function globally accessible
    // This is needed when new events are created dynamically
    window.DebugMode = window.DebugMode || {};
    window.DebugMode.updateDebugIndicesVisibility = updateDebugIndicesVisibility;
})();

/**
 * EDIT MODE TOGGLE FUNCTIONALITY
 * 
 * Enables advanced game controls for customizing event sets.
 * When enabled, reveals additional UI controls and event management features.
 * 
 * Features unlocked in edit mode:
 * - Remove buttons on events in the unsorted pile (before they're placed)
 * - Shuffle, Reset, Randomize, and Clear buttons
 * - "Add a new event" form at bottom of page
 * - Manual event addition with custom name and date
 * 
 * Design rationale:
 * - Keeps main UI clean for players by hiding advanced controls
 * - Allows teachers/creators to build custom event sets
 * - Persisted in localStorage so edit state survives page reloads
 * 
 * Integration points:
 * - data-edit-mode="on" attribute on body enables CSS rules (.edit-mode-only)
 * - window.EditMode.updateRemoveButtonsVisibility() called when events are dynamically added
 * - Remove buttons are only shown on unsorted events, not placed events (immutable once placed)
 */
(function() {
    const editModeToggle = document.getElementById('edit-mode-toggle');
    
    // Exit early if edit mode toggle element doesn't exist (defensive programming)
    if (!editModeToggle) {
        console.warn('Edit mode toggle button not found');
        return;
    }
    
    // Edit mode is off by default, or use saved preference
    const savedEditMode = localStorage.getItem('editMode');
    const currentEditMode = savedEditMode ?? 'off';
    
    // Apply the edit mode
    document.body.setAttribute('data-edit-mode', currentEditMode);
    updateEditModeButton(currentEditMode);
    updateRemoveButtonsVisibility(currentEditMode);
    
    // Toggle edit mode on button click
    editModeToggle.addEventListener('click', () => {
        const activeEditMode = document.body.getAttribute('data-edit-mode');
        const newEditMode = activeEditMode === 'on' ? 'off' : 'on';
        
        document.body.setAttribute('data-edit-mode', newEditMode);
        localStorage.setItem('editMode', newEditMode);
        updateEditModeButton(newEditMode);
        updateRemoveButtonsVisibility(newEditMode);
    });
    
    function updateEditModeButton(mode) {
        if (mode === 'on') {
            editModeToggle.innerHTML = '<span class="btn-emoji">✏</span><span class="btn-text"> Edit</span>';
            editModeToggle.setAttribute('aria-label', 'Edit mode is on, click to turn off');
        } else {
            editModeToggle.innerHTML = '<span class="btn-emoji">✏</span><span class="btn-text"> Edit</span>';
            editModeToggle.setAttribute('aria-label', 'Edit mode is off, click to turn on');
        }
    }
    
    function updateRemoveButtonsVisibility(mode) {
        const removeButtons = document.querySelectorAll('.remove-button');
        removeButtons.forEach(button => {
            if (mode === 'on') {
                // Only show remove button if the event is still in the unsorted pile
                // (not yet placed in the ordered timeline)
                const event = button.closest('.event');
                if (event && event.parentNode.id === 'unsorted-events') {
                    button.style.display = '';
                }
            } else {
                button.style.display = 'none';
            }
        });
    }
    
    // Make the update function globally accessible via a namespace
    // This is needed when new events are created dynamically
    window.EditMode = window.EditMode || {};
    window.EditMode.updateRemoveButtonsVisibility = updateRemoveButtonsVisibility;
})();

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SHOW DATE TOGGLE - Controls visibility of event dates on placed events
 * ═══════════════════════════════════════════════════════════════════════════
 * Purpose:
 *   Allows players to optionally hide/show dates on events they've placed in the
 *   ordered timeline. This is useful for:
 *   - Increasing challenge by removing date hints
 *   - Focusing on relative chronological ordering without absolute dates
 *   - Accommodating different learning/testing preferences
 *
 * Behavior/Features:
 *   - Checkbox control in UI (show date / hide date)
 *   - Default state: ON (dates visible) for user-friendly experience
 *   - Persists user preference in localStorage as 'showDate' ('on' | 'off')
 *   - Only affects dates in #ordered-timeline (not unsorted events)
 *   - Updates DOM by adding/removing 'hidden' class on .event-Date elements
 *   - State synchronized via data-show-date attribute on <body>
 *
 * Design Rationale:
 *   - Default ON ensures new users see dates immediately for context
 *   - Only affects placed events (ordered timeline) because unsorted events always
 *     keep dates hidden until placement to preserve game challenge
 *   - Checkbox positioned in main container for easy access during gameplay
 *   - CSS-drawn monochrome checkbox for consistent cross-browser appearance
 *
 * Integration Points:
 *   - CSS: data-show-date attribute on body controls .event-Date.hidden styling
 *   - localStorage: 'showDate' key persists preference across sessions
 *   - window.ShowDate.updateDateVisibility(): Exposed globally for dynamic event additions
 *   - Related: placeEventAtPosition() reveals dates when placing events
 */
// Show date toggle functionality
(function() {
    const showDateToggle = document.getElementById('show-date-toggle');
    const showDateCheckbox = document.getElementById('show-date-checkbox');
    
    // Exit early if elements don't exist
    if (!showDateToggle || !showDateCheckbox) {
        console.warn('Show date toggle button or checkbox not found');
        return;
    }
    
    // Show date is on by default, or use saved preference
    const savedShowDate = localStorage.getItem('showDate');
    const currentShowDate = savedShowDate !== null ? savedShowDate : 'on';
    
    // Apply the show date preference
    document.body.setAttribute('data-show-date', currentShowDate);
    showDateCheckbox.checked = currentShowDate === 'on';
    updateDateVisibility(currentShowDate);
    
    // Toggle show date on checkbox change
    showDateCheckbox.addEventListener('change', () => {
        const newShowDate = showDateCheckbox.checked ? 'on' : 'off';
        
        document.body.setAttribute('data-show-date', newShowDate);
        localStorage.setItem('showDate', newShowDate);
        updateDateVisibility(newShowDate);
    });
    
    function updateDateVisibility(mode) {
        // Only affect dates in the ordered timeline
        const orderedTimeline = document.getElementById('ordered-timeline');
        if (orderedTimeline) {
            const dates = orderedTimeline.querySelectorAll('.event-Date');
            dates.forEach(date => {
                if (mode === 'on') {
                    date.classList.remove('hidden');
                } else {
                    date.classList.add('hidden');
                }
            });
        }
    }
    
    // Make the update function globally accessible
    window.ShowDate = window.ShowDate || {};
    window.ShowDate.updateDateVisibility = updateDateVisibility;
})();

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * URL ENCODING/DECODING - Shareable link generation and parsing
 * ═══════════════════════════════════════════════════════════════════════════
 * Purpose:
 *   Enables users to share custom event sets via URL. This allows:
 *   - Teachers creating custom quiz scenarios for students
 *   - Friends challenging each other with specific event combinations
 *   - Saving and restoring game state without server-side storage
 *
 * Compression Strategy:
 *   Uses LZString library (lz-string.min.js) to compress JSON event arrays:
 *   - Raw JSON: [{name:"...", date:"YYYY-MM-DD"}, ...]
 *   - Compressed: Base64-like encoded string safe for URLs
 *   - Typical compression: 60-80% reduction in URL length
 *   - Special token: 'EMPTY' represents intentionally empty event list
 *
 * URL Parameter Format:
 *   ?events=<LZString compressed JSON>
 *   - Single query parameter 'events' contains all state
 *   - Includes both ordered timeline events AND unsorted events
 *   - URL is cleared after load (clearURLParameters) to return to data-less state
 *
 * Data Flow:
 *   Encoding: DOM events → JS array → JSON → LZString → URL param
 *   Decoding: URL param → LZString → JSON → JS array → DOM events
 *
 * Integration Points:
 *   - generateShareableLink(): Collects current game state into URL
 *   - loadEventsFromURL(): Parses URL on page load, populates game
 *   - Copy link button: Triggers encoding and clipboard copy
 *   - Date format: YYYY-MM-DD strings (ISO-like) preserved through encoding
 *   - Error handling: Invalid URLs fall back to randomized events with toast notification
 */
// Function to encode events to URL format using lz-string compression
function encodeEventsToURL(events) {
    // Check if LZString is available
    if (typeof LZString === 'undefined') {
        console.error('LZString library not loaded');
        return null;
    }
    // Keep dates in yyyy-mm-dd format (no hex conversion needed)
    const eventsJSON = JSON.stringify(events);
    // Use lz-string to compress and encode for URI
    return LZString.compressToEncodedURIComponent(eventsJSON);
}

// Function to show a transient toast message
function showToast(message, duration = 5000) {
    // Create toast element
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = message;
    
    // Add to document
    document.body.appendChild(toast);
    
    // Remove after animation completes
    setTimeout(() => {
        // Check if element still exists before removing
        if (toast.parentNode) {
            toast.remove();
        }
    }, duration);
}

// Function to decode events from URL
function decodeEventsFromURL(encodedStr) {
    try {
        // Check if LZString is available
        if (typeof LZString === 'undefined') {
            console.error('LZString library not loaded');
            return null;
        }
        // Decompress using lz-string
        const decompressed = LZString.decompressFromEncodedURIComponent(encodedStr);
        if (!decompressed) {
            console.error('Error decompressing events from URL');
            return null;
        }
        // Parse the JSON
        return JSON.parse(decompressed);
    } catch (e) {
        console.error('Error decoding events from URL:', e);
        return null;
    }
}

// Function to clear URL parameters and return to data-less state
function clearURLParameters() {
    const cleanUrl = new URL(window.location.origin + window.location.pathname);
    window.history.replaceState({}, '', cleanUrl);
}

// Function to generate shareable link with current state
function generateShareableLink() {
    // Collect events from both ordered timeline and unsorted events
    const orderedTimelineContainer = document.getElementById("ordered-timeline");
    const unsortedEventsContainer = document.getElementById("unsorted-events");
    
    const orderedEvents = Array.from(orderedTimelineContainer.children).map(eventElement => ({
        name: eventElement.querySelector('.event-text').textContent,
        date: eventElement.dataset.date
    }));
    
    const unsortedEvents = Array.from(unsortedEventsContainer.children).map(eventElement => ({
        name: eventElement.querySelector('.event-text').textContent,
        date: eventElement.dataset.date
    }));
    
    // Combine all events (ordered timeline + unsorted)
    const allEvents = [...orderedEvents, ...unsortedEvents];
    
    const url = new URL(window.location.origin + window.location.pathname);
    
    // Handle empty event list with special indicator
    if (allEvents.length === 0) {
        url.searchParams.set('events', 'EMPTY');
    } else {
        const encodedEvents = encodeEventsToURL(allEvents);
        url.searchParams.set('events', encodedEvents);
    }
    
    return url.toString();
}

// Function to load events from URL
function loadEventsFromURL() {
    const url = new URL(window.location);
    const encodedEvents = url.searchParams.get('events');
    
    if (encodedEvents) {
        // Handle intentionally empty list
        if (encodedEvents === 'EMPTY') {
            // Clear existing unsorted events
            const unsortedEventsContainer = document.getElementById("unsorted-events");
            unsortedEventsContainer.innerHTML = "";
            
            // Reset the index counter when loading from URL (starting fresh)
            nextEventIndex = 1;
            
            // Update totalPossibleScore
            totalPossibleScore = 0;
            updateScoreDisplay();
            
            // Clear URL parameters to return to data-less state
            clearURLParameters();
            
            return true;
        }
        
        const events = decodeEventsFromURL(encodedEvents);
        if (events && events.length > 0) {
            // Clear existing unsorted events
            const unsortedEventsContainer = document.getElementById("unsorted-events");
            unsortedEventsContainer.innerHTML = "";
            
            // Reset the index counter when loading from URL (starting fresh with shared events)
            nextEventIndex = 1;
            
            // Load events from URL (don't populate eventsData here - it will be loaded from JSON)
            events.forEach(event => createEventElement(event, unsortedEventsContainer));
            
            // Sort unsorted events by their index
            sortUnsortedEventsByIndex();
            
            // Update totalPossibleScore (first event doesn't count)
            const totalEvents = unsortedEventsContainer.children.length + document.getElementById("ordered-timeline").children.length;
            totalPossibleScore = Math.max(0, totalEvents - 1);
            updateScoreDisplay();
            
            // Clear URL parameters to return to data-less state
            clearURLParameters();
            
            return true;
        } else {
            // Decoding failed - show error message and return false to load random events
            showToast('⚠ Failed to load events from URL. The link may be corrupted or incorrectly formatted. Randomized events were loaded instead.');
            
            // Clear URL parameters since they're invalid
            clearURLParameters();
            
            return false;
        }
    }
    return false;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * COPY LINK BUTTON - Generates and copies shareable URL to clipboard
 * ═══════════════════════════════════════════════════════════════════════════
 * Purpose:
 *   Single-click action to create a shareable URL containing the current game state.
 *   Users can share this link to reproduce the exact event combination.
 *
 * Behavior:
 *   1. Collects all events (ordered timeline + unsorted) from DOM
 *   2. Encodes them into compressed URL via generateShareableLink()
 *   3. Copies URL to system clipboard using navigator.clipboard API
 *   4. Shows toast notification confirming copy success/failure
 *   5. Fallback: If clipboard API unavailable, shows link in toast for manual copy
 *
 * Integration Points:
 *   - Calls: generateShareableLink() → encodeEventsToURL()
 *   - Depends on: navigator.clipboard.writeText() (modern browsers)
 *   - Feedback: showToast() for user confirmation
 *   - URL format: Origin + pathname + ?events=<encoded data>
 */
// Copy link button functionality
(function() {
    const copyLinkBtn = document.getElementById('copy-link-btn');
    
    if (!copyLinkBtn) {
        console.warn('Copy link button not found');
        return;
    }
    
    // Copy link button functionality
    copyLinkBtn.addEventListener('click', () => {
        // Generate the shareable link with current state
        const shareableLink = generateShareableLink();
        
        navigator.clipboard.writeText(shareableLink).then(() => {
            // Visual feedback - change button text and color temporarily
            const originalHTML = copyLinkBtn.innerHTML;
            const originalBgColor = copyLinkBtn.style.backgroundColor;
            const originalTitle = copyLinkBtn.getAttribute('title');
            copyLinkBtn.innerHTML = '<span class="btn-emoji">📋</span><span class="btn-text"> Copied!</span>';
            copyLinkBtn.style.backgroundColor = '#4caf50'; // Green color
            copyLinkBtn.setAttribute('title', 'Copied!');
            setTimeout(() => {
                copyLinkBtn.innerHTML = originalHTML;
                copyLinkBtn.style.backgroundColor = originalBgColor;
                copyLinkBtn.setAttribute('title', originalTitle);
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy link:', err);
            alert('Failed to copy link. Please copy this shareable link manually:\n\n' + shareableLink);
        });
    });
})();

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GAME STATE VARIABLES - Core state tracking for game mechanics
 * ═══════════════════════════════════════════════════════════════════════════
 * These module-level variables maintain the state of the game across user interactions.
 *
 * playerScore (number):
 *   - Current score earned by player (correct placements only)
 *   - First event placement doesn't count (no reference point)
 *   - Incremented only on first placement attempt per event (dataset.initialAnswer)
 *   - Updated via checkEventOrder() after placeEventAtPosition()
 *
 * totalPossibleScore (number):
 *   - Maximum achievable score for current game
 *   - Calculated as: (total events - 1) since first placement can't be wrong
 *   - Updated when events are added/removed/randomized
 *
 * selectedEvent (HTMLElement | null):
 *   - Reference to currently selected event element (has .selected class)
 *   - Set by selectEvent(), cleared by deselectEvent()
 *   - Used to determine which event to place when slot is clicked
 *
 * eventsData (Array<{name: string, date: string}>):
 *   - Master dataset loaded from events.json
 *   - Contains all available historical events for randomization
 *   - Dates in YYYY-MM-DD format (ISO-like)
 *   - Used by EventPool and randomizeEvents() to select new events
 *
 * nextEventIndex (number):
 *   - Sequential counter for debug mode event numbering
 *   - Each created event gets unique index via data-event-index attribute
 *   - Persists across randomizations (doesn't reset) for continuous tracking
 *   - Reset only when loading from URL or starting fresh game
 *
 * EVENTS_PER_GAME (const number = 8):
 *   - Default number of events in a new game
 *
 * EVENTS_TO_ADD (const number = 7):
 *   - Number of events added by "Add more events" button
 */
let playerScore = 0;
let totalPossibleScore = 0;
let selectedEvent = null;
let eventsData = [];
let nextEventIndex = 1; // Track the next sequential index number for events
const EVENTS_PER_GAME = 8;
const EVENTS_TO_ADD = 7;

// Function to sort unsorted events by their index numbers
function sortUnsortedEventsByIndex() {
    const unsortedEventsContainer = document.getElementById("unsorted-events");
    const events = Array.from(unsortedEventsContainer.children);
    
    if (events.length === 0) {
        return; // Nothing to sort
    }
    
    // Sort events by their index (stored in data-event-index attribute)
    events.sort((a, b) => {
        const indexA = parseInt(a.dataset.eventIndex || '0', 10);
        const indexB = parseInt(b.dataset.eventIndex || '0', 10);
        return indexA - indexB;
    });
    
    // Clear the container and re-append in sorted order
    unsortedEventsContainer.innerHTML = "";
    events.forEach(event => unsortedEventsContainer.appendChild(event));
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EVENT POOL MODULE - Smart event selection with date deduplication
 * ═══════════════════════════════════════════════════════════════════════════
 * Purpose:
 *   Prevents duplicate dates when adding or randomizing events. This ensures:
 *   - No two events on screen share the same date
 *   - Randomization replaces old events with truly different ones
 *   - "Add more events" doesn't introduce date conflicts
 *
 * Deduplication Strategy:
 *   1. Scan DOM for all existing event dates (ordered + unsorted)
 *   2. Build Set of used dates for O(1) lookup
 *   3. Filter eventsData to exclude any events with used dates
 *   4. Select from remaining pool using Fisher-Yates shuffle
 *
 * IMPORTANT: Content Duplicates vs Date Duplicates
 *   - This module ONLY prevents date duplicates (e.g., two events on 1969-07-20)
 *   - Does NOT deduplicate event NAME/CONTENT (if events.json has duplicate entries,
 *     they can both appear IF they have different dates)
 *   - For strict content deduplication, preprocess eventsData before using EventPool
 *
 * API Methods:
 *   getUsedDates() → Set<string>
 *     - Scans #ordered-timeline and #unsorted-events for all data-date attributes
 *     - Returns Set of YYYY-MM-DD strings currently on screen
 *
 *   getAvailableEvents(allEvents, usedDates) → Array<Event>
 *     - Filters allEvents to exclude any with dates in usedDates Set
 *     - Returns array of events safe to add without date conflicts
 *
 *   getRandomEvents(count) → Array<Event>
 *     - Main entry point: gets N random events from available pool
 *     - Internally calls getUsedDates() + getAvailableEvents() + shuffleArray()
 *     - Returns up to 'count' events (may return fewer if pool exhausted)
 *     - Returns empty array [] if no events available
 *
 * Integration Points:
 *   - Used by: randomizeEvents(), addMoreEvents()
 *   - Depends on: eventsData (master dataset), shuffleArray() (Fisher-Yates)
 *   - DOM queries: #ordered-timeline, #unsorted-events
 */
// Reusable module for random event selection with deduplication
const EventPool = {
    // Get dates that are already in use on the page
    getUsedDates() {
        const orderedTimeline = document.getElementById("ordered-timeline");
        const unsortedEvents = document.getElementById("unsorted-events");
        
        const usedDates = new Set();
        
        // Collect dates from ordered timeline
        Array.from(orderedTimeline.children).forEach(eventElement => {
            if (eventElement.dataset.date) {
                usedDates.add(eventElement.dataset.date);
            }
        });
        
        // Collect dates from unsorted events
        Array.from(unsortedEvents.children).forEach(eventElement => {
            if (eventElement.dataset.date) {
                usedDates.add(eventElement.dataset.date);
            }
        });
        
        return usedDates;
    },
    
    // Get available events that don't have dates already in use
    getAvailableEvents(allEvents, usedDates) {
        return allEvents.filter(event => !usedDates.has(event.date));
    },
    
    // Get N random events from available pool
    getRandomEvents(count) {
        const usedDates = this.getUsedDates();
        const availableEvents = this.getAvailableEvents(eventsData, usedDates);
        
        if (availableEvents.length === 0) {
            return []; // Return empty array for consistency
        }
        
        // Get up to 'count' random events
        const eventsToSelect = Math.min(count, availableEvents.length);
        const shuffled = shuffleArray(availableEvents);
        return shuffled.slice(0, eventsToSelect);
    }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LOAD EVENTS - Initial game setup and data loading
 * ═══════════════════════════════════════════════════════════════════════════
 * Purpose:
 *   Main initialization function that runs on page load. Handles two scenarios:
 *   1. Shared link: Decode events from URL parameter
 *   2. Fresh start: Load random events from events.json
 *
 * Load Sequence:
 *   1. Check URL for ?events= parameter via loadEventsFromURL()
 *      - If found and valid: Populate DOM with decoded events, clear URL
 *      - If found but invalid: Show error toast, continue to step 2
 *      - If not found: Continue to step 2
 *   2. Fetch events.json and populate eventsData array
 *   3. If no URL events were loaded: Select EVENTS_PER_GAME random events,
 *      create DOM elements, set totalPossibleScore
 *
 * IMPORTANT: Dual Data Management
 *   - eventsData is ALWAYS loaded from events.json (even with URL events)
 *   - This ensures randomize/add buttons have full dataset available
 *   - URL events populate DOM directly, not eventsData
 *
 * Integration Points:
 *   - Calls: loadEventsFromURL(), createEventElement(), shuffleArray()
 *   - Updates: eventsData, totalPossibleScore, DOM (#unsorted-events)
 *   - Triggered: On page load (see bottom of script.js)
 */
// Function to create and add events dynamically
function loadEvents() {
    // First check if there are events in the URL
    const hasURLEvents = loadEventsFromURL();
    
    // Always load the full events.json dataset for randomize functionality
    fetch('events.json')
        .then(response => response.json())
        .then(data => {
            eventsData.length = 0; // Clear existing array
            eventsData.push(...data); // Load new data
            
            // If no URL events, load initial random events
            if (!hasURLEvents) {
                const randomEvents = shuffleArray([...eventsData]).slice(0, EVENTS_PER_GAME);
                const unsortedEventsContainer = document.getElementById("unsorted-events");
                unsortedEventsContainer.innerHTML = ""; // Clear existing events
                randomEvents.forEach(event => createEventElement(event, unsortedEventsContainer));

                // Sort unsorted events by their index
                sortUnsortedEventsByIndex();

                // Set total possible score (first event doesn't count)
                totalPossibleScore = EVENTS_PER_GAME - 1;
                updateScoreDisplay();
            }
        })
        .catch(error => console.error("Error loading events:", error));
}

/**
 * Fisher-Yates Shuffle Algorithm - Unbiased array randomization
 * 
 * Purpose:
 *   Creates a shuffled copy of an array with uniform random distribution.
 *   Each permutation has equal probability of occurring.
 *
 * Algorithm (Fisher-Yates):
 *   - Iterate backwards from last element to first
 *   - For each position i, pick random index j from [0, i]
 *   - Swap elements at i and j
 *   - This ensures each element has equal chance of ending up at any position
 *
 * Implementation Notes:
 *   - Creates shallow copy via spread operator to avoid mutating original
 *   - Uses Math.random() * (i + 1) to get uniform distribution across valid indices
 *   - O(n) time complexity, O(n) space (for copy)
 *
 * Integration Points:
 *   - Used by: loadEvents(), randomizeEvents(), shuffleUnsortedEvents(), EventPool.getRandomEvents()
 *   - Returns: New array (does not modify input)
 */
// Function to shuffle the array (Fisher-Yates algorithm)
function shuffleArray(array) {
    const shuffled = [...array]; // Create a copy to avoid mutating the original
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
    }
    return shuffled;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RANDOMIZE EVENTS - Replace unsorted events with new random selection
 * ═══════════════════════════════════════════════════════════════════════════
 * Purpose:
 *   Replaces all events in unsorted area with fresh random events from eventsData.
 *   Maintains same event count (doesn't add/remove events, just swaps them).
 *   Useful for getting unstuck or exploring different event combinations.
 *
 * Behavior:
 *   1. Saves current unsorted events as fallback (in case pool exhausted)
 *   2. Clears unsorted events container DOM
 *   3. Gets N random events via EventPool.getRandomEvents() (where N = current count)
 *   4. If pool has events: creates new DOM elements and sorts by index
 *   5. If pool exhausted: restores original events and shows error toast
 *   6. Maintains game state: preserves score, updates totalPossibleScore, deselects active event
 *
 * Important Implementation Details:
 *   - Uses EventPool for date deduplication (no duplicate dates with ordered timeline)
 *   - Does NOT reset nextEventIndex (debug numbering continues sequentially)
 *   - Preserves ordered timeline (only randomizes unsorted area)
 *   - Empty unsorted area: Shows warning toast and exits early
 *
 * Integration Points:
 *   - Triggered by: #randomize-btn click (Edit Mode UI)
 *   - Depends on: EventPool.getRandomEvents(), eventsData, createEventElement()
 *   - Updates: DOM (#unsorted-events), totalPossibleScore
 *   - Calls: sortUnsortedEventsByIndex(), deselectEvent(), updateScoreDisplay()
 */
// Function to randomize events on button click
function randomizeEvents() {
    const unsortedEventsContainer = document.getElementById("unsorted-events");
    
    // Get the current number of events in unsorted area
    const currentEventCount = unsortedEventsContainer.children.length;
    
    // Handle edge case: if unsorted area is empty, do nothing
    if (currentEventCount === 0) {
        showToast('⚠ No events to randomize in the unsorted area.');
        return;
    }
    
    // Save current events before clearing (in case we need to restore them)
    const currentEvents = Array.from(unsortedEventsContainer.children)
        .map(eventElement => {
            const eventText = eventElement.querySelector('.event-text');
            if (!eventText || !eventElement.dataset.date) {
                return null; // Skip malformed events
            }
            return {
                name: eventText.textContent,
                date: eventElement.dataset.date
            };
        })
        .filter(event => event !== null); // Remove any null entries
    
    // Clear existing events in unsorted area
    unsortedEventsContainer.innerHTML = "";
    
    // Get random events using EventPool (handles deduplication)
    // Note: Do NOT reset nextEventIndex - continue the sequence
    const newEvents = EventPool.getRandomEvents(currentEventCount);
    
    if (newEvents.length === 0) {
        // Restore original events since we couldn't get new ones
        currentEvents.forEach(event => createEventElement(event, unsortedEventsContainer));
        sortUnsortedEventsByIndex();
        
        // Show error message using toast
        showToast('⚠ No more events available in the event pool.');
        return;
    }
    
    // Add the new events to unsorted events container
    newEvents.forEach(event => createEventElement(event, unsortedEventsContainer));

    // Sort unsorted events by their index
    sortUnsortedEventsByIndex();

    // Clear any selected event and placement slots
    deselectEvent();

    // Update totalPossibleScore based on the unsorted events (first event doesn't count)
    const totalEvents = unsortedEventsContainer.children.length + document.getElementById("ordered-timeline").children.length;
    totalPossibleScore = Math.max(0, totalEvents - 1);
    updateScoreDisplay();
}

// Add event listener to Randomize button
document.getElementById("randomize-btn").addEventListener("click", randomizeEvents);

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SHUFFLE UNSORTED EVENTS - Randomize visual order without changing events
 * ═══════════════════════════════════════════════════════════════════════════
 * Purpose:
 *   Randomizes the visual order of unsorted events WITHOUT changing the actual events.
 *   Unlike randomizeEvents(), this keeps same events but rearranges their positions.
 *
 * Behavior:
 *   1. Collects current event indices from data-event-index attributes
 *   2. Shuffles the index array using Fisher-Yates algorithm
 *   3. Reassigns shuffled indices to existing event elements
 *   4. Updates .event-debug-index display to match new indices
 *   5. Sorts DOM via sortUnsortedEventsByIndex() to reorder visually
 *   6. Clears selection and placement slots
 *
 * Use Case:
 *   - Break habitual ordering patterns when playing repeatedly
 *   - Avoid positional bias (e.g., always starting with first event)
 *   - Adds variety without changing event content
 *
 * Integration Points:
 *   - Triggered by: #shuffle-btn click (Edit Mode UI)
 *   - Depends on: shuffleArray(), sortUnsortedEventsByIndex()
 *   - Updates: data-event-index attributes, .event-debug-index DOM text
 *   - Calls: deselectEvent()
 */
// Function to shuffle the position of unsorted events
function shuffleUnsortedEvents() {
    const unsortedEventsContainer = document.getElementById("unsorted-events");
    const events = Array.from(unsortedEventsContainer.children);
    
    if (events.length === 0) {
        return; // Nothing to shuffle
    }
    
    // Get current indices from events
    const currentIndices = events.map(event => parseInt(event.dataset.eventIndex, 10));
    
    // Shuffle the indices array
    const shuffledIndices = shuffleArray(currentIndices);
    
    // Reassign the shuffled indices to the events
    events.forEach((event, idx) => {
        event.dataset.eventIndex = shuffledIndices[idx];
        
        // Update the debug index display if it exists
        const debugIndex = event.querySelector('.event-debug-index');
        if (debugIndex) {
            debugIndex.textContent = `#${shuffledIndices[idx]}`;
        }
    });
    
    // Sort events by their new index (which will reorder them based on shuffled indices)
    sortUnsortedEventsByIndex();
    
    // Clear any selected event and placement slots
    deselectEvent();
}

// Add event listener to Shuffle button
document.getElementById("shuffle-btn").addEventListener("click", shuffleUnsortedEvents);

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESET EVENTS - Return all ordered events to unsorted area
 * ═══════════════════════════════════════════════════════════════════════════
 * Purpose:
 *   Undoes all player placements by moving events from ordered timeline back to
 *   unsorted area. Allows replaying same event set without starting new game.
 *
 * Behavior:
 *   1. Collects all events from #ordered-timeline
 *   2. Removes visual feedback classes (.correct, .incorrect, .placed)
 *   3. Restores hidden state on dates (adds .hidden to .event-Date)
 *   4. Ensures each event has data-event-index (assigns if missing)
 *   5. Updates remove button visibility based on current edit mode
 *   6. Clears dataset.initialAnswer (allows scoring on second attempt)
 *   7. Moves all events to #unsorted-events container
 *   8. Resets playerScore to 0
 *   9. Recalculates totalPossibleScore (events - 1)
 *   10. Sorts unsorted events by index for consistent display
 *
 * Preserves:
 *   - Event content and dates (doesn't change events)
 *   - nextEventIndex counter (debug numbering continues)
 *   - eventsData array (master dataset unchanged)
 *
 * Integration Points:
 *   - Triggered by: #reset-btn click (Edit Mode UI)
 *   - Updates: DOM (#ordered-timeline, #unsorted-events), playerScore, totalPossibleScore
 *   - Calls: deselectEvent(), sortUnsortedEventsByIndex(), updateScoreDisplay()
 */
// Function to reset - move all events from ordered timeline back to unsorted events and shuffle
function resetEvents() {
    const orderedTimelineContainer = document.getElementById("ordered-timeline");
    const unsortedEventsContainer = document.getElementById("unsorted-events");
    const orderedEvents = Array.from(orderedTimelineContainer.children);
    
    // Move all events from ordered timeline to unsorted events
    orderedEvents.forEach(eventElement => {
        // Remove correct/incorrect classes
        eventElement.classList.remove('correct', 'incorrect', 'placed');
        
        // Restore index if it doesn't have one (it should already have one from when it was created)
        if (!eventElement.dataset.eventIndex) {
            eventElement.dataset.eventIndex = nextEventIndex;
            nextEventIndex++;
        }
        
        // Handle remove button visibility based on edit mode
        let removeButton = eventElement.querySelector(".remove-button");
        if (removeButton) {
            const editMode = document.body.getAttribute('data-edit-mode');
            if (editMode === 'on') {
                removeButton.style.display = '';
            } else {
                removeButton.style.display = 'none';
            }
        }
        
        // Hide the date again
        let eventDate = eventElement.querySelector(".event-Date");
        if (eventDate) {
            eventDate.classList.add("hidden");
        }
        
        // Reset initial answer tracking
        delete eventElement.dataset.initialAnswer;
        
        // Move to unsorted events container
        unsortedEventsContainer.appendChild(eventElement);
    });
    
    // Reset player score
    playerScore = 0;
    
    // Update total possible score (first event doesn't count)
    totalPossibleScore = Math.max(0, unsortedEventsContainer.children.length - 1);
    updateScoreDisplay();
    
    // Clear any selected event and placement slots
    deselectEvent();
    
    // Sort the unsorted events by index to maintain order
    sortUnsortedEventsByIndex();
}

// Add event listener to Reset button
document.getElementById("reset-btn").addEventListener("click", resetEvents);

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CLEAR ALL EVENTS - Remove all unsorted events (ordered timeline untouched)
 * ═══════════════════════════════════════════════════════════════════════════
 * Purpose:
 *   Removes all events from unsorted area only (leaves ordered timeline intact).
 *   Used for creating custom scenarios from scratch in Edit Mode.
 *
 * Behavior:
 *   1. Clears #unsorted-events container (innerHTML = "")
 *   2. Deselects any selected event and hides placement slots
 *   3. Does NOT reset nextEventIndex (debug numbering continues)
 *   4. Recalculates totalPossibleScore based on remaining events
 *   5. Updates score display
 *
 * Preserves:
 *   - Ordered timeline events (user's placed events remain)
 *   - Player score (already earned points stay)
 *   - eventsData (master dataset unchanged)
 *   - nextEventIndex counter
 *
 * Use Cases:
 *   - Remove unwanted events without affecting placed ones
 *   - Prepare for custom event addition via "Add more" or manual entry
 *   - Simplify game to only events already placed
 *
 * Integration Points:
 *   - Triggered by: #clear-all-btn click (Edit Mode UI)
 *   - Updates: DOM (#unsorted-events), totalPossibleScore
 *   - Calls: deselectEvent(), updateScoreDisplay()
 */
// Function to clear unsorted events only
function clearAllEvents() {
    // Clear unsorted events only (not ordered timeline)
    const unsortedEventsContainer = document.getElementById("unsorted-events");
    unsortedEventsContainer.innerHTML = ""; // Clear all events

    // Clear selection and placement slots
    deselectEvent();
    
    // Do NOT reset the index counter - sequence keeps going up unless a new game starts

    // Update total possible score based on the remaining events (first event doesn't count)
    const totalEvents = unsortedEventsContainer.children.length + document.getElementById("ordered-timeline").children.length;
    totalPossibleScore = Math.max(0, totalEvents - 1);
    updateScoreDisplay();
}

// Add event listener to Clear button
document.getElementById("clear-all-btn").addEventListener("click", clearAllEvents);

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * START NEW GAME - Complete game reset with fresh random events
 * ═══════════════════════════════════════════════════════════════════════════
 * Purpose:
 *   Full game reset - clears everything (both timelines) and loads fresh random events.
 *   Returns game to initial state as if page was just loaded.
 *
 * Behavior:
 *   1. Clears both #unsorted-events and #ordered-timeline containers
 *   2. Deselects any selected event and hides placement slots
 *   3. Resets playerScore to 0
 *   4. Resets nextEventIndex to 1 (restarts debug numbering)
 *   5. Selects EVENTS_PER_GAME random events from eventsData via Fisher-Yates
 *   6. Creates DOM elements for new events in unsorted area
 *   7. Sorts events by index
 *   8. Sets totalPossibleScore = EVENTS_PER_GAME - 1
 *   9. Updates score display
 *
 * vs. resetEvents():
 *   - startNewGame(): Clears EVERYTHING, loads NEW events, resets index counter
 *   - resetEvents(): Moves ordered events back, keeps SAME events, preserves index counter
 *
 * Confirmation Dialog:
 *   Triggered by #new-game-btn via IIFE below this function.
 *   Shows #new-game-dialog overlay to confirm (prevents accidental resets).
 *
 * Integration Points:
 *   - Triggered by: Dialog Yes button after #new-game-btn click
 *   - Depends on: eventsData (master dataset), shuffleArray(), createEventElement()
 *   - Updates: DOM (#unsorted-events, #ordered-timeline), all game state variables
 *   - Calls: deselectEvent(), sortUnsortedEventsByIndex(), updateScoreDisplay()
 */
// Function to start a new game - clears everything and loads random events
function startNewGame() {
    // Clear both timelines
    const unsortedEventsContainer = document.getElementById("unsorted-events");
    const orderedTimelineContainer = document.getElementById("ordered-timeline");
    unsortedEventsContainer.innerHTML = "";
    orderedTimelineContainer.innerHTML = "";
    
    // Clear selection and placement slots
    deselectEvent();
    
    // Reset player score
    playerScore = 0;
    
    // Reset the index counter
    nextEventIndex = 1;
    
    // Load new random events (same as initial page load)
    const randomEvents = shuffleArray([...eventsData]).slice(0, EVENTS_PER_GAME);
    randomEvents.forEach(event => createEventElement(event, unsortedEventsContainer));
    
    // Sort unsorted events by their index
    sortUnsortedEventsByIndex();
    
    // Set total possible score (first event doesn't count)
    totalPossibleScore = EVENTS_PER_GAME - 1;
    updateScoreDisplay();
}

// New Game button functionality
(function() {
    const newGameBtn = document.getElementById('new-game-btn');
    const dialogOverlay = document.getElementById('new-game-dialog');
    const dialogYesBtn = document.getElementById('dialog-yes-btn');
    const dialogNoBtn = document.getElementById('dialog-no-btn');
    
    if (!newGameBtn || !dialogOverlay || !dialogYesBtn || !dialogNoBtn) {
        console.warn('New game button or dialog elements not found');
        return;
    }
    
    // Show dialog when New game button is clicked
    newGameBtn.addEventListener('click', () => {
        dialogOverlay.classList.remove('hidden');
    });
    
    // Handle Yes button - start new game and hide dialog
    dialogYesBtn.addEventListener('click', () => {
        dialogOverlay.classList.add('hidden');
        startNewGame();
    });
    
    // Handle No button - just hide dialog
    dialogNoBtn.addEventListener('click', () => {
        dialogOverlay.classList.add('hidden');
    });
    
    // Close dialog when clicking outside the dialog box
    dialogOverlay.addEventListener('click', (e) => {
        if (e.target === dialogOverlay) {
            dialogOverlay.classList.add('hidden');
        }
    });
})();

// Add More button functionality
(function() {
    const addMoreBtn = document.getElementById('add-more-btn');
    
    if (!addMoreBtn) {
        console.warn('Add more button not found');
        return;
    }
    
    addMoreBtn.addEventListener('click', () => {
        // Get random events that don't have duplicate dates
        const newEvents = EventPool.getRandomEvents(EVENTS_TO_ADD);
        
        if (newEvents.length === 0) {
            // Show error message using toast
            showToast('⚠ No more events available in the event pool.');
            return;
        }
        
        // Add the new events to the unsorted events container
        const unsortedEventsContainer = document.getElementById("unsorted-events");
        newEvents.forEach(event => createEventElement(event, unsortedEventsContainer));
        
        // Sort unsorted events by their index
        sortUnsortedEventsByIndex();
        
        // Update totalPossibleScore (first event doesn't count)
        const totalEvents = unsortedEventsContainer.children.length + document.getElementById("ordered-timeline").children.length;
        totalPossibleScore = Math.max(0, totalEvents - 1);
        updateScoreDisplay();
    });
})();

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CREATE EVENT ELEMENT - Build event DOM structure with all child elements
 * ═══════════════════════════════════════════════════════════════════════════
 * Purpose:
 *   Factory function that creates complete event DOM element with all child components.
 *   Central place for event structure definition - used by all event-creating code paths.
 *
 * DOM Structure Created:
 *   <div class="event no-select" data-date="YYYY-MM-DD" data-event-index="N" 
 *        tabindex="0" role="button" aria-label="Event: ..."> 
 *     <span class="event-text">Event name</span>
 *     <button class="remove-button no-select">Remove</button>
 *     <span class="event-Date hidden">YYYY-MM-DD</span>
 *     <span class="event-debug-index [hidden]">#N</span>  <!-- Only if in unsorted -->
 *   </div>
 *
 * Parameters:
 *   event: {name: string, date: string} - Event data object from eventsData or URL
 *   container: HTMLElement - Parent container (#unsorted-events or #ordered-timeline)
 *
 * Index Assignment:
 *   - Only assigns data-event-index if container is #unsorted-events
 *   - Ordered timeline events don't get indices (they're "played" events)
 *   - Uses global nextEventIndex counter, increments after assignment
 *
 * Visibility Rules:
 *   - .event-Date: Always starts hidden (revealed on placement)
 *   - .remove-button: Hidden if data-edit-mode !== 'on'
 *   - .event-debug-index: Hidden if data-debug-mode !== 'on', only exists if indexed
 *
 * Accessibility:
 *   - tabindex="0": Makes event keyboard-focusable
 *   - role="button": Announces as interactive button to screen readers
 *   - aria-label: Provides descriptive label for assistive tech
 *
 * Integration Points:
 *   - Called by: loadEvents(), loadEventsFromURL(), randomizeEvents(), 
 *                addMoreEvents(), addEvent(), createEventElement() recursion
 *   - Depends on: nextEventIndex, data-edit-mode, data-debug-mode attributes
 *   - Attaches: addClickListeners(), addKeyboardListeners() for interactivity
 *   - Appends to: Provided container element
 */
// Function to create an event element
function createEventElement(event, container) {
    let eventElement = document.createElement("div");
    eventElement.classList.add("event", "no-select");
    eventElement.dataset.date = event.date;
    
    // Assign sequential index number only when adding to unsorted events
    // (not when loading from ordered timeline in shareable links)
    if (container.id === "unsorted-events") {
        eventElement.dataset.eventIndex = nextEventIndex;
        nextEventIndex++;
    }
    
    // Make event keyboard accessible
    eventElement.setAttribute("tabindex", "0");
    eventElement.setAttribute("role", "button");
    eventElement.setAttribute("aria-label", `Event: ${event.name}`);

    // Event text
    let eventText = document.createElement("span");
    eventText.classList.add("event-text");
    eventText.textContent = event.name;
    eventElement.appendChild(eventText);

    // Remove button - positioned absolutely at top left
    let removeButton = document.createElement("button");
    removeButton.classList.add("remove-button", "no-select");
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent event selection when clicking remove
        removeEvent(eventElement, event.name);
    });
    
    // Hide remove button if edit mode is off
    const editMode = document.body.getAttribute('data-edit-mode');
    if (editMode !== 'on') {
        removeButton.style.display = 'none';
    }
    
    eventElement.appendChild(removeButton);

    // Date element - positioned absolutely at bottom right
    let eventDate = document.createElement("span");
    eventDate.classList.add("event-Date", "hidden");
    eventDate.textContent = event.date; // Will be formatted by checkEventOrder() function
    eventElement.appendChild(eventDate);
    
    // Debug index element - positioned absolutely at top right (only if event has an index)
    if (eventElement.dataset.eventIndex) {
        let debugIndex = document.createElement("span");
        debugIndex.classList.add("event-debug-index");
        debugIndex.textContent = `#${eventElement.dataset.eventIndex}`;
        
        // Check if debug mode is on
        const debugMode = document.body.getAttribute('data-debug-mode');
        if (debugMode !== 'on') {
            debugIndex.classList.add('hidden');
        }
        
        eventElement.appendChild(debugIndex);
    }
    
    container.appendChild(eventElement);

    // Attach click and keyboard event listeners
    addClickListeners(eventElement);
    addKeyboardListeners(eventElement);
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * REMOVE EVENT - Delete event from unsorted area (Edit Mode feature)
 * ═══════════════════════════════════════════════════════════════════════════
 * Purpose:
 *   Removes an event from the unsorted area via "Remove" button in Edit Mode.
 *   Prevents removal of placed events (ordered timeline) to preserve game integrity.
 *
 * Behavior:
 *   1. Checks parent container: if #ordered-timeline, shows alert and exits
 *   2. Removes event element from DOM
 *   3. Removes event from eventsData array (by name matching)
 *   4. If removed event was selected, deselects it via deselectEvent()
 *   5. Recalculates totalPossibleScore (remaining events - 1)
 *   6. Updates score display
 *
 * Protection:
 *   - Ordered timeline removal blocked with user-facing alert
 *   - This prevents score manipulation and preserves game history
 *
 * Data Synchronization:
 *   - Removes from BOTH DOM and eventsData array
 *   - Uses Array.findIndex + splice for eventsData removal
 *   - Maintains consistency between UI state and data model
 *
 * Integration Points:
 *   - Triggered by: .remove-button click event (see createEventElement)
 *   - Parameters: eventElement (DOM ref), eventName (for eventsData lookup)
 *   - Updates: DOM, eventsData, selectedEvent, totalPossibleScore
 *   - Calls: deselectEvent(), updateScoreDisplay()
 */
// Function to remove an event (only from unsorted list)
function removeEvent(eventElement, eventName) {
    const parentTimeline = eventElement.parentNode.id;

    if (parentTimeline === "ordered-timeline") {
        alert("You cannot remove an event after it has been placed in the timeline.");
        return;
    }

    eventElement.remove();
    eventsData.splice(eventsData.findIndex(e => e.name === eventName), 1);

    // Clear selection if this was the selected event
    if (selectedEvent === eventElement) {
        deselectEvent();
    }

    // Update totalPossibleScore based on the remaining events (first event doesn't count)
    const totalEvents = document.getElementById("unsorted-events").children.length + document.getElementById("ordered-timeline").children.length;
    totalPossibleScore = Math.max(0, totalEvents - 1);
    updateScoreDisplay();
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ADD EVENT - Create custom event from manual input (Edit Mode feature)
 * ═══════════════════════════════════════════════════════════════════════════
 * Purpose:
 *   Allows users to manually create custom events via text input fields in Edit Mode.
 *   Useful for creating personalized quizzes, educational scenarios, or testing specific dates.
 *
 * Behavior:
 *   1. Reads values from #event-name (text input) and #event-date (date input)
 *   2. Validates both fields are non-empty (shows alert if missing)
 *   3. Creates event object {name, date} and pushes to eventsData
 *   4. Creates DOM element via createEventElement() in #unsorted-events
 *   5. Sorts unsorted events by index for consistent ordering
 *   6. Recalculates totalPossibleScore (total events - 1)
 *   7. Clears input fields for next entry
 *
 * Validation:
 *   - Basic empty check only (trim whitespace from name)
 *   - Date input uses native HTML5 date picker for format validation
 *   - No duplicate checking (user can add duplicate names/dates if desired)
 *
 * Integration Points:
 *   - Triggered by: "Add Event" button in Edit Mode controls
 *   - Reads from: #event-name input, #event-date input
 *   - Updates: eventsData, DOM (#unsorted-events), totalPossibleScore
 *   - Calls: createEventElement(), sortUnsortedEventsByIndex(), updateScoreDisplay()
 */
// Add a new event from input
function addEvent() {
    const eventName = document.getElementById("event-name").value.trim();
    const eventDate = document.getElementById("event-date").value;

    if (eventName === "" || eventDate === "") {
        alert("Please enter both an event name and a date.");
        return;
    }

    let newEvent = { name: eventName, date: eventDate };
    eventsData.push(newEvent);
    createEventElement(newEvent, document.getElementById("unsorted-events"));

    // Sort unsorted events by their index
    sortUnsortedEventsByIndex();

    // Update totalPossibleScore based on the unsorted events (first event doesn't count)
    const totalEvents = document.getElementById("unsorted-events").children.length + document.getElementById("ordered-timeline").children.length;
    totalPossibleScore = Math.max(0, totalEvents - 1);
    updateScoreDisplay();

    // Clear input fields
    document.getElementById("event-name").value = "";
    document.getElementById("event-date").value = "";
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EVENT INTERACTION - Click and keyboard event handlers
 * ═══════════════════════════════════════════════════════════════════════════
 * Purpose:
 *   Attaches mouse and keyboard event handlers to event elements for selection.
 *   Ensures accessibility and prevents event bubbling issues.
 *
 * addClickListeners(event):
 *   - Attaches click handler to event element
 *   - Only allows selection if event is in #unsorted-events (prevents clicking placed events)
 *   - stopPropagation() prevents document-level deselect handler from firing
 *   - Called by: createEventElement()
 *
 * addKeyboardListeners(event):
 *   - Attaches keydown handler for keyboard navigation
 *   - Enter/Space: Selects event (prevents Space from scrolling page)
 *   - Escape: Deselects currently selected event
 *   - Only allows selection if event is in #unsorted-events
 *   - stopPropagation() prevents bubbling to document handlers
 *   - Called by: createEventElement()
 *
 * Accessibility:
 *   - Provides keyboard-only interaction path (no mouse required)
 *   - Works with screen readers via tabindex, role, aria-label set in createEventElement()
 *   - Escape key provides universal deselect mechanism
 *
 * Integration Points:
 *   - Both call: selectEvent() for unsorted events, deselectEvent() for Escape
 *   - Event bubbling: stopPropagation() critical for preventing conflicts with
 *     document-level click handler that deselects when clicking outside
 */
// Attach click event listeners
function addClickListeners(event) {
    event.addEventListener('click', (e) => {
        // Stop propagation to prevent document click handler from deselecting
        e.stopPropagation();
        
        // Only allow selection if event is in unsorted pile
        if (event.parentNode.id === "unsorted-events") {
            selectEvent(event);
        }
    });
}

// Attach keyboard event listeners for accessibility
function addKeyboardListeners(event) {
    event.addEventListener('keydown', (e) => {
        // Only handle Enter and Space keys
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault(); // Prevent scrolling on Space
            e.stopPropagation(); // Prevent document click handler from deselecting
            
            // Only allow selection if event is in unsorted pile
            if (event.parentNode.id === "unsorted-events") {
                selectEvent(event);
            }
        } else if (e.key === 'Escape') {
            // Allow Escape key to deselect
            e.preventDefault();
            e.stopPropagation();
            if (selectedEvent) {
                deselectEvent();
            }
        }
    });
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EVENT SELECTION - Manages selected event state and placement slots
 * ═══════════════════════════════════════════════════════════════════════════
 * selectEvent(event):
 *   Purpose: Mark an event as selected and show where it can be placed
 *
 *   Behavior:
 *     1. If clicking same event again: deselect it (toggle behavior)
 *     2. Clear previous selection (.selected class)
 *     3. Clear previous placement slots from DOM
 *     4. Set global selectedEvent reference
 *     5. Add .selected class to new event (CSS highlights it)
 *     6. Call showPlacementSlots() to display placement positions
 *
 *   State Management:
 *     - selectedEvent global variable holds reference to active event
 *     - Only one event can be selected at a time
 *     - Selection is cleared when event is placed or user clicks outside
 *
 * deselectEvent():
 *   Purpose: Clear current selection and hide placement slots
 *
 *   Behavior:
 *     1. If selectedEvent exists: remove .selected class
 *     2. Set selectedEvent = null
 *     3. Call clearPlacementSlots() to remove all .placement-slot elements
 *
 *   Called by:
 *     - selectEvent() (when toggling or switching events)
 *     - placeEventAtPosition() (after placing event)
 *     - Event handlers (Escape key, click outside, button actions)
 *     - Game actions (randomize, reset, shuffle, remove, etc.)
 *
 * Integration Points:
 *   - Updates: selectedEvent global, .selected class, DOM (placement slots)
 *   - Calls: showPlacementSlots(), clearPlacementSlots()
 *   - CSS: .selected class triggers visual highlight via styles.css
 */
// Function to select an event and show placement slots
function selectEvent(event) {
    // If clicking the same event that's already selected, deselect it
    if (selectedEvent === event) {
        deselectEvent();
        return;
    }
    
    // Clear previous selection
    if (selectedEvent) {
        selectedEvent.classList.remove('selected');
    }
    
    // Clear previous placement slots
    clearPlacementSlots();
    
    // Select the new event
    selectedEvent = event;
    event.classList.add('selected');
    
    // Show placement slots in the ordered timeline
    showPlacementSlots();
}

// Function to deselect the current event
function deselectEvent() {
    if (selectedEvent) {
        selectedEvent.classList.remove('selected');
        selectedEvent = null;
    }
    clearPlacementSlots();
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PLACEMENT SLOTS - Interactive drop targets for ordering events
 * ═══════════════════════════════════════════════════════════════════════════
 * showPlacementSlots():
 *   Purpose: Display clickable slots showing where selected event can be placed
 *
 *   Behavior:
 *     1. Gets all existing events from #ordered-timeline
 *     2. Inserts slot at position 0 (before first event)
 *     3. Loops through existing events, inserting slot after each one
 *     4. Result: N+1 slots for N events (can place before, between, or after)
 *
 *   Visual: Each slot is a horizontal line with circle in center (CSS-styled)
 *
 * createPlacementSlot(position):
 *   Purpose: Factory function to create individual placement slot element
 *
 *   DOM Structure:
 *     <div class="placement-slot" data-position="N" tabindex="0" role="button">
 *       <div class="placement-slot-line"></div>  <!-- Gradient horizontal line -->
 *       <div class="placement-slot-circle"></div>  <!-- Center circle -->
 *       <span class="placement-slot-text">Click to place here</span>  <!-- Only on first slot if timeline empty -->
 *     </div>
 *
 *   Parameters:
 *     position (number): Index where event will be inserted (0-based)
 *
 *   Special Behavior:
 *     - First slot (position 0) shows "Click to place here" text IF timeline is empty
 *     - Text disappears once first event is placed (no longer needed)
 *
 *   Interaction:
 *     - Click: calls placeEventAtPosition(position)
 *     - Enter/Space: same as click (keyboard accessibility)
 *     - stopPropagation() prevents document deselect handler
 *
 *   Accessibility:
 *     - tabindex="0" makes slots keyboard-focusable
 *     - role="button" announces as clickable to screen readers
 *     - aria-label describes position in human-readable format
 *
 * clearPlacementSlots():
 *   Purpose: Remove all placement slots from DOM
 *   Behavior: Queries all .placement-slot elements and removes them
 *   Called by: deselectEvent(), selectEvent() (when switching events)
 *
 * Integration Points:
 *   - showPlacementSlots() called by: selectEvent()
 *   - createPlacementSlot() called by: showPlacementSlots()
 *   - clearPlacementSlots() called by: deselectEvent()
 *   - All slots trigger: placeEventAtPosition() on click/keyboard
 */
// Function to show placement slots in the ordered timeline
function showPlacementSlots() {
    const orderedTimeline = document.getElementById("ordered-timeline");
    const existingEvents = Array.from(orderedTimeline.children);
    
    // Add slot at the beginning
    const firstSlot = createPlacementSlot(0);
    orderedTimeline.insertBefore(firstSlot, orderedTimeline.firstChild);
    
    // Add slots between existing events and at the end
    for (let i = 0; i < existingEvents.length; i++) {
        const slot = createPlacementSlot(i + 1);
        orderedTimeline.insertBefore(slot, existingEvents[i].nextSibling);
    }
}

// Function to create a placement slot
function createPlacementSlot(position) {
    const slot = document.createElement("div");
    slot.classList.add("placement-slot", "no-select");
    slot.dataset.position = position;
    
    // Make placement slot keyboard accessible
    slot.setAttribute("tabindex", "0");
    slot.setAttribute("role", "button");
    slot.setAttribute("aria-label", `Place event at position ${position + 1}`);
    
    // Create the line element with gradient
    const line = document.createElement("div");
    line.classList.add("placement-slot-line");
    slot.appendChild(line);
    
    // Create the circle element
    const circle = document.createElement("div");
    circle.classList.add("placement-slot-circle");
    slot.appendChild(circle);
    
    // Only add text to the first slot if timeline is empty (no events placed yet)
    const orderedTimeline = document.getElementById("ordered-timeline");
    const existingEvents = Array.from(orderedTimeline.children).filter(child => !child.classList.contains('placement-slot'));
    
    if (position === 0 && existingEvents.length === 0) {
        const text = document.createElement("span");
        text.classList.add("placement-slot-text");
        text.textContent = "Click to place here";
        slot.appendChild(text);
    }
    
    slot.addEventListener('click', (e) => {
        // Stop propagation to prevent document click handler from deselecting
        e.stopPropagation();
        placeEventAtPosition(position);
    });
    
    // Add keyboard support for placement slots
    slot.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault(); // Prevent scrolling on Space
            e.stopPropagation();
            placeEventAtPosition(position);
        }
    });
    
    return slot;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PLACE EVENT - Move selected event to ordered timeline position
 * ═══════════════════════════════════════════════════════════════════════════
 * Purpose:
 *   Moves selected event from unsorted area to specified position in ordered timeline.
 *   Core game mechanic - where player's ordering decisions are executed.
 *
 * Behavior:
 *   1. Early exit if no selectedEvent
 *   2. Gets all existing events from #ordered-timeline (filters out .placement-slot)
 *   3. Removes selectedEvent from its current parent (unsorted area)
 *   4. Inserts into #ordered-timeline at specified position:
 *      - If position >= events.length: append to end
 *      - Otherwise: insert before event at that index
 *   5. Updates event styling:
 *      - Removes .selected, adds .placed
 *      - Hides remove button (can't remove placed events)
 *      - Reveals .event-Date by removing .hidden class
 *   6. Calls checkEventOrder(selectedEvent) to score the placement
 *   7. Calls deselectEvent() to clear selection and slots
 *
 * Integration Points:
 *   - Triggered by: Placement slot click/keyboard events
 *   - Parameters: position (0-based index in timeline)
 *   - Updates: DOM (moves element), selectedEvent state, event classes
 *   - Calls: checkEventOrder() for scoring, deselectEvent() for cleanup
 */
// Function to place the selected event at a specific position
function placeEventAtPosition(position) {
    if (!selectedEvent) return;
    
    const orderedTimeline = document.getElementById("ordered-timeline");
    const existingEvents = Array.from(orderedTimeline.children).filter(child => !child.classList.contains('placement-slot'));
    
    // Remove the event from unsorted pile
    selectedEvent.remove();
    
    // Insert at the specified position
    if (position >= existingEvents.length) {
        orderedTimeline.appendChild(selectedEvent);
    } else {
        orderedTimeline.insertBefore(selectedEvent, existingEvents[position]);
    }
    
    // Mark the event as placed and disable clicking
    selectedEvent.classList.remove('selected');
    selectedEvent.classList.add('placed');
    
    // Disable remove button and reveal the date
    let removeButton = selectedEvent.querySelector(".remove-button");
    if (removeButton) removeButton.style.display = "none";
    
    let eventDate = selectedEvent.querySelector(".event-Date");
    if (eventDate) {
        eventDate.classList.remove("hidden");
    }
    
    // Check if placement is correct
    checkEventOrder(selectedEvent);
    
    // Clear placement slots and selection
    deselectEvent();
}

// Function to clear all placement slots
function clearPlacementSlots() {
    const slots = document.querySelectorAll('.placement-slot');
    slots.forEach(slot => slot.remove());
}

// Format date function - uses locale-specific formatting
function formatDate(dateString) {
    const date = new Date(dateString);
    // Use the user's locale for date formatting
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    });
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CHECK EVENT ORDER - Scoring logic for event placement correctness
 * ═══════════════════════════════════════════════════════════════════════════
 * Purpose:
 *   Determines if event was placed in correct chronological position and awards score.
 *   Auto-corrects incorrect placements by moving event to proper position.
 *
 * Algorithm:
 *   1. Format and display event date (via formatDate())
 *   2. Apply show-date visibility setting (respects data-show-date attribute)
 *   3. Get all events in timeline and convert dates to timestamps
 *   4. Calculate correct index: count how many events have earlier dates
 *   5. Get actual current index in timeline
 *   6. Compare indices:
 *      - If match: Correct placement → add .correct class, award point (unless first event)
 *      - If mismatch: Incorrect → add .incorrect class, move to correct position
 *   7. Update score display
 *
 * Scoring Rules:
 *   - First event placement: NEVER scores points (no reference to be correct/incorrect against)
 *   - Subsequent placements: 1 point for correct position, 0 for incorrect
 *   - Only first attempt counts: dataset.initialAnswer prevents re-scoring same event
 *   - Score is tracked in dataset.initialAnswer ('correct' | 'incorrect')
 *
 * Auto-Correction:
 *   - Incorrect placements are automatically moved to correct chronological position
 *   - Uses insertBefore() to place event where it should be in timeline
 *   - This helps players see the correct ordering after each attempt
 *
 * Date Handling:
 *   - Dates stored as YYYY-MM-DD strings in data-date attribute
 *   - Converted to timestamps via new Date().getTime() for comparison
 *   - Displayed using locale-specific formatting via formatDate()
 *   - Show/hide controlled by data-show-date body attribute
 *
 * Integration Points:
 *   - Called by: placeEventAtPosition() after event is moved to timeline
 *   - Parameters: placedEvent (HTMLElement just placed)
 *   - Updates: playerScore, .correct/.incorrect classes, dataset.initialAnswer
 *   - Calls: formatDate(), updateScoreDisplay()
 *   - Reads: data-date attributes, data-show-date body attribute
 */
// Check if event is in the correct order
function checkEventOrder(placedEvent) {
    let dateElement = placedEvent.querySelector('.event-Date');
    if (dateElement) {
        // Format date without parentheses
        dateElement.textContent = formatDate(placedEvent.dataset.date);
        // Check if show date is enabled
        const showDateMode = document.body.getAttribute('data-show-date');
        if (showDateMode === 'on') {
            dateElement.classList.remove('hidden');
        } else {
            dateElement.classList.add('hidden');
        }
    }

    let targetTimeline = document.querySelector('#ordered-timeline');
    let allEvents = Array.from(targetTimeline.querySelectorAll('.event'));
    let placedTime = new Date(placedEvent.dataset.date).getTime();
    
    let otherEvents = allEvents.filter(e => e !== placedEvent);
    let correctIndex = otherEvents.reduce((count, e) => {
        let eTime = new Date(e.dataset.date).getTime();
        return count + (eTime < placedTime ? 1 : 0);
    }, 0);
    
    let currentIndex = allEvents.indexOf(placedEvent);
    
    if (!placedEvent.dataset.initialAnswer) {
        // Check if this is the first event being placed in the timeline
        const isFirstEvent = otherEvents.length === 0;
        
        if (currentIndex === correctIndex) {
            placedEvent.classList.add('correct');
            placedEvent.classList.remove('incorrect');
            placedEvent.dataset.initialAnswer = 'correct';
            // Only award points if this is NOT the first event
            if (!isFirstEvent) {
                playerScore++;
            }
        } else {
            placedEvent.classList.add('incorrect');
            placedEvent.classList.remove('correct');
            placedEvent.dataset.initialAnswer = 'incorrect';

            let remainingEvents = Array.from(targetTimeline.querySelectorAll('.event')).filter(e => e !== placedEvent);
            let correctPosition = remainingEvents[correctIndex];
            if (correctPosition) {
                targetTimeline.insertBefore(placedEvent, correctPosition);
            } else {
                targetTimeline.appendChild(placedEvent);
            }
        }
    }

    updateScoreDisplay();
}

// Update score display
function updateScoreDisplay() {
    document.getElementById('result').innerText = `Score: ${playerScore}/${totalPossibleScore}`;
}

// Load events when the page loads
document.addEventListener("DOMContentLoaded", loadEvents);

// Add click handlers to timeline containers to stop propagation
document.addEventListener("DOMContentLoaded", () => {
    const orderedTimeline = document.getElementById("ordered-timeline");
    const unsortedEvents = document.getElementById("unsorted-events");
    
    // Stop propagation on timeline clicks to prevent document handler from deselecting
    if (orderedTimeline) {
        orderedTimeline.addEventListener('click', (e) => {
            // Only stop propagation if clicking the container itself
            // Event and placement slot clicks already stop propagation in their own handlers
            if (e.target === orderedTimeline) {
                e.stopPropagation();
            }
        });
    }
    
    if (unsortedEvents) {
        unsortedEvents.addEventListener('click', (e) => {
            // Only stop propagation if clicking the container itself
            // Event clicks already stop propagation in addClickListeners
            if (e.target === unsortedEvents) {
                e.stopPropagation();
            }
        });
    }
});

// Add document-level click handler to deselect when clicking outside timeline areas
document.addEventListener("click", (e) => {
    // Deselect if there's a selected event
    if (selectedEvent) {
        deselectEvent();
    }
});