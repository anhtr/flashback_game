let draggedItem = null;
let placeholder = document.createElement('div');
placeholder.classList.add('placeholder');

document.querySelectorAll('.event').forEach(event => {
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
});

document.querySelectorAll('.timeline').forEach(timeline => {
    timeline.addEventListener('dragover', (e) => {
        e.preventDefault();
        let target = e.target.closest('.event');
        if (target) {
            target.parentNode.insertBefore(placeholder, target);
        } else if (timeline.id === 'ordered-timeline' && !timeline.contains(placeholder)) {
            timeline.appendChild(placeholder);
        }
    });
    timeline.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedItem) {
            timeline.insertBefore(draggedItem, placeholder);
        }
    });
});

function checkLastDroppedOrder(event) {
    let year = parseInt(event.dataset.year); // Get the year of the dropped event
    let yearElement = event.querySelector('.event-year');
    
    // Get all events in the ordered timeline
    let targetTimeline = document.querySelector('#ordered-timeline');
    let events = Array.from(targetTimeline.querySelectorAll('.event'));
    
    // Sort the events by their years
    let years = events.map(e => parseInt(e.dataset.year));
    let sortedYears = [...years].sort((a, b) => a - b);
    
    // Find the correct position based on sorted years
    let indexInSorted = sortedYears.indexOf(year);
    
    // Check if the event is correctly placed
    let isCorrect = years.indexOf(year) === indexInSorted;

    // Update the event’s class based on correctness
    if (yearElement) {
        yearElement.classList.remove('hidden');
    }

    if (isCorrect) {
        event.classList.add('correct');
        event.classList.remove('incorrect');
    } else {
        event.classList.add('incorrect');
        event.classList.remove('correct');

        // Move the event to the correct position if it's wrong
        let correctPosition = targetTimeline.querySelectorAll('.event')[indexInSorted];
        if (correctPosition) {
            // Move the event to the correct position (preserving its properties)
            correctPosition.parentNode.insertBefore(event, correctPosition);
        } else {
            // If it's the last position, append to the end
            targetTimeline.appendChild(event);
        }
    }

    // Show the result message
    document.getElementById('result').innerText = isCorrect ? "Correct order!" : "Incorrect order, keep trying!";
}
