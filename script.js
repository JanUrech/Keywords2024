// URL of the API you want to fetch data from
const url = 'https://api.nytimes.com/svc/news/v3/content/all/all.json?api-key=F3hbvwk1R3qKIAi0fI7bbVpFIUz540Gm';

// Function to fetch data and log it to the console
async function fetchDepartures() {
  try {
    const response = await fetch(url); // Fetch data from the API
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`); // Handle non-2xx responses
    }
    const data = await response.json(); // Parse the JSON from the response
    console.log(data); // Log the fetched data to the console
  } catch (error) {
    console.error('Error fetching data:', error); // Log errors to the console
  }
}

// Call the function to fetch data
fetchDepartures();

// Replace with your actual API key
const apiKey = 'F3hbvwk1R3qKIAi0fI7bbVpFIUz540Gm';

// Function to fetch articles for a given year and month
async function fetchNYTArchive(year, month) {
    const url = `https://api.nytimes.com/svc/archive/v1/${year}/${month}.json?api-key=${apiKey}`;

    try {
        // Fetch the data from the API
        const response = await fetch(url);
        
        // Check if the response is successful
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the JSON data
        const data = await response.json();

        // Log the data to the console (or you can handle it as needed)
        console.log(data);

        // Example: Accessing the articles
        const articles = data.response.docs;
        console.log(`Total articles found: ${articles.length}`);
        articles.forEach(article => {
            console.log(`Title: ${article.headline.main}`);
            console.log(`Published Date: ${article.pub_date}`);
            console.log(`URL: ${article.web_url}`);
            console.log('----------------------------------');
        });

        return data;
    } catch (error) {
        console.error('Error fetching the NYT archive:', error);
    }
}