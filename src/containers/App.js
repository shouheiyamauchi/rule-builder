import React from 'react';
import RulesMenu from '../components/RulesMenu';
import Header from '../components/Header';
import Components from './Components';
import Formula from './Formula';

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
          const componentIndex = this.state.components.findIndex(component => component.name === this.state.currentTab.name);
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
          break;
        case 'rule':
          break;
      };
    })
  }

  handleChange = (e) => {
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
            break;
          case 'rule':
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
    const componentIndex = this.state.components.findIndex(component => component.name === this.state.currentTab.name);

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

  runValidations = () => {
    switch (this.state.currentTab.type) {
      case 'newComponent':
        return this.validateComponent();
        break;
      case 'component':
        return this.validateComponent();
        break;
      case 'ruleSelector':
        return this.validateRuleSelector();
        break;
      case 'newRule':
        break;
      case 'rule':
        break;
    };
  }

  validateComponent = () => {
    const validation = this.state.validation

    if (!this.state.currentName) validation['name'].push('Name cannot be blank.');

    const nameExists = this.state.components.findIndex(component => component.name === this.state.currentName) !== -1;
    if (nameExists) validation['name'].push('A component with this name already exists.');

    this.setState({validation});
    if (validation.name.length === 0 && validation.formula.length === 0) {
      return true;
    } else {
      return false;
    };
  }

  validateRuleSelector = () => {
    const validation = this.state.validation

    if (!this.state.currentName) validation['name'].push('Name cannot be blank.');

    this.setState({validation});
    if (validation.name.length === 0 && validation.formula.length === 0) {
      return true;
    } else {
      return false;
    };
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
        <div className="col-md-3">
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
        </div>
      </div>
    );
  }
}

export default App;
