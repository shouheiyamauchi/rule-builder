import React, { Component } from 'react';
import _ from 'lodash';
import $ from 'jquery';
import * as Typicons from 'react-icons/lib/ti'
import ItemTypes from '../config/ItemTypes';
import Components from './Components'
import TemplateItem from '../components/TemplateItem';
import LogicElement from '../components/LogicElement';

class DragAndDropFormula extends Component {
  constructor(props) {
    super(props);

    this.state = {
      newId: 0,
      draggingId: null,
      editingId: null,
      lastDrag: {
        dragId: '',
        hoverId: '',
        leftOrRightOverHoverItem: ''
      },
      basicTemplateItems: [
        {
          value: '+'
        },
        {
          value: '-'
        },
        {
          value: '*'
        },
        {
          value: '/'
        },
        {
          value: '<'
        },
        {
          value: '>'
        },
        {
          value: '<='
        },
        {
          value: '>='
        },
        {
          value: '='
        },
        {
          value: 'Number'
        },
        {
          value: '( )'
        }
      ],
      componentTemplateItems: {},
      variableTemplateItems: {},
      logicElements: []
    }
  }

  componentDidMount() {
    this.setAllVariablesFormulas();
  }

  setAllVariablesFormulas = () => {
    const logicElementsAndId = this.assignIdAndTypetoLogicElements(this.props.values.logicElements, 0);

    this.setState({
      newId: logicElementsAndId.currentId,
      componentTemplateItems: this.assignComponentVariableTypes(this.props.values.componentTemplateItems, 'component'),
      variableTemplateItems: this.assignComponentVariableTypes(this.props.values.variableTemplateItems, 'variable'),
      logicElements: logicElementsAndId.logicElementsArray
    });
  }

  assignIdAndTypetoLogicElements = (logicElementsArray, startingId) => {
    let currentId = startingId;

    for (let i = 0; i < logicElementsArray.length; i++) {
      const logicElementValue = logicElementsArray[i];

      logicElementsArray[i] = {};
      logicElementsArray[i].id = currentId;
      logicElementsArray[i].value = logicElementValue;
      currentId++;

      if (logicElementValue.constructor === Array) {
        currentId = this.assignIdAndTypetoLogicElements(logicElementsArray[i].value, currentId).currentId;
      };
    };

    return {
      logicElementsArray,
      currentId
    };
  }

  assignComponentVariableTypes = (componentsOrVariablesObject, typeString) => {
    const keys = Object.keys(componentsOrVariablesObject);

    for (let i = 0; i < keys.length; i++) {
      componentsOrVariablesObject[keys[i]].type = typeString
    };

    return componentsOrVariablesObject;
  }

  getElementType = logicElementValue => {
    if (logicElementValue.constructor === Array || logicElementValue === '( )') {
      return 'bracket'
    } else if (logicElementValue[0] === '@') {
      return 'component'
    } else if (logicElementValue[0] === '#') {
      return 'variable'
    } else if (['+', '-', '*', '/'].includes(logicElementValue)) {
      return 'operator'
    } else if (['<', '>', '<=', '>=', '='].includes(logicElementValue)) {
      return 'comparison'
    } else {
      return 'number'
    };
  }

  updateDragging = id => {
    this.setState({draggingId: id});
  }

  moveElement = (props, monitor, dropTargetType) => {
    const dragItem = monitor.getItem();
    const dragId = dragItem.id;

    const hoverItem = props;
    const hoverId = hoverItem.id;

    // don't replace items with themselves
    if (dragId === hoverId) {
      return;
    }

    const leftOrRightOverHoverItem = this.mousePositionOverHoverItem(hoverId, monitor);

    // prevent function from executing if same as last drag
    if (this.state.lastDrag.dragId === dragId && this.state.lastDrag.hoverId === hoverId && this.state.lastDrag.leftOrRightOverHoverItem === leftOrRightOverHoverItem) return;

    const draggingItemType = monitor.getItemType();

    const moveFunctionToExecute = {
      logicElement: this.moveLogicElement,
      bracket: this.moveLogicElement,
      templateItem: this.addAndDragItem
    };

    moveFunctionToExecute[draggingItemType](hoverItem, dragItem, dropTargetType, leftOrRightOverHoverItem);
  }

