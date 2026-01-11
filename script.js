// Theme toggle functionality
(function() {
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set dark mode as default, or use saved preference
    const savedTheme = localStorage.getItem('theme');
    const currentTheme = savedTheme || 'dark';
    
    // Apply the theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateToggleButton(currentTheme);
    
    // Toggle theme on button click
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateToggleButton(newTheme);
    });
    
    function updateToggleButton(theme) {
        if (theme === 'dark') {
            themeToggle.innerHTML = '☀️ Light';
            themeToggle.setAttribute('aria-label', 'Switch to light mode');
        } else {
            themeToggle.innerHTML = '🌙 Dark';
            themeToggle.setAttribute('aria-label', 'Switch to dark mode');
        }
    }
})();

let playerScore = 0;
let totalPossibleScore = 0;
let selectedEvent = null;
let eventsData = [];

// Function to create and add events dynamically
function loadEvents() {
    fetch('events.json')
        .then(response => response.json())
        .then(data => {
            eventsData.length = 0; // Clear existing array
            eventsData.push(...data); // Load new data

            // Load the initial random events
            const randomEvents = shuffleArray(eventsData).slice(0, 7);

            const unsortedEventsContainer = document.getElementById("unsorted-events");
            unsortedEventsContainer.innerHTML = ""; // Clear existing events
            randomEvents.forEach(event => createEventElement(event, unsortedEventsContainer));

            // Set total possible score to 7
            totalPossibleScore = 7;
            updateScoreDisplay();
        })
        .catch(error => console.error("Error loading events:", error));
}

// Function to shuffle the array (Fisher-Yates algorithm)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
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