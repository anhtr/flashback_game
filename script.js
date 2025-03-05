let playerScore = 0;
let totalPossibleScore = 0;
let draggedItem = null;
let placeholder = document.createElement('div');
let eventsData = [];
placeholder.classList.add('placeholder');

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
    eventElement.classList.add("event");
    eventElement.draggable = true;
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
    removeButton.classList.add("remove-button");
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => removeEvent(eventElement, event.name));

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

    // Attach drag event listeners
    addDragListeners(eventElement);
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

// Attach drag event listeners
function addDragListeners(event) {
    event.addEventListener('dragstart', (e) => {
        if (event.classList.contains("dropped")) {
            e.preventDefault(); // Prevent drag if already dropped
            return;
        }
        
        draggedItem = event;
        setTimeout(() => event.style.display = "none", 0);
    });

    event.addEventListener('dragend', (e) => {
        draggedItem.style.display = "block";
        placeholder.remove();

        // Check if the event was dropped into the ordered timeline
        const droppedInOrderedTimeline = document.querySelector('#ordered-timeline').contains(draggedItem);

        if (!droppedInOrderedTimeline) {
            // If not, move it back to the unsorted list
            const unsortedEventsContainer = document.getElementById('unsorted-events');
            unsortedEventsContainer.appendChild(draggedItem);
            // Reset any changes made during the drag (like hiding the remove button)
            let removeButton = draggedItem.querySelector(".remove-button");
            if (removeButton) removeButton.style.display = "block";
            let eventDate = draggedItem.querySelector(".event-Date");
            if (eventDate) {
                eventDate.classList.add("hidden");
            }
        } else {
            // Mark the event as dropped and disable dragging
            draggedItem.classList.add("dropped");
            draggedItem.draggable = false;
            checkLastDroppedOrder(draggedItem);
        }

        // Disable remove button and reveal the date after being placed in ordered list
        if (draggedItem.parentNode.id === "ordered-timeline") {
            let removeButton = draggedItem.querySelector(".remove-button");
            if (removeButton) removeButton.style.display = "none"; // Hide the remove button

            let eventDate = draggedItem.querySelector(".event-Date");
            if (eventDate) {
                eventDate.classList.remove("hidden"); // Show the date
            }
        }
    });
}

// Drag & drop functionality
document.querySelectorAll('.timeline').forEach(timeline => {
    timeline.addEventListener('dragover', (e) => {
        e.preventDefault();
        let target = e.target.closest('.event');
        let timelineRect = timeline.getBoundingClientRect();
        let mouseY = e.clientY;

        if (target && target !== placeholder) {
            target.parentNode.insertBefore(placeholder, target);
        } else if (!target && mouseY > timelineRect.bottom - 20) {
            if (timeline.lastElementChild !== placeholder) {
                timeline.appendChild(placeholder);
            }
        }
    });

    timeline.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedItem) {
            timeline.insertBefore(draggedItem, placeholder);
            placeholder.remove();
        }
    });
});

// Format date function
function formatDate(dateString) {
    const [year, month, day] = dateString.split("-");
    return `${month}/${day}/${year}`;
}

// Check if event is in the correct order
function checkLastDroppedOrder(draggedEvent) {
    let dateElement = draggedEvent.querySelector('.event-Date');
    if (dateElement) {
        dateElement.textContent = " (" + formatDate(draggedEvent.dataset.date) + ")";
        dateElement.classList.remove('hidden');
    }

    let targetTimeline = document.querySelector('#ordered-timeline');
    let allEvents = Array.from(targetTimeline.querySelectorAll('.event'));
    let draggedTime = new Date(draggedEvent.dataset.date).getTime();
    
    let otherEvents = allEvents.filter(e => e !== draggedEvent);
    let correctIndex = otherEvents.reduce((count, e) => {
        let eTime = new Date(e.dataset.date).getTime();
        return count + (eTime < draggedTime ? 1 : 0);
    }, 0);
    
    let currentIndex = allEvents.indexOf(draggedEvent);
    
    if (!draggedEvent.dataset.initialAnswer) {
        if (currentIndex === correctIndex) {
            draggedEvent.classList.add('correct');
            draggedEvent.classList.remove('incorrect');
            draggedEvent.dataset.initialAnswer = 'correct';
            playerScore++;
        } else {
            draggedEvent.classList.add('incorrect');
            draggedEvent.classList.remove('correct');
            draggedEvent.dataset.initialAnswer = 'incorrect';

            let remainingEvents = Array.from(targetTimeline.querySelectorAll('.event')).filter(e => e !== draggedEvent);
            let correctPosition = remainingEvents[correctIndex];
            if (correctPosition) {
                targetTimeline.insertBefore(draggedEvent, correctPosition);
            } else {
                targetTimeline.appendChild(draggedEvent);
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
