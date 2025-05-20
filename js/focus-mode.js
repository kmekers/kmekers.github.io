document.addEventListener('DOMContentLoaded', () => {
    const enterFocusButtonArchitectuur = document.getElementById('enter-focus-mode-button-architectuur');
    const enterFocusButtonStorymap = document.getElementById('enter-focus-mode-button-storymap');
    const body = document.body;
    const contentWrapper = document.querySelector('.content-wrapper');

    function activateFocusMode() {
        body.classList.add('focus-mode');
        if (contentWrapper) {
            contentWrapper.scrollTop = 0; // Scroll naar de top van de content
        }
    }

    function deactivateFocusMode() {
        body.classList.remove('focus-mode');
    }

    if (enterFocusButtonArchitectuur) {
        enterFocusButtonArchitectuur.addEventListener('click', activateFocusMode);
    }
    if (enterFocusButtonStorymap) {
        enterFocusButtonStorymap.addEventListener('click', activateFocusMode);
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && body.classList.contains('focus-mode')) {
            deactivateFocusMode();
        }
    });
}); 