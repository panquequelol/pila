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
      <div className="min-h-screen px-3 mx-auto max-w-[800px] md:px-10">
        <AppContent />
      </div>
    </Provider>
  );
}

export default App;
