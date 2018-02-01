import React, { Component } from 'react';
import Switch from 'react-switch';
import axios from 'axios';
import $ from 'jquery';
import LogicSetSelector from './LogicSetSelector';
import MouseContainer from './MouseContainer';
import TouchContainer from './TouchContainer';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      touchMode: false,
      preloadDefinitions: this.props.logicSetId,
      selectLogicSet: true,
      logicSetId: null,
      logicSetDefinitions: {}
    };
  }

  componentDidMount() {
    if (this.props.logicSetId) this.loadFormula();
  }

  toggleTouchMode = () => {
    this.setState({touchMode: !this.state.touchMode});
  }

  selectLogicSet = () => {
    $('#sub_form_question_options_logic_set_id').val('');
    this.setState({
      selectLogicSet: true,
      logicSetId: null,
      logicSetDefinitions: {}
    });
  }

  loadFormula = () => {
    axios({
      method: 'GET',
      url: '/admin/settings/logic_sets/' + this.props.logicSetId,
      responseType: 'json',
      headers: {
        'X-CSRF-Token': $("meta[name=csrf-token]").attr('content')
      }
    })
    .then(response => {
      this.setFormulas(response.data.id, response.data.definitions);
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  setFormulas = (id, logicSetDefinitions) => {
    $('#sub_form_question_options_logic_set_id').val(id);
    logicSetDefinitions.logicSetId = id;

    this.setState({
      logicSetDefinitions,
      preloadDefinitions: false,
      selectLogicSet: false
    });
  }

  render() {
    const props = {
      logicSetId: 1,
      components: {},
      parentRule: {
        name: '',
        formula: []
      },
      rules: {},
      variables: {
        '#1': {
          name: 'Variable 1',
          color: 'green'
        },
        '#2': {
          name: 'Variable 2',
          color: '#fff000'
        },
        '#3': {
          name: 'Variable 3',
          color: 'pink'
        }
      }
    }

    const {
      touchMode,
      selectLogicSet,
      preloadDefinitions,
      logicSetId,
      logicSetDefinitions
    } = this.state

    return (
      <div>
        <div style={{float: 'right', display: 'flex', justifyContent: 'center'}}>
          Touch Screen Mode:&nbsp;&nbsp;
          <Switch
            checked={touchMode}
            onChange={this.toggleTouchMode}
            onColor="#86d3ff"
            onHandleColor="#2693e6"
            handleDiameter={15}
            uncheckedIcon={false}
            checkedIcon={false}
            boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
            activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
            height={10}
            width={24}
            className="react-switch"
            id="material-switch"
          />
        </div>
        <div style={{clear: 'both'}}>
          {/* {selectLogicSet ? (
            preloadDefinitions ? null : <LogicSetSelector setFormulas={this.setFormulas} />
          ) : (
            touchMode ? <TouchContainer { ...logicSetDefinitions } selectLogicSet={this.selectLogicSet} /> : <MouseContainer { ...logicSetDefinitions } selectLogicSet={this.selectLogicSet} />
          )} */}
          {touchMode ? <TouchContainer { ...props } selectLogicSet={this.selectLogicSet} /> : <MouseContainer { ...props } selectLogicSet={this.selectLogicSet} />}
        </div>
      </div>
    );
  }
}

export default App;
