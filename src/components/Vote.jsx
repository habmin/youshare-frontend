import React, { Component } from 'react';

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
        console.log(this.props.hasVoted);
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
                <button type="button" id="thumbs-up" onClick={this.voteButton}>👍</button>
                <button type="button" id="thumbs-down" onClick={this.voteButton}>👎</button>
            </div>
        )
    }
}

export default Vote;
