document.addEventListener('DOMContentLoaded', function() {

    const staatsbladContainer = document.querySelector('.staatsblad-container');
    const vorigePublicatiesContainer = document.querySelector('.vorige-publicaties-container');
    const pdfModal = document.getElementById('pdf-modal');
    const pdfViewer = document.getElementById('pdf-viewer');
    const openModalButtons = document.querySelectorAll('.open-pdf-modal-btn');
    const closeModalButton = pdfModal ? pdfModal.querySelector('.close-modal-btn') : null;

    // Functie om te checken of alle items in een ACTIEVE groep gevalideerd zijn
    function checkGroupValidation(groupElement) {
        if (!groupElement || !groupElement.classList.contains('active-group') || groupElement.id === 'vorige-publicaties-group') {
            return false;
        }
        const indicators = groupElement.querySelectorAll('.staatsblad-item .status-indicator');
        if (indicators.length === 0) {
            return true;
        }
        return Array.from(indicators).every(indicator => indicator.classList.contains('status-gevalideerd'));
    }

    // --- NIEUW: Helper functie om geneste groep te vinden of aan te maken ---
    function getOrCreateNestedGroup(dateString, dateLabel) {
        if (!vorigePublicatiesContainer) return null;

        const groupId = dateString; // Gebruik YYYY-MM-DD als ID
        let nestedGroup = vorigePublicatiesContainer.querySelector(`.nested-group[data-group-id="${groupId}"]`);

        if (!nestedGroup) {
            console.log(`Geneste groep voor ${dateLabel} niet gevonden, aanmaken...`);
            // Maak de volledige structuur aan
            nestedGroup = document.createElement('details');
            nestedGroup.className = 'staatsblad-group nested-group';
            nestedGroup.dataset.groupId = groupId;
            // Start gesloten, tenzij je het open wilt
            // nestedGroup.open = true;

            const summary = document.createElement('summary');
            summary.className = 'staatsblad-date-header nested-header';
            summary.innerHTML = `<i class="fa-solid fa-caret-right"></i> Staatsblad ${dateLabel}`; // Gebruik leesbare datum

            const list = document.createElement('div');
            list.className = 'staatsblad-items-list nested-list';

            const footer = document.createElement('div');
            footer.className = 'card-footer-action';
            footer.innerHTML = `<a href="#" class="button-link pdf-button">PDF Staatsblad</a>`; // Placeholder link

            nestedGroup.appendChild(summary);
            nestedGroup.appendChild(list);
            nestedGroup.appendChild(footer);

            // Voeg de nieuwe groep toe aan het begin van de container
            vorigePublicatiesContainer.prepend(nestedGroup);
        }

        // Return de lijst div waar items aan toegevoegd moeten worden
        return nestedGroup.querySelector('.nested-list');
    }

    // Functie om een gevalideerde groep te verwerken (AANGEPAST)
    function processValidatedGroup(groupElement) {
        if (!groupElement || !vorigePublicatiesContainer) return;

        const groupDateId = groupElement.dataset.groupId; // bv. "2024-05-15"
        // Probeer een leesbare datum te maken uit de summary
        const groupDateLabel = groupElement.querySelector('.staatsblad-date-header')?.textContent.replace('Staatsblad', '').trim() || groupDateId;

        console.log(`Groep ${groupDateId} (${groupDateLabel}) volledig gevalideerd. Verplaatsen...`);

        // 1. Haal alle items op uit de gevalideerde groep
        const itemsToMove = Array.from(groupElement.querySelectorAll('.staatsblad-items-list .staatsblad-item'));

        // 2. Vind of maak de juiste geneste groep in "Vorige Publicaties"
        const targetList = getOrCreateNestedGroup(groupDateId, groupDateLabel);

        if (!targetList) {
            console.error("Kon geen doel lijst vinden of aanmaken in Vorige Publicaties.");
            return; // Stop als we geen plek hebben om items te plaatsen
        }

        // 3. Verplaats elk item naar het begin van de doel lijst
        itemsToMove.reverse().forEach(item => {
            // Maak alle input velden readonly
            item.querySelectorAll('input[type="text"], input[type="date"]').forEach(input => {
                input.readOnly = true;
                input.classList.add('readonly-input'); // Optionele klasse voor extra styling
            });
            // Verwijder save/delete knoppen (of disable ze)
            item.querySelector('.save-btn')?.remove();
            item.querySelector('.delete-btn')?.remove();

            targetList.prepend(item); // Voeg vooraan toe aan de geneste lijst
        });

        // 4. Verwijder de originele (nu lege) actieve groep
        groupElement.remove();

        // 5. Check of er nog actieve groepen over zijn
        const remainingActiveGroups = staatsbladContainer.querySelectorAll('.staatsblad-group.active-group:not(#vorige-publicaties-group)');
        if (remainingActiveGroups.length === 0) {
            console.log("Alle actieve groepen verwerkt.");
            // Trigger eventuele update op dashboard als die pagina open is? (Geavanceerd)
        } else {
             console.log(`${remainingActiveGroups.length} actieve groep(en) over.`);
        }
    }

    // Event listener voor klikken binnen de container (AANGEPAST)
    if (staatsbladContainer) {
        staatsbladContainer.addEventListener('click', function(event) {
            const saveButton = event.target.closest('.save-btn');
            const deleteButton = event.target.closest('.delete-btn');

            if (saveButton) {
                event.preventDefault();
                const item = saveButton.closest('.staatsblad-item');
                // Belangrijk: Zoek de groep waarin de knop ZIT (dit moet de actieve groep zijn)
                const group = saveButton.closest('.staatsblad-group.active-group');
                if (!item || !group || group.id === 'vorige-publicaties-group') {
                     console.warn("Save button geklikt buiten een valide actieve groep.");
                     return; // Voorkom opslaan in "Vorige" of buiten een groep
                }

                const statusIndicator = item.querySelector('.status-indicator');
                if (statusIndicator && !statusIndicator.classList.contains('status-gevalideerd')) {
                    statusIndicator.classList.remove('status-niet-gevalideerd');
                    statusIndicator.classList.add('status-gevalideerd');
                    statusIndicator.title = 'Gevalideerd';
                    console.log(`Status bijgewerkt voor item ${item.dataset.itemId || 'onbekend'} in groep ${group.dataset.groupId}`);

                    // Check of de HELE groep nu gevalideerd is
                    if (checkGroupValidation(group)) {
                        setTimeout(() => processValidatedGroup(group), 500);
                    }
                }
            } else if (deleteButton) {
                event.preventDefault();
                const item = deleteButton.closest('.staatsblad-item');
                 // Sta verwijderen alleen toe in actieve groepen
                const group = deleteButton.closest('.staatsblad-group.active-group');
                if (item && group && group.id !== 'vorige-publicaties-group' && confirm('Weet u zeker dat u dit item wilt verwijderen?')) {
                    const itemId = item.dataset.itemId || 'onbekend';
                    console.log(`Item ${itemId} verwijderen uit groep ${group.dataset.groupId}...`);
                    item.remove();
                    // Optioneel: Check of de groep nu leeg is en verwerkt moet worden?
                    if (checkGroupValidation(group)) {
                         console.log(`Groep ${group.dataset.groupId} is nu leeg na verwijderen, verwerken...`);
                         setTimeout(() => processValidatedGroup(group), 100); // Kortere delay
                    }
                    // fetch call...
                } else if (item && !group) {
                    console.warn("Delete button geklikt buiten een actieve groep.");
                } else if (item && group && group.id === 'vorige-publicaties-group') {
                     console.warn("Kan items niet verwijderen uit 'Vorige publicaties'.");
                }
            }
        });
    } else {
        console.error("Staatsblad container niet gevonden.");
    }

    // Functie om modal te openen
    function openPdfModal(pdfSrc) {
        if (!pdfModal || !pdfViewer) {
            console.error("Modal of PDF viewer element niet gevonden!");
            return;
        }
        pdfViewer.src = pdfSrc; // Stel de bron van de iframe in
        pdfModal.style.display = 'flex'; // Maak modal container zichtbaar (flex voor centreren)
        // Forceer reflow voor transitie
        void pdfModal.offsetWidth;
        pdfModal.classList.add('visible'); // Voeg class toe voor fade-in
        // Optioneel: voorkom scrollen van achtergrond
        document.body.style.overflow = 'hidden';
    }

    // Functie om modal te sluiten
    function closePdfModal() {
        if (!pdfModal || !pdfViewer) return;
        pdfModal.classList.remove('visible'); // Verwijder class voor fade-out
        // Wacht tot transitie klaar is voordat display none wordt gezet
        setTimeout(() => {
            pdfModal.style.display = 'none';
            pdfViewer.src = ''; // Leeg de src om laden te stoppen
             // Sta scrollen weer toe
            document.body.style.overflow = '';
        }, 300); // Moet overeenkomen met CSS transitie duur
    }

    // Event listeners voor open knoppen
    openModalButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            // Voorkom standaard actie als het een link is
            // event.preventDefault();
            const pdfSrc = this.dataset.pdfSrc;
            if (pdfSrc) {
                openPdfModal(pdfSrc);
            } else {
                console.error("Geen data-pdf-src attribuut gevonden op de knop.");
            }
        });
    });

    // Event listener voor sluit knop
    if (closeModalButton) {
        closeModalButton.addEventListener('click', closePdfModal);
    }

    // Event listener om te sluiten bij klikken op de achtergrond (overlay)
    if (pdfModal) {
        pdfModal.addEventListener('click', function(event) {
            // Sluit alleen als direct op de modal achtergrond is geklikt
            if (event.target === pdfModal) {
                closePdfModal();
            }
        });
    }

    // Optioneel: Sluiten met Escape toets
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && pdfModal && pdfModal.classList.contains('visible')) {
            closePdfModal();
        }
    });

}); 