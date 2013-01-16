$(function () {
	var myQuestionaire = $.ay.questionnaire($('form')),
		
		fieldsetA = myQuestionaire.addFieldset(function (parent) { return parent.find('fieldset').eq(0); }),
		fieldsetB = myQuestionaire.addFieldset(function (parent) { return parent.find('fieldset').eq(1); }),
		fieldsetC = myQuestionaire.addFieldset(function (parent) { return parent.find('fieldset').eq(2); }),
		fieldsetD = myQuestionaire.addFieldset(function (parent) { return parent.find('fieldset').eq(3); }),
		fieldsetE = myQuestionaire.addFieldset(function (parent) { return parent.find('fieldset').eq(4); }),
		
		inputA = fieldsetA.addInput(function (parent) { return parent.find('input'); }),
		inputB = fieldsetB.addInput(function (parent) { return parent.find('input'); }),
		inputC = fieldsetC.addInput(function (parent) { return parent.find('input'); }),
		inputD = fieldsetD.addInput(function (parent) { return parent.find('input'); });
	
	fieldsetB.createRoute().link(inputA, function (val) { return val === "1"; });
	fieldsetC.createRoute().link(inputB, function (val) { return val === "1"; });
	fieldsetD.createRoute().link(inputC, function (val) { return val === "1"; });
	
	fieldsetE.createRoute().link(inputA, function (val) { return val === "0"; })
	fieldsetE.createRoute().link(inputB, function (val) { return val === "0"; });
	fieldsetE.createRoute().link(inputD, function (val) { return val !== false; });
	
	myQuestionaire.update();
});