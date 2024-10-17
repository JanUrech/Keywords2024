document.addEventListener("DOMContentLoaded", function() {
    const pointsContainer = document.getElementById("menuCtCandidates"); // Der Container, in den wir die Punkte einfügen
    const donaldImage = document.getElementById("donald");
    const kamalaImage = document.getElementById("kamala");

    // Anzahl der Punkte (Kalenderwochen)
    const totalWeeks = 10;

    // Dynamisch die Punkte und Labels erstellen
    for (let i = 0; i < totalWeeks; i++) {
        const weekNumber = 42 + i; // KW 42 bis KW 51

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
        point.addEventListener("click", function() {
            loadWeekData(weekNumber); // Lade die Daten für die ausgewählte Woche
        });

        // Füge den Punkt zum Container hinzu
        pointsContainer.appendChild(point);
    }

    // Funktion, um Daten basierend auf der Woche zu laden
    function loadWeekData(week) {
        console.log(`Lade Daten für Woche: ${week}`); // Debugging
        fetch('../etl/unloadCandidates.php')
            .then(response => response.json())
            .then(data => {
                console.log('Erhaltene Daten:', data); // Debugging

                // Filter die Daten für die ausgewählte Woche
                const weekData = data.filter(entry => entry.week_number == week);
                console.log('Gefilterte Daten für die Woche:', weekData); // Debugging

                let donaldCount = 0;
                let kamalaCount = 0;

                // Daten durchgehen und Zähler festlegen
                weekData.forEach(entry => {
                    if (entry.keyword === "Donald J Trump") {
                        donaldCount = entry.count;
                    } else if (entry.keyword === "Kamala D Harris") {
                        kamalaCount = entry.count;
                    }
                });

                console.log(`Donald Count: ${donaldCount}, Kamala Count: ${kamalaCount}`); // Debugging

                // Dynamische Anpassung der Höhe der Bilder basierend auf den counts
                donaldImage.style.height = `${50 + donaldCount * 10}px`; // Zum Beispiel: 10px pro Erwähnung
                kamalaImage.style.height = `${50 + kamalaCount * 10}px`;
            })
            .catch(error => console.error('Fehler beim Laden der Daten:', error));
    }

    // Lade die Daten für die erste Woche beim Start (z.B. KW 42)
    loadWeekData(42);
});
