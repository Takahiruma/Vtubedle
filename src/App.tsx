import { useEffect } from 'react';
import './App.scss'
import { useSQLite } from './components/SQliteProvider/SQliteProvider';
import { initializeDatabase } from "./utils/db";
import VHome from './pages/Home/VHome'
import React from 'react';

function App() {
  const { db, isDbReady } = useSQLite();
  const [isInitialized, setIsInitialized] = React.useState(false);

  useEffect(() => {
    if (db && !isInitialized) {
      const initDb = async () => {
        await initializeDatabase(db);
        setIsInitialized(true);
      };
      initDb();
    }
  }, [db, isInitialized]);

  if (!db || !isDbReady || !isInitialized) {
    return <div>Chargement de la base de données...</div>;
  }

  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}>
      <VHome/>
    </div>
  );
}

export default App;
