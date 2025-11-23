import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import initSqlJs from "sql.js";

interface SQLiteProviderProps {
  children: ReactNode;
}

interface SQLiteContextType {
  db: any | null;
  isDbReady: boolean;
}

const SQLiteContext = createContext<SQLiteContextType>({
  db: null,
  isDbReady: false,
});

export const SQLiteProvider: React.FC<SQLiteProviderProps> = ({ children }) => {
  const [db, setDb] = useState<any | null>(null);
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadDb = async () => {
      try {
        const SQL = await initSqlJs({
          locateFile: (file) => `https://sql.js.org/dist/${file}`
        });
        const database = new SQL.Database();
        if (mounted) {
          setDb(database);
          setIsDbReady(true);
        }
      } catch (error) {
        console.error("Failed to initialize SQLite database:", error);
        if (mounted) {
          setDb(null);
          setIsDbReady(false);
        }
      }
    };

    loadDb();

    return () => {
      mounted = false;
      if (db) {
        db.close();
      }
    };
  }, []);

  return (
    <SQLiteContext.Provider value={{ db, isDbReady }}>
      {children}
    </SQLiteContext.Provider>
  );
}

export const useSQLite = () => useContext(SQLiteContext);
