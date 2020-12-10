import React, { Component } from 'react';
//import io from 'socket.io-client';
//import { BrowserRouter as Router, Route, Link, Switch, } from 'react-router-dom';

class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query: '',
            searchResults: []
        }
    };

    searchResults = () => {
        console.log(this.state.query);
        fetch('https://youtube.googleapis.com/youtube/v3/search?part=id,snippet&q=' 
        + this.state.query + '&maxResults=5&type=video&videoEmbeddable=true&key=' 
        + process.env.REACT_APP_API_KEY).then((res) => {
            return res.json();
        }).then((data) => {
            this.setState({
                searchResults: data.items
            });
        })
    }

    handleChange = (event) =>
        this.setState({
            [event.target.name]: event.target.value
    });

    render() {
        return (
            <div className="playlist">
                <div className="search">
                    <input type="text" name="query" onChange={this.handleChange} placeholder="Search For Videos" />
                    <button type="button" onClick={this.searchResults}>Search YouTube</button>
                </div>
                <div className="search-results"></div>
                    <ul>
                        {
                            this.state.searchResults.map((result) => {
                                return (
                                    <div className="result-item" id={result.id.videoId}>
                                        <li>
                                            <img src={result.snippet.thumbnails.default.url} />
                                            <p>{result.snippet.title}</p>
                                            <button onClick={() => this.props.addToQueue(result)}>+</button>
                                        </li>
                                    </div>
                                );
                            })
                        }
                    </ul>
            </div>
        );
    }
}

export default Search;
