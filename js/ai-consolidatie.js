document.addEventListener('DOMContentLoaded', function() {
    // Selecteer ALLE consolidation items om tab functionaliteit per item in te stellen
    const consolidationItems = document.querySelectorAll('.consolidation-item');

    consolidationItems.forEach((item, index) => {
        // Zoek ALLE tab knoppen binnen dit item
        const tabButtons = item.querySelectorAll('.tab-button');
        // Zoek de container voor de content panelen
        const diffViewContainer = item.querySelector('.diff-view-container');

        if (!diffViewContainer) return; // Skip als de container niet bestaat

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.dataset.tabTarget; // bv. "#origineel-1"
                // Zoek de target content binnen de diff-view-container
                const targetContent = diffViewContainer.querySelector(targetId);

                if (!targetContent) {
                    console.warn(`Tab content with selector ${targetId} not found within diff view for item ${index}.`);
                    return;
                }

                // Bepaal welke groep tabs (links of rechts) deze knop toebehoort
                const parentHeaderGroup = button.closest('.tab-header-group');
                const parentNav = button.closest('.tab-nav');

                // Deactiveer alle knoppen binnen DEZELFDE navigatie
                parentNav.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));

                // Bepaal welk paneel (links of rechts) bij deze tab hoort
                const isLeftPanelTab = parentHeaderGroup.classList.contains('left-header-group');
                const targetPanel = isLeftPanelTab
                    ? diffViewContainer.querySelector('.left-panel')
                    : diffViewContainer.querySelector('.right-panel');

                if (!targetPanel) return; // Skip als paneel niet gevonden wordt

                // Deactiveer alle content divs binnen het TARGET PANEEL
                targetPanel.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

                // Activeer de geklikte knop en de target content
                button.classList.add('active');
                targetContent.classList.add('active');
            });
        });
    });

    // Optioneel: Zorg dat bij het openen van een <details> de eerste tabs correct actief zijn
    // (Dit zou standaard al moeten werken door de 'active' class in HTML, maar kan als fallback dienen)
    consolidationItems.forEach(item => {
        item.addEventListener('toggle', event => {
            if (event.target.open) {
                // Reset eventueel naar de default actieve tabs als nodig
                // console.log(`Details ${index} opened`);
            }
        });
    });

    // --- NIEUW: Metadata Modal Logic ---
    const metadataModal = document.getElementById('metadata-modal');
    // Selecteer ALLE metadata open knoppen (als er meer items komen)
    const openMetadataButtons = document.querySelectorAll('.open-metadata-button'); // Gebruik een algemene class
    // const openMetadataButton1 = document.getElementById('open-metadata-modal-1'); // Specifiek voor item 1
    const closeMetadataButton = metadataModal ? metadataModal.querySelector('.close-modal-btn') : null;
    const modalTabButtons = metadataModal ? metadataModal.querySelectorAll('.modal-tab-button') : []; // Wordt nu 4 ipv 5
    const modalTabContents = metadataModal ? metadataModal.querySelectorAll('.modal-tab-content') : [];
    // const modalTabNav = metadataModal ? metadataModal.querySelector('.modal-tab-nav') : null; // Niet meer nodig voor listener

    // Functie om metadata modal te openen
    function openMetadataModal() {
        if (!metadataModal) return;
        metadataModal.style.display = 'flex';
        void metadataModal.offsetWidth; // Force reflow
        metadataModal.classList.add('visible');
        document.body.style.overflow = 'hidden'; // Voorkom scrollen achtergrond

        // NIEUW: Zet focus op de initieel actieve tab knop
        const activeTabButton = metadataModal.querySelector('.modal-tab-button.active');
        if (activeTabButton) {
            activeTabButton.focus();
        }
    }

    // Functie om metadata modal te sluiten
    function closeMetadataModal() {
        if (!metadataModal) return;
        metadataModal.classList.remove('visible');
        setTimeout(() => {
            metadataModal.style.display = 'none';
            document.body.style.overflow = ''; // Sta scrollen weer toe
        }, 300); // Match CSS transition
    }

    // Event listener voor metadata open knop (specifiek voor item 1)
    // if (openMetadataButton1) {
    //     openMetadataButton1.addEventListener('click', openMetadataModal);
    // }
    // NIEUW: Algemene listener voor metadata knoppen
    openMetadataButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            // Vind het bovenliggende consolidatie-item
            const parentItem = event.target.closest('.consolidation-item');
            if (parentItem) {
                // Markeer dat metadata is bekeken voor DIT item
                parentItem.dataset.metadataChecked = 'true';
                console.log(`Metadata checked for item: ${parentItem.dataset.consolidationId}`);
                // Optioneel: Verander de stijl van de 'Valideren' knop binnen dit item nu al
                const validateBtn = parentItem.querySelector('.validate-button');
                if (validateBtn) {
                    validateBtn.classList.remove('validate-button-initial');
                }
            }
            openMetadataModal(); // Open de (generieke) modal
        });
    });

    // Event listener voor metadata sluit knop
    if (closeMetadataButton) {
        closeMetadataButton.addEventListener('click', closeMetadataModal);
    }

    // Event listener voor klikken op achtergrond metadata modal
    if (metadataModal) {
        metadataModal.addEventListener('click', (event) => {
            if (event.target === metadataModal) {
                closeMetadataModal();
            }
        });
    }

    // Tab switching logic binnen de metadata modal
    modalTabButtons.forEach((button, buttonIndex) => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.modalTabTarget; // e.g., "#meta-algemeen"
            const targetContent = metadataModal.querySelector(targetId);

            // Deactivate all modal tabs and content
            modalTabButtons.forEach(btn => btn.classList.remove('active'));
            modalTabContents.forEach(content => content.classList.remove('active'));

            // Activate the clicked button and its target content
            button.classList.add('active');
            if (targetContent) {
                targetContent.classList.add('active');
            }
            // Zet focus op de geklikte knop voor toetsenbordnavigatie
            button.focus();
        });

        // NIEUW: Keydown listener direct op elke knop
        button.addEventListener('keydown', (event) => {
            // Alleen reageren als de modal zichtbaar is en het een pijltoets is
            if (!metadataModal || !metadataModal.classList.contains('visible') || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) {
                return;
            }

            let nextIndex = buttonIndex; // Start met de index van de huidige knop
            // AANPASSING: Gebruik het actuele aantal knoppen
            const numTabs = modalTabButtons.length;

            if (event.key === 'ArrowRight') {
                event.preventDefault(); // Voorkom standaard browsergedrag
                nextIndex = (buttonIndex + 1) % numTabs; // Gebruik numTabs
            } else if (event.key === 'ArrowLeft') {
                event.preventDefault(); // Voorkom standaard browsergedrag
                nextIndex = (buttonIndex - 1 + numTabs) % numTabs; // Gebruik numTabs
            }

            // Simuleer een klik op de nieuwe knop (als deze anders is)
            if (nextIndex !== buttonIndex) {
                modalTabButtons[nextIndex].click(); // Triggert de click listener (incl. focus())
            }
        });
    });

    // --- Einde Metadata Modal Logic ---

    // --- NIEUW: Logica voor Valideren knop (per item) ---
    const consolidationList = document.querySelector('.consolidation-list');

    if (consolidationList) {
        consolidationList.addEventListener('click', function(event) {
            // Check of er op een valideren knop is geklikt
            if (event.target.closest('.validate-button')) {
                const validateButton = event.target.closest('.validate-button');
                const parentItem = validateButton.closest('.consolidation-item');

                if (!parentItem) return; // Veiligheid check

                const consolidationId = parentItem.dataset.consolidationId;
                const metadataChecked = parentItem.dataset.metadataChecked === 'true';

                if (!metadataChecked) {
                    alert("Kijk eerst de metadata na voor dit item.");
                } else {
                    console.log(`Validating item: ${consolidationId}`);

                    // Vind het volgende item
                    const nextItem = parentItem.nextElementSibling;

                    // NIEUW: Sla info op voor geschiedenis
                    const itemTitle = parentItem.querySelector('.consolidation-summary span')?.textContent || 'Onbekend Item';
                    const historyItem = { id: consolidationId, title: itemTitle, validatedAt: new Date().toISOString() };
                    // Haal bestaande geschiedenis op of maak een lege array
                    let history = JSON.parse(localStorage.getItem('consolidationHistory') || '[]');
                    // Voeg nieuw item toe (vooraan)
                    history.unshift(historyItem);
                    // Sla bijgewerkte geschiedenis op
                    localStorage.setItem('consolidationHistory', JSON.stringify(history));
                    console.log(`Item ${consolidationId} added to history in localStorage.`);

                    // Verwijder het huidige item
                    parentItem.remove();
                    console.log(`Item ${consolidationId} removed.`);
                    // TODO: Stuur data naar backend / geschiedenis

                    // Open het volgende item als het bestaat en een consolidation-item is
                    if (nextItem && nextItem.classList.contains('consolidation-item')) {
                        nextItem.open = true;
                        console.log(`Opening next item: ${nextItem.dataset.consolidationId}`);
                        // Scroll naar het volgende item indien nodig
                        nextItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    } else {
                        console.log("No next consolidation item found or it's not a details element.");
                    }
                }
            }
        });
    }
    // --- EINDE Logica voor Valideren knop ---

    // --- Trefwoorden Beheer Logic (UI/UX Rework) ---
    const keywordInput = document.getElementById('keyword-input');
    const addKeywordButton = document.getElementById('add-keyword-btn');
    const finalKeywordList = document.getElementById('keyword-list'); // Definitieve lijst UL
    const suggestKeywordsButton = document.getElementById('suggest-keywords-btn');
    const keywordLoader = document.getElementById('keyword-loader');
    const suggestedKeywordsArea = document.getElementById('suggested-keywords-area');
    const suggestedKeywordList = document.getElementById('suggested-keyword-list'); // Suggestie lijst UL
    const paginationControls = document.getElementById('keyword-pagination');
    const prevPageButton = document.getElementById('prev-keyword-page');
    const nextPageButton = document.getElementById('next-keyword-page');
    const pageInfoSpan = document.getElementById('keyword-page-info');
    // NIEUW: Empty state elementen
    const suggestedEmptyState = document.getElementById('suggested-empty-state');
    const selectedEmptyState = document.getElementById('selected-empty-state');
    const suggestedPlaceholder = document.getElementById('suggested-placeholder');
    // NIEUW: Modal voor alle trefwoorden elementen
    const allKeywordsModal = document.getElementById('all-keywords-modal');
    const openAllKeywordsModalButton = document.getElementById('open-all-keywords-modal-btn'); // ID van '+' knop aangepast
    const closeAllKeywordsModalButtons = allKeywordsModal ? allKeywordsModal.querySelectorAll('.close-modal-btn, .close-all-keywords-modal-btn') : [];
    const allKeywordsModalList = document.getElementById('all-keywords-modal-list');
    const allKeywordsSearchInput = document.getElementById('all-keywords-search-input');
    // NIEUW: Selecteer knop
    const addSelectedKeywordsButton = document.getElementById('add-selected-keywords-btn');

    let allSuggestedKeywords = [];
    let currentKeywordPage = 1;
    const keywordsPerPage = 6;
    // Definieer de lijst met alle beschikbare trefwoorden (voorbeeld - kan beter uit config/API komen)
    const availableKeywords = ["Administratie", "Advies", "Agentschap", "Arbeid", "Archief", "Armoede", "Belasting", "Beleid", "Besluit", "Bestuur", "Budget", "Burger", "Communicatie", "Consolidatie", "Cultuur", "Data", "Decreet", "Digitalisering", "Economie", "Energie", "Erfgoed", "Europa", "Evaluatie", "Financiën", "Fiscaliteit", "Formulier", "Fusie", "Gezondheid", "Gezondheidszorg", "Gemeente", "Gewest", "Grondwet", "Handel", "Hervorming", "Huisartsen", "Huisartsenkring", "Huisartsenzone", "Infrastructuur", "Integratie", "Internationaal", "Investering", "Jeugd", "Justitie", "Juridisch", "Kader", "Kennis", "Klimaat", "Kwaliteit", "Landbouw", "Leefmilieu", "Lokaal", "Maatschappij", "Management", "Media", "Milieu", "Ministerieel Besluit", "Mobiliteit", "Natuur", "Netwerk", "Norm", "Onderwijs", "Onderzoek", "Ontwikkeling", "Openbaar", "Organisatie", "Overheid", "Participatie", "Personeel", "Plan", "Procedure", "Project", "Provincie", "Publicatie", "Recht", "Regelgeving", "Regering", "Regio", "Relaties", "Rijksregister", "Samenleving", "Samenwerking", "Sanctie", "Sociaal", "Sport", "Staat", "Staatsblad", "Statistiek", "Structuur", "Subsidie", "Technologie", "Territorium", "Toerisme", "Toezicht", "Transport", "Uitvoering", "Universiteit", "Urbanisme", "Veiligheid", "Vergunning", "Verkeer", "Verkiezing", "Verordening", "Vervoer", "Vlaanderen", "Vorming", "Vrijwilliger", "Water", "Welzijn", "Werk", "Werkgelegenheid", "Wet", "Wetenschap", "Wonen", "Zorg", "Zone"].sort();

    // --- Hulpfuncties ---

    // Toont/verbergt empty state voor een lijst
    function updateEmptyState(listElement, emptyStateElement, forceShow = false) {
        if (!listElement || !emptyStateElement) return;
        const hasItems = listElement.children.length > 0;
        emptyStateElement.style.display = !hasItems || forceShow ? 'flex' : 'none';
    }

    // --- Kernfuncties ---

    // Trefwoord toevoegen aan definitieve lijst
    function addKeywordToFinalList(keywordText) {
        if (!finalKeywordList || !keywordText) return false;
        keywordText = keywordText.trim();
        if (!keywordText) return false; // Voeg geen lege trefwoorden toe

        const existingKeywords = Array.from(finalKeywordList.querySelectorAll('li span')).map(span => span.textContent.trim().toLowerCase());
        if (existingKeywords.includes(keywordText.toLowerCase())) {
            console.warn(`Trefwoord "${keywordText}" staat al in de definitieve lijst.`);
            // Optioneel: highlight het bestaande item kort
            return false;
        }

        const li = document.createElement('li');
        li.innerHTML = `
            <span>${keywordText}</span>
            <button class="remove-keyword-btn" aria-label="Verwijder trefwoord ${keywordText}">
                <i class="fa-solid fa-times"></i>
            </button>
        `;
        finalKeywordList.appendChild(li);
        updateEmptyState(finalKeywordList, selectedEmptyState); // Update empty state
        return true;
    }

    // Suggesties weergeven voor een pagina
    function displaySuggestedKeywords(page) {
        if (!suggestedKeywordList) return;
        suggestedKeywordList.innerHTML = '';
        currentKeywordPage = page;

        const startIndex = (page - 1) * keywordsPerPage;
        const endIndex = startIndex + keywordsPerPage;
        const paginatedKeywords = allSuggestedKeywords.slice(startIndex, endIndex);
        const finalKeywordsLower = Array.from(finalKeywordList.querySelectorAll('li span')).map(span => span.textContent.trim().toLowerCase());

        paginatedKeywords.forEach(keyword => {
            const li = document.createElement('li');
            const isAlreadyAdded = finalKeywordsLower.includes(keyword.toLowerCase());
            li.innerHTML = `
                <span>${keyword}</span>
                <button class="add-suggested-keyword-btn ${isAlreadyAdded ? 'added' : ''}" data-keyword="${keyword}" aria-label="Voeg trefwoord ${keyword} toe" ${isAlreadyAdded ? 'disabled' : ''}>
                    <i class="fa-solid ${isAlreadyAdded ? 'fa-check' : 'fa-plus'}"></i>
                </button>
            `;
            suggestedKeywordList.appendChild(li);
        });

        updatePaginationControls();
        updateEmptyState(suggestedKeywordList, suggestedEmptyState, allSuggestedKeywords.length === 0); // Toon empty state als er 0 suggesties zijn
    }

    // Paginatie bijwerken
    function updatePaginationControls() {
        if (!paginationControls || !pageInfoSpan || !prevPageButton || !nextPageButton) return;

        const totalPages = Math.ceil(allSuggestedKeywords.length / keywordsPerPage);
        pageInfoSpan.textContent = `Pagina ${currentKeywordPage} / ${totalPages || 1}`;

        prevPageButton.disabled = currentKeywordPage <= 1;
        nextPageButton.disabled = currentKeywordPage >= totalPages;

        paginationControls.style.display = totalPages > 0 ? 'flex' : 'none'; // Toon alleen als er resultaten zijn
    }

    // --- Event Listeners ---

    // Handmatig toevoegen met Enter
    if (keywordInput) { // Alleen input nodig nu
        keywordInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                const newKeyword = keywordInput.value.trim();
                if (addKeywordToFinalList(newKeyword)) {
                    keywordInput.value = ''; // Maak input leeg na succesvol toevoegen
                    if (allSuggestedKeywords.length > 0) displaySuggestedKeywords(currentKeywordPage);
                }
                keywordInput.focus(); // Houd focus op input
            }
        });
    }

    // Verwijderen uit definitieve lijst
    if (finalKeywordList) {
        finalKeywordList.addEventListener('click', (event) => {
            const removeButton = event.target.closest('.remove-keyword-btn');
            if (removeButton) {
                removeButton.closest('li')?.remove();
                updateEmptyState(finalKeywordList, selectedEmptyState);
                 // Trigger update op suggestielijst om eventuele '+' knoppen te updaten
                 if (allSuggestedKeywords.length > 0) displaySuggestedKeywords(currentKeywordPage);
            }
        });
    }

    // AI Suggesties knop
    if (suggestKeywordsButton) {
        suggestKeywordsButton.addEventListener('click', () => {
            console.log("AI + Rulebased suggesties laden...");
            suggestKeywordsButton.disabled = true;
            suggestKeywordsButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Laden...'; // Update knop tekst
            keywordLoader.style.display = 'block';
            suggestedKeywordsArea.style.display = 'none';
            suggestedPlaceholder.style.display = 'none'; // Verberg placeholder

            // Simuleer API call
            setTimeout(() => {
                const mockSuggestedKeywords = [
                    "Huisartsen", "Ministerieel Besluit", "Zone", "Werkingsgebied",
                    "Gezondheidszorg", "Vlaamse Regering", "Huisartsenkring", "Organisatie",
                    "Decreet", "Aanpassing", "Publicatie", "Structuur", "Samenwerking",
                    "Regio", "Gemeente", "Zorg", "Beleid", "Territorium" // Meer voorbeelden
                ];
                allSuggestedKeywords = mockSuggestedKeywords;

                keywordLoader.style.display = 'none';
                suggestedKeywordsArea.style.display = 'flex'; // Gebruik flex voor area
                displaySuggestedKeywords(1); // Toon eerste pagina (dit regelt ook empty state)

                suggestKeywordsButton.disabled = false;
                suggestKeywordsButton.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Opnieuw Laden'; // Update knop tekst

            }, 1500);
        });
    }

    // Paginatie
    if (prevPageButton) {
        prevPageButton.addEventListener('click', () => {
            if (currentKeywordPage > 1) displaySuggestedKeywords(currentKeywordPage - 1);
        });
    }
    if (nextPageButton) {
        nextPageButton.addEventListener('click', () => {
            const totalPages = Math.ceil(allSuggestedKeywords.length / keywordsPerPage);
            if (currentKeywordPage < totalPages) displaySuggestedKeywords(currentKeywordPage + 1);
        });
    }

    // Suggestie toevoegen aan definitieve lijst
    if (suggestedKeywordList) {
        suggestedKeywordList.addEventListener('click', (event) => {
            const addButton = event.target.closest('.add-suggested-keyword-btn:not(.added)'); // Alleen niet-toegevoegde
            if (addButton) {
                const keywordToAdd = addButton.dataset.keyword;
                if (keywordToAdd && addKeywordToFinalList(keywordToAdd)) {
                    // Visuele feedback: verander icoon naar vinkje en disable knop
                    addButton.innerHTML = '<i class="fa-solid fa-check"></i>';
                    addButton.classList.add('added');
                    addButton.disabled = true;
                }
            }
        });
    }

    // Initiele empty state check voor geselecteerde lijst bij laden
    updateEmptyState(finalKeywordList, selectedEmptyState);
    // Zorg dat suggestie placeholder zichtbaar is bij start
    if(suggestedPlaceholder) suggestedPlaceholder.style.display = 'flex';

    // --- Einde Trefwoorden Beheer Logic ---

    // --- NIEUW: Afkeur Modal Logic ---
    const rejectModal = document.getElementById('reject-modal');
    const rejectReasonTextarea = document.getElementById('reject-reason');
    const rejectButtons = document.querySelectorAll('.reject-button'); // Selecteer ALLE afkeur knoppen
    const closeRejectModalButton = rejectModal ? rejectModal.querySelector('.close-modal-btn') : null;
    const cancelRejectionButton = rejectModal ? rejectModal.querySelector('.cancel-rejection-btn') : null;
    const submitRejectionButton = rejectModal ? rejectModal.querySelector('.submit-rejection-btn') : null;

    // Functie om afkeur modal te openen
    function openRejectModal() {
        if (!rejectModal) return;
        rejectReasonTextarea.value = ''; // Maak textarea leeg bij openen
        rejectModal.style.display = 'flex';
        void rejectModal.offsetWidth; // Force reflow
        rejectModal.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }

    // Functie om afkeur modal te sluiten
    function closeRejectModal() {
        if (!rejectModal) return;
        rejectModal.classList.remove('visible');
        setTimeout(() => {
            rejectModal.style.display = 'none';
            document.body.style.overflow = '';
            // Textarea wordt al geleegd bij openen, maar kan hier ook voor zekerheid
            // rejectReasonTextarea.value = '';
        }, 300); // Match CSS transition
    }

    // Event listeners voor ALLE afkeur knoppen
    rejectButtons.forEach(button => {
        button.addEventListener('click', openRejectModal);
    });

    // Event listener voor sluit knop (X)
    if (closeRejectModalButton) {
        closeRejectModalButton.addEventListener('click', closeRejectModal);
    }

    // Event listener voor Annuleren knop
    if (cancelRejectionButton) {
        cancelRejectionButton.addEventListener('click', closeRejectModal);
    }

    // Event listener voor Verzenden knop
    if (submitRejectionButton) {
        submitRejectionButton.addEventListener('click', () => {
            const reason = rejectReasonTextarea.value.trim();
            console.log("Afkeur reden:", reason); // Optioneel: log de reden

            closeRejectModal(); // Sluit de modal

            // Toon de pop-up
            alert('Normaal zou nu dit artikel weg gaan en door gaan naar het volgende');

            // Hier zou de logica komen om het item daadwerkelijk te verwerken/verwijderen
            // bijv. findParentConsolidationItem(submitRejectionButton).remove();
        });
    }

     // Event listener voor klikken op achtergrond afkeur modal
    if (rejectModal) {
        rejectModal.addEventListener('click', (event) => {
            if (event.target === rejectModal) {
                closeRejectModal();
            }
        });
    }

    // Update Escape toets listener om ook reject modal te sluiten
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            if (metadataModal && metadataModal.classList.contains('visible')) {
                closeMetadataModal();
            } else if (rejectModal && rejectModal.classList.contains('visible')) {
                closeRejectModal();
            }
            // Voeg hier eventueel check toe voor PDF modal
            const pdfModal = document.getElementById('pdf-modal');
             if (pdfModal && pdfModal.classList.contains('visible')) {
                 // Roep de closePdfModal functie aan
                 // closePdfModal(); // Aanname: closePdfModal is beschikbaar
             }
        }
    });
    // --- Einde Afkeur Modal Logic ---

    // --- NIEUW: Alle Trefwoorden Modal Logic ---
    function openAllKeywordsModal() {
        if (!allKeywordsModal || !allKeywordsModalList) return;
        populateAllKeywordsModalList(); // Vul de lijst
        // Reset selectie bij openen
        allKeywordsModalList.querySelectorAll('li.selected').forEach(li => li.classList.remove('selected'));
        allKeywordsSearchInput.value = ''; // Reset zoekveld
        filterAllKeywordsModalList(''); // Toon alles initieel
        allKeywordsModal.style.display = 'flex';
        void allKeywordsModal.offsetWidth;
        allKeywordsModal.classList.add('visible');
        document.body.style.overflow = 'hidden';
        allKeywordsSearchInput.focus(); // Focus op zoekveld
    }

    function closeAllKeywordsModal() {
        if (!allKeywordsModal) return;
        allKeywordsModal.classList.remove('visible');
        setTimeout(() => {
            allKeywordsModal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }

    // Vult de lijst in de modal met alle beschikbare trefwoorden
    function populateAllKeywordsModalList() {
        if (!allKeywordsModalList) return;
        allKeywordsModalList.innerHTML = ''; // Leegmaken voor zekerheid
        availableKeywords.forEach(keyword => {
            const li = document.createElement('li');
            li.textContent = keyword;
            li.dataset.keyword = keyword;
            // Controleer of het al in de definitieve lijst staat
            const finalKeywordsLower = Array.from(finalKeywordList.querySelectorAll('li span')).map(span => span.textContent.trim().toLowerCase());
            if (finalKeywordsLower.includes(keyword.toLowerCase())) {
                li.classList.add('already-added'); // Markeer als al toegevoegd (optioneel)
                li.style.opacity = '0.6'; // Maak het minder prominent
                li.style.cursor = 'not-allowed';
            }
            allKeywordsModalList.appendChild(li);
        });
    }

    // Filtert de lijst in de modal op basis van zoekterm
    function filterAllKeywordsModalList(searchTerm) {
        if (!allKeywordsModalList) return;
        const filterLower = searchTerm.toLowerCase();
        const items = allKeywordsModalList.querySelectorAll('li');
        items.forEach(item => {
            const keyword = item.dataset.keyword || '';
            // Verberg alleen als het niet matcht EN niet geselecteerd is
            const isVisible = keyword.toLowerCase().includes(filterLower) || item.classList.contains('selected');
            item.classList.toggle('hidden', !isVisible);
        });
    }

    // Event listener voor '+' knop om modal te openen
    if (openAllKeywordsModalButton) {
        openAllKeywordsModalButton.addEventListener('click', openAllKeywordsModal);
    }

    // Event listeners voor sluitknoppen van de modal
    closeAllKeywordsModalButtons.forEach(button => {
        button.addEventListener('click', closeAllKeywordsModal);
    });

    // Event listener voor klikken buiten de modal content
    if (allKeywordsModal) {
        allKeywordsModal.addEventListener('click', (event) => {
            if (event.target === allKeywordsModal) {
                closeAllKeywordsModal();
            }
        });
    }

    // Event listener voor zoekveld in de modal
    if (allKeywordsSearchInput) {
        allKeywordsSearchInput.addEventListener('input', () => {
            filterAllKeywordsModalList(allKeywordsSearchInput.value.trim());
        });
    }

    // Event listener voor klikken op een trefwoord in de modal lijst
    if (allKeywordsModalList) {
        allKeywordsModalList.addEventListener('click', (event) => {
            const targetLi = event.target.closest('li');
            // Toggle selectie alleen als het nog niet is toegevoegd
            if (targetLi && targetLi.dataset.keyword && !targetLi.classList.contains('already-added')) {
                targetLi.classList.toggle('selected');
            }
        });
    }

    // NIEUW: Event listener voor "Selecteren" knop in modal
    if (addSelectedKeywordsButton) {
        addSelectedKeywordsButton.addEventListener('click', () => {
            const selectedItems = allKeywordsModalList.querySelectorAll('li.selected');
            let addedAny = false;
            selectedItems.forEach(item => {
                const keywordToAdd = item.dataset.keyword;
                if (keywordToAdd) {
                    if(addKeywordToFinalList(keywordToAdd)) {
                        addedAny = true;
                    }
                }
            });
            closeAllKeywordsModal(); // Sluit de modal
            // Update suggestielijst als er iets is toegevoegd
            if (addedAny && allSuggestedKeywords.length > 0) {
                displaySuggestedKeywords(currentKeywordPage);
            }
        });
    }

    // Update Escape toets listener om ook deze modal te sluiten
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            if (allKeywordsModal && allKeywordsModal.classList.contains('visible')) { // Eerst deze checken (meest recent geopend?)
                closeAllKeywordsModal();
            } else if (rejectModal && rejectModal.classList.contains('visible')) {
                closeRejectModal();
            } else if (metadataModal && metadataModal.classList.contains('visible')) {
                closeMetadataModal();
            }
            // Voeg hier eventueel check toe voor PDF modal
            const pdfModal = document.getElementById('pdf-modal');
             if (pdfModal && pdfModal.classList.contains('visible')) {
                 // Roep de closePdfModal functie aan
                 // closePdfModal(); // Aanname: closePdfModal is beschikbaar
             }
        }
    });
    // --- Einde Alle Trefwoorden Modal Logic ---

}); 