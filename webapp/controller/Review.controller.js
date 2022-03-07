sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
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
], function (Controller, Filter, FilterOperator, B, S, JSONModel, F, MessageStrip, MessageBox, Device, ResourceModel, Button,
	SiteSelectDialog, NavigationHandler,
	Context, Formatter, formatter, MessageToast, models) {
	"use strict";

	return Controller.extend("retailstore.ZRCV_PDT_byHU.controller.Review", {

		_siteSelectDialog: SiteSelectDialog,
		_navigationHandler: null,
		_context: Context,
		formatter: formatter,
		_messageToast: MessageToast,
		MessageBox: MessageBox,
		_models: models,
		//formatter: formatter
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf retailstore.ZRCV_PDT_byHU.view.Review
		 */
		onInit: function () {
			this.showLog = false;
			this.log = [];
			this.log.push("onInit");
			this.getView().setModel(this._models.createI18NModel(), "i18n");
			this._obundle = this.getView().getModel("i18n").getResourceBundle();
			this._navigationHandler = NavigationHandler;
			this.getOwnerComponent().getRouter().getRoute("RouteReview").attachPatternMatched(this.onReviewRouteMatched, this);
		},

		backToScan: function (oEvent) {

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("RouteHUlisting", {
				HUnumber: "MULTITU"
			});
		},
		onReviewRouteMatched: function (oEvent) {
			this.log.push("onRouteMatched");
			this.visualog = "";
			this.visualog = this.visualog + "iM";
			var self = this;

			var aFilters = [];
			var Status = '002';
			var materialSection = self.getView().byId("HuTable");
			var footer = self.getView().byId("footer");
			//testo
			var sServiceUrl = "/sap/opu/odata/sap/ZRETAILSTORE_RECEIVE_PRODUCT_SRV";
			// var sServiceUrl = this.getView().getModel().sServiceUrl;
			//testo
			this.log.push(`ServiceURL ${sServiceUrl}`);
			var oModel = new sap.ui.model.odata.ODataModel(
				sServiceUrl, true);
			var oFilter1 = new Filter("STATUS", FilterOperator.EQ, Status);

			aFilters.push(oFilter1);

			var HUModel = this.getOwnerComponent().getModel("HUModel");
			HUModel.setSizeLimit(1500);
			var TUModel = this.getOwnerComponent().getModel("TUModel");
			TUModel.setSizeLimit(1500);
			this.log.push("filtersSet");
			this.log.push("CallBlock");
			try {
				this.log.push("PrimerTry");
				if (true) {
					var that = this;
					that.visualog = that.visualog + "bK";
					var HUs = [];
					that.HUsRetrieved = 0;
					that.getOwnerComponent().getDicAsArr(function () {
						that.HUsRetrieved++;
					});
					if (that.HUsRetrieved !== 0) {
						that._navigationHandler.showBusyDialog();
					}
					that.arrTU = [];
					var oTUDic = this.getOwnerComponent().oTUtoHU;
					var HUModellist = new sap.ui.model.json.JSONModel();
					HUModellist.setSizeLimit(1500);
					var logCount = 0;
					this.log.push("For Dicc");
					for (var key in oTUDic) {
						logCount = logCount + 1;
						that.visualog = that.visualog + "f" + logCount;
						// if (Object.hasOwn(oTUDic, key)) {
						// if (oTUDic.hasOwnProperty(key)) {
							that.log.push("Read" + key);
							oModel.read("/TUHeaders('" + key + "')/HUInfoSet", {
								filters: aFilters,
								headers: {
									"X-CSRF-Token": "Fetch"
								},
								success: function (data) {
									logCount = logCount + 1;
									that.visualog = that.visualog + "r" + logCount;
									data.results.forEach(function (e) {
										that.arrTU.push(e);
									});
									that.log.push("read Succ");
									that.HUsRetrieved--;
									if (that.HUsRetrieved === 0) {
										that.log.push("oDataReadEnd");
										that.visualog = that.visualog + "N";
										try {
											HUModellist.setData({
												results: that.arrTU
											});
											var HuTable = that.getView().byId("HuTable");
											HuTable.setModel(HUModellist);
											that.visualog = that.visualog + ".";
											that.getView().byId("visualog").setText(that.visualog);
											that.getView().byId("visualog").setVisible(true);
											if (!HuTable.getVisible()) {
												HuTable.setVisible(true);
												if (!footer.getVisible()) {
													footer.setVisible(true);
												}
											}
										} catch (err) {

										}
										that._navigationHandler.hideBusyDialog();
									}
								},
								error: function (oError) {
									that.log.push("read Error");
									var msg = "";
									try {
										msg = JSON.parse(oError.response.body)["error"]["message"]["value"];
									} catch (e) {
										msg = that._obundle.getText("GenericError");
									}
									MessageToast.show(msg);
									that.HUsRetrieved--;
								}
							});
						// }
					}
				} else {
					var that = this;
					that.visualog = that.visualog + "Pr1";
					that.getView().byId("visualog").setText(that.visualog);
					that.log.push("PrimerTry ViaPromise");
					self.getHUinfo(aFilters, oModel);
				}
			} catch (err) {
				try {
					var that = this;
					that.log.push("Error En Primer Try");
					that.log.push(err);
					that.visualog = that.visualog + "Pr2";
					that.getView().byId("visualog").setText(that.visualog);
					self.getHUinfo(aFilters, oModel);
				} catch (err) {
					that.log.push("Error En Segundo Try viaPromise");
					that.log.push(err);
					MessageToast.show(err);
					self.getView().byId("errorArea").setValue(err);
					self.getView().byId("errorArea").setVisible(true);
				}
			}
			that.visualog = that.visualog + "(fn)";
		},
		getHUinfo: function (aFilters, oModel) {
			var that = this;
			that.log.push("viaPromise");
			return new Promise(function (resolve, reject) {
				that.arrTU = [];
				var getHUinfo = function (TU) {
					return new Promise(function (resolve, reject) {
						that.log.push("PromiseRead");
						oModel.read("/TUHeaders('" + TU + "')/HUInfoSet", {
							filters: aFilters,
							headers: {
								"X-CSRF-Token": "Fetch"
							},
							success: function (data) {
								that.log.push("viaPromiseSucc");
								var HUModellist = new sap.ui.model.json.JSONModel();
								HUModellist.setSizeLimit(1500);
								data.results.forEach(function (e) {
									that.arrTU.push(e);
								});
								HUModellist.setData({
									results: that.arrTU
								});
								try {
									var HuTable = that.getView().byId("HuTable");
									HuTable.setModel(HUModellist);

									var footer = that.getView().byId("footer");
									if (!HuTable.getVisible()) {
										HuTable.setVisible(true);

										if (!footer.getVisible()) {
											footer.setVisible(true);
										}

									}
								} catch (err) {}
								resolve();

							},
							error: function (oError) {
								that.log.push("viaPromiseError");
								var msg = "";
								try {
									msg = JSON.parse(oError.response.body)["error"]["message"]["value"];

								} catch (e) {
									msg = that._obundle.getText("GenericError");
								}
								reject(MessageToast.show(msg));
							}
						});
					});
				};

				var HUs = [];
				that.HUsRetrieved = 0;
				that.getOwnerComponent().getDicAsArr(function () {
					that.HUsRetrieved++;
				});
				if (that.HUsRetrieved !== 0) {
					that._navigationHandler.showBusyDialog();
				}
				var retrievalEnd = function () {
					that.log.push("viaPromiseEnd");
					that.HUsRetrieved--;
					if (that.HUsRetrieved === 0) {
						that._navigationHandler.hideBusyDialog();
						resolve();
					}
				};

				var oDataSubmit = function (key) {
					getHUinfo(key).then(function () {
							retrievalEnd();
						})
						.catch(function (err) {
							retrievalEnd();
							return err;
						});
				};
				try {
					that.getOwnerComponent().getDicAsArr(oDataSubmit);
				} catch (err) {
					that.getView().byId("errorArea").setValue(err);
					that.getView().byId("errorArea").setVisible(true);
				}
			});
		},
		onSearch: function (oEvent) {
			var filters = [];
			var query = oEvent.getParameter("query");
			var str = new RegExp("^(?! )([a-zA-Z ]+)$");
			if (query && query.length > 0) {
				if (str.test(query)) {
					var descriptionFilter = new sap.ui.model.Filter("HU_EXT", sap.ui.model.FilterOperator.Contains, query);
					filters.push(descriptionFilter);
				} else {
					var materialFilter = new sap.ui.model.Filter("HU_EXT", sap.ui.model.FilterOperator.Contains, query);
					filters.push(materialFilter);
				}
			}

			var list = this.getView().byId("HuTable");
			var binding = list.getBinding("items");
			binding.filter(filters);

		},

		openFilter: function (oEvent) {
			if (!this.HUfilterDialog) {
				this.HUfilterDialog = sap.ui.xmlfragment("retailstore.ZRCV_PDT_byHU.view.fragment.filter", this.getView().getController());
				this.getView().addDependent(this.HUfilterDialog);

			}
			this.HUfilterDialog.open();

		},
		//function to post filters to backend
		onFilterSelect: function (oEvent) {
			var aFilters = [];
			var filtersModel = this.getOwnerComponent().getModel("filtersModel");
			if (filtersModel.getProperty("/Processed") === true) {
				var oFilter1 = new Filter("STATUS", FilterOperator.EQ, "003");
				aFilters.push(oFilter1);
			}
			if (filtersModel.getProperty("/InTransit") === true) {
				var oFilter2 = new Filter("STATUS", FilterOperator.EQ, "001");
				aFilters.push(oFilter2);
			}
			if (filtersModel.getProperty("/InProgress") === true) {
				var oFilter3 = new Filter("STATUS", FilterOperator.EQ, "002");
				aFilters.push(oFilter3);
			}
			var sServiceUrl = this.getView().getModel().sServiceUrl;
			//	var sServiceUrl = "/sap/opu/odata/sap/ZRETAILSTORE_RECEIVE_PRODUCT_SRV";

			var oModel = new sap.ui.model.odata.ODataModel(
				sServiceUrl, true);

			var HUModel = this.getOwnerComponent().getModel("HUModel");
			HUModel.setSizeLimit(1500);
			var TUModel = this.getOwnerComponent().getModel("TUModel");
			TUModel.setSizeLimit(1500);
			var TU = TUModel.getProperty("/TU_ID");

			var self = this;

			this.getHUinfo(aFilters, oModel)
				.then(function () {
					filtersModel.setProperty("/Processed", false);
					filtersModel.setProperty("/InTransit", false);
					filtersModel.setProperty("/InProgress", false);
				});
			this.closeProductFilterDialog();

		},
		InProgressSelected: function (oEvent) {
			var filtersModel = this.getOwnerComponent().getModel("filtersModel");
			filtersModel.setProperty("/InProgress", oEvent.getParameter("selected"));
		},
		IntransitSelected: function (oEvent) {
			var filtersModel = this.getOwnerComponent().getModel("filtersModel");
			filtersModel.setProperty("/InTransit", oEvent.getParameter("selected"));
		},
		ProcessedSelected: function (oEvent) {
			var filtersModel = this.getOwnerComponent().getModel("filtersModel");
			filtersModel.setProperty("/Processed", oEvent.getParameter("selected"));
		},
		closeProductFilterDialog: function (oEvent) {
			if (!this.HUfilterDialog) {
				return;
			}
			this.HUfilterDialog.close();
		},

		onDelete: function (oEvent) {
			var bindingContextPath = oEvent.getSource().getParent().getBindingContextPath();
			var selectedRow = this.getView().byId("HuTable").getModel().getData(bindingContextPath);
			selectedRow.results[0].DelFlag = "X";
			var index = parseInt(bindingContextPath.split('/')[2]);

			var DelHU = selectedRow.results[index].HU_EXT;
			var DelTU = selectedRow.results[index].TU_ID;
			var DelStatus = selectedRow.results[index].STATUS;
			var self = this;

			var sServiceUrl = this.getView().getModel().sServiceUrl;
			var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
			this._navigationHandler.showBusyDialog();
			oModel.remove("/HUInfoSet(TU_ID='" + DelTU + "',HU_EXT='" + DelHU + "')", {
				method: "DELETE",
				success: function (data) {
					self._navigationHandler.hideBusyDialog();
					var aFilters = [];
					var oFilter1 = new Filter("STATUS", FilterOperator.EQ, DelStatus);
					aFilters.push(oFilter1);
					self.getOwnerComponent().removeHUfromTU(DelHU, DelTU);
					self.getHUinfo(aFilters, oModel);
				},
				error: function (oError) {
					self._navigationHandler.hideBusyDialog();
					var msg = "";

					try {
						msg = JSON.parse(oError.response.body)["error"]["message"]["value"];

					} catch (e) {
						msg = self._obundle.getText("GenericError");
					}

					sap.m.MessageBox.show(msg, {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Error",
						actions: [sap.m.MessageBox.Action.OK],
						id: "messageBoxId1",
						initialFocus: sap.m.MessageBox.Action.OK,

						onClose: function (oAction) {

						}
					});
				},

			});

		},
		onPost: function (oEvent) {

			if (this.getView() && this.getView().byId("HuTable") && this.getView().byId("HuTable").getBinding("items") &&
				this.getView().byId("HuTable").getBinding("items").oList.length !== 0) {

				var self = this;
				var sServiceUrl = this.getView().getModel().sServiceUrl;

				var TUModel = this.getOwnerComponent().getModel("TUModel");
				var TU = TUModel.getProperty("/TU_ID");
				var TUs = [];
				var pushTUs = function (key, oDic) {
					if (oDic[key].length > 0) {
						TUs.push({
							TU_ID: key
						});
					}
				};
				this.getOwnerComponent().getDicAsArr(pushTUs);
				var entityData = {
					TU_ID: "POST",
					HU_EXT: "",
					toMultiTU: TUs
				};
				self._navigationHandler.showBusyDialog();
				var oModel = new sap.ui.model.odata.ODataModel(
					sServiceUrl, true);
				oModel.create("/HUInfoSet", entityData, {
					method: "POST",
					success: function (data) {
						self._navigationHandler.hideBusyDialog();

						MessageToast.show(self._obundle.getText("HUposted"), {
							duration: 7000
						});

						var HUModel = self.getOwnerComponent().getModel("HUModel");

						TUModel.setProperty("/TU_ID", "");
						HUModel.setProperty("/HU_EXT", "");
						var filtersModel = self.getOwnerComponent().getModel("filtersModel");

						filtersModel.setProperty("/Processed", true);
						filtersModel.setProperty("/InTransit", true);
						filtersModel.setProperty("/InProgress", true);

						var oRouter = sap.ui.core.UIComponent.getRouterFor(self);
						oRouter.navTo("RouteHUlisting", {
							HUnumber: self.getOwnerComponent().posted
						});

					},
					error: function (oError) {
						var msg = "";

						try {
							msg = JSON.parse(oError.response.body)["error"]["message"]["value"];

						} catch (e) {
							msg = self._obundle.getText("GenericError");
						}
						self._navigationHandler.hideBusyDialog();
						sap.m.MessageBox.show(msg, {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: "Error",
							actions: [sap.m.MessageBox.Action.OK],
							id: "messageBoxId1",
							initialFocus: sap.m.MessageBox.Action.OK,

							onClose: function (oAction) {

								var HUModel = self.getOwnerComponent().getModel("HUModel");
								TUModel.setProperty("/TU_ID", "");
								HUModel.setProperty("/HU_EXT", "");
								var oRouter = sap.ui.core.UIComponent.getRouterFor(self);
								oRouter.navTo("RouteHUlisting", {
									HUnumber: "error"
								});

							}
						});

					}
				});
			} else {
				var msg = this._obundle.getText("PleaseSelectHU2Post");

				MessageToast.show(msg);

			}

		},
		onTestButPressed: function (oEvent) {
			this.showLog = !this.showLog;
			this.getView().byId("log").setVisible(this.showLog);
			this.getView().byId("log").setValue(this.log);
		}

	});

});