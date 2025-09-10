import Head from 'next/head';
import styles from './HomePage.module.css';

function HomePage() {
  return (
    <>
      <Head>
        <title>Horror DM Tools - Home</title>
        <meta name="description" content="A collection of tools to help run horror-themed tabletop games." />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>Horror DM Tools</h1>
        <p className={styles.description}>
          Welcome! This is the starting point for your collection of tools
          to help run horror-themed tabletop games.
        </p>

        <h2>Available Tools:</h2>
        <ul>
          <li>(Your first tool will go here)</li>
          <li>(Your second tool will go here)</li>
          <li>(Your third tool will go here)</li>
        </ul>
      </main>
    </>
  );
}

export default HomePage;