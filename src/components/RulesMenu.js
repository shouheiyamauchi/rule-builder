import React from 'react';

const RulesMenu = props => {
  return (
    <div className="dropdown nav">
      <a data-toggle="dropdown" href="#">
        <i className="fa fa-plus-square"></i>&nbsp;&nbsp;Add/View Rules
      </a>
      <ul className="dropdown-menu">
        <li><a onClick={() => props.changeTab('ruleSelector', props.ruleSelector.name)}>Rule Selector</a></li>
      </ul>
    </div>
  );
}

export default RulesMenu;
