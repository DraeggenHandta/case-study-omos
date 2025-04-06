
 // Wörterbuch mit Übersetzungen
 const translations = {
    "MetaFlow": "MetaFlow",
    "Subscription Manager": "Abo-Verwaltung",
    "Navigation": "Navigation",
    "Dashboard": "Übersicht",
    "Subscriptions": "Abonnements",
    "New Subscription": "Neues Abonnement",
    "Active Subscriptions": "Aktive Abonnements",
    "Paused Subscriptions": "Pausierte Abonnements",
    "Pause Subscription":"Pausiere Abonnement",
    "Pause subscription":"Pausiere Abonnement",
    "Canceled Subscriptions": "Stornierte Abonnements",
    "Profile": "Profil",
    "Settings": "Einstellungen",
    "MetaFlow Subscription v1.0.0": "MetaFlow Abonnement v1.0.0",
    "Welcome back,": "Willkommen zurück,",
    "Manage your MetaFlow Protein-Shake Subscriptions": "Verwalte deine MetaFlow Protein-Shake Abonnements",
    "Next delivery": "Nächste Lieferung",
    "Tuesday": "Dienstag",
    "Subscription": "Abonnement",
    "subscription": "Abonnement",
    "Active": "Aktiv",
    "Paused": "Pausiert",
    "Canceled": "Storniert",
    "Started on": "Gestartet am",
    "Selected flavors": "Ausgewählte Sorten",
    "flavors for 4 weeks": "Sorten für 4 Wochen",
    "flavors": "Sorten",
    " of ":" von ",
    "You have selected":"Deine Auswahl beinhaltet",
    "Next delivery:": "Nächste Lieferung:",
    "Paused until": "Pausiert bis",
    "Edit Flavors": "Geschmacksrichtungen bearbeiten",
    "Skipped":"Übersprungen",
    "Skip": "Überspringen",
    "Pause": "Pausieren",
    "Resume": "Fortsetzen",
    "Cancel": "Stornieren",
    "Quantity": "Menge",
    "weeks": "Wochen",
    "Billed every":"Abrechnung alle",
    "Peanut": "Erdnuss",
    "Delivery Address": "Lieferadresse",
    "Update your delivery address for subscriptions": "Aktualisiere deine Lieferadresse für Abonnements",
    "Street Address": "Straße und Hausnummer",
    "City": "Stadt",
    "Postal Code": "Postleitzahl",
    "Country": "Land",
    "Select a date until when you want to pause your subscription.":"Wähle ein Datum bis zu dem du dein Abonnement pausieren möchtest",
    "until":"bis",

    // Geschmacksrichtungen
    "Chocolate": "Schokolade",
    "Vanilla": "Vanille",
    "Strawberry": "Erdbeere",
    "Banana Milk": "Bananenmilch",
    "Iced Coffee (contains caffeine)": "Eiskaffee (enthält Koffein)",
    "Cherry": "Kirsche",
    "Peanut Chocolate": "Erdnuss-Schokolade",
    "Salted Caramel": "Salz-Karamell",
    "Butter Cookie": "Butterkeks",
    "Peach Passion Fruit": "Pfirsich-Maracuja",
    "Wild Berry": "Waldbeere",
    "Coconut": "Kokosnuss"
  };
// Debounce-Funktion, um schnelle Änderungen zu gruppieren und nur einmal auszuführen
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Funktion, die durch alle Child-Nodes geht und nur Text ersetzt
function translateTextNodes(element) {
    element.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            let originalText = node.nodeValue;

            // 1. Datumsformat prüfen und ggf. umwandeln
            let translatedText = convertUSToGermanDate(originalText);
        
            // 2. Text übersetzen
            Object.keys(translations).sort((a, b) => b.length - a.length).forEach(englishText => {
                if (translatedText.includes(englishText)) {
                    translatedText = translatedText.replaceAll(englishText, translations[englishText]);
                }
            });

            // Nur ändern, wenn sich was geändert hat
            if (translatedText !== originalText) {
                node.nodeValue = translatedText;
            }
        }
    });
    mergeAndFormatPriceNodes(element)
}

function mergeAndFormatPriceNodes(element) {
    const nodes = Array.from(element.childNodes);

    for (let i = 0; i < nodes.length - 1; i++) {
        const first = nodes[i];
        const second = nodes[i + 1];

        if (
            first.nodeType === Node.TEXT_NODE &&
            second.nodeType === Node.TEXT_NODE &&
            first.nodeValue.trim() === "€" &&
            /^\d+\.\d{2}$/.test(second.nodeValue.trim())
        ) {
            const [euros, cents] = second.nodeValue.trim().split(".");
            const newText = `${euros},${cents} €`;

            // Neuen Textknoten erstellen und ersetzen
            const newNode = document.createTextNode(newText);
            element.replaceChild(newNode, second);
            element.removeChild(first); // altes "€" löschen

            // Nur ein Ersetzung pro Element nötig
            break;
        }
    }
}

function convertUSToGermanDate(text) {
    // Regex erkennt Datumsformate wie: Apr 15, 2025 oder May 6th, 2025
    const dateRegex = /\b([a-zA-Z]{3,}) (\d{1,2})(st|nd|rd|th)?, (\d{4})\b/g;

    return text.replace(dateRegex, (match, month, day, _suffix, year) => {
        // Beispiel: "May", "6", "th", "2025"
        const cleanDateStr = `${month} ${day}, ${year}`;
        const parsedDate = new Date(cleanDateStr);

        // Wenn ungültig, Original zurückgeben
        if (isNaN(parsedDate)) return match;

        const germanDay = parsedDate.getDate();
        const germanMonth = parsedDate.toLocaleString('de-DE', { month: 'long' });
        const germanYear = parsedDate.getFullYear();

        return `${germanDay}. ${germanMonth} ${germanYear}`;
    });
}

// Funktion, um einen MutationObserver zu starten, der Änderungen überwacht
function startMutationObserver() {
    const observer = new MutationObserver(debounce(() => {
        // Alle relevanten Elemente durchsuchen und übersetzen
        document.querySelectorAll("body *").forEach(el => {
            translateTextNodes(el);
        });
    }, 20)); 

    // Beobachtungsoptionen: Beobachtungen im DOM
    observer.observe(document.body, {
        childList: true,     // Beobachtet das Hinzufügen/Entfernen von Kindern
        subtree: true,       // Beobachtet auch alle Unterelemente
        characterData: true, // Beobachtet Textänderungen in Textknoten
    });

    console.log("✅ MutationObserver läuft und überwacht Änderungen im DOM.");
}

// Initiale Übersetzungen durchführen
document.querySelectorAll("body *").forEach(el => {
    translateTextNodes(el);
});

// MutationObserver starten
startMutationObserver();



