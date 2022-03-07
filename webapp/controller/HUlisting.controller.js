sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ndc/BarcodeScannerButton",
	"sap/ndc/BarcodeScanner",
	"sap/ui/model/json/JSONModel",
	"retailstore/ZRCV_PDT_byHU/model/Facade",
	'sap/m/MessageStrip',
	'sap/m/MessageBox',
	"sap/ui/Device",
	"sap/ui/model/resource/ResourceModel",
	"sap/m/Button",
	"retailstore/ZRCV_PDT_byHU/controller/SiteSelectDialog",
	"retailstore/ZRCV_PDT_byHU/utils/NavigationHandler",
	"retailstore/ZRCV_PDT_byHU/utils/Context",
	"retailstore/ZRCV_PDT_byHU/model/Formatter",
	"retailstore/ZRCV_PDT_byHU/utils/formatter",
	"sap/m/MessageToast",
	"retailstore/ZRCV_PDT_byHU/model/models"
], function (Controller, B, S, JSONModel, F, MessageStrip, MessageBox, Device, ResourceModel, Button, SiteSelectDialog, NavigationHandler,
	Context, Formatter, formatter, MessageToast, models) {
	"use strict";

	return Controller.extend("retailstore.ZRCV_PDT_byHU.controller.HUlisting", {

		oSiteSelectDialog: null,

		_siteSelectDialog: SiteSelectDialog,
		_navigationHandler: null,
		_context: Context,
		formatter: formatter,
		_messageToast: MessageToast,
		_models: models,

		onInit: function () {
			this._oDataManager = null;
			this.createAssignSiteButton();

			this.getView().setModel(this._models.createI18NModel(), "i18n");
			this._obundle = this.getView().getModel("i18n").getResourceBundle();

			this._navigationHandler = NavigationHandler;
			this.getOwnerComponent().getRouter().getRoute("RouteHUlisting").attachPatternMatched(this.onHUListMatched, this);
		},
		onHUListMatched: function (oEvent) {
			// HABILITAR MULTIPLES TUs 10/2021		
			if(oEvent.getParameter("arguments").HUnumber === this.getOwnerComponent().posted || 
			oEvent.getParameter("arguments").HUnumber === "error"){
				this.clearDataAfterPost();
			}
			// if(oEvent.getParameter("arguments").HUnumber === 'MULTITU' ){
			// 	this.uniqueCall = false;
			// }
			// HABILITAR MULTIPLES TUs 10/2021		
			var sServiceUrl = this.getView().getModel().sServiceUrl;
			var materialSection = this.getView().byId("materials");
			if (oEvent.getParameter("arguments").HUnumber) {
				this.getView().byId("testScan").setValueState(sap.ui.core.ValueState.None);

			}
			var self = this;
			var TUModel = this.getOwnerComponent().getModel("TUModel");
			var TUNumber = TUModel.getProperty("/TU_ID");
			var that = this;

			this.getView().byId("messageStrip").destroyItems();
			this.getView().byId("review").setEnabled(true);
			var TU = TUNumber.trim();
			if (TU !== "") {

				TUModel.setProperty("/TU_ID", TU);

				var oModel = new sap.ui.model.odata.ODataModel(
					sServiceUrl, true);
				var sPath = "/TUHeaders('" + TU + "')";
				// HABILITAR MULTIPLES TUs 10/2021	
				// oModel.read(sPath, {
				// 	success: function (oData) {
				// 		var TUHeaderModel = new sap.ui.model.json.JSONModel();

				// 		TUHeaderModel.setData(oData);
				// 		that.getView().byId("TUHeaderInfo").setModel(TUHeaderModel);
				// 		if (!materialSection.getVisible()) {
				// 			materialSection.setVisible(true);

				// 		}
				// 		self.getView().byId("TUNumberInput").setValueState(sap.ui.core.ValueState.None);
				// 	},
				// 	error: function (oError) {
				// 		var msg = "";
				// 		try {
				// 			msg = JSON.parse(oError.response.body)["error"]["message"]["value"];

				// 		} catch (e) {
				// 			msg = self._obundle.getText("GenericError");
				// 		}
				// 	}
				// });				
				if(!this.getOwnerComponent().uniqueCall){
					this.getOwnerComponent().uniqueCall = true;
					this.TUsRetrieved = 0;
					this.getOwnerComponent().getDicAsArr(function () {this.TUsRetrieved++;}.bind(this));
					if(this.TUsRetrieved !== 0){
						this._navigationHandler.showBusyDialog();
					}
					var selfo = this;
					var afterNav = function (iTU) { 
						var sPath = "/TUHeaders('" + iTU + "')";
						var getData = function () {
							return new Promise(function (resolve, reject) {
								oModel.read(sPath, {
									success: function (oData) {
										if (!that.getView().getModel("multiTU")) {
											that.getView().setModel(new JSONModel([oData]), "multiTU");
										} else {
											var TUs = that.getView().getModel("multiTU").getData();
											that.getView().getModel("multiTU").setData(that.updateTUs(TUs, oData));
										};
										if (!materialSection.getVisible()) {
											materialSection.setVisible(true);
										}
										self.getView().byId("TUNumberInput").setValueState(sap.ui.core.ValueState.None);
										resolve();
									},
									error: function (oError) {
										var msg = "";
										try {
											msg = JSON.parse(oError.response.body)["error"]["message"]["value"];
				
										} catch (e) {
											msg = self._obundle.getText("GenericError");
										}
										reject(msg);
									}
								});
							});
						};
						getData().then(function () {
							// console.log(this.TUsRetrieved);
						})
						.catch(function(err){return err;})
						.finally(function(){
							this.TUsRetrieved--;
							if(this.TUsRetrieved === 0){
								this._navigationHandler.hideBusyDialog();
								this.getOwnerComponent().uniqueCall = false;
							}
						}.bind(selfo));
					};
					this.getOwnerComponent().getDicAsArr(afterNav);
				}
			// HABILITAR MULTIPLES TUs 10/2021	

			} else {

				materialSection.setVisible(false);
				self.getView().byId("review").setEnabled(false);
			}

			var HUModel = this.getOwnerComponent().getModel("HUModel");
			var HU = HUModel.getProperty("/HU_EXT");

			if (HU !== "") {
				//	var HUModel = this.getOwnerComponent().getModel("HUModel");
				HUModel.setSizeLimit(1500);
				//	var TUModel = this.getOwnerComponent().getModel("TUModel");
				TUModel.setSizeLimit(1500);
				//	var TU = TUModel.getProperty("/TU_ID");
				HUModel.setProperty("/HU_EXT", HU);

				var footer = self.getView().byId("footer");

				var entityData = {
					"TU_ID": TU,
					// "HU_EXT": HU
				};
				var oModel = new sap.ui.model.odata.ODataModel(
					sServiceUrl, true);
				oModel.create("/HUInfoSet", entityData, {
					method: "POST",
					success: function (data) {

						var HUModelSingle = new sap.ui.model.json.JSONModel();
						HUModelSingle.setSizeLimit(1500);
						var arr = [];
						arr.push(data);

						HUModelSingle.setData(data);
						self.getView().byId("materialTable2").setModel(HUModelSingle);

						self.getView().byId("toggle").setState(true);
						self.getOwnerComponent().getModel("HUModel").setData(data);
						if (!materialSection.getVisible()) {
							materialSection.setVisible(true);

							if (!footer.getVisible()) {
								footer.setVisible(true);
							}

						}
						self.getView().byId("testScan").setValueState(sap.ui.core.ValueState.None);
					},
					error: function (oError) {
						var msg = "";
						try {
							msg = JSON.parse(oError.response.body)["error"]["message"]["value"];

						} catch (e) {
							msg = self._obundle.getText("GenericError");
						}
						//	MessageToast.show(msg);
					}
				});
				self.getView().byId("TUNumberInput").setValue("");

			} else {

				materialSection.setVisible(false);
				self.getView().byId("review").setEnabled(false);
				var HUerrorModel = new sap.ui.model.json.JSONModel();
				self.getView().byId("materialTable2").setModel(HUerrorModel);
				self.getView().byId("toggle").setState(false);
			}

		},
		//triggered when TU is scanned
		TUscanned: function (oEvent) {
			var TUNumber = this.getView().byId("TUNumberInput").getValue();
			this.getTUheader(this, TUNumber);
		},
		//function to validate TU
		getTUheader: function (that, TUNumber) {
			var self = this;
			that.getView().byId("messageStrip").destroyItems();
			var TU = TUNumber.trim();
			if (TU !== "") {

				var TUModel = this.getOwnerComponent().getModel("TUModel");
				TUModel.setProperty("/TU_ID", TU);
				var sServiceUrl = this.getView().getModel().sServiceUrl;
				//	var sServiceUrl = "/sap/opu/odata/sap/ZRETAILSTORE_RECEIVE_PRODUCT_SRV";
				var oModel = new sap.ui.model.odata.ODataModel(
					sServiceUrl, true);
				var sPath = "/TUHeaders('" + TU + "')";
				self._navigationHandler.showBusyDialog();
				oModel.read(sPath, {
					success: function (oData) {
						self._navigationHandler.hideBusyDialog();
						// HABILITAR MULTIPLES TUs 10/2021						
						// var TUHeaderModel = new sap.ui.model.json.JSONModel(); 

						// TUHeaderModel.setData(oData);
						// that.getOwnerComponent().getModel("TUHeaderModel").setData(oData);
						// that.getView().byId("TUHeaderInfo").setModel(TUHeaderModel);
						that.getOwnerComponent().addTU(TU);
						if (!that.getView().getModel("multiTU")) {
							that.getView().setModel(new JSONModel([oData]), "multiTU");
						} else {
							var TUs = that.getView().getModel("multiTU").getData();
							that.getView().getModel("multiTU").setData(that.updateTUs(TUs, oData));
						};
						// HABILITAR MULTIPLES TUs 10/2021
						that.getView().byId("review").setEnabled(true);
						var materialSection = that.getView().byId("materials");
						if (!materialSection.getVisible()) {
							materialSection.setVisible(true);
							jQuery.sap.delayedCall(1000, this, function () {
								self.getView().byId("testScan").focus();
							});

						}
						var HUModel = self.getOwnerComponent().getModel("HUModel");
						HUModel.setData(null);
						self.getView().byId("materialTable2").updateBindings();
						self.getView().byId("toggle").setState(false);
						self.getView().byId("TUNumberInput").setValueState(sap.ui.core.ValueState.None);
					},
					error: function (oError) {
						self._navigationHandler.hideBusyDialog();
						self.getView().byId("review").setEnabled(false);
						var msg = "";
						try {
							msg = JSON.parse(oError.response.body)["error"]["message"]["value"];

						} catch (e) {
							msg = self._obundle.getText("GenericError");
						}
						var materialSection = self.getView().byId("materials");
						if (materialSection.getVisible()) {
							materialSection.setVisible(false);

						}
						self.getView().byId("TUNumberInput").setValueState(sap.ui.core.ValueState.Error);
						self.getView().byId("TUNumberInput").setValueStateText(msg);
						self.getView().byId("toggle").setState(false);

					}
				});
			} else {
				self.getView().byId("review").setEnabled(false);
				self.getView().byId("TUNumberInput").setValueState(sap.ui.core.ValueState.Error);
				self.getView().byId("TUNumberInput").setValueStateText(self._obundle.getText("EnterValidTU"));
				//

			}

		},
		//trigerred when HU is scanned
		onHUScanInput: function (oEvent) {
			var HUnumber = oEvent.getParameters().value;

			this.HUValidate(HUnumber);
			this.getView().byId("testScan").setValue("");
			this.getView().byId("testScan").focus();

		},
		//validated the HU
		HUValidate: function (HUnumber) {

			var HU = HUnumber.trim();
			var self = this;
			if (HU !== "") {
				var HUModel = this.getOwnerComponent().getModel("HUModel");
				HUModel.setSizeLimit(1500);
				var TUModel = this.getOwnerComponent().getModel("TUModel");
				TUModel.setSizeLimit(1500);
				var TU = TUModel.getProperty("/TU_ID");
				HUModel.setProperty("/HU_EXT", HU);

				var materialSection = self.getView().byId("materials");
				var footer = self.getView().byId("footer");
				var sServiceUrl = this.getView().getModel().sServiceUrl;
				//	var sServiceUrl = "/sap/opu/odata/sap/ZRETAILSTORE_RECEIVE_PRODUCT_SRV";
				// HABILITAR MULTIPLES TUs 10/2021	
				// var entityData = {
				// 	"TU_ID": TU,
				// 	"HU_EXT": HU
				// };
				var entityData = {
					TU_ID: "MULTI",
					HU_EXT: HU,
					toMultiTU: this.getView().getModel("multiTU").getData().map(function (e) {
						return {
							TU_ID: e.TU_ID
						};
					})
				};
				// HABILITAR MULTIPLES TUs 10/2021	
				var oModel = new sap.ui.model.odata.ODataModel(
					sServiceUrl, true);
				self._navigationHandler.showBusyDialog();
				oModel.create("/HUInfoSet", entityData, {
					method: "POST",
					success: function (data) {
						self._navigationHandler.hideBusyDialog();
						var arr = [];

						arr.push(data);

						self.getView().byId("toggle").setState(true);
						//	var HUModel = self.getOwnerComponent().getModel("HUModel");
						//	HUModel.setSizeLimit(1500);
						HUModel.setData(data);
						// HABILITAR MULTIPLES TUs 10/2021	
						self.getOwnerComponent().addHUtoTU(data.HU_EXT, data.TU_ID);
						// HABILITAR MULTIPLES TUs 10/2021	
						self.getView().byId("materialTable2").setModel(HUModel);
						///	jQuery.sap.delayedCall(5, this, function () {
						self.getView().byId("testScan").setValue("");
						//	});

						if (!materialSection.getVisible()) {
							materialSection.setVisible(true);
							self.setFocus();

							if (!footer.getVisible()) {
								footer.setVisible(true);
							}

						}
						self.getView().byId("testScan").setValueState(sap.ui.core.ValueState.None);
					},
					error: function (oError) {
						self._navigationHandler.hideBusyDialog();
						var msg = "";
						try {
							msg = JSON.parse(oError.response.body)["error"]["message"]["value"];

						} catch (e) {
							msg = self._obundle.getText("GenericError");
						}
						self.getView().byId("testScan").setValueState(sap.ui.core.ValueState.Error);
						self.getView().byId("testScan").setValueStateText(msg);
						self.getView().byId("toggle").setState(false);
						var HUerrorModel = new sap.ui.model.json.JSONModel();
						self.getView().byId("materialTable2").setModel(HUerrorModel);
					}
				});
				self.getView().byId("TUNumberInput").setValue("");
				self.getView().byId("testScan").setValue("");

			} else {

				self.getView().byId("testScan").setValueState(sap.ui.core.ValueState.Error);
				self.getView().byId("testScan").setValueStateText(self._obundle.getText("EnterValidHU"));

			}

		},

		setFocus: function () {
			this.getView().byId("testScan").focus();
		},
		//function to display different sites
		showSiteSelection: function () {
			var t = this;
			var s = function (e) {
				var o = e.getParameter("selectedItem");
				var f = o.getBindingContext("ReuseModelDialog");
				var m = f.getModel("SiteModel");
				var g = m.getProperty("", f, false);
				var h = g.StoreID;
				t._navigationHandler.showBusyDialog();
				var i = function () {
					t._navigationHandler.hideBusyDialog();
					var materialSection = t.getView().byId("materials");
					if (materialSection.getVisible()) {
						materialSection.setVisible(false);
					}
						t.getView().byId("testScan").setValue("");
						t.getView().byId("TUNumberInput").setValue("");

					t._messageToast.show(t._obundle.getText("SiteChangeSuccessMessage"));

				};
				var j = function () {
					t._navigationHandler.hideBusyDialog();
					t._messageBox.error(t._obundle.getText("SiteChangeErrorMessage"));

				};
				t._context.setAssignedSite(h, i, j);
			};
			if (this.oSiteSelectDialog === null) {
				this.oSiteSelectDialog = new this._siteSelectDialog({
					"propertySiteId": "StoreID",
					"confirm": s
				});
				this.getView().addDependent(this.oSiteSelectDialog);
			}
			this.oSiteSelectDialog.open();
		},

		createAssignSiteButton: function () {

			var o = new Button({
				text: "Site",
				press: jQuery.proxy(function () {
					jQuery.sap.log.info("Setting - Select site button click");
					this.showSiteSelection();
				}, this)
			});
			this.getView().addDependent(o);
			sap.ushell.services.AppConfiguration.addApplicationSettingsButtons([o]);
		},

		onReview: function (oEvent) {

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("RouteReview", {
				HUnumber: this.getOwnerComponent().getModel("HUSetModel").getProperty("/HU_EXT")
			});
		},
		updateTUs: function (arrTUs, newTU) {
			var foundTU = arrTUs.findIndex( function(e){ return e.TU_ID === newTU.TU_ID && e.STORE_ID === newTU.STORE_ID;});
			if(foundTU > -1){
				arrTUs[foundTU] = newTU;
			}else{
				arrTUs.push(newTU);
			}
			return arrTUs;
		},
		clearDataAfterPost: function(){
			if(this.getView().getModel("multiTU")){
				this.getView().getModel("multiTU").setProperty("/",[]);
			}
			this.getOwnerComponent().clearDataAfterPost();
		}
	});
});