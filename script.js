const eventsData = [
    { name: "American Independence", date: "1776-07-04" },
    { name: "Moon Landing", date: "1969-07-20" },
    { name: "9/11 Attacks", date: "2001-09-11" },
    { name: "World War I Begins", date: "1914-07-28" }
];

// Global score variables
let playerScore = 0;
let totalPossibleScore = 0;

let draggedItem = null;
let placeholder = document.createElement('div');
placeholder.classList.add('placeholder');

// Function to create and add events dynamically
function loadEvents() {
    const unsortedEventsContainer = document.getElementById("unsorted-events");

    eventsData.forEach(event => {
        let eventElement = document.createElement("div");
        eventElement.classList.add("event");
        eventElement.draggable = true;
        eventElement.dataset.date = event.date; // Store full date as dataset

        // Create inner span for event text
        let eventText = document.createElement("span");
        eventText.classList.add("event-text");
        eventText.textContent = event.name;

        // Create hidden span for the date
        let eventYear = document.createElement("span");
        eventYear.classList.add("event-year", "hidden");
        eventYear.textContent = ` (${event.date})`; // Show full date in parentheses

        // Append to event element
        eventElement.appendChild(eventText);
        eventElement.appendChild(eventYear);
        unsortedEventsContainer.appendChild(eventElement);

        // Attach drag event listeners
        addDragListeners(eventElement);
    });

    // Set total possible score
    totalPossibleScore = eventsData.length;
    updateScoreDisplay();
}

// Attach drag event listeners
function addDragListeners(event) {
    event.addEventListener('dragstart', (e) => {
        draggedItem = event;
        setTimeout(() => event.style.display = "none", 0);
    });

    event.addEventListener('dragend', (e) => {
        draggedItem.style.display = "block";
        placeholder.remove();
        // Only check the last dropped event
        checkLastDroppedOrder(draggedItem);
    });
}

// Attach timeline event listeners
document.querySelectorAll('.timeline').forEach(timeline => {
    timeline.addEventListener('dragover', (e) => {
        e.preventDefault();
        let target = e.target.closest('.event');
        let timelineRect = timeline.getBoundingClientRect();
        let mouseY = e.clientY;

        // If hovering over an event, insert the placeholder before it
        if (target && target !== placeholder) {
            target.parentNode.insertBefore(placeholder, target);
        } 
        // If hovering near the bottom of the timeline, place placeholder at the end
        else if (!target && mouseY > timelineRect.bottom - 20) {
            if (timeline.lastElementChild !== placeholder) {
                timeline.appendChild(placeholder);
            }
        }
    });

    timeline.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedItem) {
            timeline.insertBefore(draggedItem, placeholder);
            placeholder.remove(); // Clean up placeholder after drop
        }
    });
});

// Helper function to format date without timezone adjustments.
function formatDate(dateString) {
    // dateString is in the format "YYYY-MM-DD"
    const [year, month, day] = dateString.split("-");
    return `${month}/${day}/${year}`;
}

function checkLastDroppedOrder(draggedEvent) {
    // Reveal the correct date in parentheses using our custom format function.
    let yearElement = draggedEvent.querySelector('.event-year');
    if (yearElement) {
        yearElement.textContent = " (" + formatDate(draggedEvent.dataset.date) + ")";
        yearElement.classList.remove('hidden');
    }

    let targetTimeline = document.querySelector('#ordered-timeline');
    // Get all events in the timeline (current order)
    let allEvents = Array.from(targetTimeline.querySelectorAll('.event'));
    // Use timestamp for comparison (this still uses Date objects)
    let draggedTime = new Date(draggedEvent.dataset.date).getTime();
    
    // Determine the correct index by counting events (excluding draggedEvent) with an earlier date.
    let otherEvents = allEvents.filter(e => e !== draggedEvent);
    let correctIndex = otherEvents.reduce((count, e) => {
        let eTime = new Date(e.dataset.date).getTime();
        return count + (eTime < draggedTime ? 1 : 0);
    }, 0);
    
    // Get the current index of the dragged event.
    let currentIndex = allEvents.indexOf(draggedEvent);
    
    // Only set the initial answer once.
    if (!draggedEvent.dataset.initialAnswer) {
        if (currentIndex === correctIndex) {
            draggedEvent.classList.add('correct');
            draggedEvent.classList.remove('incorrect');
            draggedEvent.dataset.initialAnswer = 'correct';
            playerScore++; // increment score for a correct initial drop
        } else {
            draggedEvent.classList.add('incorrect');
            draggedEvent.classList.remove('correct');
            draggedEvent.dataset.initialAnswer = 'incorrect';
            
            // Auto-correct the position for incorrect events.
            let remainingEvents = Array.from(targetTimeline.querySelectorAll('.event')).filter(e => e !== draggedEvent);
            let correctPosition = remainingEvents[correctIndex];
            if (correctPosition) {
                targetTimeline.insertBefore(draggedEvent, correctPosition);
            } else {
                targetTimeline.appendChild(draggedEvent);
            }
        }
    } else {
        // If already answered, simply reposition without changing its color.
        let remainingEvents = Array.from(targetTimeline.querySelectorAll('.event')).filter(e => e !== draggedEvent);
        let correctPosition = remainingEvents[correctIndex];
        if (correctPosition) {
            targetTimeline.insertBefore(draggedEvent, correctPosition);
        } else {
            targetTimeline.appendChild(draggedEvent);
        }
    }
    
    // Update the score display
    updateScoreDisplay();
}

// Update the score display
function updateScoreDisplay() {
    document.getElementById('result').innerText = `Score: ${playerScore}/${totalPossibleScore}`;
}

// Load events when the page loads
document.addEventListener("DOMContentLoaded", loadEvents);
