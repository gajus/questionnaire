/**
 * jQuery Questionnaire v0.0.0
 * https://github.com/gajus/questionnaire
 *
 * Licensed under the BSD.
 * https://github.com/gajus/questionnaire/blob/master/LICENSE
 *
 * Author: Gajus Kuizinas <g.kuizinas@anuary.com>
 */
(function ($) {
	'use strict';
	
	$.ay = $.ay || {};
	
	$.ay.questionnaire = function (formElm, options) {
		var settings,
			fieldsets = [],
			questionnaire = {};
		
		settings = $.extend({
			'resetHiddenFields': false
		}, options);
		
		if (!(formElm instanceof $) || formElm.length !== 1 || !formElm.is('form')) {
			throw new Error('Questionaire container must be a single form element.');
		}
		
		/**
		 * @param {Function} fieldsetFn Expected to return a fieldset element.
		 */
		var Fieldset = function (fieldsetFn) {
			var routes = [], // An array of array input instances, where every input determines fieldset visibility.
				selfFieldset = this,
				visible,
				fieldsetElm;
			
			fieldsetElm = fieldsetFn.call(null, formElm);
			
			if (!(fieldsetElm instanceof $) || fieldsetElm.length !== 1 || !fieldsetElm.is('fieldset')) {
				throw new Error('Question group container must be a single fieldset element.');
			}
			
			selfFieldset.update = function () {
				var i, j, l, k, state = true;
	
				for (i = 0, j = routes.length; i < j; i++) {
					state = true;
					for (l = 0, k = routes[i].inputs.length; l < k; l++) {
						if (!routes[i].inputs[l].input.isVisible() || !routes[i].inputs[l].callback(routes[i].inputs[l].input.getValue())) {
							state = false;
						}
					}
					
					if (state === true) {
						break;
					}
				}
				
				selfFieldset.state(state);
			};
			
			selfFieldset.createRoute = function () {
				var route = {
					inputs: [],
					/**
					 * @param {Function} callback A boolean function to validate input value.
					 */
					link: function (input, callback) {
						// @todo make sure it is not yet added
						if (!input instanceof Input) {
							throw new Error('Fieldset input must be an instance of Input.');
						}
						this.inputs.push({input: input, callback: callback});
						return this;
					}
				};
				
				routes.push(route);
				
				return route;
			};
			
			selfFieldset.state = function (newState) {
				visible = newState;
				fieldsetElm[visible ? 'show' : 'hide']();
				
				if (!visible && settings.resetHiddenFields) {
					fieldsetElm.find('input, select, textarea').each(function () {
						switch (this.type.toLowerCase()) {
							case 'text':
							case 'password':
							case 'textarea':
							case 'hidden':
								this.value = '';
								break;
							
							case 'radio':
							case 'checkbox':
								this.checked = false;
								break;
								
							case 'select-one':
							case 'select-multi':
								this.selectedIndex = -1;
								break;
							
							default:
								throw new Error('Unsupported input type.');
								break;
						}
					});
				}
			};
			
			selfFieldset.isVisible = function () {
				return visible;
			};
			
			selfFieldset.addInput = function (input) {
				return new Input(input, selfFieldset, fieldsetElm);
			}
			
			return selfFieldset;
		};
		
		var Input = function (inputElm, fieldset, fieldsetElm) {
			var value,
				registerChange,
				setValue;
			
			inputElm = inputElm.call(null, fieldsetElm);
			
			// @todo typecheck
			
			if (inputElm.length > 1) {
				// @todo If there is more than one input represented by the selector, make sure that it is a radio group with the same name.
				
				setValue = function () {
					var checked = inputElm.filter(':checked'),
						newValue = checked.length ? checked.val() : false;
					
					if (value !== newValue) {
						value = newValue;
						
						questionnaire.update();
					}
				};
				
				inputElm.on('change', setValue);
			} else {
				throw new Error('Not implemented.');
			}
			
			// populate the initial value
			setValue();
			
			return {
				isVisible: function () {
					return fieldset.isVisible();
				},
				getValue: function () {
					return value;
				}
			};
		};
		
		questionnaire.addFieldset = function (fieldset) {
			fieldset = new Fieldset(fieldset)
			fieldsets.push(fieldset);
			return fieldset;
		};
		
		/**
		 * Called when any of the dependant input value is changed and upon initiation.
		 */
		questionnaire.update = function () {
			var i, j;
			for (i = 0, j = fieldsets.length; i < j; ++i) {
				fieldsets[i].update();
			}
		};
		
		return questionnaire;
	};
})($);