import React from 'react';

const ComponentButton = props => {
  return <button className="btn btn-primary" type="button" style={{'width': '100%'}} onClick={() => props.changeTab('component', props.name)} >{props.name}</button>
}

export default ComponentButton;
