import React from 'react';
import PropTypes from 'prop-types';
import ComponentButton from '../components/ComponentButton';
import TemplateItem from '../components/TemplateItem';

const Components = props => {
  const {
    style,
    newId,
    changeTab,
    componentTemplateItems,
    updateDragging,
    renderIcon
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
      {/* <div style={{'margin': '5px 15px'}}>
        {components.map((component, index) => {
          return <div className="form-group" key={index}><ComponentButton name={component.name} changeTab={changeTab} /></div>
        })}
      </div> */}
      <div style={style}>
        {Object.keys(componentTemplateItems).map((key, i) => (
          <TemplateItem
            index={key}
            key={i}
            newId={newId}
            type={componentTemplateItems[key].type}
            value={componentTemplateItems[key].value}
            color={componentTemplateItems[key].color}
            templateItemType="component"
            updateDragging={updateDragging}
            renderIcon={renderIcon}
            canDrag={componentTemplateItems[key].canDrag}
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
  renderIcon: PropTypes.func.isRequired
};

export default Components;
