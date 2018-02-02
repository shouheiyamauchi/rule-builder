import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MainContainer from './MainContainer'
import { DragDropContext } from 'react-dnd';
import { default as TouchBackend } from 'react-dnd-touch-backend';

class TouchContainer extends Component {
  static propTypes = {
    components: PropTypes.object.isRequired,
    parentRule: PropTypes.object.isRequired,
    rules: PropTypes.object.isRequired,
    variables: PropTypes.object.isRequired,
    selectLogicSet: PropTypes.func.isRequired
  }

  render() {
    return <MainContainer {...this.props} selectLogicSet={this.props.selectLogicSet} />
  }
}

export default DragDropContext(TouchBackend)(TouchContainer);
