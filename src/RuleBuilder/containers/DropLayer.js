import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
import ItemTypes from '../config/ItemTypes';

const dropLayerTarget = {
	hover(props, monitor, component) {
    // prevent executing on parent containers
		if (!monitor.isOver({ shallow: true })) return;

		props.moveElement(props, monitor, ItemTypes.DROP_LAYER);
	},
}

class DropLayer extends Component {
	static propTypes = {
		moveElement: PropTypes.func.isRequired,
		id: PropTypes.string.isRequired
	}

	render() {
		const {
			connectDropTarget,
			children
		} = this.props

		return connectDropTarget(
			<div id="rule-builder-id-drop-layer" style={{border: '1px solid black', height: '150px'}}>
				{children}
			</div>
		);
	}
}

export default DropTarget([ItemTypes.BRACKET, ItemTypes.LOGIC_ELEMENT, ItemTypes.TEMPLATE_ITEM], dropLayerTarget, connect => ({
	connectDropTarget: connect.dropTarget()
}))(DropLayer);
