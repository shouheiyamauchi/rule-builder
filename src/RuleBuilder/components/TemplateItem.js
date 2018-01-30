import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { DragSource } from 'react-dnd';
import ItemTypes from '../config/ItemTypes';
import ItemCss from '../config/ItemCss';
import BasicElement from './BasicElement';

const templateItemSource = {
	beginDrag(props) {
		props.updateDragging(props.newId);
		return {
			id: props.newId,
			index: props.index,
			value: props.value
		};
	},
	canDrag(props) {
		return props.canDrag;
	},
	endDrag(props, monitor) {
		props.updateDragging(null);

		const outsideDropZone = !monitor.didDrop();
		if (outsideDropZone) props.removeElement(monitor);
	}
}

class TemplateItem extends Component {
	static propTypes = {
		connectDragSource: PropTypes.func.isRequired,
    updateDragging: PropTypes.func,
		index: PropTypes.oneOfType([
			PropTypes.number,
			PropTypes.string
		]).isRequired,
		newId: PropTypes.number.isRequired,
		type: PropTypes.string.isRequired,
		value: PropTypes.string.isRequired,
		color: PropTypes.string,
		componentTemplateItems: PropTypes.object,
		ruleTemplateItems: PropTypes.object,
		variableTemplateItems: PropTypes.object,
		renderIcon: PropTypes.func.isRequired,
		canDrag: PropTypes.bool.isRequired,
		onClick: PropTypes.func,
		removeElement: PropTypes.func
	}

	renderObject = props => {
		const {
			type,
			value,
			color,
			componentTemplateItems,
			ruleTemplateItems,
			variableTemplateItems,
			renderIcon,
			canDrag,
			onClick
		} = props

		const style = _.clone(ItemCss.templateItemStyle)
		const backgroundColor = color || ItemCss.backgroundColor[type]
		if (!canDrag) { style.opacity = 0.5 ; style.color = 'grey' }

		switch (type) {
			case 'component':
				return <BasicElement value={componentTemplateItems[value].title} style={style} backgroundColor={backgroundColor} onClick={onClick} />;
			case 'rule':
				return <BasicElement value={ruleTemplateItems[value].title} style={style} backgroundColor={backgroundColor} onClick={onClick} />;
			case 'variable':
				return <BasicElement value={variableTemplateItems[value].title} style={style} backgroundColor={backgroundColor} onClick={onClick} />;
			default:
				return <BasicElement value={renderIcon(value)} style={style} backgroundColor={backgroundColor} onClick={onClick} />;
		};
	}

	render() {
		const {
			connectDragSource,
			connectDragPreview
		} = this.props

		return connectDragPreview(
			<div style={{transform: 'translate3d(0,0,0)'}}>
				{connectDragSource(
					<div>
						{this.renderObject(this.props)}
					</div>
				)}
			</div>
		);
	}
}

export default DragSource(ItemTypes.TEMPLATE_ITEM, templateItemSource, (connect, monitor) => ({
	connectDragSource: connect.dragSource(),
	connectDragPreview: connect.dragPreview()
}))(TemplateItem);
