import React, { useState } from "react";
import BiasSorter from "./BiasSorter";
import axios from "axios";

function App() {
  // State variables
  const [albumTracks, setAlbumTracks] = useState([]); // Tracks of the selected album
  const [albumName, setAlbumName] = useState(""); // Name of the selected album
  const [searchQuery, setSearchQuery] = useState(""); // User's search input
  const [searchResults, setSearchResults] = useState([]); // List of albums from the search
  const [selectedAlbum, setSelectedAlbum] = useState(null); // The album selected by the user
  const [isDarkMode, setIsDarkMode] = useState(false); // Dark mode state

  // Dynamic styles based on isDarkMode
  const dynamicStyles = {
    searchButton: {
      padding: "10px 15px",
      fontSize: "1rem",
      cursor: "pointer",
      border: "2px solid black",
      borderRadius: "8px",
      backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(128, 128, 128, 0.5)",
      color: isDarkMode ? "white" : "black",
      transition: "background-color 0.3s ease, opacity 0.3s ease",
    },
    searchButtonHover: {
      backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(128, 128, 128, 0.8)",
    },
  };

  // Function to reset the app to the album search phase
  const resetToSearch = () => {
    setAlbumTracks([]); // Clear album tracks
    setAlbumName(""); // Clear album name
    setSelectedAlbum(null); // Deselect the album
    setSearchResults([]); // Clear previous search results
  };

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  // Function to fetch albums based on the user's search query
  const fetchAlbums = async () => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID; // Spotify API client ID
    const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET; // Spotify API client secret

    // Validate the search query
    if (!searchQuery.trim()) {
      alert("Please enter an album name.");
      return;
    }

    try {
      // Clear previous search results before fetching new ones
      setSearchResults([]);

      // Get Spotify API access token
      const tokenResponse = await axios.post(
        "https://accounts.spotify.com/api/token",
        "grant_type=client_credentials",
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
          },
        }
      );
      const accessToken = tokenResponse.data.access_token;

      // Search for albums using the Spotify API
      const searchResponse = await axios.get(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          searchQuery
        )}&type=album`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Handle case where no albums are found
      if (searchResponse.data.albums.items.length === 0) {
        alert("No albums found. Please try a different search.");
        return;
      }

      // Filter albums to include only those with more than 3 tracks
      const filteredAlbums = await Promise.all(
        searchResponse.data.albums.items.map(async (album) => {
          const albumDetails = await axios.get(
            `https://api.spotify.com/v1/albums/${album.id}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          return albumDetails.data.tracks.total > 3 ? album : null;
        })
      );

      // Save the filtered and limited search results (up to 4 albums)
      setSearchResults(filteredAlbums.filter(Boolean).slice(0, 4));
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert("An error occurred while fetching albums. Please try again.");
    }
  };

  // Function to fetch tracks of a selected album
  const fetchAlbumTracks = async (album) => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID; // Spotify API client ID
    const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET; // Spotify API client secret

    try {
      // Get Spotify API access token
      const tokenResponse = await axios.post(
        "https://accounts.spotify.com/api/token",
        "grant_type=client_credentials",
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
          },
        }
      );
      const accessToken = tokenResponse.data.access_token;

      // Fetch album tracks using the Spotify API
      const tracksResponse = await axios.get(
        `https://api.spotify.com/v1/albums/${album.id}/tracks`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Save the album name and tracks
      setAlbumName(album.name);
      setAlbumTracks(tracksResponse.data.items.map((track) => track.name));
      setSelectedAlbum(album); // Mark the album as selected
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert("An error occurred while fetching album tracks. Please try again.");
    }
  };

  // Handle Enter key press in the search input
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (selectedAlbum) {
        resetToSearch(); // Reset if sorting is in progress
      }
      fetchAlbums(); // Fetch new albums
    }
  };

  return (
    <div
      style={{
        ...styles.container,
        ...(isDarkMode ? styles.darkMode : {}),
      }}
    >
      {/* App Header */}
      <h1 style={styles.header}>Album Bias Sorter</h1>

      {/* Search Bar */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search for an album..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Update search query
          onKeyDown={handleKeyDown} // Trigger search on Enter key
          style={styles.searchInput}
        />
        <button
          onClick={() => {
            if (selectedAlbum) {
              resetToSearch(); // Reset if sorting is in progress
            }
            fetchAlbums(); // Fetch new albums
          }}
          style={dynamicStyles.searchButton}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = dynamicStyles.searchButtonHover.backgroundColor)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = dynamicStyles.searchButton.backgroundColor)
          }
        >
          Search
        </button>
      </div>

      {/* Display Search Results */}
      {searchResults.length > 0 && !selectedAlbum && (
        <div style={styles.resultsContainer}>
          <h2>Select an Album</h2>
          <ul style={styles.resultsList}>
            {searchResults.map((album) => (
              <li
                key={album.id}
                onClick={() => fetchAlbumTracks(album)} // Fetch tracks for the selected album
                style={styles.resultItem}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.05)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <img
                  src={album.images[0]?.url}
                  alt={album.name}
                  style={styles.albumImage}
                />
                <div>
                  <strong>{album.name}</strong>
                  <p style={{ fontSize: "0.9rem", color: "#555" }}>
                    {album.artists.map((artist) => artist.name).join(", ")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Display BiasSorter Component */}
      {selectedAlbum && albumTracks.length > 0 && (
        <>
          <h2>Album: {albumName}</h2>
          <BiasSorter songs={albumTracks} />
        </>
      )}

      {/* Move the Toggle Dark Mode button here */}
      <button onClick={toggleDarkMode} style={styles.darkModeButton}>
        Toggle Dark Mode
      </button>

      <footer style={styles.footer}>
        Made by ROZEPOP
        <div style={styles.footerLinks}>
          <a href="https://bsky.app/profile/rozepop.bsky.social" target="_blank" rel="noopener noreferrer">
            Bluesky
          </a>{" "}
          |{" "}
          <a href="https://github.com/dwainebrannon" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>{" "}
          |{" "}
          <a href="https://twitter.com/rozepop" target="_blank" rel="noopener noreferrer">
            Twitter
          </a>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  // Main container styles
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    fontFamily: "'Roboto', sans-serif",
    width: "100vw",
    minHeight: "100vh",
    background: "linear-gradient(to right,rgb(125, 163, 216),rgb(246, 220, 182))", // Light gradient background
    margin: "0 auto", // Center the container
  },
  header: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    marginBottom: "20px",
    textAlign: "center",
    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)", // Text shadow for header
  },
  searchContainer: {
    alignItems: "center",
    display: "flex",
    marginBottom: "20px",
  },
  searchInput: {
    padding: "10px",
    fontSize: "1rem",
    marginRight: "10px",
    // tranparent background for search input
    background: "rgba(255, 255, 255, 0)",
    color: "black",
    // black border in light mode
    border: "1px solid black",
    borderRadius: "8px", // Rounded corners
    outline: "none",
    transition: "border-color 0.3s ease",
  },
  searchInputFocus: {
    borderColor: "#007BFF", // Highlight border on focus
  },
  resultsContainer: {
    marginTop: "20px",
    textAlign: "center",
    maxWidth: "800px",
    width: "100%",
    background: "rgba(255, 255, 255, 0.59)",
    backdropFilter: "blur(10px)",
    borderRadius: "15px",
    color: "black",
    padding: "20px",
    boxShadow: "0 8px 16px rgba(12, 140, 125, 0.37)",
    margin: "0 auto",
  },
  resultsList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "20px", // Space between items
    listStyleType: "none",
    // Slight drop shadow on list items for better visibility on light mode
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    borderRadius: "10px",
    padding: 0,
    margin: 0,
  },
  resultItem: {
    display: "flex",
    flexDirection: "column", // Stack image and text
    alignItems: "center",
    cursor: "pointer",
    padding: "15px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    backgroundColor: "#ffffff", // White background for cards
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    animation: "fadeIn 0.5s ease-in-out",
  },
  resultItemHover: {
    transform: "scale(1.05)", // Slight zoom effect on hover
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  },
  albumImage: {
    width: "100px", // Album image size
    height: "100px",
    marginBottom: "10px",
    borderRadius: "8px", // Rounded corners for the image
    objectFit: "cover", // Ensure the image fits nicely
  },
  footer: {
    marginTop: "20px",
    fontSize: "0.9rem",
    color: "#666",
    textAlign: "center",
  },
  footerLinks: {
    marginTop: "10px",
    fontSize: "0.9rem",
  },
  "footerLinks a": {
    color: "#007BFF", // Link color
    textDecoration: "none",
    margin: "0 5px",
  },
  "footerLinks a:hover": {
    textDecoration: "underline", // Underline on hover
  },
  "@keyframes fadeIn": {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  darkMode: {
    background: "linear-gradient(to right,rgb(27, 37, 41),rgb(24, 23, 22))", // Dark gradient background
    color: "#ffffff",
  },
  darkModeButton: {
    padding: "10px 15px",
    fontSize: "1rem",
    cursor: "pointer",
    border: "none",
    borderRadius: "8px",
    backgroundColor: // transparent background for dark mode button
      "rgba(58, 54, 54, 0.48)",
    color: "#fff",
    marginBottom: "20px",
    transition: "background-color 0.3s ease",
  },
};

export default App;