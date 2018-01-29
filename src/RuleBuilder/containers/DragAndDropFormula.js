import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import $ from 'jquery';
import * as Typicons from 'react-icons/lib/ti'
import ItemTypes from '../config/ItemTypes';
import DropLayer from './DropLayer'
import Components from './Components'
import TemplateItem from '../components/TemplateItem';
import LogicElement from '../components/LogicElement';

class DragAndDropFormula extends Component {
  static propTypes = {
    currentTab: PropTypes.object.isRequired,
    values: PropTypes.object.isRequired,
    changeTab: PropTypes.func.isRequired,
    saveChanges: PropTypes.func.isRequired,
    updateCurrentFormula: PropTypes.func.isRequired,
    getElementType: PropTypes.func.isRequired,
    validation: PropTypes.object.isRequired,
    parentRule: PropTypes.object.isRequired
  }

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
      basicTemplateItems: ['+', '-', '*', '/', '<', '>', '<=', '>=', '=', 'Number', '( )', 'IF', 'ELSIF', 'ELSE'],
      componentTemplateItems: {},
      ruleTemplateItems: {},
      variableTemplateItems: {},
      logicElements: []
    }
  }

  componentDidMount() {
    this.setAllVariablesFormulas(this.props);
  }

  setAllVariablesFormulas = (props) => {
    const values = _.cloneDeep(props.values);

    this.setState({
      newId: values.startingId,
      componentTemplateItems: values.componentTemplateItems,
      ruleTemplateItems: values.ruleTemplateItems,
      variableTemplateItems: values.variableTemplateItems,
      logicElements: values.logicElements
    });
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

  removeElement = monitor => {
    const logicElements = _.cloneDeep(this.state.logicElements);

    const dragItem = monitor.getItem();
    const dragId = dragItem.id;

    const parentAndIndexOfDragging = this.getParentArrayAndIndex(dragId, logicElements);

    parentAndIndexOfDragging.parentArray.splice(parentAndIndexOfDragging.index, 1);

    this.setState({
      logicElements
    }, () => {
      this.props.updateCurrentFormula(logicElements);
    });
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
    const logicElements = _.cloneDeep(this.state.logicElements);
    const hoverId = hoverItem.id;
    const dragId = dragItem.id;

    // cancel if a dragging element is hovering over its own child
    if (this.props.getElementType(this.getSingleElement(dragId).value) === 'bracket' && this.hoverIsChildOfDrag(dragId, hoverId, logicElements) && hoverId !== 'drop-layer') return;

    const parentAndIndexOfDragging = this.getParentArrayAndIndex(dragId, logicElements);
    const draggingObject = _.cloneDeep(parentAndIndexOfDragging.parentArray[parentAndIndexOfDragging.index]);

    parentAndIndexOfDragging.parentArray.splice(parentAndIndexOfDragging.index, 1);

    if (dropTargetType === ItemTypes.DROP_LAYER) {
      const insertIndex = leftOrRightOverHoverItem === 'left' ? 0 : logicElements.length;
      logicElements.splice(insertIndex, 0, draggingObject);
    } else {
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
    }

    const lastDrag = {
      dragId,
      hoverId,
      leftOrRightOverHoverItem
    };

    this.setState({
      logicElements,
      lastDrag
    }, () => {
      this.props.updateCurrentFormula(logicElements);
    });
  }

  addAndDragItem = (hoverItem, dragItem, dropTargetType, leftOrRightOverHoverItem) => {
    const { newId } = this.state;
    const logicElements = _.cloneDeep(this.state.logicElements);
    const hoverId = hoverItem.id;
    const dragId = dragItem.id;

    // redirect to move function if item has already been added to array
    if (dragId < newId) {
      this.moveLogicElement(hoverItem, dragItem, dropTargetType, leftOrRightOverHoverItem);
      return;
    };

    const newObject = this.constructNewObject(dragItem.templateItemType, dragItem);
    newObject.id = newId;

    if (dropTargetType === ItemTypes.DROP_LAYER) {
      const insertIndex = leftOrRightOverHoverItem === 'left' ? 0 : logicElements.length;
      logicElements.splice(insertIndex, 0, newObject);
    } else {
      const parentAndIndexOfHovering = this.getParentArrayAndIndex(hoverId, logicElements);
      const hoveringObject = parentAndIndexOfHovering.parentArray[parentAndIndexOfHovering.index];
      let insertIndex = null;

      if (dropTargetType === ItemTypes.LOGIC_ELEMENT) {
        insertIndex = leftOrRightOverHoverItem === 'left' ? parentAndIndexOfHovering.index : parentAndIndexOfHovering.index + 1;
        parentAndIndexOfHovering.parentArray.splice(insertIndex, 0, newObject);
      } else if (dropTargetType === ItemTypes.BRACKET) {
        insertIndex = leftOrRightOverHoverItem === 'left' ? 0 : hoveringObject.value.length;
        hoveringObject.value.splice(insertIndex, 0, newObject);
      };
    }

    const lastDrag = {
      dragId,
      hoverId,
      leftOrRightOverHoverItem
    };

    this.setState({
      logicElements,
      lastDrag,
      newId: newId + 1
    }, () => {
      this.props.updateCurrentFormula(logicElements);
    });
  }

  constructNewObject = (templateItemType, dragItem) => {
    const { basicTemplateItems } = this.state;
    const dragIndex = dragItem.index;
    const dragValue = dragItem.value;

    const newObjectValue = {
        number: '',
        operator: basicTemplateItems[dragIndex],
        comparison: basicTemplateItems[dragIndex],
        bracket: [],
        component: dragValue,
        rule: dragValue,
        variable: dragValue,
        ifelse: basicTemplateItems[dragIndex]
      }[this.props.getElementType(dragValue)];

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
      'IF': 'IF',
      'ELSIF': 'ELSE IF',
      'ELSE': 'ELSE'
	  };

		return icons[value] ? icons[value] : value;
	}

  render() {
    const {
      basicTemplateItems,
      logicElements,
      componentTemplateItems,
      ruleTemplateItems,
      variableTemplateItems,
      newId,
      draggingId,
      editingId
    } = this.state

    const {
      parentRule,
      changeTab,
      currentTab,
      saveChanges,
      getElementType,
      validation
    } = this.props

    const style = {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center'
    }

    return (
      <div>
        <div style={{marginTop: '5px'}}>
          <label>Rules</label>&nbsp;
          <span className="glyphicon glyphicon-plus-sign" aria-hidden="true" onClick={() => changeTab('newRule', '')} />
        </div>
        <div style={style}>
          <TemplateItem
            index={0}
            newId={0}
            type="parentRule"
            value={parentRule.name ? 'Parent Rule - ' + parentRule.name : 'Parent Rule'}
            color="white"
            renderIcon={this.renderIcon}
            canDrag={false}
            onClick={() => changeTab('parentRule', '')}
          />
          {Object.keys(ruleTemplateItems).map((key, i) => (
            <TemplateItem
              index={key}
              key={i}
              newId={newId}
              type={getElementType(ruleTemplateItems[key].value)}
              value={ruleTemplateItems[key].value}
              color={ruleTemplateItems[key].color}
              ruleTemplateItems={ruleTemplateItems}
              updateDragging={this.updateDragging}
              renderIcon={this.renderIcon}
              canDrag={(currentTab.type === 'parentRule' || currentTab.type === 'newRule' || currentTab.type === 'rule')}
              onClick={() => changeTab('rule', ruleTemplateItems[key].value)}
              removeElement={this.removeElement}
            />
          ))}
        </div>
        <div style={{marginTop: '5px'}}>
          <label>Components</label>&nbsp;
          <span className="glyphicon glyphicon-plus-sign" aria-hidden="true" onClick={() => changeTab('newComponent', '')} />
        </div>
        <div style={style}>
          {Object.keys(componentTemplateItems).length > 0 ? (
            Object.keys(componentTemplateItems).map((key, i) => (
              <TemplateItem
                index={key}
                key={i}
                newId={newId}
                type={getElementType(componentTemplateItems[key].value)}
                value={componentTemplateItems[key].value}
                color={componentTemplateItems[key].color}
                componentTemplateItems={componentTemplateItems}
                updateDragging={this.updateDragging}
                renderIcon={this.renderIcon}
                canDrag={true}
                onClick={() => changeTab('component', componentTemplateItems[key].value)}
                removeElement={this.removeElement}
              />
            ))
          ) : (
            <TemplateItem
              index={0}
              key={0}
              newId={0}
              type="nullIcon"
              value="None"
              color="black"
              renderIcon={this.renderIcon}
              canDrag={false}
              removeElement={this.removeElement}
            />
          )}
        </div>
        <div style={{marginTop: '5px'}}>
          <label>Variables</label>&nbsp;
        </div>
        <div style={style}>
          {Object.keys(variableTemplateItems).length > 0 ? (
            Object.keys(variableTemplateItems).map((key, i) => (
              <TemplateItem
                index={key}
                key={i}
                newId={newId}
                type={getElementType(variableTemplateItems[key].value)}
                value={variableTemplateItems[key].value}
                color={variableTemplateItems[key].color}
                variableTemplateItems={variableTemplateItems}
                updateDragging={this.updateDragging}
                renderIcon={this.renderIcon}
                canDrag={true}
                removeElement={this.removeElement}
              />
            ))
          ) : (
            <TemplateItem
              index={0}
              key={0}
              newId={0}
              type="nullIcon"
              value="None"
              color="black"
              renderIcon={this.renderIcon}
              canDrag={false}
              removeElement={this.removeElement}
            />
          )}
        </div>
        <div style={{marginTop: '5px'}}>
          <label>Operators</label>&nbsp;
        </div>
        <div style={style}>
          {basicTemplateItems.map((templateItem, i) => (
            <TemplateItem
              index={i}
              key={i}
              newId={newId}
              type={getElementType(templateItem)}
              value={templateItem}
              updateDragging={this.updateDragging}
              renderIcon={this.renderIcon}
              canDrag={true}
              removeElement={this.removeElement}
            />
          ))}
        </div>
        <hr />
        <DropLayer moveElement={this.moveElement} id="drop-layer">
          <div style={style}>
            {logicElements.map((card, i) => (
              <LogicElement
                key={card.id}
                id={card.id}
                type={getElementType(card.value)}
                value={card.value}
                componentTemplateItems={componentTemplateItems}
                variableTemplateItems={variableTemplateItems}
                ruleTemplateItems={ruleTemplateItems}
                moveElement={this.moveElement}
                draggingId={draggingId}
                updateDragging={this.updateDragging}
                editingId={editingId}
                changeNumber={this.changeNumber}
                renderIcon={this.renderIcon}
                getElementType={getElementType}
                removeElement={this.removeElement}
              />
            ))}
          </div>
        </DropLayer>
        <ul className="parsley-errors-list">
          {validation.formula.map((error, index) => <li className="parsley-required" key={index}>{error}</li>)}
        </ul>
        <br />
        <button className="btn btn-info pull-right" type="button" onClick={() => saveChanges(logicElements)}>Save</button>
      </div>
    );
  }
}

export default DragAndDropFormula;
