import Home from "./Home";
import Login from "./Login";
import axios from "axios";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    axios.get("/api/userInfo.json").then((res) => console.log(res));
  });

  return (
    <div style={{}}>
      <Home />
    </div>
  );
}

export default App;
