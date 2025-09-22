import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import ConfiguratorPlayer from "./ConfiguratorPlayer";
const AppRouter = () => (
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/vp-podconfigurator" element={<ConfiguratorPlayer />} />
    </Routes>
  </Router>
);
export default AppRouter;