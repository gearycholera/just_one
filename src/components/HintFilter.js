import React from "react";
import io from "socket.io-client";

export default class HintFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hints: this.props.gameData.hints,
      hintsState: new Array(this.props.gameData.hints.length).fill(true)
    };
    this.socket = io("http://localhost:3001");
    this.socket.on("connect", () => {
      this.socket.emit("join", this.props.gameId);
    });
  }

  componentDidMount() {
    this.socket.on("hints_filtered", hintsState => {
      this.setState({ hintsState: hintsState });
    });
  }

  handleHintClick = e => {
    const index = e.target.getAttribute("index");
    const hintsState = this.state.hintsState;
    hintsState[index] = !hintsState[index];
    const data = {
      hintsState: hintsState,
      gameId: this.props.gameId
    };
    this.socket.emit("hints_filtered", data);
    this.setState({ hintsState: hintsState });
  };

  handleDoneClick = () => {
    const info = {
      hintsState: this.state.hintsState,
      gameId: this.props.gameId
    };
    this.socket.emit("valid_hints_submitted", info);
  };

  render() {
    const strikethrough = { textDecorationLine: "line-through" };
    return (
      <div>
        <p>{this.props.gameData.clue}</p>
        <ul>
          {this.state.hints.map((hint, index) => (
            <li
              key={index}
              index={index}
              onClick={this.handleHintClick}
              style={!this.state.hintsState[index] ? strikethrough : null}
            >
              {hint}
            </li>
          ))}
        </ul>
        <button onClick={this.handleDoneClick}>done</button>
      </div>
    );
  }
}
