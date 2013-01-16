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
	
	$.ay.questionnaire = function (formElm) {
		var fieldsets = [],
			selfQuestionaire = {};
		
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
				
				//console.log(routes);
				
				selfFieldset[state ? 'show' : 'hide']();
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
			
			selfFieldset.hide = function () {
				fieldsetElm.hide();
				visible = false;
			};
			
			selfFieldset.show = function () {
				fieldsetElm.show();
				visible = true;
			};
			
			selfFieldset.isVisible = function () {
				return visible;
			};
			
			selfFieldset.addInput = function (input) {
				return new Input(input, selfFieldset, fieldsetElm);
			}
			
			return selfFieldset;
		};
		
		var Input = function (inputElm, selfFieldset, fieldsetElm) {
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
						
						selfQuestionaire.update();
					}
				};
				
				inputElm.on('change', setValue);
			} else {
				throw new Error('Not implemented.');
			}
			
			// prepare initial value
			setValue();
			
			return {
				isVisible: function () {
					return selfFieldset.isVisible();
				},
				getValue: function () {
					return value;
				}
			};
		};
		
		selfQuestionaire.addFieldset = function (fieldset) {
			fieldset = new Fieldset(fieldset)
			fieldsets.push(fieldset);
			return fieldset;
		};
		
		/**
		 * Called when any of the dependant input value is changed and upon initiation.
		 */
		selfQuestionaire.update = function () {
			var i, j;
			for (i = 0, j = fieldsets.length; i < j; ++i) {
				fieldsets[i].update();
			}
		};
		
		return selfQuestionaire;
	};
})($);