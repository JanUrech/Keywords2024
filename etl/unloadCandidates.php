<?php

header('Content-Type: application/json');

// Datenbankverbindungsparameter
$host = 'mw2lgm.myd.infomaniak.com'; // Dein Datenbank-Host
$dbname = 'mw2lgm_electionkeys'; // Dein Datenbankname
$username = 'mw2lgm_nyt_api'; // Dein Datenbank-Benutzername
$password = 'm-4hSBfavI8'; // Dein Datenbank-Passwort

// Erstellen einer neuen PDO-Instanz
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Could not connect to the database: " . $e->getMessage());
}

// Kandidaten festlegen (Keywords)
$candidates = ['Donald J Trump', 'Kamala D Harris'];

// Bereite die SQL-Abfrage vor, um die Daten nach Kalenderwoche und Jahr zu gruppieren
$stmt = $pdo->prepare("
    SELECT 
        WEEK(published_date, 1) AS week_number,  -- Berechnung der Kalenderwoche
        YEAR(published_date) AS year,  -- Berechnung des Jahres
        keyword, 
        COUNT(*) AS count  -- Zählen der Erwähnungen
    FROM 
        keywords 
    WHERE 
        keyword IN (:candidate1, :candidate2)  -- Filter für die beiden Kandidaten
    GROUP BY 
        week_number, year, keyword  -- Gruppieren nach Kalenderwoche, Jahr und Keyword
    ORDER BY 
        year DESC, week_number DESC  -- Ergebnisse sortieren
");

// Binde die Kandidatennamen an die Platzhalter
$stmt->bindParam(':candidate1', $candidates[0]);
$stmt->bindParam(':candidate2', $candidates[1]);

// Führe die Abfrage aus
$stmt->execute();
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Konvertiere die Ergebnisse in ein JSON-Objekt
echo json_encode($results);
?>
