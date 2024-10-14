        // Erstelle die Karte und setze die Ansicht
        // Erstelle die Karte und setze die Ansicht
        var map = L.map('map').setView([37.8, -96], 4);

        // Füge die Tile-Layer hinzu
        var tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        // Funktion, um die Farbe basierend auf der Dichte zu bestimmen
        function getColor(d) {
            return d > 1000 ? '#800026' :
                   d > 500  ? '#BD0026' :
                   d > 200  ? '#E31A1C' :
                   d > 100  ? '#FC4E2A' :
                   d > 50   ? '#FD8D3C' :
                   d > 20   ? '#FEB24C' :
                   d > 10   ? '#FED976' :
                              '#FFEDA0';
        }

        // Funktion, um den Stil für die GeoJSON-Features zu definieren
        function style(feature) {
            return {
                fillColor: getColor(feature.properties.density),
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            };
        }

        // Füge die GeoJSON-Daten hinzu und wende den Stil an
        L.geoJson(statesData, {style: style}).addTo(map);