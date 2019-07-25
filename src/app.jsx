import React from "react";
import { MemoryRouter, Switch, Route } from "react-router-dom";

import Dashboard from "./components/Dashboard";
import History from "./components/History";

const App = () => (
  <MemoryRouter>
    <Switch>
      <Route path="/" exact component={Dashboard} />
      <Route path="/history" exact component={History} />
    </Switch>
  </MemoryRouter>
);

export default App;
