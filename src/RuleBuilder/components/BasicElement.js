import React from 'react';
import PropTypes from 'prop-types';

const BasicElement = props => {
  const {
    value,
    style,
    backgroundColor,
    onClick
  } = props

  style.backgroundColor = backgroundColor;

  return (
    <div style={style} onClick={onClick}>
      {value}
    </div>
  );
}

BasicElement.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]).isRequired,
  style: PropTypes.object.isRequired,
  backgroundColor: PropTypes.string.isRequired,
  onClick: PropTypes.func
}

export default BasicElement;
