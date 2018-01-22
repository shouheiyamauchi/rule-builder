import React, { Component } from 'react';
import ItemCss from '../config/ItemCss'

class NumberElement extends Component {
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
    if (this.props.editingId === this.props.id) {
      return (
        <div>
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
              onClick={() => {this.props.changeNumber(null);}}
            />
            <span
              className="glyphicon glyphicon-ok"
              aria-hidden="true"
              onClick={() => this.props.changeNumber(this.props.id, this.state.value)}
            />
          </div>
        </div>
      );
    } else {
      return <span onClick={() => this.props.changeNumber(this.props.id)}>{this.props.value ? this.props.value : 'Click to Enter Value'}</span>
    }
  }
}

export default NumberElement;
