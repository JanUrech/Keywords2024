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

