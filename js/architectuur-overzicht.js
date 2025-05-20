document.addEventListener('DOMContentLoaded', function() {
    const printButton = document.getElementById('print-architecture-button');

    if (printButton) {
        printButton.addEventListener('click', function() {
            window.print();
        });
    }
}); 