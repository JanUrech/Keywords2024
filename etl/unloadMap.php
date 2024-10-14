<?php

header('Content-Type: application/json');

// Fehlerausgaben aktivieren
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Datenbankverbindungsparameter
$host = 'mw2lgm.myd.infomaniak.com'; // Dein Datenbank-Host
$dbname = 'mw2lgm_electionkeys'; // Dein Datenbankname
$username = 'mw2lgm_nyt_api'; // Dein Datenbank-Benutzername
$password = 'm-4hSBfavI8'; // Dein Datenbank-Passwort

// Erstellen einer neuen PDO-Instanz
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // echo "Database connection successful\n"; // Debug-Ausgabe (entfernt)
} catch (PDOException $e) {
    die("Could not connect to the database: " . $e->getMessage());
}

// 'Geo'-Keywords mit ihren Zählern abrufen
$stmt = $pdo->prepare("SELECT keyword, COUNT(*) as count FROM keywords WHERE type = 'Geo' GROUP BY keyword HAVING count > 2 ORDER BY count DESC");
$stmt->execute();
$keywords = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Konvertiere die Keywords-Daten in ein JSON-Objekt, um sie in JavaScript zu verwenden
echo json_encode($keywords);
?>
