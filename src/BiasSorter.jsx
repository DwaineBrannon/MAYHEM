import React, { useState, useEffect } from "react";
import html2canvas from "html2canvas";

// Accept 'album' prop instead of albumName/artistName
const BiasSorter = ({ songs, album }) => {
  const [sortedList, setSortedList] = useState([]); // The sorted list of songs
  const [unsortedList, setUnsortedList] = useState([...songs]); // Songs yet to be sorted
  const [currentComparison, setCurrentComparison] = useState(null); // Current pair being compared
  const [isSorted, setIsSorted] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  // Helper: capture screenshot and download
  // background should be transparent
  const downloadScreenshot = async () => {
    setIsCapturing(true);
    const node = document.getElementById("final-ranking");
    if (!node) return;
    // Temporarily hide share buttons for screenshot
    const shareDiv = document.getElementById('share-buttons');
    if (shareDiv) shareDiv.style.display = 'none';
    const canvas = await html2canvas(node);
    const url = canvas.toDataURL("image/png");
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ranking.png';
    link.click();
    if (shareDiv) shareDiv.style.display = '';
    setIsCapturing(false);
  };

  // Helper: open Twitter intent
  const shareOnTwitter = () => {
    const tweetText = encodeURIComponent(
      `I just ranked my favorite songs! Try it here: http://beatmeter.top`
    );
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`);
  };

  // Start the sorting process
  useEffect(() => {
    if (unsortedList.length === 0 && !currentComparison) {
      setIsSorted(true); // Sorting is complete
      return;
    }

    if (!currentComparison && unsortedList.length > 0) {
      // Take the next song from the unsorted list
      const nextSong = unsortedList[0];
      setUnsortedList(unsortedList.slice(1)); // Remove it from the unsorted list

      // If the sorted list is empty, add the first song directly
      if (sortedList.length === 0) {
        setSortedList([nextSong]);
      } else {
        // Compare the new song with the sorted list
        setCurrentComparison({ song: nextSong, index: 0 });
      }
    }
  }, [unsortedList, currentComparison, sortedList]);

  // Handle the user's choice
  const handleChoice = (isBetter) => {
    const { song, index } = currentComparison;

    if (isBetter) {
      // If the new song is better, move to the next comparison
      if (index + 1 < sortedList.length) {
        setCurrentComparison({ song, index: index + 1 });
      } else {
        // If we've reached the end, add the song to the end of the sorted list
        setSortedList([...sortedList, song]);
        setCurrentComparison(null); // Move to the next song
      }
    } else {
      // If the new song is worse, insert it at the current position
      const newSortedList = [...sortedList];
      newSortedList.splice(index, 0, song);
      setSortedList(newSortedList);
      setCurrentComparison(null); // Move to the next song
    }
  };

  // --- Final Ranking UI ---
  // Extract album info if available
  const albumName = album?.name;
  const artistNames = album?.artists ? album.artists.map(a => a.name).join(", ") : "";
  const albumCover = album?.images && album.images.length > 0 ? album.images[0].url : null;

  // Main content area: always rendered, fixed minHeight
  const mainContent = isSorted ? (
    <div id="final-ranking" style={{
      width: "100%",
      maxWidth: 500,
      background: "linear-gradient(to right, rgb(125, 163, 216), rgb(246, 220, 182))",
      color: "#fff",
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
      position: 'relative',
      boxShadow: '0 8px 24px 0 rgba(0,0,0,0.25)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      minHeight: 220 // Ensures height is stable
    }}>
      <div style={{flex: 1}}>
        <h3 style={{marginTop:0, marginBottom:8, fontWeight:'bold'}}>MY {albumName ? albumName : "Song"} Ranking</h3>
        {albumName && (
          <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: 2 ,
             textShadow: '2px 2px 6px rgba(0,0,0,.75)'}}>{albumName}</div>
        )}
        {artistNames && (
          <div style={{ fontSize: '1rem', marginBottom: 12, textShadow: '2px 2px 6px rgba(0,0,0,.75)' }}>{artistNames}</div>
        )}
        <ol>
          {sortedList.map((song, index) => (
            <li key={index}>{song}</li>
          ))}
        </ol>
      </div>
      {albumCover && (
        <img src={albumCover} alt="Album cover" style={{ width: 120, height: 120, borderRadius: 8, objectFit: 'cover', marginLeft: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.18)'}} />
      )}
    </div>
  ) : currentComparison ? (
    <div style={{
      width: "100%",
      maxWidth: 500,
      minHeight: 220, // Ensures height is stable
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(255,255,255,0.01)'
    }}>
      <h2 style={styles.header}>Choose your favorite</h2>
      <div style={styles.buttons}>
        <button onClick={() => handleChoice(false)} style={styles.button}>
          {currentComparison.song}
        </button>
        <button onClick={() => handleChoice(true)} style={styles.button}>
          {sortedList[currentComparison.index]}
        </button>
      </div>
    </div>
  ) : (
    <div style={{
      width: "100%",
      maxWidth: 500,
      minHeight: 220,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(255,255,255,0.01)'
    }}>
      <button onClick={() => setCurrentComparison(null)} style={styles.button}>
        Start Sorting
      </button>
    </div>
  );

  return (
    <div style={styles.container}>
      {mainContent}
      {/* Action buttons always rendered below main content, with reserved space */}
      <div style={{ minHeight: 48, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        {isSorted ? (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
              <button
                onClick={downloadScreenshot}
                style={styles.button}
                disabled={isCapturing}
              >
                {isCapturing ? "Capturing..." : "Download Image"}
              </button>
              <button onClick={shareOnTwitter} style={styles.button}>Share on Twitter</button>
            </div>
            <button onClick={() => window.location.reload()} style={styles.button}>
              Sort Again
            </button>
          </>
        ) : (
          // Invisible placeholder to reserve space for the Sort Again button
          <button style={{...styles.button, visibility: 'hidden'}}>Sort Again</button>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    padding: "20px",
    fontFamily: "'Roboto', sans-serif",
  },
  header: {
    fontSize: "2rem",
    marginBottom: "20px",
    textAlign: "center",
    fontFamily: "'Roboto', sans-serif",
  },
  buttons: {
    display: "flex",
    flexDirection: "column",
    minHeight: "120px",
    gap: "10px",
    alignItems: "center",
  },
  button: {
    padding: "10px 20px",
    fontSize: "1rem",
    cursor: "pointer",
    backgroundColor: "black",
    minHeight: "48px",
    color: "white",
    border: "none",
    borderRadius: "5px",
    transition: "background-color 0.3s ease",
    fontFamily: "'Roboto', sans-serif",
  },
};

export default BiasSorter;