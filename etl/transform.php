<?php
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

// Function to get or insert tags and return their IDs
function getOrInsertTag($tag, $pdo) {
    $stmt = $pdo->prepare("SELECT id FROM tags WHERE tag_name = :tag");
    $stmt->execute(['tag' => $tag]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    // If tag exists, return its ID
    if ($result) {
        return $result['id'];
    }

    // If not, insert it and return the new ID
    $stmt = $pdo->prepare("INSERT INTO tags (tag_name) VALUES (:tag)");
    $stmt->execute(['tag' => $tag]);
    return $pdo->lastInsertId();
}

// API URL for the New York Times articles
$url = "https://api.nytimes.com/svc/news/v3/content/all/all.json?api-key=F3hbvwk1R3qKIAi0fI7bbVpFIUz540Gm";

// Initialize a cURL session
$ch = curl_init($url);

// Set options for the cURL session
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// Execute the cURL session and get the content
$response = curl_exec($ch);

// Close the cURL session
curl_close($ch);

// Decode the JSON response into a PHP array
$data = json_decode($response, true);

// Check if the decoding was successful
if (json_last_error() === JSON_ERROR_NONE) {
    if (isset($data['results'])) {
        foreach ($data['results'] as $article) {
            // Prepare article data
            $title = $article['title'];
            $slug_name = $article['slug_name'];
            $byline = $article['byline'];
            $section = $article['section'];
            $subsection = $article['subsection'];
            $created_date = $article['created_date'];
            $first_published_date = $article['first_published_date'];
            $published_date = $article['published_date'];
            $updated_date = $article['updated_date'];
            $source = $article['source'];
            $url = $article['url'];

            // Prepare tags
            $tag_ids = [];

            // Collect tags from facets
            foreach (['des_facet', 'org_facet', 'per_facet', 'geo_facet'] as $facet) {
                if (!empty($article[$facet])) {
                    foreach ($article[$facet] as $tag) {
                        $tag_id = getOrInsertTag($tag, $pdo);
                        $tag_ids[] = $tag_id; // Store the tag ID
                    }
                }
            }

            // Convert tag IDs to a comma-separated string
            $tag_ids_string = implode(',', $tag_ids);

            // Insert article into the database
            $stmt = $pdo->prepare("INSERT INTO articles (title, slug_name, byline, section, subsection, created_date, first_published_date, published_date, updated_date, source, url, tag_ids) 
                                    VALUES (:title, :slug_name, :byline, :section, :subsection, :created_date, :first_published_date, :published_date, :updated_date, :source, :url, :tag_ids)");
            $stmt->execute([
                ':title' => $title,
                ':slug_name' => $slug_name,
                ':byline' => $byline,
                ':section' => $section,
                ':subsection' => $subsection,
                ':created_date' => $created_date,
                ':first_published_date' => $first_published_date,
                ':published_date' => $published_date,
                ':updated_date' => $updated_date,
                ':source' => $source,
                ':url' => $url,
                ':tag_ids' => $tag_ids_string
            ]);
        }
        echo "Articles have been inserted successfully.";
    } else {
        echo "No articles found.";
    }
} else {
    echo "Error retrieving data: " . json_last_error_msg();
}
?>


