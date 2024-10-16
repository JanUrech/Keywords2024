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
function getColor(c) {
    return c > 15 ? '#800026' :
           c > 10  ? '#BD0026' :
           c > 5   ? '#E31A1C' :
           c > 2   ? '#FC4E2A' :
           c > 0   ? '#FD8D3C' :
                      '#FFEDA0';
}

// Funktion, um den Stil für die GeoJSON-Features zu definieren (basierend auf count und Swing State)
function style(feature) {
    const stateName = feature.properties.name;
    const isSwingState = swingStates.includes(stateName);

    return {
        fillColor: getColor(feature.properties.count),  // Nutze count für die Füllfarbe
        weight: isSwingState ? 4 : 2,                   // Dickere Grenzen für Swing States
        opacity: 1,
        color: isSwingState ? '#77B84D' : 'white',      // Blaue Grenze für Swing States, weiße Grenze für andere
        dashArray: '5',                                 // Gleiche Strichel-Linie für alle
        fillOpacity: 0.7
    };
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
    // Durchlaufe die GeoJSON-Daten (statesData)
    statesData.features.forEach(state => {
        // Finde das entsprechende Keyword im API-Datensatz
        const matchingState = apiData.find(entry => entry.keyword === state.properties.name);

        // Wenn ein passender Bundesstaat gefunden wurde, setze den Count als neues Attribut
        if (matchingState) {
            state.properties.count = matchingState.count;  // Speichere den count-Wert in den Eigenschaften des Staates
        } else {
            state.properties.count = 0; // Setze auf 0, wenn kein passender Bundesstaat im API-Datensatz gefunden wurde
        }
    });

    // Füge die aktualisierten GeoJSON-Daten der Karte hinzu
    L.geoJson(statesData, {
        style: style,               // Wende die style-Funktion an
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
