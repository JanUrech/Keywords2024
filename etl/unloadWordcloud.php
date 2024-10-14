<?php

header('Content-Type: application/json');

// Database connection parameters
$host = 'mw2lgm.myd.infomaniak.com'; // Your database host
$dbname = 'mw2lgm_electionkeys'; // Your database name
$username = 'mw2lgm_nyt_api'; // Your database username
$password = 'm-4hSBfavI8'; // Your database password

// Create a new PDO instance
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Could not connect to the database: " . $e->getMessage());
}

// Fetch the keywords with their counts, but only if the count is greater than 2
$stmt = $pdo->prepare("SELECT keyword, COUNT(*) as count FROM keywords GROUP BY keyword HAVING count > 2 ORDER BY count DESC");
$stmt->execute();
$keywords = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Convert the keywords data to a JSON object to use it in JavaScript
echo json_encode($keywords);
?>
