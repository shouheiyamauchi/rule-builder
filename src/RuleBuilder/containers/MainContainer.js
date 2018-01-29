import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import update from 'immutability-helper';
import DragAndDropFormula from './DragAndDropFormula';
import RulesMenu from '../components/RulesMenu';
import Header from '../components/Header';
import Formula from './Formula';

class MainContainer extends Component {
  static propTypes = {
    components: PropTypes.object.isRequired,
    parentRule: PropTypes.object.isRequired,
    rules: PropTypes.object.isRequired,
    variableTemplateItems: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      componentUpdateKey: 0,
      components: {},
      parentRule: {
        name: '',
        formula: []
      },
      rules: {},
      variableTemplateItems: {},
      currentTab: {
        type: 'parentRule',
        value: ''
      },
      currentName: '',
      currentFormula: [],
      validation: {
        name: [],
        formula: []
      }
    };
  }

  componentDidMount() {
    const {
      components,
      parentRule,
      rules,
      variableTemplateItems
    } = this.props;

    this.setState({
      components,
      parentRule,
      rules,
      variableTemplateItems,
      componentUpdateKey: this.state.componentUpdateKey + 1
    });
  }

  changeTab = (tabType, tabValue) => {
    this.setState({currentTab: {
      type: tabType,
      value: tabValue
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
          currentName = this.state.components[this.state.currentTab.value].name
          currentFormula = this.state.components[this.state.currentTab.value].formula
          break;
        case 'parentRule':
          currentName = this.state.parentRule.name
          currentFormula = this.state.parentRule.formula
          break;
        case 'newRule':
          currentName = ''
          currentFormula = []
          break;
        case 'rule':
          currentName = this.state.rules[this.state.currentTab.value].name
          currentFormula = this.state.rules[this.state.currentTab.value].formula
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

    this.setState({currentFormula}, () => {
      const validation = _.cloneDeep(this.state.validation);
      this.formulaValidations(validation);
      this.setState({validation})
    });
  }

  saveChanges = (dragAndDropFormulaLogicElements) => {
    const logicElements = _.cloneDeep(dragAndDropFormulaLogicElements);
    const currentFormula = this.convertDragAndDropFormulaToArray(logicElements);

    this.setState({currentFormula}, () => {
      if (this.runValidations()) {
        switch (this.state.currentTab.type) {
          case 'newComponent':
            this.saveNewComponent();
            break;
          case 'component':
            this.saveComponent();
            break;
          case 'parentRule':
            this.saveparentRule();
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
    const newDragAndDropFormulaLogicElements = [];

    for (let i = 0; i < dragAndDropFormulaLogicElements.length; i++) {
      newDragAndDropFormulaLogicElements.push(dragAndDropFormulaLogicElements[i].value);

      if (newDragAndDropFormulaLogicElements[i].constructor === Array) {
        newDragAndDropFormulaLogicElements[i] = this.convertDragAndDropFormulaToArray(newDragAndDropFormulaLogicElements[i]);
      };
    };

    return newDragAndDropFormulaLogicElements;
  }

  saveNewComponent = () => {
    // set unique ID
    let i = 0;
    while (this.state.components['@' + i]) i++;

    const components = _.cloneDeep(this.state.components);
    components['@' + i] = ({name: this.state.currentName, formula: this.state.currentFormula});

    this.setState({components}, this.changeTab('component', '@' + i));
  }

  saveComponent = () => {
    const components = _.cloneDeep(this.state.components);
    components[this.state.currentTab.value].name = this.state.currentName;
    components[this.state.currentTab.value].formula = this.state.currentFormula;

    this.setState({components}, this.changeTab('component', this.state.currentTab.value));
  }

  saveparentRule = () => {
    const parentRule = _.cloneDeep(this.state.parentRule);
    parentRule.name = this.state.currentName;
    parentRule.formula = this.state.currentFormula;

    this.setState({parentRule}, this.changeTab('parentRule', ''));
  }

  saveNewRule = () => {
    // set unique ID
    let i = 0;
    while (this.state.rules['~' + i]) i++;

    const rules = _.cloneDeep(this.state.rules);
    rules['~' + i] = ({name: this.state.currentName, formula: this.state.currentFormula});

    this.setState({rules}, this.changeTab('rule', '~' + i));
  }

  saveRule = () => {
    const rules = _.cloneDeep(this.state.rules);
    rules[this.state.currentTab.value].name = this.state.currentName;
    rules[this.state.currentTab.value].formula = this.state.currentFormula;

    this.setState({rules}, this.changeTab('rule', this.state.currentTab.value));
  }

  runValidations = () => {
    const validation = _.cloneDeep(this.state.validation);

    this.nameValidations(validation);
    this.formulaValidations(validation);

    this.setState({validation});
    return (validation.name.length === 0 && validation.formula.length === 0);
  }

  nameValidations = validationObject => {
    validationObject.name = [];

    if (!this.state.currentName) validationObject.name.push('Name cannot be blank.');
    // if (this.state.currentName === 'formula') validationObject.name.push('The name "formula" is reserved and cannot be used.');

    if (this.anyRuleOrComponent()) {
      if (this.checkDuplicateName('components')) validationObject.name.push('A component with this name already exists.');
      if (this.checkDuplicateName('rules')) validationObject.name.push('A rule with this name already exists.');
    };
  }

  formulaValidations = validationObject => {
    validationObject.formula = [];

    if (this.existingRuleOrComponent()) {
      const dependenciesArray = [];
      this.checkFormulaDependencies(this.state.currentTab.value, this.state.currentFormula, dependenciesArray);
      const dependenciesArrayToName = dependenciesArray.map(dependency => {
        return (this.getElementType(dependency) === 'component' ? this.state.components[dependency].name : this.state.rules[dependency].name)
      });

      if (dependenciesArrayToName.length > 0) validationObject.formula.push('The current ' + this.state.currentTab.type + ' is used within ' + dependenciesArrayToName.join(', '));
    };
  }

  checkDuplicateName = (componentsOrRules) => {
    const componentsOrRulesObject = componentsOrRules === 'components' ? this.state.components : this.state.rules;

    let duplicate = false;
    const componentsOrRulesObjectKeys = Object.keys(componentsOrRulesObject);
    for (let i = 0; i < componentsOrRulesObjectKeys.length; i++) {
      const key = componentsOrRulesObjectKeys[i];
      if (componentsOrRulesObject[key].name === this.state.currentName) { duplicate = true; break; };
    };

    if (this.newRuleOrComponent()) {
      return duplicate;
    } else {
      const currentObjectName = (this.state.currentTab.type === 'component' ? this.state.components : this.state.rules)[this.state.currentTab.value].name;
      return this.state.currentName !== currentObjectName && duplicate;
    };
  }

  anyRuleOrComponent = () => {
    return this.state.currentTab.type !== 'parentRule';
  }

  anyRule = () => {
    return this.state.currentTab.type === 'rule' || this.state.currentTab.type === 'newRule';
  }

  anyComponent = () => {
    return this.state.currentTab.type === 'component' || this.state.currentTab.type === 'newComponent';
  }

  newRuleOrComponent = () => {
    return this.state.currentTab.type === 'newRule' || this.state.currentTab.type === 'newComponent';
  }

  existingRuleOrComponent = () => {
    return this.state.currentTab.type === 'rule' || this.state.currentTab.type === 'component';
  }

  // ensure a component does not bring in another component which
  // the definition relies on itself resulting in an infinity loop
  checkFormulaDependencies = (currentItem, formula, dependenciesArray) => {
    for (let i = 0; i < formula.length; i++) {
      if (this.getElementType(formula[i]) === 'bracket') {
        this.checkFormulaDependencies(currentItem, formula[i], dependenciesArray)
      } else {
        const dependencyItem = this.getDependencyItem(currentItem, formula[i])
        if (dependencyItem) dependenciesArray.push(dependencyItem);
      };
    };

    return dependenciesArray;
  }

  getDependencyItem = (currentItem, formulaOrItem) => {
    if (formulaOrItem.constructor === Array) {
      for (let i = 0; i < formulaOrItem.length; i++) {
        const elementType = this.getElementType(formulaOrItem[i]);

        if (elementType === 'component' || elementType === 'rule') {
          const componentOrRule = elementType === 'component' ? this.state.components[formulaOrItem[i]] : this.state.rules[formulaOrItem[i]];
          const nestedDependencyCheck = this.getDependencyItem(currentItem, componentOrRule.formula);

          if (nestedDependencyCheck) return formulaOrItem[i];
        };

        if (formulaOrItem[i] === currentItem) return formulaOrItem[i];
      };

      return false;
    } else {
      const elementType = this.getElementType(formulaOrItem);

      if (elementType === 'component' || elementType === 'rule') {
        const componentOrRule = elementType === 'component' ? this.state.components[formulaOrItem] : this.state.rules[formulaOrItem];
        const nestedDependencyCheck = this.getDependencyItem(currentItem, componentOrRule.formula);

        if (nestedDependencyCheck) return formulaOrItem;
      };

      if (formulaOrItem === currentItem) return formulaOrItem;
    };
  }

  generateDragAndDropFormulaObject = () => {
    const logicElementsAndId = this.assignIdAndTypetoLogicElements(_.cloneDeep(this.state.currentFormula), 0);
    const startingId = logicElementsAndId.currentId;
    const logicElements = logicElementsAndId.logicElementsArray;
    const componentTemplateItems = this.convertComponentTemplateItems();
    const ruleTemplateItems = this.convertRuleTemplateItems();
    const variableTemplateItems = this.state.variableTemplateItems;

    return {
      startingId,
      logicElements,
      componentTemplateItems,
      ruleTemplateItems,
      variableTemplateItems
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
        const updatedLogicElementsArrayAndCurrentId = this.assignIdAndTypetoLogicElements(updatedLogicElements[i].value, currentId)
        currentId = updatedLogicElementsArrayAndCurrentId.currentId;
        updatedLogicElements[i].value = updatedLogicElementsArrayAndCurrentId.logicElementsArray;
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

  convertRuleTemplateItems = () => {
    const ruleTemplateItems = {};

    Object.keys(this.state.rules).map(key => {
      ruleTemplateItems[key] = {
        value: key,
        title: this.state.rules[key].name,
        color: 'black',
        canDrag: true
      };
    });

    return ruleTemplateItems;
  }

  getElementType = logicElementValue => {
    let elementType = ''

    if (logicElementValue.constructor === Array || logicElementValue === '( )') {
      elementType = 'bracket'
    } else if (logicElementValue[0] === '@') {
      elementType = 'component'
    } else if (logicElementValue[0] === '#') {
      elementType = 'variable'
    } else if (logicElementValue[0] === '~') {
      elementType = 'rule'
    } else if (['+', '-', '*', '/'].indexOf(logicElementValue) !== -1) {
      elementType = 'operator'
    } else if (['<', '>', '<=', '>=', '='].indexOf(logicElementValue) !== -1) {
      elementType = 'comparison'
    } else if (['IF', 'ELSIF', 'ELSE'].indexOf(logicElementValue) !== -1) {
      elementType = 'ifelse'
    } else {
      elementType = 'number'
    };

    return elementType;
  }

  render() {
    return (
      <div className="row">
        <div className="col-md-12">
          <span style={{float: 'left'}}>
            <Header currentTab={this.state.currentTab} />
          </span>
          <span style={{float: 'right'}}>
            <RulesMenu parentRule={this.state.parentRule} rules={this.state.rules} changeTab={this.changeTab} />
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
            getElementType={this.getElementType}
            validation={this.state.validation}
          />
        </div>
      </div>
    );
  }
}

export default MainContainer;