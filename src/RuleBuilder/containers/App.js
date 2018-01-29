import React, { Component } from 'react';
import Switch from "react-switch";
import MouseContainer from './MouseContainer'
import TouchContainer from './TouchContainer'

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      touchMode: false
    };
  }

  toggleTouchMode = () => {
    this.setState({touchMode: !this.state.touchMode});
  }

  render() {
    const props = {
      components: {},
      parentRule: {},
      rules: {},
      variableTemplateItems: {
        '#1': {
          value: '#1',
          title: 'Variable 1',
          color: 'green'
        },
        '#2': {
          value: '#2',
          title: 'Variable 2',
          color: '#fff000'
        },
        '#3': {
          value: '#3',
          title: 'Variable 3',
          color: 'pink'
        }
      }
    }

    return (
      <div>
        <div style={{float: 'right', display: 'flex', justifyContent: 'center'}}>
          Touch Screen Mode:&nbsp;&nbsp;
          <Switch
            checked={this.state.touchMode}
            onChange={this.toggleTouchMode}
            onColor="#86d3ff"
            onHandleColor="#2693e6"
            handleDiameter={15}
            uncheckedIcon={false}
            checkedIcon={false}
            boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
            activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
            height={10}
            width={24}
            className="react-switch"
            id="material-switch"
          />
          <br />
          <br />
        </div>
        {this.state.touchMode ? <TouchContainer {...props} /> : <MouseContainer {...props} />}
      </div>
    );
  }
}

export default App;
