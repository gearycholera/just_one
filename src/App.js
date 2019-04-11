import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from "./components/Home";
import Lobby from "./components/Lobby";
import GameRoom from "./components/GameRoom";

const App = () => {
  return (
    <Router>
      <div className="App">
        <h1 onClick={() => (window.location.href = "/")}>just one</h1>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/lobby/:gameId" component={Lobby} />
          <Route exact path="/gameroom/:gameId" component={GameRoom} />
        </Switch>
      </div>
    </Router>
  );
};

export default App;