  mousePositionOverHoverItem = (hoverId, monitor) => {
    const hoverElementProperties = $('#rule-builder-id-' + hoverId)[0].getBoundingClientRect();
    const centerOfElement = (hoverElementProperties.left + hoverElementProperties.width / 2);
    const mouseHorizontalPosition = monitor.getClientOffset().x;

    if (mouseHorizontalPosition < centerOfElement) {
      return 'left';
    } else if (mouseHorizontalPosition > centerOfElement) {
      return "right";
    };
  }

  moveLogicElement = (hoverItem, dragItem, dropTargetType, leftOrRightOverHoverItem) => {
    const { logicElements } = this.state;
    const hoverId = hoverItem.id;
    const dragId = dragItem.id;

    // cancel if a dragging element is hovering over its own child
    if (this.getElementType(this.getSingleElement(dragId).value) === 'bracket' && this.hoverIsChildOfDrag(dragId, hoverId, logicElements)) return;

    const parentAndIndexOfDragging = this.getParentArrayAndIndex(dragId, logicElements);
    // clone the parent array to prevent mutating original object
    const draggingObject = _.cloneDeep(parentAndIndexOfDragging.parentArray[parentAndIndexOfDragging.index]);

    parentAndIndexOfDragging.parentArray.splice(parentAndIndexOfDragging.index, 1);

    const parentAndIndexOfHovering = this.getParentArrayAndIndex(hoverId, logicElements);
    const hoveringObject = parentAndIndexOfHovering.parentArray[parentAndIndexOfHovering.index];

    let insertIndex = null;

    if (dropTargetType === ItemTypes.LOGIC_ELEMENT) {
      insertIndex = leftOrRightOverHoverItem === 'left' ? parentAndIndexOfHovering.index : parentAndIndexOfHovering.index + 1;
      parentAndIndexOfHovering.parentArray.splice(insertIndex, 0, draggingObject);
    } else if (dropTargetType === ItemTypes.BRACKET) {
      insertIndex = leftOrRightOverHoverItem === 'left' ? 0 : hoveringObject.value.length;
      hoveringObject.value.splice(insertIndex, 0, draggingObject);
    };

    const lastDrag = {
      dragId,
      hoverId,
      leftOrRightOverHoverItem
    };

    this.setState({
      logicElements,
      lastDrag
    });
  }

  addAndDragItem = (hoverItem, dragItem, dropTargetType, leftOrRightOverHoverItem) => {
    const { newId, logicElements } = this.state;
    const hoverId = hoverItem.id;
    const dragId = dragItem.id;
    const dragIndex = dragItem.index;

    // redirect to move function if item has already been added to array
    if (dragId < newId) {
      this.moveLogicElement(hoverItem, dragItem, dropTargetType, leftOrRightOverHoverItem);
      return;
    };

    const newObject = this.constructNewObject(dragItem.templateItemType, dragIndex);
    newObject.id = newId;

    const parentAndIndexOfHovering = this.getParentArrayAndIndex(hoverId, logicElements);
    const hoveringObject = parentAndIndexOfHovering.parentArray[parentAndIndexOfHovering.index];

    let insertIndex = null;

    if (dropTargetType === ItemTypes.LOGIC_ELEMENT) {
      insertIndex = leftOrRightOverHoverItem === 'left' ? parentAndIndexOfHovering.index : parentAndIndexOfHovering.index + 1;
      parentAndIndexOfHovering.parentArray.splice(insertIndex, 0, newObject);
    } else if (dropTargetType === ItemTypes.BRACKET) {
      insertIndex = leftOrRightOverHoverItem === 'left' ? 0 : hoveringObject.value.length;
      hoveringObject.value.splice(insertIndex, 0, newObject);
    }

    const lastDrag = {
      dragId,
      hoverId,
      leftOrRightOverHoverItem
    };

    this.setState({
      logicElements,
      lastDrag,
      newId: this.state.newId + 1
    });
  }

  constructNewObject = (templateItemType, dragIndex) => {
    const { basicTemplateItems } = this.state;

    let newObjectValue = '';

    if (templateItemType === 'basic') {
      newObjectValue = {
        number: '',
        operator: basicTemplateItems[dragIndex].value,
        comparison: basicTemplateItems[dragIndex].value,
        bracket: [],
      }[this.getElementType(basicTemplateItems[dragIndex].value)];
    } else if (templateItemType === 'component') {
      newObjectValue = '@' + dragIndex;
    } else if (templateItemType === 'variable') {
      newObjectValue = '#' + dragIndex;
    };

    return {
      value: newObjectValue
    };
  }

