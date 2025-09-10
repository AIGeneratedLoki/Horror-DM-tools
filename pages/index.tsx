// Inside pages/index.tsx
import styles from '../styles/Home.module.css'; // <-- This imports your styles

function HomePage() {
  return (
    // This uses the styles from your CSS file
    <main className={styles.container}> 
      <h1 className={styles.title}>Horror DM Tools</h1>
      <p>
        Welcome! This is the starting point for your collection of tools 
        to help run horror-themed tabletop games.
      </p>
      
      <h2>Available Tools:</h2>
      <ul>
        <li>(Your first tool will go here)</li>
      </ul>
    </main>
  );
}

export default HomePage;