import React from 'react';
import _ from 'lodash';
import update from 'immutability-helper';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import DragAndDropFormula from './DragAndDropFormula';
import RulesMenu from '../components/RulesMenu';
import Header from '../components/Header';
import Formula from './Formula';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      componentUpdateKey: 0,
      components: {},
      ruleSelector: {
        name: '',
        formula: []
      },
      rules: {},
      currentTab: {
        type: 'ruleSelector',
        name: ''
      },
      currentName: '',
      currentFormula: [],
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
      let currentName = '';
      let currentFormula = [];

      switch (this.state.currentTab.type) {
        case 'newComponent':
          currentName = ''
          currentFormula = []
          break;
        case 'component':
          currentName = this.state.components[this.state.currentTab.name].name
          currentFormula = this.state.components[this.state.currentTab.name].formula
          break;
        case 'ruleSelector':
          currentName = this.state.ruleSelector.name
          currentFormula = this.state.ruleSelector.formula
          break;
        case 'newRule':
          currentName = ''
          currentFormula = []
          break;
        case 'rule':
          currentName = this.state.rules[this.state.currentTab.name].name
          currentFormula = this.state.rules[this.state.currentTab.name].formula
          break;
        default:
          break;
      };

      this.setState({
        currentName,
        currentFormula,
        componentUpdateKey: this.state.componentUpdateKey + 1
      })
    })
  }

  handleChange = e => {
    const value = e.target.value;
    const name = e.target.name

    this.setState({[name]: value});
  }

  updateCurrentFormula = (dragAndDropFormulaLogicElements) => {
    const logicElements = _.cloneDeep(dragAndDropFormulaLogicElements);
    const currentFormula = this.convertDragAndDropFormulaToArray(logicElements);

    this.setState({currentFormula});
  }

  saveChanges = (dragAndDropFormulaLogicElements) => {
    const logicElements = _.cloneDeep(dragAndDropFormulaLogicElements);
    const currentFormula = this.convertDragAndDropFormulaToArray(logicElements);

    this.setState({currentFormula, validation: {name: [], formula: []}}, () => {
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

  convertDragAndDropFormulaToArray = (dragAndDropFormulaLogicElements) => {
    for (let i = 0; i < dragAndDropFormulaLogicElements.length; i++) {
      dragAndDropFormulaLogicElements[i] = dragAndDropFormulaLogicElements[i].value;

      if (dragAndDropFormulaLogicElements[i].constructor === Array) {
        this.convertDragAndDropFormulaToArray(dragAndDropFormulaLogicElements[i]);
      };
    };

    return dragAndDropFormulaLogicElements;
  }

  saveNewComponent = () => {
    let i = 0;
    while (this.state.components['@' + i]) i++;

    const components = this.state.components;
    components['@' + i] = ({name: this.state.currentName, formula: this.state.currentFormula});

    this.setState({components}, this.changeTab('component', '@' + i));
  }

  saveComponent = () => {
    const components = this.state.components;
    components[this.state.currentTab.name].name = this.state.currentName;
    components[this.state.currentTab.name].formula = this.state.currentFormula;

    this.setState({components}, this.changeTab('component', this.state.currentTab.name));
  }

  saveRuleSelector = () => {
    const ruleSelector = this.state.ruleSelector;
    ruleSelector.name = this.state.currentName;
    ruleSelector.formula = this.state.currentFormula;

    this.setState({ruleSelector}, this.changeTab('ruleSelector', this.state.currentName));
  }

  saveNewRule = () => {
    let i = 0;
    while (this.state.rules['#' + i]) i++;

    const rules = this.state.rules;
    rules['#' + i] = ({name: this.state.currentName, formula: this.state.currentFormula});

    this.setState({rules}, this.changeTab('rule', '#' + i));
  }

  saveRule = () => {
    const rules = this.state.rules;
    rules[this.state.currentTab.name].name = this.state.currentName;
    rules[this.state.currentTab.name].formula = this.state.currentFormula;

    this.setState({rules}, this.changeTab('rule', this.state.currentTab.name));
  }

  runValidations = () => {
    const validation = this.state.validation;

    if (!this.state.currentName) validation['name'].push('Name cannot be blank.');
    // if (this.state.currentName === 'formula') validation['name'].push('The name "formula" is reserved and cannot be used.');
    if (this.state.currentTab.type !== 'ruleSelector' && this.checkDuplicateName()) {
      const ruleOrComponent = (this.state.currentTab.type === 'rule' || this.state.currentTab.type === 'newRule') ? 'rule' : 'component'
      validation['name'].push('A ' + ruleOrComponent + ' with this name already exists.');
    };

    this.setState({validation});
    return (validation.name.length === 0 && validation.formula.length === 0);
  }

  checkDuplicateName = () => {
    const componentsOrRulesObject = (this.state.currentTab.type === 'component' || this.state.currentTab.type === 'newComponent') ? this.state.components : this.state.rules;

    let duplicate = false;
    Object.keys(componentsOrRulesObject).map(key => {
      if (componentsOrRulesObject[key].name === this.state.currentName) duplicate = true;
    });

    if (this.state.currentTab.type === 'newComponent' || this.state.currentTab.type === 'newRule') {
      return duplicate;
    } else {
      return this.state.currentName !== componentsOrRulesObject[this.state.currentTab.name].name && duplicate;
    };
  }

  generateDragAndDropFormulaObject = () => {
    const logicElementsAndId = this.assignIdAndTypetoLogicElements(this.state.currentFormula, 0);
    const startingId = logicElementsAndId.currentId;
    const logicElements = logicElementsAndId.logicElementsArray;
    const componentTemplateItems = this.convertComponentTemplateItems();

    return {
      startingId,
      logicElements,
      componentTemplateItems,
      variableTemplateItems: {
        '#1': {
          value: '#1',
          title: 'Variable 1',
          color: 'green'
        },
        '#2': {
          value: '#2',
          title: 'Variable 2',
          color: '#fff000'
        },
        '#3': {
          value: '#3',
          title: 'Variable 3',
          color: 'pink'
        }
      }
    };
  }

  assignIdAndTypetoLogicElements = (logicElementsArray, startingId) => {
    const updatedLogicElements = _.cloneDeep(logicElementsArray)
    let currentId = startingId;

    for (let i = 0; i < updatedLogicElements.length; i++) {
      const logicElementValue = updatedLogicElements[i];

      updatedLogicElements[i] = {};
      updatedLogicElements[i].id = currentId;
      updatedLogicElements[i].value = logicElementValue;
      currentId++;

      if (logicElementValue.constructor === Array) {
        currentId = this.assignIdAndTypetoLogicElements(updatedLogicElements[i].value, currentId).currentId;
      };
    };

    return {
      logicElementsArray: updatedLogicElements,
      currentId
    };
  }

  convertComponentTemplateItems = () => {
    const componentTemplateItems = {};

    Object.keys(this.state.components).map(key => {
      componentTemplateItems[key] = {
        value: key,
        title: this.state.components[key].name,
        color: 'black',
        canDrag: true
      };
    });

    return componentTemplateItems;
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
          <Formula
            currentTab={this.state.currentTab}
            rules={this.state.rules}
            currentName={this.state.currentName}
            validation={this.state.validation}
            handleChange={this.handleChange}
          />
        </div>
        <div className="col-md-12">
          <DragAndDropFormula
            key={this.state.componentUpdateKey}
            currentTab={this.state.currentTab}
            values={this.generateDragAndDropFormulaObject()}
            changeTab={this.changeTab}
            updateCurrentFormula={this.updateCurrentFormula}
            saveChanges={this.saveChanges}
          />
        </div>
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(App);
