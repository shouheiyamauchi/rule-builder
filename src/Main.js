import React, { Component } from 'react';
import './App.css';
import App from './RuleBuilder/containers/App';

class Main extends Component {
  render() {
    return (
      <div style={{'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center', 'height': '100vh'}}>
        <div style={{'width': '840px', 'border': 'solid 1px black', 'padding': '15px'}}>
          <App />
        </div>
      </div>
    );
  }
}

export default Main;
