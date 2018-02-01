import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import $ from 'jquery';
import _ from 'lodash';

class LogicSetSelector extends Component {
  static propTypes = {
    setFormulas: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);

    this.state = {
      selectedLogicSetId: 'new',
      logicSets: [],
      logicSetDefinitionsTemplate: {
        components: {},
        parentRule: {
          name: '',
          formula: []
        },
        rules: {},
        variableTemplateItems: {}
      }
    };
  }

  componentDidMount() {
    this.getLogicSets();
  }

  getLogicSets = () => {
    axios({
      method: 'GET',
      url: '/admin/settings/logic_sets',
      responseType: 'json',
      headers: {
        'X-CSRF-Token': $("meta[name=csrf-token]").attr('content').content
      }
    })
    .then(response => {
      this.setState({logicSets: response.data});
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  createNewLogicSet = () => {
    axios({
      method: 'POST',
      url: '/admin/settings/logic_sets',
      data: {
        logic_sets: {
          definitions: JSON.stringify({...this.state.logicSetDefinitionsTemplate})
        }
      },
      responseType: 'json',
      headers: {
        'X-CSRF-Token': $("meta[name=csrf-token]").attr('content').content
      }
    })
    .then(response => {
      this.props.setFormulas(response.data.id, response.data.definitions)
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  changeSelection = event => {
    this.setState({selectedLogicSetId: event.target.value});
  }

  changeNewLogicSetName = event => {
    const logicSetDefinitionsTemplate = _.cloneDeep(this.state.logicSetDefinitionsTemplate);
    logicSetDefinitionsTemplate.parentRule.name = event.target.value;

    this.setState({logicSetDefinitionsTemplate});
  }

  selectFormula = () => {
    if (this.state.selectedLogicSetId === 'new') this.createNewLogicSet();

    // IE 10 doesn't support findIndex
    let index = 0;

    while (true) {
      if (this.state.logicSets[index].id == this.state.selectedLogicSetId) break;

      index++;
    }

    this.props.setFormulas(this.state.logicSets[index].id, this.state.logicSets[index].definitions);
  }

  render() {
    return (
      <div>
        <div className="form-group">
          <label>Select Logic Set</label>
          <select className="form-control" onChange={this.changeSelection}>
            <option value="new">Create New Logic Set</option>
            {this.state.logicSets.map((logicSet, index) => {
              return <option key={index} value={logicSet.id}>{logicSet.definitions.parentRule.name}</option>
            })}
          </select>
        </div>
        {this.state.selectedLogicSetId === 'new' ? (
          <div className="form-group">
            <label>New Logic Set Parent Rule Name</label>
            <input className="form-control" placeholder="Enter Logic Set parent rule name" type="text" value={this.state.logicSetDefinitionsTemplate.parentRule.name} />
          </div>
        ) : (
          null
        )}
        <div className="form-group">
          <button className="btn btn-info pull-right" type="button" onClick={this.selectFormula}>Select</button>
        </div>
      </div>
    );
  }
}

export default LogicSetSelector;
