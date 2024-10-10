<?php

// API-URL for the New York Times articles
$url = "https://api.nytimes.com/svc/news/v3/content/all/all.json?api-key=F3hbvwk1R3qKIAi0fI7bbVpFIUz540Gm";

// Initialize a cURL session
$ch = curl_init($url);

// Set options for the cURL session
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// Execute the cURL session and get the content
$response = curl_exec($ch);
$http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);

// Check for cURL errors or HTTP status codes other than 200
if ($response === false || $http_status !== 200) {
    echo "Error fetching data: " . curl_error($ch) . " (HTTP Status: $http_status)";
} else {
    // Decode the JSON response into a PHP array
    $data = json_decode($response, true);

    // Check if the decoding was successful
    if (json_last_error() === JSON_ERROR_NONE) {
        // Check if articles are present
        if (isset($data['results'])) {
            foreach ($data['results'] as $article) {
                // Filter articles that mention "Presidential Election of 2024" in des_facet
                if (isset($article['des_facet']) && in_array("Presidential Election of 2024", $article['des_facet'])) {
                    // Display only the required information
                    echo "<strong>Published Date:</strong> " . htmlspecialchars($article['published_date']) . "<br>";

                    // Display des_facet (Tags) if available
                    if (!empty($article['des_facet'])) {
                        echo "<strong>Topics:</strong> " . implode(", ", array_map('htmlspecialchars', $article['des_facet'])) . "<br>";
                    }

                    // Display org_facet if available
                    if (!empty($article['org_facet'])) {
                        echo "<strong>Organizations:</strong> " . implode(", ", array_map('htmlspecialchars', $article['org_facet'])) . "<br>";
                    }

                    // Display per_facet if available
                    if (!empty($article['per_facet'])) {
                        echo "<strong>Persons:</strong> " . implode(", ", array_map('htmlspecialchars', $article['per_facet'])) . "<br>";
                    }

                    // Display geo_facet if available
                    if (!empty($article['geo_facet'])) {
                        echo "<strong>Geographical Locations:</strong> " . implode(", ", array_map('htmlspecialchars', $article['geo_facet'])) . "<br>";
                    }

                    // Display the article URL
                    echo "<strong>Article URL:</strong> <a href='" . htmlspecialchars($article['url']) . "'>" . htmlspecialchars($article['url']) . "</a><br>";

                    // Add a horizontal line between articles
                    echo "<hr>";
                }
            }
        } else {
            echo "No articles found.";
        }
    } else {
        echo "Error retrieving data: " . json_last_error_msg();
    }
}

// Close the cURL session
curl_close($ch);

?>
