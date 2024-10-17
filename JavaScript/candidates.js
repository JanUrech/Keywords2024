document.addEventListener("DOMContentLoaded", function() {
    const points = document.querySelectorAll(".point");
    const donaldImage = document.getElementById("donald");
    const kamalaImage = document.getElementById("kamala");

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
                    } else if (entry.keyword === "Kamala Harris") {
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

    // Füge jedem Punkt einen Click-Event-Listener hinzu
    points.forEach(point => {
        point.addEventListener("click", function() {
            const week = this.getAttribute("data-week");
            loadWeekData(week); // Lade die Daten für die ausgewählte Woche
        });
    });

    // Lade die Daten für die erste Woche beim Start (z.B. KW 42)
    loadWeekData(42);
});
