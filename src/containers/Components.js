import React from 'react';
import ComponentButton from '../components/ComponentButton';

const Components = props => {
  return (
    <div>
      <h4>
        <span style={{float: 'left'}}>
          Components
        </span>
        <span style={{float: 'right'}}>
          <span className="glyphicon glyphicon-plus-sign" aria-hidden="true" onClick={() => props.changeTab('newComponent', '')} />
        </span>
        <div style={{clear: 'both'}}></div>
      </h4>
      <div style={{'margin': '5px 15px'}}>
        {props.components.map((component, index) => {
          return <div className="form-group" key={index}><ComponentButton name={component.name} changeTab={props.changeTab} /></div>
        })}
      </div>
    </div>
  );
}

export default Components;
