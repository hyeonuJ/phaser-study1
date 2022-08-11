import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";
//import Game from "./Game";
//import Game2 from "./Game2";
import Game3 from "./Game3";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Game3 />} />
    </Routes>
  </BrowserRouter>
);
