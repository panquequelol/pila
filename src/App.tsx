import { Provider } from "jotai";
import { Notepad } from "./components/Notepad";

function App() {
  return (
    <Provider>
      <Notepad />
    </Provider>
  );
}

export default App;
