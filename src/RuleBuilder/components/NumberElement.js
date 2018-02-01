import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import ItemCss from '../config/ItemCss';

class NumberElement extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    value: PropTypes.string.isRequired,
    style: PropTypes.object.isRequired,
    editingId: PropTypes.number,
    changeNumber: PropTypes.func.isRequired,
    backgroundColor: PropTypes.string.isRequired
  }

  constructor(props) {
    super(props);

    this.state = {
      value: this.props.value
    };
  }

  componentWillReceiveProps(nextProps) {
    // reset editing value on cancel or selection of another field
    this.setState({value: nextProps.value});
  }

  handleChange = e => {
    this.setState({value: e.target.value});
  }

  render() {
    const {
      id,
      value,
      editingId,
      changeNumber,
      backgroundColor
    } = this.props

    const style = _.cloneDeep(this.props.style)
    style.backgroundColor = backgroundColor;

    if (editingId === id) {
      return (
				<div style={style}>
          <input
            value={this.state.value}
            size={this.state.value.length > 1 ? this.state.value.length : 2}
            onChange={this.handleChange}
            style={{backgroundColor: ItemCss.backgroundColor.number}}
          />
          <br />
          <div className="text-right">
            <span
              className="glyphicon glyphicon-remove"
              aria-hidden="true"
              onClick={() => changeNumber(null)}
            />
            <span
              className="glyphicon glyphicon-ok"
              aria-hidden="true"
              onClick={() => changeNumber(id, this.state.value)}
            />
          </div>
				</div>
      );
    } else {
      return (
				<div style={style}>
          <span onClick={() => changeNumber(id)}>{value ? value : 'Click to Enter Value'}</span>
        </div>
      );
    }
  }
}

export default NumberElement;
