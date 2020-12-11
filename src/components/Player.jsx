import React, { Component } from 'react';
import Search from './Search.jsx';
import Vote from './Vote.jsx';
import YouTube from 'react-youtube';
import './Player.css';
import { Button, List }from 'semantic-ui-react';

class Player extends Component {
    constructor(props) {
        super(props);
        this.state = {
            queue: [],
            opts: {
                height: '390',
                width: '640',
                playerVars: {
                    autoplay: 1,
                    controls: 0,
                    enablejsapi: 1,
                    disablekb: 1
                }
            },
            hasVoted: '',
            playerState: -1,
        };

        //holds target for YouTube react element
        //assigns value once onReady is triggered.
        this.youTubeElem = {};
        
    };

    componentDidMount() {
        //see if a saved playlist is there and load it into the queue
        //if no room is found, create it.
        try{
            fetch(process.env.REACT_APP_DB_URL + '/api/sessions/' + this.props.room).then((res) => {
                return res.json();
            }).then((result) => {
                if (result.status.code === 200) {
                    this.setState({
                        queue: result.data.playlist
                    })
                }
                if (result.status.code === 404) {
                    fetch(process.env.REACT_APP_DB_URL + '/api/sessions/', {
                        method: 'POST',
                        body: JSON.stringify({
                            room_name: this.props.room,
                            playlist: []
                        }),
                        headers: {'Content-Type': 'application/json'}
                    }).then((res) => {
                        return res.json();
                    }).then((data) => {
                        console.log(data);
                    }).catch((err) => {console.error({'Error': err})});
                }
            }).catch((err) => {console.error({'Error': err})});
        } catch(err) {
            console.log(err);
        }

        //Listener for playlists added by all users via socket.io
        this.props.socket.on('add-playlist', (res) => {
            console.log("receiving video to queue");
            let queueBuffer = [...this.state.queue];
            queueBuffer.push(res);
            this.setState({
                queue: queueBuffer
            });
            console.log("finished receiving video to queue");
        });

        //listener for when video are paused or not
        this.props.socket.on('player-state', (res) => {
            console.log(res);
            if (res.playerState === 1)
                this.youTubeElem.playVideo();
            else if (res.playerState === 2)
                this.youTubeElem.pauseVideo();
        });
        
        //updates current users state when someone joins or leaves
        this.props.socket.on('connection', (res) => {
            this.props.connectedUsersChanged(res.connected_users);
        })

        //listener for next video trigger
        this.props.socket.on('next-video', (res) => {
            console.log("received next-video from socketio");
            if (res)
                this.nextVideo();
            console.log("finished next-video from socketio");
        })

        //listener for force next video trigger
        this.props.socket.on('force-next-video', (res) => {
            console.log('A User Have Reached An Error ' + res.error)
            if (res)
                this.onEnd();
        })
    }

    onReady = (event) => {
        this.youTubeElem = event.target;
        this.youTubeElem.stopVideo();
    }

    broadcastToQueue = (result) => {
        try{
            fetch(process.env.REACT_APP_DB_URL + '/api/sessions/' + this.props.room, {
                method: 'PUT',
                body: JSON.stringify({
                    username: this.props.username,
                    video: result
                }),
                headers: {'Content-Type': 'application/json'}
            }).then((res) => {
                return res.json();
            }).then((data) => {
                this.props.socket.emit('add-playlist', {
                    username: this.props.username,
                    room: this.props.room, 
                    video: result}
                );
            }).catch((err) => {console.error({'Error': err})});
        } catch(err){ console.log(err) }
    }

    nextVideo = () => {
        console.log("starting nextVideo()");
        let queueBuffer = [...this.state.queue];
        queueBuffer = queueBuffer.slice(1);
        console.log(queueBuffer);
        this.setState({
            queue: queueBuffer,
            hasVoted: ''
        });
        try{
            fetch(process.env.REACT_APP_DB_URL + '/api/sessions/' + this.props.room + '/nextVideo', {
                method: 'DELETE'
            }).then((res) => {
                return res.json();
            }).then((data) => {
                console.log(data);
            }).catch((err) => {console.error({'Error': err})});
        } catch(err){ console.log(err) }
        if (queueBuffer.length) {
            console.log(queueBuffer[0].video);
            this.youTubeElem.playVideo();
        }
        else {
            this.youTubeElem.stopVideo();
        }
        console.log("finished nextVideo()");
    }

    changeHasVoted = (vote) => {
        this.setState({
            hasVoted: vote
        })
    };

    onEnd = () => {
        console.log("onEnd() begins - send to socket io");
        this.props.socket.emit('next-video', {room: this.props.room});
        console.log("onEnd() ends");
    }
    
    onError = (event) => {
        console.log("ERROR Loading Video, Code " + event.data)
        this.props.socket.emit('buffer-states', {room: this.props.room, error: true})
    }
    
    playPause = () => {
        if (this.state.playerState === 1)
            this.props.socket.emit('player-state', {
                playerState: 2,
                room: this.props.room
            })
        else if (this.state.playerState === 2) {
            this.props.socket.emit('player-state', {
                playerState: 1,
                room: this.props.room
            })
        }
    }

    onStateChange = (event) => {
        if (this.state.playerState === 3 && event.target.getPlayerState() === 1) 
            this.props.socket.emit('buffer-states', {room: this.props.room, error: false})
        console.log(event.target.getPlayerState());
        this.setState({
            playerState: event.target.getPlayerState()
        });
    }

    render() {
        let currentVideoID;
        if (!this.state.queue.length) {
            currentVideoID = null;
        }
        else {
            currentVideoID = this.state.queue[0].video.id.videoId
        };
        
        return (
            <div id="player">
                <div className="video">
                    <YouTube
                        id="YouTube-Video"
                        videoId={currentVideoID}
                        opts={this.state.opts}
                        onReady={this.onReady}
                        onStateChange={this.onStateChange}
                        onEnd={this.onEnd}
                        onError={this.onError}
                    />
                    {
                        currentVideoID
                        ? <h3 className="video-title">{this.state.queue[0].video.snippet.title}</h3>
                        : <></>
                    }
                    {
                        currentVideoID
                        ? <Vote
                            room={this.props.room}
                            nextVideo={this.nextVideo}
                            hasVoted={this.state.hasVoted}
                            changeHasVoted={this.changeHasVoted}
                            socket={this.props.socket}/>
                        : <></>
                    }
                    {
                        currentVideoID
                        ? <Button
                            id="play-pause" 
                            circular
                            icon={
                                this.state.playerState === 1
                                ? {name: "pause", size: "big"}
                                : {name: "play", size: "big"}
                            } 
                            inverted color="black" 
                            type="button" 
                            onClick={this.playPause} />
                        : <></>
                    }
                </div>
                <div id="video-lists">
                    <div id="queue">
                        <h4 id="playlist-title">Playlist</h4>
                        <List inverted>
                            {
                                this.state.queue.map((item) => {
                                    return (
                                        <div className="queue-item">
                                            <List.Item id={item.video.id.videoId}>
                                                <div className="queue-item-contents">
                                                    <img src={item.video.snippet.thumbnails.default.url} />
                                                    <p>{this.state.queue.indexOf(item) + 1}. {item.video.snippet.title}</p>
                                                    <p>Added by {item.username}</p>
                                                </div>
                                            </List.Item>
                                        </div>
                                    );
                                })
                            }
                        </List>
                    </div>
                    <Search addToQueue={this.broadcastToQueue}/>
                </div>
            </div>
        );
    }
}

export default Player;
