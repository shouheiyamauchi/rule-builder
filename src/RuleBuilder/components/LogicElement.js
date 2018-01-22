import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import flow from 'lodash/flow';
import { DragSource, DropTarget } from 'react-dnd';
import ItemTypes from '../config/ItemTypes';
import ItemCss from '../config/ItemCss';
import Bracket from './Bracket';
import NumberElement from './NumberElement';

const logicElementSource = {
	beginDrag(props) {
		props.updateDragging(props.id);
		return {
			id: props.id
		};
	},
	endDrag(props) {
		props.updateDragging(null);
	}
}

const logicElementTarget = {
	hover(props, monitor, component) {
    // prevent executing on parent containers
		if (!monitor.isOver({ shallow: true })) return;

		props.moveElement(props, monitor, ItemTypes.LOGIC_ELEMENT);
	},
}

class LogicElement extends Component {
	static propTypes = {
		connectDragSource: PropTypes.func.isRequired,
		connectDropTarget: PropTypes.func.isRequired,
		draggingId: PropTypes.number,
    updateDragging: PropTypes.func.isRequired,
		id: PropTypes.number.isRequired,
		type: PropTypes.string.isRequired,
		value: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.array
		]).isRequired,
		componentTemplateItems: PropTypes.object.isRequired,
		variableTemplateItems: PropTypes.object.isRequired,
		moveElement: PropTypes.func.isRequired,
		editingId: PropTypes.number,
		changeNumber: PropTypes.func.isRequired,
		renderIcon: PropTypes.func.isRequired,
		getElementType: PropTypes.func.isRequired
	}

	renderObject = props => {
		const style = _.clone(ItemCss.logicElementStyle);

		const {
			draggingId,
			updateDragging,
			id,
			type,
			value,
      componentTemplateItems,
      variableTemplateItems,
			moveElement,
			editingId,
			changeNumber,
			renderIcon,
			getElementType
		} = props;

		const opacity = id === draggingId ? 0.5 : 1;

		style.backgroundColor = ItemCss.backgroundColor[type];

		if (type === 'operator' || type === 'comparison') {
			return (
				<div style={{ opacity }} id={'rule-builder-id-' + id}>
					<div style={style}>
						{renderIcon(value)}
					</div>
				</div>
			);
		} else if (type === 'component') {
			style.backgroundColor = componentTemplateItems[value.substr(1)].color
			return (
				<div style={{ opacity }} id={'rule-builder-id-' + id}>
					<div style={style}>
						{componentTemplateItems[value.substr(1)].value}
					</div>
				</div>
			);
		} else if (type === 'variable') {
			style.backgroundColor = variableTemplateItems[value.substr(1)].color
			return (
				<div style={{ opacity }} id={'rule-builder-id-' + id}>
					<div style={style}>
						{variableTemplateItems[value.substr(1)].value}
					</div>
				</div>
			);
		} else if (type === 'number') {
			return (
				<div style={{ opacity }} id={'rule-builder-id-' + id}>
					<div style={style}>
						<NumberElement id={id} value={value} editingId={editingId} changeNumber={changeNumber} />
					</div>
				</div>
			);
		} else if (type === 'bracket') {
			return (
				<div>
					<Bracket
						id={id}
						logicElements={value}
						componentTemplateItems={componentTemplateItems}
						variableTemplateItems={variableTemplateItems}
						moveElement={moveElement}
						draggingId={draggingId}
						updateDragging={updateDragging}
						editingId={editingId}
						changeNumber={changeNumber}
						renderIcon={renderIcon}
						getElementType={getElementType}
					/>
				</div>
			);
		};
	}

	render() {
		const {
			connectDragSource,
			connectDropTarget
		} = this.props

		return connectDragSource(
			connectDropTarget(
				this.renderObject(this.props)
			)
		);
	}
}

export default flow(
  DragSource(ItemTypes.LOGIC_ELEMENT, logicElementSource, (connect, monitor) => ({
  	connectDragSource: connect.dragSource()
  })),
  DropTarget([ItemTypes.BRACKET, ItemTypes.TEMPLATE_ITEM, ItemTypes.LOGIC_ELEMENT], logicElementTarget, connect => ({
  	connectDropTarget: connect.dropTarget()
  }))
)(LogicElement);
