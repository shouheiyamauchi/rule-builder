import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { DragSource } from 'react-dnd';
import ItemTypes from '../config/ItemTypes';
import ItemCss from '../config/ItemCss';

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
	endDrag(props) {
		props.updateDragging(null);
	}
}

class TemplateItem extends Component {
	static propTypes = {
		connectDragSource: PropTypes.func.isRequired,
    updateDragging: PropTypes.func.isRequired,
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
		onClick: PropTypes.func
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

		style.backgroundColor = ItemCss.backgroundColor[type]
		if (color) style.backgroundColor = color
		if (!canDrag) { style.opacity = 0.5 ; style.color = 'grey' }

		if (type === 'component') {
			return <div onClick={onClick} style={{ ...style }}>{componentTemplateItems[value].title}</div>
		} else if (type === 'rule') {
			return <div style={{ ...style }}>{ruleTemplateItems[value].title}</div>
		} else if (type === 'variable') {
			return <div style={{ ...style }}>{variableTemplateItems[value].title}</div>
		} else {
			return <div style={{ ...style }}>{renderIcon(value)}</div>
		};
	}

	render() {
		const {
			connectDragSource
		} = this.props

		return connectDragSource(
			this.renderObject(this.props)
		);
	}
}

export default DragSource(ItemTypes.TEMPLATE_ITEM, templateItemSource, (connect, monitor) => ({
	connectDragSource: connect.dragSource()
}))(TemplateItem);
