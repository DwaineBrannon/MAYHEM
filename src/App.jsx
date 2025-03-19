import BiasSorter from "./BiasSorter";

function App() {
  return (
    <div style={styles.container}>
      <h1 style={styles.header}>
        MAYHEM Bias Sorter
      </h1>
      <BiasSorter />
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center', // Center vertically
    alignItems: 'center', // Center horizontally
    height: '100vh',
    width: '100vw',
  },
  header: {
    fontSize: '2rem',
    marginBottom: '20px',
    textAlign: 'center',
  },
};

export default App;