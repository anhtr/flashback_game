// Theme toggle functionality
(function() {
    const themeToggle = document.getElementById('theme-toggle');
    
    // Exit early if theme toggle element doesn't exist
    if (!themeToggle) {
        console.warn('Theme toggle button not found');
        return;
    }
    
    // Set dark mode as default, or use saved preference
    const savedTheme = localStorage.getItem('theme');
    const currentTheme = savedTheme || 'dark';
    
    // Apply the theme
    document.documentElement.setAttribute('data-theme', currentTheme);
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
            themeToggle.innerHTML = '🌙 Dark mode: ON';
            themeToggle.setAttribute('aria-label', 'Dark mode is on, click to switch to light mode');
        } else {
            themeToggle.innerHTML = '☀️ Dark mode: OFF';
            themeToggle.setAttribute('aria-label', 'Dark mode is off, click to switch to dark mode');
        }
    }
})();

// Edit mode toggle functionality
(function() {
    const editModeToggle = document.getElementById('edit-mode-toggle');
    
    // Exit early if edit mode toggle element doesn't exist
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
            editModeToggle.innerHTML = 'Edit';
            editModeToggle.setAttribute('aria-label', 'Edit mode is on, click to turn off');
        } else {
            editModeToggle.innerHTML = 'Edit';
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
            
            // Load events from URL (don't populate eventsData here - it will be loaded from JSON)
            events.forEach(event => createEventElement(event, unsortedEventsContainer));
            
            // Update totalPossibleScore
            totalPossibleScore = unsortedEventsContainer.children.length + document.getElementById("ordered-timeline").children.length;
            updateScoreDisplay();
            
            // Clear URL parameters to return to data-less state
            clearURLParameters();
            
            return true;
        } else {
            // Decoding failed - show error message and return false to load random events
            showToast('⚠️ Failed to load events from URL. The link may be corrupted or incorrectly formatted. Randomized events were loaded instead.');
            
            // Clear URL parameters since they're invalid
            clearURLParameters();
            
            return false;
        }
    }
    return false;
}

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
            // Visual feedback - change button text temporarily
            const originalText = copyLinkBtn.textContent;
            copyLinkBtn.textContent = '✅ Copied!';
            setTimeout(() => {
                copyLinkBtn.textContent = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy link:', err);
            alert('Failed to copy link. Please copy this shareable link manually:\n\n' + shareableLink);
        });
    });
})();

let playerScore = 0;
let totalPossibleScore = 0;
let selectedEvent = null;
let eventsData = [];

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
                const randomEvents = shuffleArray([...eventsData]).slice(0, 7);
                const unsortedEventsContainer = document.getElementById("unsorted-events");
                unsortedEventsContainer.innerHTML = ""; // Clear existing events
                randomEvents.forEach(event => createEventElement(event, unsortedEventsContainer));

                // Set total possible score to 7
                totalPossibleScore = 7;
                updateScoreDisplay();
            }
        })
        .catch(error => console.error("Error loading events:", error));
}

// Function to shuffle the array (Fisher-Yates algorithm)
function shuffleArray(array) {
    const shuffled = [...array]; // Create a copy to avoid mutating the original
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
    }
    return shuffled;
}

// Function to randomize events on button click
function randomizeEvents() {
    const randomEvents = shuffleArray(eventsData).slice(0, 7);
    const unsortedEventsContainer = document.getElementById("unsorted-events");
    unsortedEventsContainer.innerHTML = ""; // Clear existing events
    randomEvents.forEach(event => createEventElement(event, unsortedEventsContainer));

    // Clear any selected event and placement slots
    selectedEvent = null;
    clearPlacementSlots();

    // Update totalPossibleScore based on the unsorted events
    totalPossibleScore = unsortedEventsContainer.children.length + document.getElementById("ordered-timeline").children.length;
    updateScoreDisplay();
}

// Add event listener to Randomize button
document.getElementById("randomize-btn").addEventListener("click", randomizeEvents);

// Function to shuffle the position of unsorted events
function shuffleUnsortedEvents() {
    const unsortedEventsContainer = document.getElementById("unsorted-events");
    const events = Array.from(unsortedEventsContainer.children);
    
    if (events.length === 0) {
        return; // Nothing to shuffle
    }
    
    // Shuffle the events array
    const shuffledEvents = shuffleArray(events);
    
    // Clear the container and re-append in new order
    unsortedEventsContainer.innerHTML = "";
    shuffledEvents.forEach(event => unsortedEventsContainer.appendChild(event));
    
    // Clear any selected event and placement slots
    selectedEvent = null;
    clearPlacementSlots();
}

// Add event listener to Shuffle button
document.getElementById("shuffle-btn").addEventListener("click", shuffleUnsortedEvents);

