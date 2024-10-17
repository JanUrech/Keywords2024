document.addEventListener("DOMContentLoaded", function () {
    const menuContainer = document.getElementById("menuCtCandidates");
    const donaldImage = document.getElementById("donald");
    const kamalaImage = document.getElementById("kamala");
    const countDonaldElement = document.getElementById("countDonald");  // Element für Donalds Count
    const countKamalaElement = document.getElementById("countKamala");  // Element für Kamalas Count

    // Die Kalenderwochen, die du anzeigen möchtest
    const weeks = [41, 42, 43, 44, 45, 46, 47, 48, 49, 50];

    // Dynamisch das Menü erstellen
    weeks.forEach(week => {
        const point = document.createElement("div");
        point.classList.add("point");
        point.setAttribute("data-week", week);
        point.innerHTML = `<span class="label">KW ${week}</span>`;

        // Event-Listener für den Click-Event hinzufügen
        point.addEventListener("click", function () {
            loadWeekData(week); // Lade die Daten für die ausgewählte Woche
        });

        // Das Menü in den Container einfügen
        menuContainer.appendChild(point);
    });

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

                // Dynamische Anpassung der Höhe und Breite der Bilder basierend auf den counts
                const aspectRatio = 4 / 10;  // Original Aspect Ratio (Breite/Höhe-Verhältnis)
                const maxPercentage = 100;  // Maximale Höhe in Prozent (bei 150 Counts 100%)

                // Funktion zur Berechnung der Höhe basierend auf dem Count in Prozent
                function calculateHeightPercentage(count) {
                    const maxCount = 150; // Maximale Erwähnungen, die 100% entsprechen
                    return (count / maxCount) * maxPercentage;  // Höhe im Verhältnis zur maximalen Anzahl in Prozent
                }

                // Donald
                const donaldHeightPercentage = calculateHeightPercentage(donaldCount);
                donaldImage.style.height = `${donaldHeightPercentage}%`;
                donaldImage.style.width = `${donaldHeightPercentage * aspectRatio}%`;  // Breite basierend auf der Aspect Ratio

                // Kamala
                const kamalaHeightPercentage = calculateHeightPercentage(kamalaCount);
                kamalaImage.style.height = `${kamalaHeightPercentage}%`;
                kamalaImage.style.width = `${kamalaHeightPercentage * aspectRatio}%`;  // Breite basierend auf der Aspect Ratio

                // Counts in den entsprechenden HTML-Elementen anzeigen
                countDonaldElement.textContent = donaldCount;  // Zähler für Donald anzeigen
                countKamalaElement.textContent = kamalaCount;  // Zähler für Kamala anzeigen
            })
            .catch(error => console.error('Fehler beim Laden der Daten:', error));
    }

    // Lade die Daten für die erste Woche beim Start (z.B. KW 42)
    loadWeekData(42);
});
