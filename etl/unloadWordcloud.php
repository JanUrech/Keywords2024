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

// Get week_number from the URL
$week_number = isset($_GET['week_number']) ? $_GET['week_number'] : null;

// Bereite die SQL-Abfrage vor, um alle Keywords nach Kalenderwoche und Jahr zu gruppieren
$stmt = $pdo->prepare("
    SELECT 
        week_number, 
        year, 
        keyword, 
        count 
    FROM (
        SELECT 
            WEEK(published_date, 1) AS week_number,  -- Berechnung der Kalenderwoche
            YEAR(published_date) AS year,  -- Berechnung des Jahres
            keyword, 
            COUNT(*) AS count  -- Zählen der Erwähnungen
        FROM 
            keywords 
        WHERE 
            WEEK(published_date, 1) = :week_number  -- Filter nach Kalenderwoche
            AND Type = 'Topic'  -- Nur Zeilen mit Type 'Topic'
        GROUP BY 
            week_number, year, keyword  -- Gruppieren nach Kalenderwoche, Jahr und Keyword
        HAVING 
            count > 2  -- Nur Keywords mit mehr als 2 Zählungen
        ORDER BY 
            count DESC  -- Sortieren nach der Häufigkeit der Keywords
        LIMIT 40  -- Begrenzung auf die Top 40 Keywords
    ) AS top_keywords
    ORDER BY count DESC;  -- Ergebnis nach Häufigkeit sortieren
");

// Bind the week_number parameter to the prepared statement
if ($week_number !== null) {
    $stmt->bindParam(':week_number', $week_number, PDO::PARAM_INT);
} else {
    // Handle the case where week_number is not provided
    echo json_encode(["error" => "week_number parameter is required"]);
    exit();
}

// Führe die Abfrage aus
$stmt->execute();
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Konvertiere die Ergebnisse in ein JSON-Objekt
echo json_encode($results);
?>
