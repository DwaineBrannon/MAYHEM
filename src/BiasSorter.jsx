import React, { useState, useEffect } from "react";
import html2canvas from "html2canvas";

// Accept 'album' prop instead of albumName/artistName
const BiasSorter = ({ songs, album }) => {
  // Bottom-up, queue-driven merge sort:
  // - `queue` holds sorted "runs" waiting to be merged (starts as one run per song).
  // - `current` holds the in-progress merge of the two runs at the front of the queue.
  // - Each click resolves one comparison; when a run is exhausted the remainder is
  //   appended without asking the user, the merged run goes to the back of the queue,
  //   and the next pair is dequeued. When only one run is left, sorting is done.
  const [queue, setQueue] = useState(() => songs.map((song) => [song]));
  const [current, setCurrent] = useState(null); // { left, right, leftIdx, rightIdx, merged }
  const [sortedList, setSortedList] = useState([]);
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
      `I just ranked my favorite songs! Try it here: https://dwainebrannon.github.io/MAYHEM/`
    );
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`);
  };

  // Drive the merge sort forward: dequeue the next pair of runs to merge,
  // or finish once only one run remains.
  useEffect(() => {
    if (current) return; // a comparison is already in progress

    if (queue.length === 0) {
      setSortedList([]);
      setIsSorted(true);
      return;
    }

    if (queue.length === 1) {
      setSortedList(queue[0]);
      setIsSorted(true);
      return;
    }

    const [left, right, ...rest] = queue;
    setQueue(rest);
    setCurrent({ left, right, leftIdx: 0, rightIdx: 0, merged: [] });
  }, [queue, current]);

  // Handle the user's choice between the current heads of the two runs.
  // pickLeft = true means the left run's current song was preferred.
  const handleChoice = (pickLeft) => {
    if (!current) return;
    const { left, right, leftIdx, rightIdx, merged } = current;

    let newMerged = pickLeft ? [...merged, left[leftIdx]] : [...merged, right[rightIdx]];
    const newLeftIdx = pickLeft ? leftIdx + 1 : leftIdx;
    const newRightIdx = pickLeft ? rightIdx : rightIdx + 1;

    // One run is exhausted: append the remainder of the other run with no
    // further comparisons, finish this merge, and send the result to the
    // back of the queue.
    if (newLeftIdx >= left.length) {
      newMerged = newMerged.concat(right.slice(newRightIdx));
      setQueue((q) => [...q, newMerged]);
      setCurrent(null);
      return;
    }
    if (newRightIdx >= right.length) {
      newMerged = newMerged.concat(left.slice(newLeftIdx));
      setQueue((q) => [...q, newMerged]);
      setCurrent(null);
      return;
    }

    setCurrent({ left, right, leftIdx: newLeftIdx, rightIdx: newRightIdx, merged: newMerged });
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
  ) : current ? (
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
        <button onClick={() => handleChoice(true)} style={styles.button}>
          {current.left[current.leftIdx]}
        </button>
        <button onClick={() => handleChoice(false)} style={styles.button}>
          {current.right[current.rightIdx]}
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
      <button style={styles.button} disabled>
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
