import React from "react";
import axios from "axios";
import io from "socket.io-client";
import { words } from "./../wordlist.js";

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      joinGame: false,
      gameId: null
    };

    this.socket = io("http://localhost:3001");
  }

  handleChange = event => {
    this.setState({ username: event.target.value });
  };

  handleJoinClick = () => {
    this.setState({ joinGame: true });
  };

  handleCreateGame = () => {
    if (!this.state.username) {
      alert("enter a username");
      return;
    }
    localStorage.username = this.state.username;
    const gameId = Math.floor(1000 + Math.random() * 9000);
    const clue = words[Math.floor(Math.random() * words.length)];
    axios
      .post("/api/createGame", {
        username: this.state.username,
        gameId: gameId,
        clue: clue
      })
      .then(res => {
        console.log(res);
        this.socket.emit("game_created", gameId);
        window.location.href = `/lobby/${gameId}`;
      })
      .catch(err => {
        alert(err.message);
      });
  };

  handleEnterRoom = () => {
    const roomNumber = document.getElementsByClassName("input-room")[0].value;
    if (!this.state.username || !roomNumber) {
      alert("enter the fields");
      return;
    }
    localStorage.username = this.state.username;
    axios
      .post("api/joinGame", {
        username: this.state.username,
        gameId: roomNumber
      })
      .then(res => {
        console.log(res);
        this.socket.emit("new_player", roomNumber);
        window.location.href = `/lobby/${roomNumber}`;
      })
      .catch(err => {
        console.log(err);
      });
  };

  render() {
    return (
      <div>
        <p>welcome</p>
        <input placeholder="enter username" onChange={this.handleChange} />
        <button onClick={this.handleCreateGame}>create game</button>
        <button onClick={this.handleJoinClick}>join game</button>
        {this.state.joinGame ? (
          <span>
            <input className="input-room" placeholder="enter room number" />{" "}
            <button onClick={this.handleEnterRoom}>go</button>
          </span>
        ) : null}
      </div>
    );
  }
}
