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
        checkImmediateOrder();
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

function checkImmediateOrder() {
    let events = document.querySelectorAll('#ordered-timeline .event');
    let years = Array.from(events).map(e => parseInt(e.dataset.year));
    let sortedYears = [...years].sort((a, b) => a - b);
    let isCorrect = JSON.stringify(years) === JSON.stringify(sortedYears);
    
    events.forEach((event, index) => {
        let yearElement = event.querySelector('.event-year');
        if (yearElement) {
            yearElement.classList.remove('hidden');
        }
        if (years[index] === sortedYears[index]) {
            event.classList.add('correct');
            event.classList.remove('incorrect');
        } else {
            event.classList.add('incorrect');
            event.classList.remove('correct');
        }
    });
    
    document.getElementById('result').innerText = isCorrect ? "Correct order!" : "Incorrect order, keep trying!";
}
