import React from "react";
import axios from "axios";
import io from "socket.io-client";
import HintInput from "./HintInput";
import HintFilter from "./HintFilter";

export default class GameRoom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gameData: {
        players: [],
        creator: false
      },
      loading: true,
      allHintsSubmitted: false,
      hintsFiltered: false,
      gameDone: false
    };
    this.gameId = this.props.match.params.gameId;
    this.socket = io("http://54.153.0.109:3001");
    this.socket.on("connect", () => {
      this.socket.emit("join", this.gameId);
    });
  }

  componentDidMount() {
    this.getData();
    this.socket.on("hints_done", gameData => {
      this.setState({ gameData: gameData, allHintsSubmitted: true });
    });
    this.socket.on("valid_hints_submitted", gameData => {
      this.setState({ gameData: gameData, hintsFiltered: true });
    });
    this.socket.on("game_done", gameData => {
      this.setState({ gameData: gameData, gameDone: true });
    });
  }

  getData() {
    axios
      .get(`/api/getGameData?gameId=${this.gameId}`)
      .then(res => {
        console.log(res.data);
        this.setState({ gameData: res.data, loading: false });
      })
      .catch(err => {
        console.log(err);
      });
  }

  handleSubmitClick = () => {
    const guess = document.getElementsByTagName("input")[0].value;
    const info = { gameId: this.gameId, guess: guess };
    this.socket.emit("guess_submitted", info);
  };

  handlePlayAgainClick = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.loading) {
      return (
        <div>
          <p>game room</p>
        </div>
      );
    }

    if (this.state.gameDone) {
      return (
        <div>
          <p>game room</p>
          <p>the clue was: {this.state.gameData.clue}</p>
          <p>
            {this.state.gameData.guesser} guessed {this.state.gameData.guess}
          </p>
          <button onClick={this.handlePlayAgainClick}>play again</button>
        </div>
      );
    }

    if (this.state.hintsFiltered) {
      return (
        <div>
          <p>game room</p>
          <ul>
            {this.state.gameData.finalHints.map((hint, index) => (
              <li key={index}>{hint}</li>
            ))}
          </ul>
          {localStorage.username === this.state.gameData.guesser ? (
            <span>
              <input placeholder="enter your guess" />
              <button onClick={this.handleSubmitClick}>submit</button>
            </span>
          ) : (
            <p>wait for the guesser to submit their answer</p>
          )}
        </div>
      );
    }
    return (
      <div>
        <p>game room</p>
        {localStorage.username === this.state.gameData.guesser ? (
          <p>you are the guesser, so wait.</p>
        ) : this.state.allHintsSubmitted ? (
          <HintFilter gameId={this.gameId} gameData={this.state.gameData} />
        ) : (
          <HintInput gameId={this.gameId} gameData={this.state.gameData} />
        )}
      </div>
    );
  }
}
