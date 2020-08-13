import React from 'react';
import Dashboard from './pages/dashboard';

import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

const App = () => {
  return (
    <Router>
      <Switch>
        <Dashboard />
      </Switch>
    </Router>
  );
}

export default App;
