// Apni API key yahan paste karein
const API_KEY = 'AIzaSyBkr...'; 

const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');
const titleDisplay = document.getElementById('title');

searchBtn.addEventListener('click', async () => {
    const query = searchInput.value;
    if (!query) return alert("Gaane ka naam likhein!");

    titleDisplay.innerText = "Searching...";

    try {
        // YouTube API se search karna
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${query}&type=video&key=${API_KEY}`);
        const data = await res.json();

        if (data.items.length > 0) {
            const videoId = data.items[0].id.videoId;
            const songTitle = data.items[0].snippet.title;

            titleDisplay.innerText = songTitle;
            
            // Ab hume is VideoId ko play karna hai
            // Play karne ke liye hume YouTube Player API chahiye hogi
            alert("Gaana mil gaya: " + songTitle);
        } else {
            alert("Gaana nahi mila!");
        }
    } catch (err) {
        console.error("API Error:", err);
        alert("Kuch galti hui, check karein key restrict hui ya nahi.");
    }
});
