<?php

function fetchWeatherData() {
    $url = "https://api.nytimes.com/svc/news/v3/content/all/all.json?api-key=F3hbvwk1R3qKIAi0fI7bbVpFIUz540Gm";

    // Initialisiert eine cURL-Sitzung
    $ch = curl_init($url);

    // Setzt Optionen
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    // Führt die cURL-Sitzung aus und erhält den Inhalt
    $response = curl_exec($ch);

    // Schließt die cURL-Sitzung
    curl_close($ch);

    // Dekodiert die JSON-Antwort und gibt Daten zurück
    return json_decode($response, true);
}


// Gibt die Daten zurück, wenn dieses Skript eingebunden ist
return fetchWeatherData();
?>