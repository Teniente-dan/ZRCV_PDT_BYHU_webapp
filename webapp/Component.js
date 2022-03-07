sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"retailstore/ZRCV_PDT_byHU/model/models",
		"sap/ui/model/resource/ResourceModel",
	"retailstore/ZRCV_PDT_byHU/model/Facade",
	"sap/ui/model/json/JSONModel"
], function (UIComponent,Device, models,ResourceModel,Facade,JSONModel) {
	"use strict";

	return UIComponent.extend("retailstore.ZRCV_PDT_byHU.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			this.setModel(models.createHUSetModel(), "HUSetModel");
			this.setModel(models.createFilterModel(), "filtersModel");
				this.setModel(models.createTUModel(), "TUModel");
					this.setModel(models.createHUModel(), "HUModel");//TUHeaderModel
					this.setModel(models.createTUHeaderModel(), "TUHeaderModel");
						Facade.setService(this.getModel("siteModel"));
// HABILITAR MULTIPLES TUs 10/2021					
			this.posted = "posted";
		},
		addHUtoTU: function (iHU, iTU) {
			if (!this.oTUtoHU) {
				this.oTUtoHU = Object.create(null);
			}
			if (!this.oTUtoHU[iTU]) {
				this.oTUtoHU[iTU] = [iHU];
			} else {
				this.oTUtoHU[iTU].push(iHU);
			}
		},
		removeHUfromTU: function (iHU, iTU) {
			var nArr = this.oTUtoHU[iTU].filter(function(e){ return e !== iHU; });
				this.oTUtoHU[iTU] = nArr;
		},
		addTU:function (iTU){
			if (!this.oTUtoHU) {
				this.oTUtoHU = Object.create(null);
			}
			if (!this.oTUtoHU[iTU]) {
				this.oTUtoHU[iTU] = [];
			} 
		},
		clearDataAfterPost: function () {
			this.oTUtoHU = Object.create(null);
		},
		getDicAsArr:function (fn){
			var oTUDic = this.oTUtoHU;
			for (var key in oTUDic) {
				//if (Object.hasOwn(oTUDic, key)) {
					fn(key, oTUDic);
				//}
			}
		},
// HABILITAR MULTIPLES TUs 10/2021				
	});
});