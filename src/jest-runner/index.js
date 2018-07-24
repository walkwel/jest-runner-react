import React from 'react';
import GithubForm from './components/GithubForm';
import FileDirectory from './components/FileDirectory';
import Output from './components/Output';
import Editor from './components/Editor';
import Loader from './components/Loader';
import Notification from './components/Notification';

import {
    GITHUB_BASE_URL,
    GITHUB_SERVER_URL,
    RAW_GIT_URL,
    AWS_SERVER_URL,
    GITHUB_ACCESS_TOKEN,
    TEACHER,
    STUDENT,
} from '../constants'

class JestRunner extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userRole: null,
            loading: false,
            output: null,
            notificationMsg: '',
            repoDetails: {},
            selectedFile: null,
            editorContent: '',
            files: [],
            project: null
        };
    }
    componentDidMount(){
        this.setState({
            userRole: this.props.userRole,
            selectedFile: this.props.project.files && this.props.project.files.length > 0 ? this.props.project.files.find(f => f.type !== 'dir') : null,
            files: this.props.project.files || [],
            project: this.props.project
        })
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            userRole: nextProps.userRole,
            selectedFile: nextProps.project.files && nextProps.project.files.length > 0 ? nextProps.project.files.find(f => f.type !== 'dir') : null,
            files: nextProps.project.files || [],
            project: nextProps.project
        })
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
    runTests = () => {
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
                console.log('server response', data);
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
    handleDeleteFile = (file) => {
        const hasOkay = window.confirm(`Are you sure to delete <${file.path}>?`);
        if (hasOkay) {
            this.setState({
                files: this.state.files.filter(f => f.path !== file.path)
            })
            if (this.state.selectedFile.path === file.path) {
                this.setState({
                    selectedFile: this.state.files.length > 0 ? this.state.files.find(f => f.type !== 'dir' && f.path !== file.path) : null
                })
            }
        }
    }
    handelFileSubmit = (file) => {
        const files = this.state.files;
        const paths = file.path.split('/');
        files.push({
            path: file.path,
            code: file.code || '',
            name: paths.length > 0 ? paths[paths.length - 1] : '',
            readOnly: false,
            type: 'file'
        });
        this.setState({ files });
    }
    handleCheckbox = (file) => {
        this.setState({
            files: this.state.files.map(f => f.path === file.path ? { ...f, readOnly: !f.readOnly } : f),
            selectedFile: { ...this.state.selectedFile, readOnly: !this.state.selectedFile.readOnly }
        })
    }
    saveAllFiles = () => {
        const projectJSON = window.localStorage.getItem('projects');
        let projects = projectJSON ? JSON.parse(projectJSON) : [];
        const existedProject = projects.find(p => p.timestamp === this.state.project.timestamp);
        if (existedProject) {
            projects = projects.map(p => p.timestamp === this.state.project.timestamp ? { ...this.state.project, files: this.state.files } : p)
        } else {
            projects.push({
                timestamp: this.state.project.timestamp,
                files: this.state.files
            })
        }

        window.localStorage.setItem('projects', JSON.stringify(projects));
        this.showNotification('Project Saved.');
    }
    render() {
        const { output, loading, notificationMsg, files, selectedFile, repoDetails, userRole } = this.state;
        return (
            <div>

                {userRole === TEACHER &&
                    <GithubForm handleSubmit={this.handelGithubURlSubmit} />
                }
                <br />
                {
                    // // files.length == 0 &&
                    // false &&
                    // <div className="github-poster">
                    //     <i className="fab fa-github"></i>
                    // </div>
                }

                <div className="title">
                    {/* {repoDetails.owner
                        && <h3 style={{ color: '#b3b9bf', padding: '2px' }}>{
                            `${repoDetails.owner}/${repoDetails.name}/`}{selectedFile && (<span style={{ color: 'white' }}>{selectedFile.path}</span>)
                            } </h3>
                    } */}
                    {
                        userRole === TEACHER
                            ? <h3 style={{ color: '#b3b9bf', padding: '2px' }}><i className="fas fa-check-square"></i> Select Checkbox for read only file. </h3>
                            : <h3 style={{ color: '#b3b9bf', padding: '2px' }}>Only <i className="fas fa-edit"></i> are editable.</h3>
                    }
                    <a className="pointer" onClick={this.props.exit}><h3><i className="fas fa-power-off"></i></h3></a>
                </div>
                <div className="mainWrap" >

                    <div className="container" >
                        <FileDirectory files={files} userRole={userRole} selectedFile={selectedFile} openFile={this.openFile} handleSubmit={this.handelFileSubmit} deleteFile={this.handleDeleteFile} handleCheckbox={this.handleCheckbox} />
                        {<Editor selectedFile={selectedFile} saveFile={this.saveFile} />}
                    </div>


                    <div style={{ height: '97px' }}>
                        {userRole === STUDENT
                            ? <button className="bigBtn" onClick={this.runTests}>Run Tests</button>
                            : <button className="bigBtn" onClick={this.saveAllFiles}>Save Files</button>
                        }

                    </div>

                </div>
                {output && <Output output={output} />}
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