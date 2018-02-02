import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import flow from 'lodash/flow';
import { DragSource, DropTarget } from 'react-dnd';
import ItemTypes from '../config/ItemTypes';
import ItemCss from '../config/ItemCss';
import LogicElementTypes from '../config/LogicElementTypes';
import Bracket from './Bracket';
import BasicElement from './BasicElement';
import NumberElement from './NumberElement';

const logicElementSource = {
	beginDrag(props) {
		props.updateDragging(props.id);
		return {
			id: props.id
		};
	},
	endDrag(props, monitor) {
		props.updateDragging(null);

		const outsideDropZone = !monitor.didDrop();
		if (outsideDropZone) props.removeElement(monitor);
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
		ruleTemplateItems: PropTypes.object.isRequired,
		variableTemplateItems: PropTypes.object.isRequired,
		moveElement: PropTypes.func.isRequired,
		editingId: PropTypes.number,
		changeNumber: PropTypes.func.isRequired,
		renderIcon: PropTypes.func.isRequired,
		getElementType: PropTypes.func.isRequired,
		removeElement: PropTypes.func.isRequired
	}

	renderTemplateItem = (value, id, opacity, style) => {
		style.backgroundColor = value.color
		return (
			<div id={'rule-builder-id-' + id} style={{ opacity }}>
				<div style={style}>
					{value.name}
				</div>
			</div>
		);
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
			ruleTemplateItems,
      variableTemplateItems,
			moveElement,
			editingId,
			changeNumber,
			renderIcon,
			getElementType,
			removeElement
		} = props;

		switch(type) {
			case LogicElementTypes.OPERATOR:
			case LogicElementTypes.COMPARISON:
			case LogicElementTypes.IFELSE:
				return <BasicElement value={renderIcon(value)} style={style} backgroundColor={ItemCss.backgroundColor[type]} />;
			case LogicElementTypes.COMPONENT:
				return <BasicElement value={componentTemplateItems[value].name} style={style} backgroundColor={componentTemplateItems[value].color} />;
			case LogicElementTypes.RULE:
				return <BasicElement value={ruleTemplateItems[value].name} style={style} backgroundColor={ruleTemplateItems[value].color} />;
			case LogicElementTypes.VARIABLE:
				return <BasicElement value={variableTemplateItems[value].name} style={style} backgroundColor={variableTemplateItems[value].color} />;
			case LogicElementTypes.NUMBER:
				return <NumberElement id={id} style={style} value={value} editingId={editingId} changeNumber={changeNumber} backgroundColor={ItemCss.backgroundColor.number} />;
			case LogicElementTypes.BRACKET:
				return (
						<Bracket
							id={id}
							logicElements={value}
							componentTemplateItems={componentTemplateItems}
							ruleTemplateItems={ruleTemplateItems}
							variableTemplateItems={variableTemplateItems}
							moveElement={moveElement}
							draggingId={draggingId}
							updateDragging={updateDragging}
							editingId={editingId}
							changeNumber={changeNumber}
							renderIcon={renderIcon}
							getElementType={getElementType}
							removeElement={removeElement}
						/>
				);
			default:
				return;
		};
	}

	render() {
		const {
			connectDragSource,
			connectDropTarget,
			connectDragPreview,
			id,
			draggingId
		} = this.props

		const opacity = id === draggingId ? 0.5 : 1;

		return connectDragPreview(
			<div id={'rule-builder-id-' + id} style={{opacity, transform: 'translate3d(0,0,0)'}}>
				{connectDragSource(
					connectDropTarget(
						<div>
							{this.renderObject(this.props)}
						</div>
					)
				)}
			</div>
		);
	}
}

export default flow(
  DragSource(ItemTypes.LOGIC_ELEMENT, logicElementSource, (connect, monitor) => ({
  	connectDragSource: connect.dragSource(),
		connectDragPreview: connect.dragPreview()
  })),
  DropTarget([ItemTypes.BRACKET, ItemTypes.TEMPLATE_ITEM, ItemTypes.LOGIC_ELEMENT], logicElementTarget, connect => ({
  	connectDropTarget: connect.dropTarget()
  }))
)(LogicElement);
