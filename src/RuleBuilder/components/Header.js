import React from 'react';

const Header = props => {
  const header = {
    'newComponent': 'Component',
    'component': 'Component',
    'ruleSelector': 'Rule Selector',
    'newRule': 'Rule',
    'rule': 'Rule'
  }[props.currentTab.type]

  return (
    <div>
      <label>Currently Editing:</label>
      <br />{header} - {!props.currentTab.name ? <em>name not specified</em> : props.currentTab.name}
    </div>
  );
}

export default Header;
