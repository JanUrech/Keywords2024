document.addEventListener("DOMContentLoaded", async function () {
    const wordCloudElement = document.getElementById("wordCloud");
    const pointsContainer = document.getElementById("menuCtWordcloud"); // Container für das Menü (WordCloud)
    let allData = []; // Zum Speichern aller Daten
    const totalWeeks = 10; // Anzahl der Wochen (KW 42 bis KW 51)

    // Dynamisch die Punkte und Labels für Kalenderwochen erstellen
    for (let i = 0; i < totalWeeks; i++) {
        const weekNumber = 41 + i; // KW 41 bis KW 51

        // Erstelle ein neues Punkt-Element
        const point = document.createElement("div");
        point.classList.add("point");

        // Erstelle ein neues Label-Element
        const label = document.createElement("span");
        label.classList.add("label");
        label.textContent = `KW ${weekNumber}`;

        // Füge das Label zum Punkt hinzu
        point.appendChild(label);

        // Füge Click-Event-Listener hinzu
        point.addEventListener("click", async function () {
            await loadWeekData(weekNumber); // Lade die Daten für die ausgewählte Woche
        });

        // Füge den Punkt zum Container hinzu
        pointsContainer.appendChild(point);
    }

    // Funktion zum Abrufen der Daten für die ausgewählte Woche
    async function fetchData(week) {
        try {
            const response = await fetch(`https://im3.janicure.ch/etl/unloadWordcloud.php?week_number=${week}`);
            if (!response.ok) {
                throw new Error(`Fehler beim Laden der Daten für Woche ${week}: ${response.statusText}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error: ${error.message}`);
            return [];
        }
    }

    // Funktion zum Laden und Darstellen der WordCloud für die ausgewählte Woche
    async function loadWeekData(week) {
        console.log(`Lade Daten für Woche: ${week}`);
        const weekData = await fetchData(week); // Daten für die ausgewählte Woche abrufen

        if (weekData.length === 0) {
            console.warn(`Keine Daten für Woche ${week} gefunden.`);
            return;
        }

        // Array für die WordCloud erstellen
        const wordCloudData = weekData.map(entry => ({
            text: entry.keyword.replace(/\"/g, ''), // Entfernen von Anführungszeichen
            size: entry.count * 10, // Größe basierend auf der Anzahl (z.B. 10px pro Erwähnung)
            count: entry.count // Speichern der Anzahl für den Tooltip
        }));

        // Erstellen der WordCloud mit WordCloud2.js
        WordCloud(wordCloudElement, {
            list: wordCloudData.map(item => [item.text, item.size]), // Liste als [text, size]-Paare vorbereiten
            gridSize: Math.round(16 * window.innerWidth / 1024), // Grid-Größe basierend auf Bildschirmbreite anpassen
            weightFactor: function (size) { return size / 2; }, // Größenfaktor für die Skalierung
            fontFamily: 'brando, serif', // Schriftart für die Wörter
            color: function (word, weight) {
                const hue = 285; // Fixierter Farbton für Lila
                const saturation = Math.min(30, 0 + weight / 2); // Weniger gesättigt (max. 30%)
                const lightness = Math.min(85, 65 + weight / 2);  // Heller (65% bis 85%)
                return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            },
            backgroundColor: '#44354C',  // Hintergrundfarbe
            rotateRatio: 0.5, // Rotationsverhältnis für einige Wörter
            shuffle: true, // Wörter mischen
            shape: 'circle', // Kreisform für die WordCloud
            drawOutOfBound: false, // Nicht außerhalb der Canvas-Grenzen zeichnen
            click: function(item) { // Click-Event für Wörter
                console.log(`Clicked on word: ${item[0]}`);
            }
        });

         
        
        // Tooltip-Logik hinzufügen
        addHoverTooltips(wordCloudData);
    }

    // Funktion zum Hinzufügen von Hover-Tooltips
    function addHoverTooltips(wordCloudData) {
        const tooltip = document.createElement("div");
        tooltip.className = "tooltip"; // Klasse für das Tooltip
        document.body.appendChild(tooltip); // Tooltip zum Body hinzufügen
        tooltip.style.display = "none"; // Standardmäßig nicht angezeigt

        wordCloudElement.addEventListener('mousemove', function(event) {
            const wordElement = event.target; // Das aktuelle Wort-Element
            if (wordElement.classList.contains('word')) { // Überprüfen, ob es ein Wort ist
                const word = wordElement.innerText; // Das Wort
                const dataEntry = wordCloudData.find(entry => entry.text === word); // Daten zu diesem Wort finden
                if (dataEntry) {
                    tooltip.innerHTML = `<strong>${word}</strong><br>Mentions: ${dataEntry.count}`; // Tooltip-Inhalt
                    tooltip.style.left = `${event.pageX + 10}px`; // Tooltip positionieren
                    tooltip.style.top = `${event.pageY + 10}px`;
                    tooltip.style.display = "block"; // Tooltip anzeigen
                }
            }
        });

        wordCloudElement.addEventListener('mouseout', function(event) {
            const wordElement = event.target; // Das aktuelle Wort-Element
            if (wordElement.classList.contains('word')) { // Überprüfen, ob es ein Wort ist
                tooltip.style.display = "none"; // Tooltip verbergen
            }
        });
    }

    // Lade Daten für KW 42 beim Start
    await loadWeekData(42);
});
