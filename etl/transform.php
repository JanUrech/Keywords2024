<?php
// Mapping of state abbreviations to full state names
$stateAbbreviations = [
    'Ala' => 'Alabama',
    'Alaska' => 'Alaska',
    'Ariz' => 'Arizona',
    'Ark' => 'Arkansas',
    'Calif' => 'California',
    'Colo' => 'Colorado',
    'Conn' => 'Connecticut',
    'Del' => 'Delaware',
    'Fla' => 'Florida',
    'Ga' => 'Georgia',
    'Hawaii' => 'Hawaii',
    'Idaho' => 'Idaho',
    'Ill' => 'Illinois',
    'Ind' => 'Indiana',
    'Iowa' => 'Iowa',
    'Kan' => 'Kansas',
    'Ky' => 'Kentucky',
    'La' => 'Louisiana',
    'Maine' => 'Maine',
    'Md' => 'Maryland',
    'Mass' => 'Massachusetts',
    'Mich' => 'Michigan',
    'Minn' => 'Minnesota',
    'Miss' => 'Mississippi',
    'Mo' => 'Missouri',
    'Mont' => 'Montana',
    'Neb' => 'Nebraska',
    'Nev' => 'Nevada',
    'NH' => 'New Hampshire',
    'NJ' => 'New Jersey',
    'NM' => 'New Mexico',
    'NY' => 'New York',
    'NC' => 'North Carolina',
    'ND' => 'North Dakota',
    'Ohio' => 'Ohio',
    'Okla' => 'Oklahoma',
    'Ore' => 'Oregon',
    'Pa' => 'Pennsylvania',
    'RI' => 'Rhode Island',
    'SC' => 'South Carolina',
    'SD' => 'South Dakota',
    'Tenn' => 'Tennessee',
    'Tex' => 'Texas',
    'Utah' => 'Utah',
    'Vt' => 'Vermont',
    'Va' => 'Virginia',
    'Wash' => 'Washington',
    'WV' => 'West Virginia',
    'Wis' => 'Wisconsin',
    'Wyo' => 'Wyoming'
];

// Function to extract and replace cities with state names
function replaceCityWithState($geoData, $stateAbbreviations) {
    foreach ($stateAbbreviations as $abbr => $state) {
        if (strpos($geoData, "($abbr)") !== false) {
            return $state; // Return the state name if the abbreviation is found
        }
    }
    return $geoData; // Return the original geo data if no abbreviation is found
}

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

// Function to check if the keyword already exists for the same article URL
function keywordExists($keyword, $article_url, $pdo) {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM keywords WHERE keyword = :keyword AND article_url = :article_url");
    $stmt->execute([
        ':keyword' => $keyword,
        ':article_url' => $article_url
    ]);
    return $stmt->fetchColumn() > 0; // Returns true if a record exists, false otherwise
}

// Function to format "LastName, FirstName Initial" to "FirstName LastName Initial"
function formatName($name) {
    if (strpos($name, ',') !== false) {
        list($lastName, $firstName) = explode(',', $name);
        $lastName = trim($lastName);
        $firstName = trim($firstName);
        return $firstName . ' ' . $lastName;
    }
    return $name;
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
            // Check if the article contains "Presidential Election of 2024" in des_facet
            if (isset($article['des_facet']) && in_array('Presidential Election of 2024', $article['des_facet'])) {
                // Get the article URL and publication date
                $published_date = $article['published_date'];
                $article_url = $article['url'];

                // Collect tags from facets and insert into the database
                foreach (['des_facet' => 'Topic', 'org_facet' => 'Organization', 'per_facet' => 'Person', 'geo_facet' => 'Geo'] as $facet => $type) {
                    if (!empty($article[$facet])) {
                        foreach ($article[$facet] as $keyword) {
                            // Format the name if it's a person in 'per_facet'
                            if ($type === 'Person') {
                                $keyword = formatName($keyword); // Apply name formatting
                            }

                            // Replace city with state if it's a geographic facet
                            if ($type === 'Geo') {
                                $keyword = replaceCityWithState($keyword, $stateAbbreviations);
                            }

                            // Check if the keyword already exists for the given article URL
                            if (!keywordExists($keyword, $article_url, $pdo)) {
                                // If it doesn't exist, insert it
                                $stmt = $pdo->prepare("INSERT INTO keywords (keyword, type, published_date, article_url) 
                                                       VALUES (:keyword, :type, :published_date, :article_url)");
                                $stmt->execute([
                                    ':keyword' => $keyword,
                                    ':type' => $type,
                                    ':published_date' => $published_date,
                                    ':article_url' => $article_url
                                ]);
                            }
                        }
                    }
                }
            }
        }
        echo "Keywords have been inserted successfully.";
    } else {
        echo "No articles found.";
    }
} else {
    echo "Error retrieving data: " . json_last_error_msg();
}
?>