  getParentArrayAndIndex = (logicElementId, array) => {
    for (let i = 0; i < array.length; i++) {
      if (array[i].id === logicElementId) {
        return {parentArray: array, index: i};
      };

      if (array[i].value.constructor === Array) {
        const nestedArray = this.getParentArrayAndIndex(logicElementId, array[i].value);
        if (nestedArray) return nestedArray;
      };
    };
  }

  getSingleElement = logicElementId => {
    const logicElementProperties = this.getParentArrayAndIndex(logicElementId, this.state.logicElements);

    return logicElementProperties.parentArray[logicElementProperties.index];
  }

  hoverIsChildOfDrag = (dragId, hoverId, array) => {
    const dragArray = this.getSingleElement(dragId).value;

    return this.getParentArrayAndIndex(hoverId, dragArray) !== undefined;
  }

  changeNumber = (logicElementId, newValue) => {
    if (!newValue) {
      this.setState({ editingId: logicElementId });
    } else {
      const { logicElements } = this.state;

      const parentArrayAndIndex = this.getParentArrayAndIndex(logicElementId, logicElements);
      parentArrayAndIndex.parentArray[parentArrayAndIndex.index].value = newValue;

      this.setState({
        editingId: null,
        logicElements
      });
    };
  }

  renderIcon = value => {
		const icons = {
	    '+': <div><Typicons.TiPlus /></div>,
	    '-': <div><Typicons.TiMinus /></div>,
	    '*': <div><Typicons.TiTimes /></div>,
	    '/': <div><Typicons.TiDivide /></div>,
	    '<': <div><Typicons.TiChevronLeft /></div>,
	    '>': <div><Typicons.TiChevronRight /></div>,
	    '<=': <div><Typicons.TiChevronLeft style={{marginRight: '-3px'}} /><Typicons.TiEquals /></div>,
	    '>=': <div><Typicons.TiChevronRight style={{marginRight: '-3px'}} /><Typicons.TiEquals /></div>,
	    '=': <div><Typicons.TiEquals /></div>,
	  };

		return icons[value] ? icons[value] : value;
	}

  render() {
    const {
      basicTemplateItems,
      logicElements,
      componentTemplateItems,
      variableTemplateItems,
      newId,
      draggingId,
      editingId
    } = this.state

    const {
      changeTab
    } = this.props

    const style = {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center'
    }

    return (
      <div className="row">
        <div className="col-md-3">
          <Components
            style={style}
            newId={newId}
            changeTab={changeTab}
            componentTemplateItems={componentTemplateItems}
            updateDragging={this.updateDragging}
            renderIcon={this.renderIcon}
          />
        </div>
        <div className="col-md-9">
          <div style={style}>
            {basicTemplateItems.map((templateItem, i) => (
              <TemplateItem
                index={i}
                key={i}
                newId={newId}
                type={this.getElementType(templateItem.value)}
                value={templateItem.value}
                templateItemType="basic"
                updateDragging={this.updateDragging}
                renderIcon={this.renderIcon}
                canDrag={true}
              />
            ))}
          </div>
          <div style={style}>
            {Object.keys(variableTemplateItems).map((key, i) => (
              <TemplateItem
                index={key}
                key={i}
                newId={newId}
                type={variableTemplateItems[key].type}
                value={variableTemplateItems[key].value}
                color={variableTemplateItems[key].color}
                templateItemType="variable"
                updateDragging={this.updateDragging}
                renderIcon={this.renderIcon}
                canDrag={true}
              />
            ))}
          </div>
          <hr />
          <div style={{ ...style, overflow: 'auto', overflowY: 'hidden' }}>
            {logicElements.map((card, i) => (
              <LogicElement
                key={card.id}
                id={card.id}
                type={this.getElementType(card.value)}
                value={card.value}
                componentTemplateItems={componentTemplateItems}
                variableTemplateItems={variableTemplateItems}
                moveElement={this.moveElement}
                draggingId={draggingId}
                updateDragging={this.updateDragging}
                editingId={editingId}
                changeNumber={this.changeNumber}
                renderIcon={this.renderIcon}
                getElementType={this.getElementType}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default DragAndDropFormula;
