import React from 'react';

class Ouptut extends React.Component {
    constructor() {
        super();
        this.state = {}
    }
    render() {
        const { output } = this.props;
        return (
            <div className="result-div">
                <div className="wrap p-10">
                    <h2>Test Result</h2>
                    <div className="status">
                        <span className="error"> {output.numFailedTests} <i className="fas fa-times-circle"></i></span>
                        <span className="success"> {output.numPassedTests} <i className="fas fa-check-circle"></i></span>
                    </div>
                </div>
                <div className="result-logs">
                    {
                        output.testResults.map((r, rIndex) => {
                            return r.testResults.map((result, index) => {
                                return (
                                    <div key={(rIndex + 1) * (1 + index)}>
                                        <div className="log">

                                            <div className="log-status" style={{ color: result.status === 'failed' ? 'red' : 'green' }}>
                                                {index + 1}  {result.status === 'failed' ? <i className="fas fa-times-circle"></i> : <i className="fas fa-check-circle"></i>}
                                            </div>

                                            <div className="log-describe" style={{ color: result.status === 'failed' ? 'red' : 'green' }}>
                                                {result.ancestorTitles && result.ancestorTitles.length ? result.ancestorTitles.reduce((a, b) => a + ' ' + b) : ''}
                                            </div>

                                            <div className="log-expect">
                                                {result.title || 'Not described'}
                                            </div>

                                            <div className="log-time">
                                                {result.duration} ms
                                            </div>

                                        </div>
                                        {result.failureMessages.length > 0 &&
                                            <div class="log-err console">
                                                <pre>{result.failureMessages}</pre>
                                            </div>}
                                    </div>)
                            })
                        })
                    }
                </div>
                {
                    <div className="mainWrap">
                        <h4 style={{ color: 'white', padding: '11px' }}>Complete Logs </h4>
                        {
                            output.testResults.map((r, rIndex) => {
                                return (r.failureMessage && r.failureMessage.length > 0 &&
                                    <pre key={rIndex + 1} className="console">{r.failureMessage}</pre>
                                )
                            })
                        }
                        {
                            output.success &&
                            <pre className="console">All Test Passed.</pre>

                        }
                    </div>
                }


            </div>);
    }
}

export default Ouptut;