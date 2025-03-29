import React, { useState, useEffect } from "react";

const BiasSorter = ({ songs }) => {
  const [sortedList, setSortedList] = useState([]); // The sorted list of songs
  const [unsortedList, setUnsortedList] = useState([...songs]); // Songs yet to be sorted
  const [currentComparison, setCurrentComparison] = useState(null); // Current pair being compared
  const [isSorted, setIsSorted] = useState(false);

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

  if (isSorted) {
    return (
      <div style={styles.container}>
        <h2>Final Ranking</h2>
        <ol>
          {sortedList.map((song, index) => (
            <li key={index}>{song}</li>
          ))}
        </ol>
        <button onClick={() => window.location.reload()} style={styles.button}>
          Sort Again
        </button>
      </div>
    );
  }

  if (currentComparison) {
    const { song, index } = currentComparison;
    return (
      <div style={styles.container}>
        <h2 style={styles.header}>Choose your favorite</h2>
        <div style={styles.buttons}>
          <button onClick={() => handleChoice(false)} style={styles.button}>
            {song}
          </button>
          <button onClick={() => handleChoice(true)} style={styles.button}>
            {sortedList[index]}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <button onClick={() => setCurrentComparison(null)} style={styles.button}>
        Start Sorting
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    width: "100vw",
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
    gap: "10px",
    alignItems: "center",
  },
  button: {
    padding: "10px 20px",
    fontSize: "1rem",
    cursor: "pointer",
    backgroundColor: "black",
    color: "white",
    border: "none",
    borderRadius: "5px",
    transition: "background-color 0.3s ease",
    fontFamily: "'Roboto', sans-serif",
  },
};

export default BiasSorter;