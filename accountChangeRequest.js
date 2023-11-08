import { LightningElement, api, wire, track } from 'lwc';
import {CurrentPageReference} from 'lightning/navigation';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';

// Import the relevant Account fields

import ACCOUNT_FIELDS from '@salesforce/schema/Account';
import CHANGE_REQUEST_OBJECT from '@salesforce/schema/Change_Request__c';

const ACCOUNT_BILL_COUNTRY_FIELD = ACCOUNT_FIELDS.BillingCountry;
const ACCOUNT_BILL_STREET_FIELD = ACCOUNT_FIELDS.BillingStreet;
const ACCOUNT_BILL_CITY_FIELD = ACCOUNT_FIELDS.BillingCity;
const ACCOUNT_BILL_STATE_FIELD = ACCOUNT_FIELDS.BillingState;
const ACCOUNT_BILL_POSTAL_CODE_FIELD = ACCOUNT_FIELDS.BillingPostalCode;
const ACCOUNT_SHIP_COUNTRY_FIELD = ACCOUNT_FIELDS.ShippingCountry;
const ACCOUNT_SHIP_STREET_FIELD = ACCOUNT_FIELDS.ShippingStreet;
const ACCOUNT_SHIP_CITY_FIELD = ACCOUNT_FIELDS.ShippingCity;
const ACCOUNT_SHIP_STATE_FIELD = ACCOUNT_FIELDS.ShippingState;
const ACCOUNT_SHIP_POSTAL_CODE_FIELD = ACCOUNT_FIELDS.ShippingPostalCode;

export default class AccountChangeRequest extends LightningElement {
    @api recordId;
    @track isLoaded = true;
    @track isStep1 = true;
    @track isStep2 = false;
    @track isStep3 = false;
    @track isStep4 = false;
    @track selectedChangeType = 'Customer Change';
    @track selectedChanges = [];
    @track selectedOption = null;
    @track showSubmitButton = false;
    @track showPreviousButton = false;
    @track showNextButton = false;
    @track headerText = 'Step 1: Type of Change';
    @track changeTypeOptions = [
        { label: 'All Updates', value: 'All Updates', isChecked: false },
        { label: 'Update Rep', value: 'Update Rep', isChecked: false },
        { label: 'Update Class', value: 'Update Class', isChecked: false },
        { label: 'Update SSC', value: 'Update SSC', isChecked: false },
        { label: 'Update Address', value: 'Update Address', isChecked: false },
        { label: 'Update Account Name', value: 'Update Account Name', isChecked: false },
        { label: 'Update Customer Type', value: 'Update Customer Type', isChecked: false },
        { label: 'Other Updates', value: 'Other Updates', isChecked: false }
    ];
    @track allUpdates = false;
    @track updateRep = false;
    @track updateClass = false;
    @track updateSSC = false;
    @track updateAddress = false;
    @track updateAccountName = false;
    @track updateCustomerType = false;
    @track otherUpdates = false;

    // Define properties to control the visibility of different sections
    @track showCustomerNameChange = true;
    @track showCustomerDetailsChange = true;
    @track showSalesRepField = true;
    @track showSSCField = true;
    @track showCustomerClassField = true;
    @track showCustomerTypeField = true;
    @track showAddressChange = true;
    @track showBillToAddressChanges = true;
    @track showShipToAddressChanges = true;
    @track showOtherUpdates = true;
    @track accountBillCountry = '';
    @track accountBillStreet = '';
    @track accountBillStreet2 = '';
    @track accountBillCity = '';
    @track accountBillState = '';
    @track accountBillPostalCode = '';    
    @track accountShipCountry = '';
    @track accountShipStreet = '';
    @track accountShipStreet2 = '';
    @track accountShipCity = '';
    @track accountShipState = '';
    @track accountShipPostalCode = '';
    @track accountBillCountryN = '';
    @track accountBillStreetN = '';
    @track accountBillStreet2N = '';
    @track accountBillCityN = '';
    @track accountBillStateN = '';
    @track accountBillPostalCodeN = '';    
    @track accountShipCountryN = '';
    @track accountShipStreetN = '';
    @track accountShipStreet2N = '';
    @track accountShipCityN = '';
    @track accountShipStateN = '';
    @track accountShipPostalCodeN = '';

