document.addEventListener('DOMContentLoaded', function () {
    // Fetch the keywords data from your PHP API
    fetch('etl/unloadWordcloud.php')
        .then(response => {
            // Check if the response is ok (status 200)
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json(); // Parse the JSON from the response
        })
        .then(data => {
            console.log(data); // Überprüfe die API-Antwort
            // Prepare the word list for wordcloud2.js
            const wordArray = data.map(item => [item.keyword, item.count]);

            // Create the wordcloud using wordcloud2.js
            WordCloud(document.getElementById('wordcloud'), {
                list: wordArray, // Pass the prepared word array
                gridSize: Math.round(16 * window.innerWidth / 1024), // Responsive grid size
                weightFactor: function (size) {
                    return Math.log(size + 1) * 20; // Scale word size by count
                },
                fontFamily: 'Times, serif', // Font family
                color: 'random-dark', // Random dark colors
                backgroundColor: '#f0f0f0', // Background color for the wordcloud
                rotateRatio: 0.5, // Rotate some words
                shape: 'circle', // Shape of the wordcloud (circle, cardioid, diamond, etc.)
                drawOutOfBound: false, // Avoid drawing outside of bounds
                shuffle: true, // Shuffle words to prevent patterns
                click: function (item) { // Add a click event to each word
                    alert(item[0] + ': ' + item[1] + ' mentions'); // Display keyword and count on click
                }
            });
        })
        .catch(error => console.error('Error fetching keywords:', error)); // Handle errors
});