import React, { Component } from 'react';
import io from 'socket.io-client';
import './App.css';
import Player from './components/Player.jsx';

//declared globally to allow access throughout scope
const socket = io(process.env.REACT_APP_BASE_URL);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      sessionID: '', 
      room: '',
      enteredRoom: false,
      currentUsers: []
    }
  }
  
  handleChange = (event) =>
  this.setState({
    [event.target.name]: event.target.value
  });
  
  joinRoom = () => {
    socket.emit('connection', {username: this.state.username, room: this.state.room}, (res) => {
      if (res) {
        this.setState({
          sessionID: res.sessionID,
          currentUsers: res.connected_users,
          enteredRoom: true
        });
      }
    });
  };

  connectedUsersChanged = (connectedUsers) => {
    this.setState({
      currentUsers: connectedUsers
    });
  }

  render() {
    return (
        <div className="App">
          {
            this.state.enteredRoom
            ? 
              <Player 
              username={this.state.username}
              sessionID = {this.state.sessionID} 
              room = {this.state.room}
              videoIsLoaded = {this.videoIsLoaded}
              currentUsers = {this.state.currentUsers}
              connectedUsersChanged={this.connectedUsersChanged}
              socket={socket}/>
            :
              <div className="sign-in">
                <input 
                  type="text" 
                  name="username" 
                  placeholder="Enter a name" 
                  onChange={this.handleChange} 
                  required 
                />
                <input 
                  type="text" 
                  name="room" 
                  placeholder="Enter room name" 
                  onChange={this.handleChange} 
                  required 
                />
                <button onClick={this.joinRoom}>Submit Username</button>
              </div>
          }
        </div>
    );
  }
}

export default App;
