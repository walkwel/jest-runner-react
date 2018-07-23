import React from 'react';

class FileDirectory extends React.Component {
    constructor() {
        super();
        this.state = {}
    }
    render() {
        return (
            <div className="sidebar">
                {this.props.files.map(file => file.type !== 'dir' && (
                    <a key={file.path} className={this.props.selectedFile && this.props.selectedFile.path == file.path ? "file1 pointer active-file" : "file1 pointer"} onClick={() => this.props.openFile(file.path)}><i className="fas fa-file-alt"></i> {file.path}</a>
                ))}
            </div>
        )
        return
    }
}

export default FileDirectory;