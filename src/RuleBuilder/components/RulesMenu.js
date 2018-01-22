import React from 'react';

const RulesMenu = props => {
  return (
    <div className="dropdown nav">
      <a data-toggle="dropdown">
        <i className="fa fa-plus-square"></i>&nbsp;&nbsp;Add/View Rules
      </a>
      <ul className="dropdown-menu">
        <li><a onClick={() => props.changeTab('ruleSelector', props.ruleSelector.name)}>Edit Rule Selector</a></li>
        <li><a onClick={() => props.changeTab('newRule', '')}>Add New Rule</a></li>
        {props.rules.length === 0 ? null : <li className="divider"></li>}
        {props.rules.map((rule, index) => <li key={index}><a onClick={() => props.changeTab('rule', rule.name)}>{rule.name}</a></li>)}
      </ul>
    </div>
  );
}

export default RulesMenu;