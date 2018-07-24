import React from 'react';
import {
    TEACHER,
    STUDENT,
} from '../../constants'

class FileDirectory extends React.Component {
    constructor() {
        super();
        this.state = {
            newFile: {
                path: ''
            }
        }
    }
    handleChange = (e) => {
        this.setState({ newFile: { ...this.state.newFile, path: e.target.value.trim() } })
    }
    resetState = () => {
        this.setState({ newFile: { path: '' } })
    }
    handleSubmit = (e) => {
        e.preventDefault();
        if (this.state.newFile.path === '') {
            return;
        }
        const existedFileWithSamePath = this.props.files.find(f => f.path === this.state.newFile.path);
        if (existedFileWithSamePath) {
            alert('File Already Exist.')
        } else {
            this.props.handleSubmit(this.state.newFile);
            this.resetState();
        }

    }
    render() {
        const { userRole, files, selectedFile } = this.props;
        return (
            <div className="sidebar">
                {userRole === TEACHER &&
                    <form onSubmit={this.handleSubmit}>
                        <input value={this.state.newFile.path} onChange={this.handleChange} placeholder="New File" type="text" className="file2" />
                    </form>
                }
                {files.map(file => file.type !== 'dir' && (
                    <div key={file.path} className={selectedFile && selectedFile.path == file.path ? "file1 file-wrap active-file" : "file1 file-wrap"}>
                        <a className="pointer" onClick={() => this.props.openFile(file.path)}>
                            {userRole === STUDENT
                                ? (file.readOnly ? <i className="fas fa-file-alt"></i> : <i className="fas fa-edit"></i>)
                                : <input type="checkbox"name="readonly" checked={file.readOnly} value={file.readOnly} onChange={()=>this.props.handleCheckbox(file)} />
                            }
                            {' '+file.path}
                        </a>
                        {userRole === TEACHER &&
                            <a className="pointer trash" onClick={() => this.props.deleteFile(file)}><i className="fas fa-trash"></i> </a>
                        }
                    </div>
                ))}

            </div>
        )
        return
    }
}

export default FileDirectory;