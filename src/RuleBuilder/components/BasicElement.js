import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

const BasicElement = props => {
  const {
    value,
    backgroundColor,
    onClick
  } = props

  const style = _.cloneDeep(props.style)
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
  backgroundColor: PropTypes.string,
  onClick: PropTypes.func
}

export default BasicElement;
