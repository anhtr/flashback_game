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

function checkLastDroppedOrder(draggedEvent) {
    let targetTimeline = document.querySelector('#ordered-timeline');
    // Get all events in the timeline (in current order)
    let allEvents = Array.from(targetTimeline.querySelectorAll('.event'));
    
    // Determine the correct index by counting events with a lower year.
    let draggedYear = parseInt(draggedEvent.dataset.year);
    let otherEvents = allEvents.filter(e => e !== draggedEvent);
    let correctIndex = otherEvents.reduce((count, e) => {
        return count + (parseInt(e.dataset.year) < draggedYear ? 1 : 0);
    }, 0);
    
    // Get the current index of the dragged event.
    let currentIndex = allEvents.indexOf(draggedEvent);
    
    if (currentIndex !== correctIndex) {
        // Move the dragged event to the correct position.
        // We refresh the list to avoid including the draggedEvent.
        let remainingEvents = Array.from(targetTimeline.querySelectorAll('.event')).filter(e => e !== draggedEvent);
        let correctPosition = remainingEvents[correctIndex];
        if (correctPosition) {
            targetTimeline.insertBefore(draggedEvent, correctPosition);
        } else {
            targetTimeline.appendChild(draggedEvent);
        }
        // Optionally, you can inform the user that the event was out of order.
        draggedEvent.classList.remove('incorrect'); // clear previous state if any
        draggedEvent.classList.add('correct');
        document.getElementById('result').innerText = "Incorrect order, but corrected!";
    } else {
        draggedEvent.classList.add('correct');
        draggedEvent.classList.remove('incorrect');
        document.getElementById('result').innerText = "Correct order!";
    }
}

