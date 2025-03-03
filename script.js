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
    // Get all events in the timeline (current order)
    let allEvents = Array.from(targetTimeline.querySelectorAll('.event'));
    let draggedYear = parseInt(draggedEvent.dataset.year);
    
    // Determine the correct index by counting events (excluding draggedEvent) with a lower year.
    let otherEvents = allEvents.filter(e => e !== draggedEvent);
    let correctIndex = otherEvents.reduce((count, e) => {
        return count + (parseInt(e.dataset.year) < draggedYear ? 1 : 0);
    }, 0);
    
    // Get the current index of the dragged event.
    let currentIndex = allEvents.indexOf(draggedEvent);
    
    // If the event hasn't been answered before, decide its color.
    if (!draggedEvent.dataset.initialAnswer) {
        if (currentIndex === correctIndex) {
            draggedEvent.classList.add('correct');
            draggedEvent.classList.remove('incorrect');
            draggedEvent.dataset.initialAnswer = 'correct';
            document.getElementById('result').innerText = "Correct order!";
        } else {
            draggedEvent.classList.add('incorrect');
            draggedEvent.classList.remove('correct');
            draggedEvent.dataset.initialAnswer = 'incorrect';
            document.getElementById('result').innerText = "Incorrect order, keep trying!";
            
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
        // If already answered, reposition without changing its color.
        let remainingEvents = Array.from(targetTimeline.querySelectorAll('.event')).filter(e => e !== draggedEvent);
        let correctPosition = remainingEvents[correctIndex];
        if (correctPosition) {
            targetTimeline.insertBefore(draggedEvent, correctPosition);
        } else {
            targetTimeline.appendChild(draggedEvent);
        }
    }
}

