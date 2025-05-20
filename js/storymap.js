document.addEventListener('DOMContentLoaded', function() {
    const printButton = document.getElementById('print-storymap-button');

    if (printButton) {
        printButton.addEventListener('click', function() {
            window.print();
        });
    }
}); 