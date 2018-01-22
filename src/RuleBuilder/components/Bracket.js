import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragSource, DropTarget } from 'react-dnd';
import flow from 'lodash/flow';
import ItemTypes from '../config/ItemTypes';
import ItemCss from '../config/ItemCss';
import LogicElement from './LogicElement';

const bracketSource = {
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

const bracketTarget = {
  hover(props, monitor, component) {
    // prevent executing on parent containers
		if (!monitor.isOver({ shallow: true })) return;

    props.moveElement(props, monitor, ItemTypes.BRACKET);
	}
}

class Bracket extends Component {
	static propTypes = {
		connectDragSource: PropTypes.func.isRequired,
		connectDropTarget: PropTypes.func.isRequired,
    draggingId: PropTypes.number,
    updateDragging: PropTypes.func.isRequired,
    id: PropTypes.number.isRequired,
    logicElements: PropTypes.array.isRequired,
		componentTemplateItems: PropTypes.object.isRequired,
		variableTemplateItems: PropTypes.object.isRequired,
    moveElement: PropTypes.func.isRequired,
		editingId: PropTypes.number,
		changeNumber: PropTypes.func.isRequired,
		renderIcon: PropTypes.func.isRequired
	}

	render() {
		const {
			connectDragSource,
			connectDropTarget,
      draggingId,
      updateDragging,
  		id,
			logicElements,
      componentTemplateItems,
      variableTemplateItems,
      moveElement,
      editingId,
      changeNumber,
			renderIcon,
			getElementType
		} = this.props

    const opacity = id === draggingId ? 0.5 : 1

    const style = ItemCss.bracketStyle

    const bracketsCss = {
      fontSize: '20px',
      padding: '0px 3px',
			color: '#666666'
    }

		return (
      <div style={{margin: '3px'}}>
        {connectDragSource(
    			connectDropTarget(
            <div style={{ ...style, opacity }} id={'rule-builder-id-' + id}>
              <span style={bracketsCss}>(</span>
                {logicElements.map((card, i) => (
                  <LogicElement
                    key={card.id}
                    id={card.id}
                    value={card.value}
                    type={getElementType(card.value)}
										color={card.color}
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
                ))}
              <span style={bracketsCss}>)</span>
            </div>
          ),
    		)}
      </div>
    );
	}
}

export default flow(
  DragSource(ItemTypes.BRACKET, bracketSource, (connect, monitor) => ({
  	connectDragSource: connect.dragSource()
  })),
  DropTarget([ItemTypes.BRACKET, ItemTypes.TEMPLATE_ITEM, ItemTypes.LOGIC_ELEMENT], bracketTarget, connect => ({
  	connectDropTarget: connect.dropTarget()
  }))
)(Bracket);
