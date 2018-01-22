import React from 'react';
import DragAndDropFormula from './DragAndDropFormula';

const Formula = props => {
  const formTitle = {
    'newComponent': 'Component Builder',
    'component': 'Component Builder',
    'ruleSelector': 'Rule Selector Builder',
    'newRule': 'Rule Builder',
    'rule': 'Rule Builder'
  }[props.currentTab.type]

  return (
    <div>
      <h4>{formTitle}</h4>
      <div className="form-group">
        <label>Name</label>
        <input name="currentName" className={'form-control' + (props.validation.name.length === 0 ? '' : ' parsley-error')} value={props.currentName} onChange={props.handleChange} />
        <ul className="parsley-errors-list">
          {props.validation.name.map((error, index) => <li className="parsley-required" key={index}>{error}</li>)}
        </ul>
      </div>
      <div className="form-group">
        <label>Logic</label>
        <input name="currentFormula" className={'form-control' + (props.validation.formula.length === 0 ? '' : ' parsley-error')} value={props.currentFormula} onChange={props.handleChange} />
        <ul className="parsley-errors-list">
          {props.validation.formula.map((error, index) => <li className="parsley-required" key={index}>{error}</li>)}
        </ul>
      </div>
      <button className="btn btn-info pull-right" type="button" onClick={props.saveChanges}>Save</button>
    </div>
  );
}

export default Formula;
