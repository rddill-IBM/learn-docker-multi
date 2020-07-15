import React, { Component } from 'react';
import axios from 'axios';

class Fib extends Component {
    state = {
        seenIndexes: [],
        values: {},
        index: ''
    };

    componentDidMount() {
        this.fetchValues();
        this.fetchIndexes();
    }

    async fetchValues() {
        let values = await axios.get('/api/values/current');
        this.setState({ values: values.data });
    }

    async fetchIndexes() {
        let seenIndexes = {};
        seenIndexes.data = [];
        try {
            seenIndexes = await axios.get('/api/values/all');
        } catch(error) {
            console.log('fetchIndexes error: ', error);
        }
        this.setState({
            seenIndexes: seenIndexes.data
        });
    }

    handleSubmit = async event => {
        event.preventDefault();
        if (parseInt(this.state.index) > 0) {
            await axios.post('/api/values', {
                index: this.state.index
            });
            this.setState({ index: '' });
        }
    };

    renderSeenIndexes() {
        return this.state.seenIndexes.map(({ number }) => number).join(', ');
    }

    renderValues() {
        let entries = [];

        for (let key in this.state.values) {
            entries.push(
                <div key={key}>
                    For index {key} I calculated {this.state.values[key]}
                </div>
            );
        }

        return entries;
    }

    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <label>Enter your index:</label>
                    <input 
                    value={this.state.index}
                    onChange={event => this.setState({ index: event.target.value })}
                        />
                    <button>Submit</button>
                </form>

                <h3>Indexes I have seen:</h3>
                {this.renderSeenIndexes()}

                <h3>Calculated Values:</h3>
                {this.renderValues()}
            </div>
        );
    }
}

export default Fib;
