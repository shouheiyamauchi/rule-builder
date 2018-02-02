import React from 'react';

const Formula = props => {
  return (
    <div className="form-group">
      <label>Name</label>
      <input name="currentName" className={'form-control' + (props.validation.name.length === 0 ? '' : ' parsley-error')} value={props.currentName} onChange={props.handleChange} />
      <ul className="parsley-errors-list">
        {props.validation.name.map((error, index) => <li className="parsley-required" key={index}>{error}</li>)}
      </ul>
      <label>Color</label>
      <input name="currentColor" className={'form-control'} value={props.currentColor} onChange={props.handleChange} />
    </div>
  );
}

export default Formula;
