import { Provider, useSetAtom } from "jotai";
import { useEffect } from "react";
import { Notepad } from "./components/Notepad";
import { initializeSettingsAtom } from "./atoms/settings";

function AppContent() {
  const initializeSettings = useSetAtom(initializeSettingsAtom);

  useEffect(() => {
    initializeSettings();
  }, [initializeSettings]);

  return <Notepad />;
}

function App() {
  return (
    <Provider>
      <AppContent />
    </Provider>
  );
}

export default App;
