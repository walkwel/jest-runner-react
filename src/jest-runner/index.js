import React from 'react';
import GithubForm from './components/GithubForm';
import FileDirectory from './components/FileDirectory';
import Output from './components/Output';
import Editor from './components/Editor';
import Loader from './components/Loader';
import Notification from './components/Notification';

const ENCODED_GITHUB_ACCESS_TOKEN = 'NDlmNDE5OWM0MGNmM2Q1OTA1NTEwOTM3OWFiMzhmOGExYjcwMTE2Yw==';
const GITHUB_BASE_URL = 'https://github.com/';
const GITHUB_SERVER_URL = 'https://api.github.com';
const RAW_GIT_URL = 'https://raw.githubusercontent.com';
const AWS_SERVER_URL = 'https://dgiy2j88ll.execute-api.us-east-1.amazonaws.com/dev/helloTest'
const GITHUB_ACCESS_TOKEN = atob(ENCODED_GITHUB_ACCESS_TOKEN);

class JestRunner extends React.Component {
    constructor() {
        super();
        this.state = {
            loading: false,
            output: null,
            notificationMsg: '',
            repoDetails: {},
            selectedFile: null,
            editorContent: '',
            files: []
        };
    }
    setRepoDetails = (details = {}) => {
        this.setState({ repoDetails: details })
    }
    showNotification = (message) => {
        this.setState({ notificationMsg: message });
    }
    showLoading = () => {
        this.setState({ loading: true });
    }
    hideLoading = () => {
        this.setState({ loading: false });
    }
    showOutput = (output) => {
        this.setState({ output: output });
    }
    hideOutput = () => {
        this.setState({ output: null });
    }
    handleError = (err = {}) => {
        console.log('error', err);
        this.showNotification('Error');
        this.hideLoading();
    }
    handelGithubURlSubmit = (url) => {
        if (!url.includes(GITHUB_BASE_URL)) {
            this.showNotification('Not a Valid Github URL');
            return;
        }
        this.showLoading();
        const params = url.replace(GITHUB_BASE_URL, '').split('/');
        let repoOwner = params[0];
        let repoName = params[1];
        let subPath = '';
        if (params.length > 4) {
            for (let i = 4; i < params.length; i++) {
                subPath = `${subPath}/${params[i]}`;
            }
        }
        fetchDirectoryStructureFromGitub(`${GITHUB_SERVER_URL}/repos/${repoOwner}/${repoName}/contents${subPath}`)
            .then(files => {
                if (files && files.length) {
                    this.hideOutput();
                    this.setRepoDetails({
                        owner: repoOwner,
                        name: repoName,
                        folderPath: subPath,
                        url: url
                    })
                    this.setState({
                        selectedFile: null,
                        files: files,
                        editorContent: ''
                    })
                    this.fetchWholeTree(-1);
                } else {
                    this.handleError();
                }
            })
            .catch(err => this.hideLoading(err))
    }
    fetchWholeTree = (fileIndex = -1) => {
        let folderToFetch = null, index = 0;
        for (index = fileIndex + 1; index < this.state.files.length; index++) {
            const file = this.state.files[index];
            if (file.type == 'dir') {
                folderToFetch = file;
                break;
            }
        }
        console.log(folderToFetch);
        if (folderToFetch) {
            fetchDirectoryStructureFromGitub(`${GITHUB_SERVER_URL}/repos/${this.state.repoDetails.owner}/${this.state.repoDetails.name}/contents${folderToFetch.path}`)
                .then(tree => {
                    if (tree && tree.length) {
                        this.setState({ files: [...this.state.files, ...tree] })
                        this.fetchWholeTree(index);
                    } else {
                        this.handleError();
                    }
                })
                .catch(err => this.hideLoader(err))
        } else {
            // this.hideLoader();
            console.log(this.state.files);
            this.fetchWholeCode();
        }
    }