    // handle getting the current record
    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference) {
            this.recordId = currentPageReference.state.recordId;
            console.log('getStateParameters + recordId: ', this.recordId);
        }
    }

    // handle loading the Account fields
    @wire(getRecord, {
        recordId: '$recordId',
        fields: [
            ACCOUNT_BILL_COUNTRY_FIELD,
            ACCOUNT_BILL_STREET_FIELD,
            ACCOUNT_BILL_CITY_FIELD,
            ACCOUNT_BILL_STATE_FIELD,
            ACCOUNT_BILL_POSTAL_CODE_FIELD,
            ACCOUNT_SHIP_COUNTRY_FIELD,
            ACCOUNT_SHIP_STREET_FIELD,
            ACCOUNT_SHIP_CITY_FIELD,
            ACCOUNT_SHIP_STATE_FIELD,
            ACCOUNT_SHIP_POSTAL_CODE_FIELD
        ]
    })
    loadFields({ error, data }) {
        console.log('loadFields + recordId: ', this.recordId);
        if (error) {
            console.log('loadFields + error', JSON.parse(JSON.stringify(error)));
            // Handle the error
        } else if (data) {
            console.log('loadFields + data', JSON.parse(JSON.stringify(data)));
            // Get the values of the new fields
            this.accountBillCountry = data.fields[ACCOUNT_BILL_COUNTRY_FIELD].value;
            this.accountBillStreet = data.fields[ACCOUNT_BILL_STREET_FIELD].value;
            this.accountBillCity = data.fields[ACCOUNT_BILL_CITY_FIELD].value;
            this.accountBillState = data.fields[ACCOUNT_BILL_STATE_FIELD].value;
            this.accountBillPostalCode = data.fields[ACCOUNT_BILL_POSTAL_CODE_FIELD].value;
            this.accountShipCountry = data.fields[ACCOUNT_SHIP_COUNTRY_FIELD].value;
            this.accountShipStreet = data.fields[ACCOUNT_SHIP_STREET_FIELD].value;
            this.accountShipCity = data.fields[ACCOUNT_SHIP_CITY_FIELD].value;
            this.accountShipState = data.fields[ACCOUNT_SHIP_STATE_FIELD].value;
            this.accountShipPostalCode = data.fields[ACCOUNT_SHIP_POSTAL_CODE_FIELD].value;
        }
    }

    changeOptions = [
        { label: 'Customer Change', value: 'Customer Change' },
        { label: 'New ShipTo Account', value: 'New ShipTo Account' }
    ];

    get customerChangeClass() {
        return this.selectedOption === 'customerChange' ? 'slds-button_brand; background-color: #0070d2; color: #000000;' : '';
    }

    get newShipToAccountClass() {
        return this.selectedOption === 'newShipToAccount' ? 'slds-button_brand; background-color: #0070d2; color: #000000;' : '';
    }

    get customerChangeStyle() {
        return this.selectedOption === 'customerChange' ? 'background-color: #0070d2; color: #000000;' : '';
    }

    get newShipToAccountStyle() {
        return this.selectedOption === 'newShipToAccount' ? 'background-color: #0070d2; color: #000000;' : '';
    }

    handleCheckboxChange(event) {
        const fieldName = event.target.name;
        const fieldValue = event.target.checked;
        this[fieldName] = fieldValue;

        console.log('handleCheckboxChange + fieldName', fieldName);
        console.log('handleCheckboxChange + fieldValue', fieldValue);

        if (fieldName == 'allUpdates') {
            this.handleSelectAll(fieldValue);
        }
    }  

    handleSelectAll(selectedChangeChecked) {
        console.log('handleSelectAll + selectedChangeChecked');

        this.updateRep = selectedChangeChecked;
        this.updateClass = selectedChangeChecked;
        this.updateSSC = selectedChangeChecked;
        this.updateAddress = selectedChangeChecked;
        this.updateName = selectedChangeChecked;
        this.updateCustomerType = selectedChangeChecked;
        this.updateOther = selectedChangeChecked;

    }

    handleSuccess(event) {
        // Handle the form submission success
        const toastEvent = new ShowToastEvent({
            title: 'Success',
            message: 'Change request created successfully',
            variant: 'success',
        });
        this.dispatchEvent(toastEvent);
    }

    // Update these methods to control the visibility of sections based on selections
    handleCustomerChange() {
        this.selectedOption = 'customerChange';
        this.showCustomerNameChange = true;
        this.showCustomerDetailsChange = true;
        this.showAddressChange = true;
        this.showBillToAddressChanges = true;
        this.showShipToAddressChanges = true;
        this.showOtherUpdates = true;
        console.log('handleCustomerChange + this.selectedOption', this.selectedOption);
        this.handleNextStep();
    }

    handleNewShipToAccount() {
        this.selectedOption = 'newShipToAccount';
        this.showCustomerNameChange = false;
        this.showCustomerDetailsChange = false;
        this.showSalesRepField = false;
        this.showSSCField = false;
        this.showCustomerClassField = false;
        this.showCustomerTypeField = false;
        this.showAddressChange = false;
        this.showBillToAddressChanges = false;
        this.showShipToAddressChanges = false;
        this.showOtherUpdates = false;
        console.log('handleNewShipToAccount + this.selectedOption', this.selectedOption);
        this.handleNextStep();
    }

    handleNextStep() {
        console.log('handleNextStep + this.isStep1', this.isStep1);
        if (this.isStep1) {
            // Handle step 1 logic and transition to step 2
            this.isStep1 = false;
            this.isStep2 = true;
            this.showNextButton = true;
            this.showPreviousButton = true;
            this.showSubmitButton = false;
            this.headerText = 'Step 2: Changes (if Customer Change)';
        } else if (this.isStep2) {
            // Handle step 2 logic and transition to step 3
            this.isStep2 = false;
            this.isStep3 = true;
            this.showNextButton = true;
            this.showPreviousButton = true;
            this.showSubmitButton = false;
            this.headerText = 'Step 3: Customer Change Information';
        } else if (this.isStep3) {
            // Handle step 3 logic and transition to step 4
            this.isStep3 = false;
            this.isStep4 = true;
            this.headerText = 'Step 4: Confirm Changes';
            this.showNextButton = false;
            this.showPreviousButton = true;
            this.showSubmitButton = true;
        }
    }

    handlePreviousStep() {
        if (this.isStep4) {
            // Transition from step 4 to step 3
            this.isStep4 = false;
            this.isStep3 = true;
            this.headerText = 'Step 3: Customer Change Information';
            this.showNextButton = true;
            this.showPreviousButton = true;
            this.showSubmitButton = false;
        } else if (this.isStep3) {
            // Transition from step 3 to step 2
            this.isStep3 = false;
            this.isStep2 = true;
            this.headerText = 'Step 2: Changes (if Customer Change)';
            this.showPreviousButton = true;
            this.showSubmitButton = false;
            this.showNextButton = true;
        } else if (this.isStep2) {
            // Transition from step 2 to step 1
            this.isStep2 = false;
            this.isStep1 = true;
            this.headerText = 'Step 1: Type of Change';
            this.showPreviousButton = false;
            this.showNextButton = false;
            this.showSubmitButton = false;
        }
    }    
    
    handleCancel() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }
    
    handleSubmit() {
        // handle submit actions
    }

}
