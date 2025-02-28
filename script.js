let draggedItem = null;

document.querySelectorAll('.event').forEach(event => {
    event.addEventListener('dragstart', (e) => {
        draggedItem = event;
    });
});

document.querySelectorAll('.timeline').forEach(timeline => {
    timeline.addEventListener('dragover', (e) => {
        e.preventDefault();
    });
    timeline.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedItem && timeline.id === 'ordered-timeline') {
            timeline.appendChild(draggedItem);
        }
    });
});

function checkOrder() {
    let events = document.querySelectorAll('#ordered-timeline .event');
    let years = Array.from(events).map(e => parseInt(e.dataset.year));
    let sortedYears = [...years].sort((a, b) => a - b);
    
    if (JSON.stringify(years) === JSON.stringify(sortedYears)) {
        document.getElementById('result').innerText = "Correct! Well done!";
    } else {
        document.getElementById('result').innerText = "Incorrect, try again!";
    }
}
