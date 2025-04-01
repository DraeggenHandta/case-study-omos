// Funktion zur Übersetzung von Textknoten auf der Seite
async function translateTextNodes(targetLang = "de") {
    let elements = document.body.querySelectorAll("*"); // Alle Elemente holen
    let textsToTranslate = [];
    let nodesToUpdate = [];

    // Schritt 1: Alle zu übersetzenden Texte sammeln
    for (let el of elements) {
        for (let node of el.childNodes) {
            if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== "") {
                let originalText = node.nodeValue.trim();
                textsToTranslate.push(originalText);
                nodesToUpdate.push(node);
            }
        }
    }

    // Schritt 2: Übersetzungen parallel anfordern
    let translations = await Promise.all(
        textsToTranslate.map(text => 
            fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`)
                .then(response => response.json())
                .then(data => data[0][0][0])
                .catch(error => {
                    console.error("Übersetzungsfehler:", error);
                    return text; // Im Fehlerfall Originaltext verwenden
                })
        )
    );

    // Schritt 3: Übersetzungen auf der Seite anwenden
    nodesToUpdate.forEach((node, index) => {
        let translatedText = translations[index];
        node.nodeValue = translatedText;
    });
}

// MutationObserver für dynamische Änderungen im DOM
const observer = new MutationObserver((mutationsList) => {
    mutationsList.forEach(async (mutation) => {
        mutation.addedNodes.forEach(async (node) => {
            if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== "") {
                // Übersetzen, wenn Textknoten hinzugefügt wird
                await translateTextNodes("de");
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                // Wenn ein Element hinzugefügt wird, übersetze dessen Inhalt
                await translateTextNodes("de");
            }
        });
    });
});

// Beobachte Änderungen im gesamten Body-Tag
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Initiale Übersetzung durchführen, wenn die Seite bereits geladen ist
translateTextNodes("de");
