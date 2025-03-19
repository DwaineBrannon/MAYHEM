import React, { useState, useEffect, useRef } from 'react';
import songs from './songs';

const BiasSorter = () => {
  const [songList, setSongList] = useState([...songs]);
  const [comparisons, setComparisons] = useState([]);
  const [comparisonIndex, setComparisonIndex] = useState(0);
  const [isSorted, setIsSorted] = useState(false);
  const [sortingPhase, setSortingPhase] = useState(false);
  const songListRef = useRef([...songs]); // Store the initial songList

  useEffect(() => {
    const generateComparisons = (list) => {
      const comps = [];
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          comps.push([i, j]);
        }
      }
      return comps;
    };
    setComparisons(generateComparisons(songs));
    console.log("Initial songs array:", songs);
  }, []);

  const handleChoice = (winnerIndex) => {
    const [index1, index2] = comparisons[comparisonIndex];
    const updatedList = [...songList];

    if (winnerIndex === index2) {
      [updatedList[index1], updatedList[index2]] = [updatedList[index2], updatedList[index1]];
    }

    setSongList(updatedList);
    console.log("Updated songList after choice:", updatedList);

    if (comparisonIndex < comparisons.length - 1) {
      setComparisonIndex(comparisonIndex + 1);
    } else {
      setSortingPhase(true);
    }
  };

  useEffect(() => {
    songListRef.current = songList; // Keep songListRef in sync with songList
  }, [songList]);

  useEffect(() => {
    if (sortingPhase) {
      const sortedList = [...songListRef.current]; // Use the updated ref for sorting
      const songIndexMap = {}; // Create a map for song indices
      songListRef.current.forEach((song, index) => {
        songIndexMap[song] = index;
      });

      for (let i = 1; i < sortedList.length; i++) {
        let currentSong = sortedList[i];
        let j = i - 1;
        while (j >= 0 && songIndexMap[sortedList[j]] > songIndexMap[currentSong]) {
          sortedList[j + 1] = sortedList[j];
          j--;
        }
        sortedList[j + 1] = currentSong;
      }
      setSongList(sortedList);
      setIsSorted(true);
    }
  }, [sortingPhase]); // Only run this effect when sortingPhase changes

  const resetSorter = () => {
    const generateComparisons = (list) => {
      const comps = [];
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          comps.push([i, j]);
        }
      }
      return comps;
    };
  
    setSongList([...songs]);
    setComparisons(generateComparisons(songs)); // Regenerate comparisons
    setComparisonIndex(0);
    setIsSorted(false);
    setSortingPhase(false);
  };

  if (isSorted) {
    return (
      <div style={styles.container}>
        <h2>Final Ranking</h2>
        <ol>
          {songList.map((song, index) => (
            <li key={index}>{song}</li>
          ))}
        </ol>
        <button onClick={resetSorter} style={styles.button}>
          Sort Again
        </button>
      </div>
    );
  }

  if (comparisons.length > 0 && comparisonIndex < comparisons.length) {
    const [index1, index2] = comparisons[comparisonIndex];
    return (
      <div style={styles.container}>
        <h2 style={styles.header}>Choose your favorite</h2>
        <div style={styles.buttons}>
          <button onClick={() => handleChoice(index1)} style={styles.button}>
            {songList[index1]}
          </button>
          <button onClick={() => handleChoice(index2)} style={styles.button}>
            {songList[index2]}
          </button>
        </div>
      </div>
    );
  }

  return <div>Loading...</div>;
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    padding: '20px',
    fontFamily: "'Roboto', sans-serif", // Apply font to the container
  },
  header: {
    fontSize: '2rem',
    marginBottom: '20px',
    textAlign: 'center',
    fontFamily: "'Roboto', sans-serif", // Apply font to the header
  },
  buttons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    alignItems: 'center',
  },
  button: {
    padding: '10px 20px',
    fontSize: '1rem',
    cursor: 'pointer',
    backgroundColor: 'black', 
    color: 'white', 
    border: 'none',
    borderRadius: '5px',
    transition: 'background-color 0.3s ease',
    fontFamily: "'Roboto', sans-serif", // Apply font to buttons
  },
};

export default BiasSorter;