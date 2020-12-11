import React, { Component } from 'react';
import { Button }from 'semantic-ui-react';
import './Vote.css';

class Vote extends Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.props.socket.on('voting', (res) => {
            console.log("is it " + res);
            if (res) {
                this.props.nextVideo();
            };
        });
    }

    //prevents multiple listeners from propagating when component is constructed
    componentWillUnmount() {
        this.props.socket.off('voting')
    }
    voteButton = (event) => {
        if (this.props.hasVoted !== event.target.id) {
            if (this.props.hasVoted === 'thumbs-down')
                this.props.socket.emit('voting', {room: this.props.room, negativeVotes: -1});
            if (event.target.id === 'thumbs-down')
                this.props.socket.emit('voting', {room: this.props.room, negativeVotes: 1})
            this.props.changeHasVoted(event.target.id);
        }
    }

    render() {
        return (
            <div className="vote-bar">
                <Button 
                    fluid
                    inverted={
                        this.props.hasVoted === 'thumbs-up'
                        ? false
                        : true
                    }
                    color="green" 
                    type="button" 
                    id="thumbs-up" 
                    icon={{name: "thumbs up outline", size: "big"}} 
                    onClick={this.voteButton} />
                <Button 
                    fluid 
                    inverted={
                        this.props.hasVoted === 'thumbs-down'
                        ? false
                        : true
                    }
                    color="red" 
                    type="button" 
                    id="thumbs-down" 
                    icon={{name: "thumbs down outline", size: "big"}} 
                    onClick={this.voteButton} />
            </div>
        )
    }
}

export default Vote;
