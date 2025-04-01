// Funktion zur Übersetzung von Textknoten auf der Seite
async function translateTextNodes(targetLang = "de") {
    let elements = document.querySelectorAll("*"); // Alle Elemente holen

    for (let el of elements) {
        for (let node of el.childNodes) {
            if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== "") {
                let originalText = node.nodeValue;

                try {
                    let response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(originalText.trim())}`);
                    let data = await response.json();

                    if (data[0] && data[0][0] && data[0][0][0]) {
                        let translatedText = data[0][0][0];
                        translatedText = originalText.replace(originalText.trim(), translatedText);
                        node.nodeValue = translatedText;
                    }
                } catch (error) {
                    console.error("Übersetzungsfehler:", error);
                }
            }
        }
    }
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