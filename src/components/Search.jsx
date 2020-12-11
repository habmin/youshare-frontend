import React, { Component } from 'react';
import { Input, Icon, List }from 'semantic-ui-react';
import './Search.css';
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
        + this.state.query + '&maxResults=15&type=video&videoEmbeddable=true&key=' 
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
            <div id="search-container">
                <Input fluid action={{color: "inverted red", icon: 'search', onClick: this.searchResults }}type="text" name="query" onChange={this.handleChange} placeholder="Search For Videos" />
                <List inverted>
                    <div id="search-results">
                    {
                        this.state.searchResults.map((result) => {
                            return (
                                <List.Item id={result.id.videoId}>
                                    <div className="search-item-contents">
                                        <img src={result.snippet.thumbnails.default.url} />
                                        <p>{result.snippet.title}</p>
                                        <Icon style={{"text-align": "right"}}size="big" inverted color="red" name="plus circle" onClick={() => this.props.addToQueue(result)} />
                                    </div>
                                </List.Item>
                            );
                        })
                    }
                    </div>
                </List>
            </div>
        );
    }
}

export default Search;
