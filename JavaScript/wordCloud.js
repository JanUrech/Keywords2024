document.addEventListener("DOMContentLoaded", async function () {
    const wordCloudElement = document.getElementById("wordCloud");
    const pointsContainer = document.getElementById("menuCtWordcloud");
    let allData = [];
    const totalWeeks = 10;

    // Zeige initial die Nachricht "Please select week"
    wordCloudElement.innerHTML = "<p>Please select a week below</p>";

    // Dynamisch die Punkte und Labels für Kalenderwochen erstellen
    for (let i = 0; i < totalWeeks; i++) {
        const weekNumber = 41 + i;

        const point = document.createElement("div");
        point.classList.add("point");

        const label = document.createElement("span");
        label.classList.add("label");
        label.textContent = `KW ${weekNumber}`;

        point.appendChild(label);

        point.addEventListener("click", async function () {
            await loadWeekData(weekNumber);
        });

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

    // Funktion zum Erstellen der WordCloud
    async function loadWeekData(week) {
        console.log(`Lade Daten für Woche: ${week}`);
        const weekData = await fetchData(week);

        // Wenn keine Daten vorhanden sind, zeige "No Data"
        if (weekData.length === 0) {
            wordCloudElement.innerHTML = "<p>No data yet.</p>";
            console.warn(`Keine Daten für Woche ${week} gefunden.`);
            return;
        }

        // Daten sortieren, um die populärsten Wörter auszuwählen
        const sortedData = weekData.sort((a, b) => b.count - a.count);

        // Auf mobilen Geräten nur die Top 20 Wörter anzeigen
        const isMobile = window.innerWidth <= 768;
        const wordCloudData = sortedData.slice(0, isMobile ? 20 : sortedData.length).map(entry => ({
            text: entry.keyword.replace(/\"/g, ''),
            size: entry.count * 15,
            count: entry.count
        }));

        // Unterschiedliche Einstellungen für Mobile und Desktop
        const wordCloudOptions = {
            list: wordCloudData.map(item => [item.text, item.size]),
            gridSize: Math.round(16 * window.innerWidth / 1024), // Grid-Größe an die Bildschirmgröße anpassen
            weightFactor: function (size) { return size / (isMobile ? 10 : 6); }, // Kleinere Wörter auf Mobilgeräten
            fontFamily: 'brando, serif',
            color: function (word, weight) {
                const hue = 285;
                const saturation = Math.min(30, 0 + weight / 2);
                const lightness = Math.min(85, 65 + weight / 2);
                return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            },
            backgroundColor: '#44354C',
            rotateRatio: 0, // Rotation deaktivieren
            minRotation: 0, // Keine Rotation auf mobilen Geräten
            maxRotation: 0, // Keine Rotation auf mobilen Geräten
            shape: isMobile ? function (x, y) { return y > 0.5 ? 1 : -1; } : 'circle', // Rechteckige Form für Mobilgeräte, Kreisform für Desktop
            drawOutOfBound: false,
            shuffle: true,
            click: function(item) {
                console.log(`Clicked on word: ${item[0]}`);
            }
        };

        // Lösche die vorherigen Inhalte der WordCloud (falls vorhanden)
        wordCloudElement.innerHTML = "";

        // Erstellen der WordCloud mit den gewählten Optionen
        WordCloud(wordCloudElement, wordCloudOptions);
    }

    // Lade Daten für KW 42 beim Start
    //wordCloudElement.innerHTML = "<p>Please select week</p>"; // Nur eine Nachricht, keine Daten initial laden

    // Passe die WordCloud bei einer Größenänderung des Bildschirms an
    window.addEventListener('resize', async function () {
        const activeWeek = 42; // Hier könntest du die aktuell ausgewählte Woche dynamisch speichern
        await loadWeekData(activeWeek);
    });
});
