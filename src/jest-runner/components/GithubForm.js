import React from 'react';

class GithubForm extends React.Component {
    constructor() {
        super();
        this.state = {
            githubURL: ''
        }
    }
    handleKeyDown = (e) => {
        console.log(e)
        this.setState({ githubURL: e.target.value })
    }
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.handleSubmit(this.state.githubURL);
    }
    render() {
        return (
            <form onSubmit={this.handleSubmit} id="githubForm">
                <input value={this.state.githubURL} onChange={this.handleKeyDown} placeholder="Enter github URL" type="text" className="file2" />
                <button type='submit' className="bigBtn" id="github">
                    <i className="fab fa-github"></i>
                </button>
            </form>
        );
    }
}

export default GithubForm;