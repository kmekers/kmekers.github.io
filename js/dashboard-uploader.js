document.addEventListener('DOMContentLoaded', function() {

    // --- File Uploader & Feedback Logic ---
    const uploadCard = document.querySelector('.upload-card');
    const uploadCardContent = document.querySelector('.upload-card-content');
    const uploadMainArea = document.querySelector('.upload-main-area');
    const uploadArea = document.querySelector('.upload-card .upload-area');
    const fileInput = document.getElementById('fileUpload');
    const loaderMessage = document.querySelector('.upload-card .loader-message');
    const feedbackSection = document.querySelector('.upload-card .feedback-section');
    const chatWindow = document.querySelector('.feedback-section .chat-window');
    const chatInput = document.querySelector('.feedback-section .chat-input');
    const chatInputArea = document.querySelector('.feedback-section .chat-input-area');
    const sendButton = document.querySelector('.feedback-section .send-button');
    const resetButton = document.getElementById('resetUploadButton');
    const processingIndicator = document.querySelector('.processing-feedback');
    const progressBar = document.querySelector('.processing-feedback .progress-bar');
    const progressSteps = document.querySelectorAll('.processing-feedback .step');
    const confirmationCard = document.querySelector('.confirmation-card');
    const complexCheckbox = document.getElementById('complexCheckbox');
    const complexInfoArea = document.querySelector('.complex-info-area');
    const complexitySection = document.querySelector('.complexity-section');
    const complexConsolidationActions = document.getElementById('complexConsolidationActions');
    const startComplexConsolidationButton = document.getElementById('startComplexConsolidationButton');

    // Define the plan steps (Keep this specific to the dashboard)
    const planSteps = [
        "Stap 1: Analyseer document structuur.",
        "Stap 2: Identificeer kernwijzigingen.",
        "Stap 3: Vergelijk met vorige versie.",
        "Stap 4: Genereer consolidatievoorstel.",
        "Stap 5: Markeer onzekerheden voor review."
    ];

    // Only run uploader logic if ALL elements exist
    if (uploadCard && uploadCardContent && uploadMainArea && uploadArea && fileInput && loaderMessage && feedbackSection && chatWindow && chatInput && chatInputArea && sendButton && resetButton && processingIndicator && progressBar && progressSteps.length > 0 && confirmationCard && complexCheckbox && complexInfoArea && complexitySection && complexConsolidationActions && startComplexConsolidationButton) {

        // Function to add a message to the chat window
        function addChatMessage(message, type = 'agent') {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('chat-message', type);
            messageDiv.textContent = message;
            chatWindow.appendChild(messageDiv);
            // Scroll to bottom after adding message
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }

        function showView(viewToShow) {
            // Hide all main views first
            uploadMainArea.style.display = 'none';
            complexitySection.style.display = 'none'; // Hide complexity section by default
            complexConsolidationActions.style.display = 'none'; // Hide complex actions by default
            loaderMessage.style.display = 'none';
            feedbackSection.style.display = 'none';
            confirmationCard.style.display = 'none';

            // Show the requested view
            if (viewToShow === 'upload') {
                uploadMainArea.style.display = 'flex'; // Show the area containing upload-area
                complexitySection.style.display = 'block'; // Show the complexity section below
                // Ensure complex info area is hidden based on checkbox state initially
                complexInfoArea.style.display = complexCheckbox.checked ? 'flex' : 'none';
                complexitySection.classList.toggle('complex-active', complexCheckbox.checked);
                updateComplexConsolidationUI(); // Update button state
            } else if (viewToShow === 'loader') {
                loaderMessage.style.display = 'flex';
            } else if (viewToShow === 'feedback') {
                feedbackSection.style.display = 'flex';
                // Ensure internal parts are visible/enabled as needed
                // e.g., chatInputArea.style.display = 'flex';
                //       processingIndicator.style.display = 'none';
            } else if (viewToShow === 'confirmation') {
                confirmationCard.style.display = 'flex';
            }
        }

        function resetUploadCard() {
            console.log('Resetting upload card...');
            // Reset checkbox and complex area state
            complexCheckbox.checked = false;
            complexInfoArea.style.display = 'none';
            complexitySection.classList.remove('complex-active');
            // complexConsolidationActions.style.display = 'none'; // Handled by updateComplexConsolidationUI
            // startComplexConsolidationButton.disabled = true; // Handled by updateComplexConsolidationUI

            // Reset file input and chat elements
            fileInput.value = '';
            chatWindow.innerHTML = '';
            if(chatInput) {
                chatInput.value = '';
                chatInput.disabled = false;
            }
            if(sendButton) sendButton.disabled = false;
            if(resetButton) resetButton.disabled = false;
            progressSteps.forEach(step => {
                step.classList.remove('active', 'completed');
            });
            progressBar.style.width = '0%';

            // Show the initial upload view
            showView('upload');
            updateComplexConsolidationUI(); // Ensure correct button state on reset
        }

        // --- Update Complex Consolidation UI ---
        function updateComplexConsolidationUI() {
            if (complexCheckbox.checked) {
                complexConsolidationActions.style.display = 'block';
                startComplexConsolidationButton.disabled = !(fileInput.files && fileInput.files.length > 0);
            } else {
                complexConsolidationActions.style.display = 'none';
                startComplexConsolidationButton.disabled = true;
            }
        }

        // Trigger file input when the upload area is clicked
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // Handle file selection
        fileInput.addEventListener('change', (event) => {
            updateComplexConsolidationUI(); // Update button state first based on file presence

            if (event.target.files && event.target.files.length > 0) {
                if (!complexCheckbox.checked) { // Only start automatically if NOT complex
                    showView('loader'); // Show loader view

                    // --- Simulate backend processing ---
                    setTimeout(() => {
                        loaderMessage.style.display = 'none';
                        chatWindow.innerHTML = '';
                        let planMessage = "Ok, hier is het voorgestelde plan:\n\n";
                        planSteps.forEach(step => {
                            planMessage += `- ${step}\n`;
                        });
                        planMessage += "\nGeef eventuele aanpassingen door of stel vragen.";
                        addChatMessage(planMessage, 'agent');

                        showView('feedback'); // Show feedback view
                        chatInputArea.style.display = 'flex';
                        processingIndicator.style.display = 'none';
                        if(chatInput) chatInput.disabled = false;
                        if(sendButton) sendButton.disabled = false;
                        if(resetButton) resetButton.disabled = false;

                    }, 2000);
                } else {
                    // For complex consolidation, file is selected, button is enabled by updateComplexConsolidationUI.
                    // User will click the 'Start' button.
                    console.log('File selected for complex consolidation. Waiting for user to click Start.');
                }
            } else {
                console.log('File selection cancelled.');
                // updateComplexConsolidationUI(); // Already called at the beginning of the event listener
            }
        });

        // --- Drag and Drop Listeners ---
        uploadArea.addEventListener('dragover', (event) => {
            event.preventDefault();
            uploadArea.style.borderColor = 'var(--text-dark)';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = 'var(--border-color)';
        });

        uploadArea.addEventListener('drop', (event) => {
            event.preventDefault();
            uploadArea.style.borderColor = 'var(--border-color)';

            if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
                fileInput.files = event.dataTransfer.files;
                const changeEvent = new Event('change');
                fileInput.dispatchEvent(changeEvent);
            }
        });

        // --- Complexity Toggle Logic ---
        complexCheckbox.addEventListener('change', () => {
            complexInfoArea.style.display = complexCheckbox.checked ? 'flex' : 'none';
            complexitySection.classList.toggle('complex-active', complexCheckbox.checked);
            updateComplexConsolidationUI(); // Update button state
        });

        // --- Chat Send Logic ---
        sendButton.addEventListener('click', () => {
            const messageText = chatInput.value.trim();
            if (messageText) {
                addChatMessage(messageText, 'user');
                chatInput.value = '';
                console.log('Feedback sent:', messageText);

                chatInput.disabled = true;
                sendButton.disabled = true;
                resetButton.disabled = true;
                chatInputArea.style.display = 'none';
                processingIndicator.style.display = 'block';

                const totalSteps = progressSteps.length;
                let currentStep = 0;

                function processNextStep() {
                    if (currentStep < totalSteps) {
                        if (currentStep > 0) {
                            progressSteps[currentStep - 1].classList.remove('active');
                            progressSteps[currentStep - 1].classList.add('completed');
                        }
                        progressSteps[currentStep].classList.add('active');
                        progressBar.style.width = `${((currentStep + 1) / totalSteps) * 100}%`;
                        currentStep++;
                        setTimeout(processNextStep, 1500);
                    } else {
                        console.log('Feedback processing complete.');
                        if (currentStep > 0) {
                            progressSteps[currentStep - 1].classList.remove('active');
                            progressSteps[currentStep - 1].classList.add('completed');
                        }
                        showView('confirmation'); // Show confirmation view
                    }
                }

                setTimeout(processNextStep, 500);
            }
        });

        // Allow sending with Enter key
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey && !chatInput.disabled) {
                e.preventDefault();
                sendButton.click();
            }
        });

        // --- Reset Button Logic ---
        resetButton.addEventListener('click', () => {
            if (!resetButton.disabled) {
                 resetUploadCard();
            }
        });

        // --- Start Complex Consolidation Button Logic ---
        startComplexConsolidationButton.addEventListener('click', () => {
            if (!startComplexConsolidationButton.disabled) {
                console.log('Start Complex Consolidation button clicked.');
                // Add logic to start complex consolidation process
                // This might involve similar steps to the normal sendButton,
                // but perhaps with different initial messages or processing.

                // For now, let's simulate a simple loading and then feedback state
                showView('loader');
                loaderMessage.querySelector('span').textContent = 'Agent start complexe consolidatie...'; // Customize loader

                setTimeout(() => {
                    chatWindow.innerHTML = ''; // Clear previous chat
                    // Restore the original plan steps display
                    let planMessage = "Ok, hier is het voorgestelde plan voor de complexe consolidatie:\n\n";
                    planSteps.forEach(step => {
                        planMessage += `- ${step}\n`;
                    });
                    planMessage += "\nGeef eventuele aanpassingen door of stel vragen.";
                    addChatMessage(planMessage, 'agent');

                    showView('feedback');
                    chatInputArea.style.display = 'flex';
                    processingIndicator.style.display = 'none';
                    if(chatInput) chatInput.disabled = false;
                    if(sendButton) sendButton.disabled = false; // Or maybe this button should be different/disabled
                    if(resetButton) resetButton.disabled = false;

                    // Adjust UI for complex flow if needed
                    // For example, hide the normal send button and show a specific one for complex feedback

                }, 2000); // Simulate planning time
            }
        });

    } else {
        // Updated error log
        console.error("One or more dashboard elements not found. Uploader/Feedback logic inactive.", {
            uploadCard, uploadCardContent, uploadMainArea, uploadArea, fileInput, loaderMessage, feedbackSection, chatWindow, chatInput, chatInputArea, sendButton, resetButton, processingIndicator, progressBar, progressSteps: progressSteps.length, confirmationCard, complexCheckbox, complexInfoArea, complexitySection, complexConsolidationActions, startComplexConsolidationButton
        });
    }

    // --- Initial State ---
    resetUploadCard(); // Set the initial view correctly
    updateComplexConsolidationUI(); // Set initial state of complex UI

}); // End DOMContentLoaded 