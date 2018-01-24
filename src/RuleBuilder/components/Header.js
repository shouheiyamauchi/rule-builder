import React from 'react';

const Header = props => {
  const header = {
    'newComponent': 'New Component',
    'component': 'Component',
    'parentRule': 'Parent Rule',
    'newRule': 'New Rule',
    'rule': 'Rule'
  }[props.currentTab.type]

  return (
    <div>
      <label>Currently Editing:</label>
      <br />{header}{!props.currentTab.value ? null : (': ' + props.currentTab.value)}
    </div>
  );
}

export default Header;
