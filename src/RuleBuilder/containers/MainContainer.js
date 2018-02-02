import React, { Component } from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery';
import _ from 'lodash';
import axios from 'axios';
import LogicElementTypes from '../config/LogicElementTypes';
import DragAndDropFormula from './DragAndDropFormula';
import Header from '../components/Header';
import Formula from './Formula';

class MainContainer extends Component {
  static propTypes = {
    logicSetId: PropTypes.number.isRequired,
    components: PropTypes.object.isRequired,
    parentRule: PropTypes.object.isRequired,
    rules: PropTypes.object.isRequired,
    variables: PropTypes.object.isRequired,
    selectLogicSet: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      logicSetId: null,
      componentUpdateKey: 0,
      components: {},
      parentRule: {
        name: '',
        formula: []
      },
      rules: {},
      variables: {},
      currentTab: {
        type: 'parentRule',
        value: ''
      },
      currentName: '',
      currentFormula: [],
      currentColor: '',
      validation: {
        name: [],
        formula: []
      }
    };
  }

  componentDidMount() {
    const {
      logicSetId,
      components,
      parentRule,
      rules,
      variables
    } = this.props;

    this.setState({
      logicSetId,
      components,
      parentRule,
      rules,
      variables,
      componentUpdateKey: this.state.componentUpdateKey + 1
    });
  }

  saveApiCallChangeTab = (tabType, tabValue) => {
    this.saveApiCall();
    this.changeTab(tabType, tabValue);
  }

  saveApiCall = () => {
    axios({
      method: 'PUT',
      url: '/admin/settings/logic_sets/' + this.state.logicSetId,
      data: {
        logic_sets: {
          definitions: JSON.stringify({
            components: this.state.components,
            parentRule: this.state.parentRule,
            rules: this.state.rules,
            variableTemplateItems: this.state.variableTemplateItems
          })
        }
      },
      responseType: 'json',
      headers: {
        'X-CSRF-Token': $("meta[name=csrf-token]").attr('content')
      }
    })
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  changeTab = (tabType, tabValue) => {
    this.setState({currentTab: {
      type: tabType,
      value: tabValue
    }}, () => {
      this.setCurrentNameFormulaColor();
    });
  }

  setCurrentNameFormulaColor = () => {
    this.setState({validation: {name: [], formula: []}}, () => {
      let currentName = '';
      let currentFormula = [];
      let currentColor = '#000000';

      switch (this.state.currentTab.type) {
        case 'newComponent':
          break;
        case 'component':
          currentName = this.state.components[this.state.currentTab.value].name;
          currentFormula = this.state.components[this.state.currentTab.value].formula;
          currentColor = this.state.components[this.state.currentTab.value].color;
          break;
        case 'parentRule':
          currentName = this.state.parentRule.name;
          currentFormula = this.state.parentRule.formula;
          currentColor = this.state.parentRule.color;
          break;
        case 'newRule':
          break;
        case 'rule':
          currentName = this.state.rules[this.state.currentTab.value].name;
          currentFormula = this.state.rules[this.state.currentTab.value].formula;
          currentColor = this.state.rules[this.state.currentTab.value].color;
          break;
        case 'newVariable':
          break;
        case 'variable':
          currentName = this.state.variables[this.state.currentTab.value].name;
          currentColor = this.state.variables[this.state.currentTab.value].color;
          break;
        default:
          break;
      };

      this.setState({
        currentName,
        currentFormula,
        currentColor,
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
          case 'newVariable':
            this.saveNewVariable();
            break;
          case 'variable':
            this.saveVariable();
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
    components['@' + i] = ({name: this.state.currentName, formula: this.state.currentFormula, color: this.state.currentColor});

    this.setState({components}, () => {
      this.saveApiCallChangeTab('component', '@' + i)
    });
  }

  saveComponent = () => {
    const components = _.cloneDeep(this.state.components);
    components[this.state.currentTab.value].name = this.state.currentName;
    components[this.state.currentTab.value].formula = this.state.currentFormula;
    components[this.state.currentTab.value].color = this.state.currentColor;

    this.setState({components}, () => {
      this.saveApiCallChangeTab('component', this.state.currentTab.value)
    });
  }

  saveparentRule = () => {
    const parentRule = _.cloneDeep(this.state.parentRule);
    parentRule.name = this.state.currentName;
    parentRule.formula = this.state.currentFormula;
    parentRule.color = this.state.currentColor;

    this.setState({parentRule}, () => {
      this.saveApiCallChangeTab('parentRule', '')
    });
  }

  saveNewRule = () => {
    // set unique ID
    let i = 0;
    while (this.state.rules['~' + i]) i++;

    const rules = _.cloneDeep(this.state.rules);
    rules['~' + i] = ({name: this.state.currentName, formula: this.state.currentFormula, color: this.state.currentColor});

    this.setState({rules}, () => {
      this.saveApiCallChangeTab('rule', '~' + i)
    });
  }

  saveRule = () => {
    const rules = _.cloneDeep(this.state.rules);
    rules[this.state.currentTab.value].name = this.state.currentName;
    rules[this.state.currentTab.value].formula = this.state.currentFormula;
    rules[this.state.currentTab.value].color = this.state.currentColor;

    this.setState({rules}, () => {
      this.saveApiCallChangeTab('rule', this.state.currentTab.value)
    });
  }

  saveNewVariable = () => {
    // set unique ID
    let i = 0;
    while (this.state.variables['#' + i]) i++;

    const variables = _.cloneDeep(this.state.variables);
    variables['#' + i] = ({name: this.state.currentName, color: this.state.currentColor});

    this.setState({variables}, () => {
      this.saveApiCallChangeTab('variable', '#' + i)
    });
  }

  saveVariable = () => {
    const variables = _.cloneDeep(this.state.variables);
    variables[this.state.currentTab.value].name = this.state.currentName;
    variables[this.state.currentTab.value].color = this.state.currentColor;

    this.setState({variables}, () => {
      this.saveApiCallChangeTab('variable', this.state.currentTab.value)
    });
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
      if (this.checkDuplicateName('variables')) validationObject.name.push('A variable with this name already exists.');
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

  checkDuplicateName = (objectType) => {
    const componentsOrRulesObject = this.state[objectType];

    let duplicate = false;
    const componentsOrRulesObjectKeys = Object.keys(componentsOrRulesObject);
    for (let i = 0; i < componentsOrRulesObjectKeys.length; i++) {
      const key = componentsOrRulesObjectKeys[i];
      if (componentsOrRulesObject[key].name === this.state.currentName) { duplicate = true; break; };
    };

    if (this.newObject()) {
      return duplicate;
    } else {
      const currentObjectName = this.state[(this.state.currentTab.type) + 's'][this.state.currentTab.value].name;
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

  newObject = () => {
    return this.state.currentTab.type === 'newRule' || this.state.currentTab.type === 'newComponent' || this.state.currentTab.type === 'newVariable';
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
    const variableTemplateItems = this.convertVariableTemplateItems();

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
        name: this.state.components[key].name,
        color: this.state.components[key].color,
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
        name: this.state.rules[key].name,
        color: this.state.rules[key].color,
        canDrag: true
      };
    });

    return ruleTemplateItems;
  }

  convertVariableTemplateItems = () => {
    const variableTemplateItems = {};

    Object.keys(this.state.variables).map(key => {
      variableTemplateItems[key] = {
        value: key,
        name: this.state.variables[key].name,
        color: this.state.variables[key].color,
        canDrag: true
      };
    });

    return variableTemplateItems;
  }

  getElementType = logicElementValue => {
    let elementType = ''

    if (logicElementValue.constructor === Array || logicElementValue === '( )') {
      elementType = LogicElementTypes.BRACKET
    } else if (logicElementValue[0] === '@') {
      elementType = LogicElementTypes.COMPONENT
    } else if (logicElementValue[0] === '#') {
      elementType = LogicElementTypes.VARIABLE
    } else if (logicElementValue[0] === '~') {
      elementType = LogicElementTypes.RULE
    } else if (['+', '-', '*', '/'].indexOf(logicElementValue) !== -1) {
      elementType = LogicElementTypes.OPERATOR
    } else if (['<', '>', '<=', '>=', '='].indexOf(logicElementValue) !== -1) {
      elementType = LogicElementTypes.COMPARISON
    } else if (['IF', 'ELSIF', 'ELSE'].indexOf(logicElementValue) !== -1) {
      elementType = LogicElementTypes.IFELSE
    } else {
      elementType = LogicElementTypes.NUMBER
    };

    return elementType;
  }

  render() {
    const {
      selectLogicSet
    } = this.props

    return (
      <div className="row">
        <div className="col-md-12">
          <Header currentTab={this.state.currentTab} />
        </div>
        <div className="col-md-12">
          <Formula
            currentTab={this.state.currentTab}
            rules={this.state.rules}
            currentName={this.state.currentName}
            validation={this.state.validation}
            currentColor={this.state.currentColor}
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
            parentRule={this.state.parentRule}
            selectLogicSet={selectLogicSet}
          />
        </div>
      </div>
    );
  }
}

export default MainContainer;
