import React from 'react';
import PropTypes from 'prop-types';

const TemplateElement = props => {
  const {
    id,
    value,
    opacity,
    style
  } = props

	style.backgroundColor = value.color

  return (
    <div id={'rule-builder-id-' + id} style={{ opacity }}>
      <div style={style}>
        {value.title}
      </div>
    </div>
  );
}

TemplateElement.propTypes = {
  id: PropTypes.number.isRequired,
  value: PropTypes.object.isRequired,
  opacity: PropTypes.number.isRequired,
  style: PropTypes.object.isRequired
}

export default TemplateElement;
