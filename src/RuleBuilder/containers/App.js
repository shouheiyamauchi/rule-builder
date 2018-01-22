import React from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import $ from "jquery";
import DragAndDropFormula from './DragAndDropFormula';
import RulesMenu from '../components/RulesMenu';
import Header from '../components/Header';
import Components from './Components';
import Formula from './Formula';

const values = {
  logicElements: [
    '1', '+', '2', '*', ['1', '8', '*', [['9000']], '+', '@1', '+', '@2', '#2']
  ],
  componentTemplateItems: {
    '1': {
      value: 'Component 1',
      color: 'brown',
      canDrag: true
    },
    '2': {
      value: 'Component 2',
      color: 'orange',
      canDrag: false
    },
    '3': {
      value: 'Component 3',
      color: 'grey',
      canDrag: false
    }
  },
  variableTemplateItems: {
    '1': {
      value: 'Variable 1',
      color: 'green'
    },
    '2': {
      value: 'Variable 2',
      color: '#fff000'
    },
    '3': {
      value: 'Variable 3',
      color: 'pink'
    }
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      components: [],
      ruleSelector: {
        name: '',
        formula: '[]'
      },
      rules: [],
      currentTab: {
        type: 'ruleSelector',
        name: ''
      },
      currentName: '',
      currentFormula: '[]',
      validation: {
        name: [],
        formula: []
      }
    };
  }

  changeTab = (tabType, tabName) => {
    this.setState({currentTab: {
      type: tabType,
      name: tabName
    }}, () => {
      this.setCurrentNameFormula();
    });
  }

  setCurrentNameFormula = () => {
    this.setState({validation: {name: [], formula: []}}, () => {
      switch (this.state.currentTab.type) {
        case 'newComponent':
          this.setState({
            currentName: '',
            currentFormula: '[]'
          });
          break;
        case 'component':
          const componentIndex = this.findIndexWithName(this.state.components, this.state.currentTab.name);
          this.setState({
            currentName: this.state.components[componentIndex].name,
            currentFormula: this.state.components[componentIndex].formula
          });
          break;
        case 'ruleSelector':
          this.setState({
            currentName: this.state.ruleSelector.name,
            currentFormula: this.state.ruleSelector.formula
          });
          break;
        case 'newRule':
          this.setState({
            currentName: '',
            currentFormula: '[]'
          });
          break;
        case 'rule':
          const ruleIndex = this.findIndexWithName(this.state.rules, this.state.currentTab.name);
          this.setState({
            currentName: this.state.rules[ruleIndex].name,
            currentFormula: this.state.rules[ruleIndex].formula
          });
          break;
        default:
          break;
      };
    })
  }

  handleChange = e => {
    const value = e.target.value;
    const name = e.target.name

    this.setState({[name]: value});
  }

  saveChanges = () => {
    this.setState({validation: {name: [], formula: []}}, () => {
      if (this.runValidations()) {
        switch (this.state.currentTab.type) {
          case 'newComponent':
            this.saveNewComponent();
            break;
          case 'component':
            this.saveComponent();
            break;
          case 'ruleSelector':
            this.saveRuleSelector();
            break;
          case 'newRule':
            this.saveNewRule();
            break;
          case 'rule':
            this.saveRule();
            break;
          default:
            break;
        };
      }
    })
  }

  saveNewComponent = () => {
    const components = this.state.components;
    components.push({name: this.state.currentName, formula: this.state.currentFormula});

    this.setState({components}, this.changeTab('component', this.state.currentName));
  }

  saveComponent = () => {
    const componentIndex = this.findIndexWithName(this.state.components, this.state.currentTab.name);

    const components = this.state.components;
    components[componentIndex].name = this.state.currentName;
    components[componentIndex].formula = this.state.currentFormula;

    this.setState({components}, this.changeTab('component', this.state.currentName));
  }

  saveRuleSelector = () => {
    const ruleSelector = this.state.ruleSelector;
    ruleSelector.name = this.state.currentName;
    ruleSelector.formula = this.state.currentFormula;

    this.setState({ruleSelector}, this.changeTab('ruleSelector', this.state.currentName));
  }

  saveNewRule = () => {
    const rules = this.state.rules;
    rules.push({name: this.state.currentName, formula: this.state.currentFormula});

    this.setState({rules}, this.changeTab('rule', this.state.currentName));
  }

  saveRule = () => {
    const ruleIndex = this.findIndexWithName(this.state.rules, this.state.currentTab.name);

    const rules = this.state.rules;
    rules[ruleIndex].name = this.state.currentName;
    rules[ruleIndex].formula = this.state.currentFormula;

    this.setState({rules}, this.changeTab('rule', this.state.currentName));
  }

  runValidations = () => {
    const validation = this.state.validation

    if (!this.state.currentName) validation['name'].push('Name cannot be blank.');
    if (this.state.currentName === 'formula') validation['name'].push('The name "formula" is reserved and cannot be used.');
    if (this.state.currentTab.type !== 'ruleSelector' && this.checkDuplicateName()) validation['name'].push('A rule with this name already exists.');

    this.setState({validation});
    return (validation.name.length === 0 && validation.formula.length === 0);
  }

  checkDuplicateName = () => {
    const componentsOrRulesArray = (this.state.currentTab.type === 'component' || this.state.currentTab.type === 'newComponent') ? this.state.components : this.state.rules;
    return this.state.currentName !== this.state.currentTab.name && this.findIndexWithName(componentsOrRulesArray, this.state.currentName) !== -1;
  }

  // IE10 doesn't support findIndex
  findIndexWithName = (componentsOrRulesArray, name) => {
    var index = -1;
    for (var i = 0; i < componentsOrRulesArray.length; ++i) {
      if (componentsOrRulesArray[i].name === name) {
        index = i;
        break;
      }
    }

    return index;
  }

  render () {
    return (
      <div className="row">
        <div className="col-md-12">
          <span style={{float: 'left'}}>
            <Header currentTab={this.state.currentTab} />
          </span>
          <span style={{float: 'right'}}>
            <RulesMenu ruleSelector={this.state.ruleSelector} rules={this.state.rules} changeTab={this.changeTab} />
          </span>
          <div style={{clear: 'both'}}></div>
        </div>
        <div className="col-md-12">
          <DragAndDropFormula values={values} changeTab={this.changeTab} />
        </div>
        {/* <div className="col-md-3">
          <Components components={this.state.components} changeTab={this.changeTab} />
        </div>
        <div className="col-md-9">
          <Formula
            currentTab={this.state.currentTab}
            components={this.state.components}
            rules={this.state.rules}
            ruleSelector={this.state.ruleSelector}
            currentName={this.state.currentName}
            currentFormula={this.state.currentFormula}
            validation={this.state.validation}
            handleChange={this.handleChange}
            saveChanges={this.saveChanges}
          />
        </div> */}
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(App);
// export default App;
