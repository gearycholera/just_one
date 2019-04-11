import React from "react";
import axios from "axios";
import io from "socket.io-client";

let socket;

export default class Lobby extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gameData: {
        players: [],
        creator: false
      }
    };
    this.gameId = this.props.match.params.gameId;
  }

  componentDidMount() {
    socket = io.connect();
    socket.on("connect", () => {
      socket.emit("join", this.gameId);
    });
    this.getData();
    socket.on("room_update", gameData => {
      this.setState({ gameData: gameData });
    });
    socket.on("game_started", () => {
      window.location.href = `/gameroom/${this.gameId}`;
    });
  }

  getData() {
    axios
      .get(`/api/getGameData?gameId=${this.gameId}`)
      .then(res => {
        console.log(res.data);
        this.setState({ gameData: res.data });
      })
      .catch(err => {
        console.log(err);
      });
  }

  handleStartGame = () => {
    socket.emit("start_game", this.gameId);
  };

  render() {
    const { players, creator } = this.state.gameData;
    if (!players) {
      return <p>not a valid game room</p>;
    }
    return (
      <div>
        <p>players</p>
        <ul>
          {players.map((name, index) => (
            <li key={index}>{name}</li>
          ))}
        </ul>
        {creator === localStorage.username ? (
          <button onClick={this.handleStartGame}>start game</button>
        ) : (
          <p>waiting...</p>
        )}
      </div>
    );
  }
}
