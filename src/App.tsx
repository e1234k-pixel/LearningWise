import React from "react";
import { AppProvider } from "./context/AppDataContext";
import { AppContent } from "./AppContent";

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
