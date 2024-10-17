// Erstelle die Karte und setze die Ansicht auf die USA
var map = L.map('map', {
    scrollWheelZoom: true,   // Aktiviert Scroll-Zoom
    dragging: true,          // Aktiviert Dragging
    doubleClickZoom: false,   // Deaktiviert Doppelklick-Zoom
    zoomControl: false        // Entfernt die Zoom-Kontrollleiste
}).setView([37.8, -96], 4);  // Zentriert auf die USA

// Begrenze die Karte auf die USA (Bounding Box für die USA)
var bounds = [
    [24.396308, -125.0],  // Südwestliche Ecke der USA
    [49.384358, -66.93457] // Nordöstliche Ecke der USA
];
map.setMaxBounds(bounds);    // Begrenze die Karte auf die USA
map.fitBounds(bounds);       // Zoome, sodass die USA vollständig angezeigt werden
map.setMinZoom(2);           // Verhindert, dass weiter herausgezoomt wird

// Entferne den Tile-Layer komplett, keine Hintergrundkarte

// Liste der Swing States
const swingStates = ["Wisconsin", "Pennsylvania", "Arizona", "Nevada", "Georgia", "North Carolina", "Michigan"];

// Funktion, um die Farbe basierend auf den count-Werten zu bestimmen
function getColor(c, minCount, maxCount) {
    // Normalisiere den count-Wert auf einen Bereich von 0 bis 1
    const normalizedValue = (c - minCount) / (maxCount - minCount);
    
    // Setze die Farben basierend auf dem normalisierten Wert
    return normalizedValue > 0.8 ? '#741B8C' :  // Dunkles Lila
           normalizedValue > 0.6 ? '#B849D6' :  // Helles Lila
           normalizedValue > 0.4 ? '#BF69D6' :  // Mittel-Lila
           normalizedValue > 0.2 ? '#CF94E0' :  // Pastell-Lila
           normalizedValue > 0 ? '#D4ABE0' :     // Helle Pastellfarbe
                                '#EFE4F2';      // Fast Weiß
}

// Tooltip-Funktion, um den count-Wert anzuzeigen
function onEachFeature(feature, layer) {
    // Tooltip, der den Namen und den count des Bundesstaates zeigt
    if (feature.properties && feature.properties.name && feature.properties.count !== undefined) {
        layer.bindTooltip(
            `<strong>${feature.properties.name}</strong><br>Counts: ${feature.properties.count}`,
            {
                permanent: false,
                direction: 'auto',
                className: 'custom-tooltip'  // Füge eine benutzerdefinierte Klasse hinzu
            }
        );
    }
}

// Funktion, um die Karte mit den Daten zu aktualisieren
function updateMapWithData(apiData) {
    // Berechne den maximalen und minimalen Count
    let minCount = Infinity;
    let maxCount = -Infinity;

    // Durchlaufe die GeoJSON-Daten (statesData)
    statesData.features.forEach(state => {
        // Finde das entsprechende Keyword im API-Datensatz
        const matchingState = apiData.find(entry => entry.keyword === state.properties.name);
        const count = matchingState ? matchingState.count : 0;

        // Setze den count als neues Attribut
        state.properties.count = count;

        // Aktualisiere min und max Count
        if (count < minCount) {
            minCount = count;
        }
        if (count > maxCount) {
            maxCount = count;
        }
    });

    // Füge die aktualisierten GeoJSON-Daten der Karte hinzu
    L.geoJson(statesData, {
        style: function (feature) {
            return {
                fillColor: getColor(feature.properties.count, minCount, maxCount),  // Verwende min und max Count
                weight: swingStates.includes(feature.properties.name) ? 4 : 2,    // Dickere Grenzen für Swing States
                opacity: 1,
                color: swingStates.includes(feature.properties.name) ? '#FAE354' : '#363112', // Behalte die Grenzfarben
                dashArray: '5',                                 // Gleiche Strichel-Linie für alle
                fillOpacity: 0.7
            };
        },
        onEachFeature: onEachFeature // Tooltips hinzufügen
    }).addTo(map);
}

// Abrufen der Daten von der Subpage
fetch('https://im3.janicure.ch/etl/unloadMap')
    .then(response => response.json())
    .then(data => {
        // Verarbeite die Daten und aktualisiere die Karte
        updateMapWithData(data);
    })
    .catch(error => console.error('Error fetching map data:', error));
