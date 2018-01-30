import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MainContainer from './MainContainer'
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

class MouseContainer extends Component {
  static propTypes = {
    components: PropTypes.object.isRequired,
    parentRule: PropTypes.object.isRequired,
    rules: PropTypes.object.isRequired,
    variableTemplateItems: PropTypes.object.isRequired
  }

  render() {
    return <MainContainer {...this.props}/>
  }
}

export default DragDropContext(HTML5Backend)(MouseContainer);
