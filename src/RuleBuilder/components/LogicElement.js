import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import flow from 'lodash/flow';
import { DragSource, DropTarget } from 'react-dnd';
import ItemTypes from '../config/ItemTypes';
import ItemCss from '../config/ItemCss';
import Bracket from './Bracket';
import BasicElement from './BasicElement';
import NumberElement from './NumberElement';
import TemplateElement from './TemplateElement';

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
					{value.title}
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

		const opacity = id === draggingId ? 0.5 : 1;

		style.backgroundColor = ItemCss.backgroundColor[type];

		switch (type) {
			case 'operator':
			case 'comparison':
			case 'ifelse':
				return (
					<div>
						<BasicElement id={id} value={value} opacity={opacity} style={style} renderIcon={renderIcon} />
					</div>
					);
			case 'component':
				return (
					<div>
						<TemplateElement id={id} value={componentTemplateItems[value]} opacity={opacity} style={style} />
					</div>
				);
			case 'rule':
				return (
					<div>
						<TemplateElement id={id} value={ruleTemplateItems[value]} opacity={opacity} style={style} />
					</div>
				);
			case 'variable':
				return (
					<div>
						<TemplateElement id={id} value={variableTemplateItems[value]} opacity={opacity} style={style} />
					</div>
				);
			case 'number':
				return (
					<div>
						<NumberElement id={id} opacity={opacity} style={style} value={value} editingId={editingId} changeNumber={changeNumber} />
					</div>
				);
			case 'bracket':
				return (
					<div>
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
