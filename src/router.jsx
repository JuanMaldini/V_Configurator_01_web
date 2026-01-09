import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import ConfiguratorPlayer from "./ConfiguratorPlayer";
import ConfiguratorPlayerTest from "./ConfiguratorPlayer_test";
const AppRouter = () => (
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/vp-podconfigurator" element={<ConfiguratorPlayer />} />
      <Route path="/vp-podconfigurator-test" element={<ConfiguratorPlayerTest />} />
    </Routes>
  </Router>
);
export default AppRouter;