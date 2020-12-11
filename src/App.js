import React, { Component } from 'react';
import io from 'socket.io-client';
import './App.css';
import Player from './components/Player.jsx';
import { Input, Button }from 'semantic-ui-react';

//declared globally to allow access throughout scope
const socket = io(process.env.REACT_APP_SOCKETIO_URL);

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
          <h1 id='main-title'>YouShare</h1>
          
          {
            this.state.enteredRoom
            ? 
              <div className="room">
                <p>connected users: {this.state.currentUsers.length}</p>
                <Player 
                  username={this.state.username}
                  sessionID = {this.state.sessionID} 
                  room = {this.state.room}
                  videoIsLoaded = {this.videoIsLoaded}
                  currentUsers = {this.state.currentUsers}
                  connectedUsersChanged={this.connectedUsersChanged}
                  socket={socket}/>
              </div>
            :
              <div id="sign-in">
                <h3 className="sub-title">Make playlists and watch videos with friends near and far.</h3>
                <h3 className="sub-title">Everyone gets to vote (by simple majority) if they want to continue to watch the video or not </h3>
                <p className="input-text">Enter a display name:</p>
                <Input
                    className="input-field"
                    type="text" 
                    name="username" 
                    placeholder="Enter a name" 
                    onChange={this.handleChange} 
                    required 
                  />
                <p className="input-text">Type in a room name. If it doesn't exist, a new one will be created</p>
                <Input
                    className="input-field"
                    type="text" 
                    name="room" 
                    placeholder="Enter room name" 
                    onChange={this.handleChange} 
                    required 
                  />
                <Button inverted color="red" onClick={this.joinRoom}>Join A Room</Button>
              </div>
          }
        </div>
    );
  }
}

export default App;
