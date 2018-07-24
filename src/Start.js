import React from 'react';
import JestRunner from './jest-runner';

import {
    TEACHER,
    STUDENT,
} from './constants'

class Start extends React.Component {
    constructor() {
        super();
        const projectsJSON = window.localStorage.getItem('projects');
        this.state = {
            userRole: null,
            selectedProject: null,
            step: 0,
            projects: projectsJSON ? JSON.parse(projectsJSON) : []
        };
    }
    resetState = () => {
        const projectsJSON = window.localStorage.getItem('projects');
        this.setState({
            userRole: null,
            selectedProject: null,
            step: 0,
            projects: projectsJSON ? JSON.parse(projectsJSON) : []
        })
    }
    handleState = (key, value) => {
        this.setState({ [key]: value, step: this.state.step + 1 })
    }

    render() {
        const { userRole, step, projects, selectedProject } = this.state;
        return (

            <div className="super">
                {
                    step === 0 &&
                    <div className="start-wrap">
                        <div>
                            <h3 style={{ fontSize: '30px', color: 'white' }}>Select Role</h3>
                        </div>
                        <div style={{ height: '40px' }}>
                        </div>
                        <div>
                            <button className="bigBtn" style={{ float: 'none' }} onClick={() => this.handleState('userRole', TEACHER)} >Teacher</button>
                        </div>
                        <div>
                            <button className="bigBtn" style={{ float: 'none' }} onClick={() => this.handleState('userRole', STUDENT)} >Student</button>
                        </div>
                    </div>
                }
                {
                    step === 1 &&
                    <div className="start-wrap">
                        <div>
                            <h3 style={{ fontSize: '30px', color: 'white' }}>Select Project</h3>
                        </div>
                        <div style={{ height: '40px' }}>
                        </div>
                        {projects.map(p => (
                            <div key={p.timestamp}>
                                <button className="bigBtn" style={{ float: 'none' }} onClick={() => this.handleState('selectedProject', p)} >{getDateFormat(p.timestamp)}</button>
                            </div>)
                        )
                        }
                        {projects.length === 0 &&
                            <div>
                                <h3 style={{ fontSize: '30px', color: 'white' }}>No Project yet.</h3>
                            </div>

                        }
                        {userRole === TEACHER &&
                            <div >
                                <button className="bigBtn" style={{ float: 'none' }} onClick={() => this.handleState('selectedProject', { timestamp: Date.now(), files: [] })} >New</button>
                            </div>}
                    </div>
                }
                {
                    step === 2 && <JestRunner project={selectedProject} userRole={userRole} exit={this.resetState} />

                }
            </div>

        )
    }

}

export default Start;

const getDateFormat = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}