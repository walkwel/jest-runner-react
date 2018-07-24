import React from 'react';

class GithubForm extends React.Component {
    constructor() {
        super();
        this.state = {
            githubURL: ''
        }
    }
    handleChange = (e) => {
        this.setState({ githubURL: e.target.value })
    }
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.handleSubmit(this.state.githubURL);
    }
    render() {
        return (
            <form onSubmit={this.handleSubmit} className="githubForm">
                <input value={this.state.githubURL} onChange={this.handleChange} placeholder="Enter github URL" type="text" className="file2" />
                <button type='submit' className="bigBtn">
                    <i className="fab fa-github"></i>
                </button>
            </form>
        );
    }
}

export default GithubForm;