    fetchWholeCode = (fileIndex = -1) => {
        let fileToFetch = null;
        for (let index in this.state.files) {
            const file = this.state.files[index];
            if (file.type !== 'dir' && parseInt(index) > parseInt(fileIndex)) {
                fileToFetch = { ...file, index };
                break;
            }
        }
        if (fileToFetch) {
            fetch(`${RAW_GIT_URL}/${this.state.repoDetails.owner}/${this.state.repoDetails.name}/master/${fileToFetch.path}`)
                .then(response => response.text())
                .then(code => {
                    this.setState({
                        files: this.state.files.map((f, i) => i == fileToFetch.index ? { ...f, code } : f)
                    })
                    this.fetchWholeCode(fileToFetch.index);

                })
                .catch(err => {
                    console.log('error', err);
                    this.showNotification('err');
                    this.hideLoading();
                })
        } else {
            const firstFile = this.state.files.find(f => f.type !== 'dir');
            if (firstFile) {
                //this.openFile(firstFile.path);
                this.setState({ selectedFile: firstFile })
            }
            this.hideLoading();
        }
    }
    openFile = (filePath) => {
        const selectedFile = this.state.files.find(file => file.path === filePath);
        if (selectedFile) {
            this.setState({ selectedFile })
        }
    }
    saveFile = (file, code) => {
        this.setState({ files: this.state.files.map(f => f.path == file.path ? { ...f, code } : f) })
    }
    postFiles = () => {
        this.hideOutput();
        // this.saveFile();
        let body = {}
        if (this.state.files.length === 0) {
            return;
        }
        this.state.files.forEach(file => {
            if (file.type !== 'dir') {
                const fileName = this.state.repoDetails.folderPath ? file.path.replace(`${this.state.repoDetails.folderPath.slice(1)}/`, '') : file.path;
                body[fileName] = file.code;
            }
        })
        this.showLoading();
        fetch(AWS_SERVER_URL, {
            method: 'POST',
            body: JSON.stringify({ files: body }),
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
        })
            .then(response => response.json())
            .then(data => {
                console.log('server response', data, JSON.stringify(data));
                if (data.message && data.message === 'Internal server error') {
                    // this.showOutput(data.message);

                } else {
                    this.showOutput(data.results);
                }
                this.hideLoading();
            })
            .catch(err => {
                this.handleError(err);
                // this.showResult(err.message);
            })
    }
    render() {
        const { output, loading, notificationMsg, files, selectedFile, repoDetails } = this.state;
        return (
            <div>
                <div className="super">

                    <GithubForm handleSubmit={this.handelGithubURlSubmit} />
                    <br />
                    {
                        files.length == 0 &&
                        <div style={{
                            textAlign: 'center',
                            color: 'white',
                            fontSize: '227px',
                            padding: '190px',
                            height: 'calc(100vh - 136x)'
                        }}>
                            <i class="fab fa-github"></i>
                        </div>
                    }
                    {repoDetails.owner && <div id="title">
                        <h3 style={{ color: '#b3b9bf', padding: '2px' }}>{`${repoDetails.owner}/${repoDetails.name}/`}{selectedFile && (<span style={{ color: 'white' }}>{selectedFile.path}</span>)} </h3>
                    </div>}

                    {files.length > 0 &&
                        <div className="mainWrap" id="editor-panel">

                            <div className="container" id="container">
                                <FileDirectory files={files} selectedFile={selectedFile} openFile={this.openFile} />
                                <Editor selectedFile={selectedFile} saveFile={this.saveFile} />
                            </div>

                            <div style={{ height: '97px' }}>
                                <button className="bigBtn" id="postButton" onClick={this.postFiles}>Run Tests</button>
                            </div>

                        </div>}
                    {output && <Output output={output} />}
                </div>
                {loading && <Loader />}
                <Notification message={notificationMsg} />
            </div>)
    }

}

export default JestRunner;

export const fetchDirectoryStructureFromGitub = (url) => {
    return fetch(`${url}?access_token=${GITHUB_ACCESS_TOKEN}`)
        .then(response => response.json())
}