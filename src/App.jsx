import React, { useState } from "react";
import BiasSorter from "./BiasSorter";
import axios from "axios";

function App() {
  const [albumTracks, setAlbumTracks] = useState([]);
  const [albumName, setAlbumName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]); // List of albums from the search
  const [selectedAlbum, setSelectedAlbum] = useState(null); // The album selected by the user

  const fetchAlbums = async () => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

    if (!searchQuery.trim()) {
      alert("Please enter an album name.");
      return;
    }

    try {
      // Get access token
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

      // Search for albums
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

      if (searchResponse.data.albums.items.length === 0) {
        alert("No albums found. Please try a different search.");
        return;
      }

      // Filter albums with more than 3 tracks
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

      // Save the filtered and limited search results (up to 6 albums)
      setSearchResults(filteredAlbums.filter(Boolean).slice(0, 6));
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert("An error occurred while fetching albums. Please try again.");
    }
  };

  const fetchAlbumTracks = async (album) => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

    try {
      // Get access token
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

      // Fetch album tracks
      const tracksResponse = await axios.get(
        `https://api.spotify.com/v1/albums/${album.id}/tracks`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setAlbumName(album.name);
      setAlbumTracks(tracksResponse.data.items.map((track) => track.name));
      setSelectedAlbum(album); // Save the selected album
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert("An error occurred while fetching album tracks. Please try again.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      fetchAlbums();
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Album Bias Sorter</h1>
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search for an album..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown} // Trigger search on Enter key
          style={styles.searchInput}
        />
        <button onClick={fetchAlbums} style={styles.searchButton}>
          Search
        </button>
      </div>

      {/* Display search results */}
      {searchResults.length > 0 && !selectedAlbum && (
        <div style={styles.resultsContainer}>
          <h2>Select an Album</h2>
          <ul style={styles.resultsList}>
            {searchResults.map((album) => (
              <li
                key={album.id}
                onClick={() => fetchAlbumTracks(album)}
                style={styles.resultItem}
              >
                <img
                  src={album.images[0]?.url}
                  alt={album.name}
                  style={styles.albumImage}
                />
                <div>
                  <strong>{album.name}</strong>
                  <p>{album.artists.map((artist) => artist.name).join(", ")}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Display the BiasSorter once an album is selected */}
      {selectedAlbum && albumTracks.length > 0 && (
        <>
          <h2>Album: {albumName}</h2>
          <BiasSorter songs={albumTracks} />
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    fontFamily: "'Roboto', sans-serif",
  },
  header: {
    fontSize: "2rem",
    marginBottom: "20px",
    textAlign: "center",
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
    alignItems: "center",
  },
  searchButton: {
    padding: "10px",
    fontSize: "1rem",
    cursor: "pointer",
    alignItems: "center",
  },
  resultsContainer: {
    marginTop: "20px",
    textAlign: "center",
    maxWidth: "600px", // Limit the width of the results container
    width: "100%",
  },
  resultsList: {
    listStyleType: "none",
    padding: 0,
    margin: 0,
  },
  resultItem: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    marginBottom: "10px",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    transition: "background-color 0.3s ease",
    backgroundColor: "#f9f9f9",
  },
  albumImage: {
    width: "50px",
    height: "50px",
    marginRight: "10px",
  },
};

export default App;