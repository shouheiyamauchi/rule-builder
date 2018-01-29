import React from 'react';
import PropTypes from 'prop-types';

const BasicElement = props => {
  const {
    id,
    value,
    opacity,
    style,
    renderIcon
  } = props

  return (
    <div id={'rule-builder-id-' + id} style={{ opacity }}>
      <div style={style}>
        {renderIcon(value)}
      </div>
    </div>
  );
}

BasicElement.propTypes = {
  id: PropTypes.number.isRequired,
  value: PropTypes.string.isRequired,
  opacity: PropTypes.number.isRequired,
  style: PropTypes.object.isRequired,
  renderIcon: PropTypes.func.isRequired
}

export default BasicElement;
