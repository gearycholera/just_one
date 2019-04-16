import React from "react";
import axios from "axios";
import io from "socket.io-client";

export default class HintInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hint: null,
      submitted: false
    };
    this.socket = io("http://localhost:3001");
  }

  handleChange = event => {
    this.setState({ hint: event.target.value });
  };

  handleSubmit = hint => {
    axios
      .post("/api/submitHint", {
        hint: this.state.hint,
        gameId: this.props.gameId
      })
      .then(res => {
        console.log(res);
        if (res.data === "waiting") {
          this.setState({ submitted: true });
        } else {
          this.socket.emit("hints_done", this.props.gameId);
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  render() {
    return (
      <div>
        <p>{this.props.gameData.clue}</p>
        <input placeholder="enter your hint" onChange={this.handleChange} />
        <button onClick={this.handleSubmit} disabled={this.state.submitted}>
          submit
        </button>
        {this.state.submitted ? (
          <p>wait for the other players to submit</p>
        ) : null}
      </div>
    );
  }
}
