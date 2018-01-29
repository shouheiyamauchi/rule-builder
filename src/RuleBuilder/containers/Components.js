import React from 'react';
import PropTypes from 'prop-types';
import TemplateItem from '../components/TemplateItem';

const Components = props => {
  const {
    style,
    newId,
    changeTab,
    componentTemplateItems,
    variableTemplateItems,
    updateDragging,
    renderIcon,
    getElementType,
    removeElement
  } = props

  return (
    <div>
      <h4>
        <span style={{float: 'left'}}>
          Components
        </span>
        <span style={{float: 'right'}}>
          <span className="glyphicon glyphicon-plus-sign" aria-hidden="true" onClick={() => changeTab('newComponent', '')} />
        </span>
        <div style={{clear: 'both'}}></div>
      </h4>
      <div style={style}>
        {Object.keys(componentTemplateItems).map((key, i) => (
          <TemplateItem
            index={key}
            key={i}
            newId={newId}
            type={getElementType(componentTemplateItems[key].value)}
            value={componentTemplateItems[key].value}
            color={componentTemplateItems[key].color}
            componentTemplateItems={componentTemplateItems}
            variableTemplateItems={variableTemplateItems}
            updateDragging={updateDragging}
            renderIcon={renderIcon}
            canDrag={componentTemplateItems[key].canDrag}
            onClick={() => changeTab('component', componentTemplateItems[key].value)}
            removeElement={removeElement}
          />
        ))}
      </div>
    </div>
  );
}

Components.propTypes = {
  style: PropTypes.object.isRequired,
  newId: PropTypes.number.isRequired,
  changeTab: PropTypes.func.isRequired,
  componentTemplateItems: PropTypes.object.isRequired,
  updateDragging: PropTypes.func.isRequired,
  renderIcon: PropTypes.func.isRequired,
  getElementType: PropTypes.func.isRequired,
  removeElement: PropTypes.func.isRequired
};

export default Components;