// Function to reset - move all events from ordered timeline back to unsorted events and shuffle
function resetEvents() {
    const orderedTimelineContainer = document.getElementById("ordered-timeline");
    const unsortedEventsContainer = document.getElementById("unsorted-events");
    const orderedEvents = Array.from(orderedTimelineContainer.children);
    
    // Move all events from ordered timeline to unsorted events
    orderedEvents.forEach(eventElement => {
        // Remove correct/incorrect classes
        eventElement.classList.remove('correct', 'incorrect', 'placed');
        
        // Show remove button again
        let removeButton = eventElement.querySelector(".remove-button");
        if (removeButton) removeButton.style.display = "";
        
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
    
    // Update total possible score
    totalPossibleScore = unsortedEventsContainer.children.length;
    updateScoreDisplay();
    
    // Clear any selected event and placement slots
    selectedEvent = null;
    clearPlacementSlots();
    
    // Shuffle the unsorted events
    shuffleUnsortedEvents();
}

// Add event listener to Reset button
document.getElementById("reset-btn").addEventListener("click", resetEvents);

// Function to clear all events
function clearAllEvents() {
    // Clear unsorted events
    const unsortedEventsContainer = document.getElementById("unsorted-events");
    unsortedEventsContainer.innerHTML = ""; // Clear all events

    // Clear ordered timeline events
    const orderedTimelineContainer = document.getElementById("ordered-timeline");
    orderedTimelineContainer.innerHTML = ""; // Clear all events

    // Clear selection and placement slots
    selectedEvent = null;
    clearPlacementSlots();

    // Reset player score to 0
    playerScore = 0;

    // Update total possible score based on the remaining events in both lists
    totalPossibleScore = unsortedEventsContainer.children.length + orderedTimelineContainer.children.length;
    updateScoreDisplay();
}

// Add event listener to Clear All button
document.getElementById("clear-all-btn").addEventListener("click", clearAllEvents);

// Function to create an event element
function createEventElement(event, container) {
    let eventElement = document.createElement("div");
    eventElement.classList.add("event", "no-select");
    eventElement.dataset.date = event.date;

    // Flex container to align text, remove button, and date
    let eventContent = document.createElement("div");
    eventContent.classList.add("event-content");
    eventContent.style.display = "flex";
    eventContent.style.justifyContent = "space-between";
    eventContent.style.alignItems = "center";
    eventContent.style.width = "100%";

    // Event text
    let eventText = document.createElement("span");
    eventText.classList.add("event-text");
    eventText.textContent = event.name;

    // Container for remove button and date
    let eventActions = document.createElement("div");
    eventActions.style.display = "flex";
    eventActions.style.alignItems = "center";
    eventActions.style.marginLeft = "auto"; // Align to the right

    // Remove button
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

    // Hidden date span (for later reveal)
    let eventDate = document.createElement("span");
    eventDate.classList.add("event-Date", "hidden");
    eventDate.textContent = ` (${event.date})`;

    // Append elements to event actions container
    eventActions.appendChild(removeButton);
    eventActions.appendChild(eventDate); // Hidden date initially

    // Append text and event actions to the main content container
    eventContent.appendChild(eventText);
    eventContent.appendChild(eventActions);
    
    eventElement.appendChild(eventContent);
    container.appendChild(eventElement);

    // Attach click event listeners
    addClickListeners(eventElement);
}

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
        selectedEvent = null;
        clearPlacementSlots();
    }

    // Update totalPossibleScore based on the remaining events
    totalPossibleScore = document.getElementById("unsorted-events").children.length + document.getElementById("ordered-timeline").children.length;
    updateScoreDisplay();
}

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

    // Update totalPossibleScore based on the unsorted events
    totalPossibleScore = document.getElementById("unsorted-events").children.length + document.getElementById("ordered-timeline").children.length;
    updateScoreDisplay();

    // Clear input fields
    document.getElementById("event-name").value = "";
    document.getElementById("event-date").value = "";
}

// Attach click event listeners
function addClickListeners(event) {
    event.addEventListener('click', (e) => {
        // Only allow selection if event is in unsorted pile
        if (event.parentNode.id === "unsorted-events") {
            selectEvent(event);
        }
    });
}

// Function to select an event and show placement slots
function selectEvent(event) {
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
    slot.textContent = "Click to place here";
    slot.dataset.position = position;
    
    slot.addEventListener('click', () => {
        placeEventAtPosition(position);
    });
    
    return slot;
}

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
    clearPlacementSlots();
    selectedEvent = null;
}

// Function to clear all placement slots
function clearPlacementSlots() {
    const slots = document.querySelectorAll('.placement-slot');
    slots.forEach(slot => slot.remove());
}

// Format date function
function formatDate(dateString) {
    const [year, month, day] = dateString.split("-");
    return `${month}/${day}/${year}`;
}

// Check if event is in the correct order
function checkEventOrder(placedEvent) {
    let dateElement = placedEvent.querySelector('.event-Date');
    if (dateElement) {
        dateElement.textContent = " (" + formatDate(placedEvent.dataset.date) + ")";
        dateElement.classList.remove('hidden');
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
        if (currentIndex === correctIndex) {
            placedEvent.classList.add('correct');
            placedEvent.classList.remove('incorrect');
            placedEvent.dataset.initialAnswer = 'correct';
            playerScore++;
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