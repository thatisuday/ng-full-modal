'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

angular.module('thatisuday.ng-full-modal', ['ngAnimate', 'angular-click-outside']);
angular.module('thatisuday.ng-full-modal').provider('_nfm', function () {
	var defOpts = {
		closeDelay: 0, // 	Delay in closing the modal (in milliseconds)
		templateHost: null, //	Template files will be served from the location, e.g. http://localhost/templates/
		transitionDuration: '0.3s', //	Modal show/hide animation duration
		escClose: true, //	Close modal on esc button click
		bgClose: true, //	Close modal on background click,
		modalWidth: '700px', // 	Modal width
		backdrop: 'rgba(0,0,0,0.9)' // 	backdrop color of modal container
	};

	return {
		set: function set(newOpts) {
			angular.extend(defOpts, newOpts);
		},
		$get: function $get() {
			return defOpts;
		}
	};
});
angular.module('thatisuday.ng-full-modal').factory('nfm', ['_nfm', '$rootScope', '$animate', '$document', '$compile', '$controller', '$http', '$q', '$templateRequest', '$timeout', '$sce', function (_nfm, $rootScope, $animate, $document, $compile, $controller, $http, $q, $templateRequest, $timeout, $sce) {

	// key codes
	var keys = {
		enter: 13,
		esc: 27,
		left: 37,
		right: 39
	};

	// create modal class

	var nfm = function () {
		function nfm(conf) {
			_classCallCheck(this, nfm);

			// set modal service configurations
			this.conf = angular.extend({}, _nfm, conf);

			// set modal open/close state
			this._stateOpen = false;
		}

		// set promises for modal


		_createClass(nfm, [{
			key: '_setPromises',
			value: function _setPromises() {
				this._showDeffered = $q.defer();
				this._hidingDeffered = $q.defer();
				this._hiddenDeffered = $q.defer();
			}

			// from `$sce`, allow url as resource url

		}, {
			key: '_secureTemplateUrl',
			value: function _secureTemplateUrl(url) {
				return $sce.trustAsResourceUrl(url);
			}

			// get template html

		}, {
			key: '_getTemplate',
			value: function _getTemplate() {
				var deferred = $q.defer();

				if (this.conf.template) {
					deferred.resolve(this.conf.template);
				} else if (this.conf.templateUrl) {
					var url = this._secureTemplateUrl(this.conf.templateUrl);

					$templateRequest(url, true).then(function (template) {
						return deferred.resolve(template);
					}).catch(function (err) {
						return deferred.reject(err);
					});
				} else if (this.conf.templateHost && this.conf.templateFile) {
					var _url = this._secureTemplateUrl(this.conf.templateHost + this.conf.templateFile);

					$templateRequest(_url, true).then(function (template) {
						return deferred.resolve(template);
					}).catch(function (err) {
						return deferred.reject(err);
					});
				} else {
					deferred.reject(new Error('Please provide template or templateUrl for modal.'));
				}

				return deferred.promise;
			}

			// create/get modal scope

		}, {
			key: '_getScope',
			value: function _getScope() {
				if (!this.conf.scope) {
					// create new scope
					this.conf.scope = $rootScope.$new();

					// add extra functionality to scope object
					this.conf.scope.__hide__ = this.conf.bgClose ? angular.noop : this._hide.bind(this);
					this.conf.scope.__bg_hide__ = this.conf.bgClose ? this._hide.bind(this) : angular.noop;

					this.conf.scope.transitionDuration = this.conf.transitionDuration;
					this.conf.scope.modalWidth = this.conf.modalWidth;
					this.conf.scope.backdrop = this.conf.backdrop;
				}

				return this.conf.scope;
			}

			// remove scope

		}, {
			key: '_removeScope',
			value: function _removeScope() {
				this._getScope().$destroy();
				delete this.conf.scope;
			}

			// get controller

		}, {
			key: '_getController',
			value: function _getController() {
				if (!this.conf.controller) {
					throw new Error('Failed to retrieve controller for the modal.');
				}

				return this.conf.controller;
			}

			// set injectable variable

		}, {
			key: '_setInjectable',
			value: function _setInjectable(inj) {
				this.conf._injectables = inj;
			}

			// get controller injectable dependencies

		}, {
			key: '_getInjectables',
			value: function _getInjectables() {
				return this.conf._injectables;
			}

			// bind controller to scope and set injectable dependencies for controller

		}, {
			key: '_bindCtrlToScope',
			value: function _bindCtrlToScope() {
				this._setInjectable(angular.extend({
					$scope: this._getScope(),
					$element: this.conf.$element,
					hide: this._hide.bind(this)
				}, this.conf.inject));

				$controller(this._getController(), this._getInjectables());
			}

			// compile modal template

		}, {
			key: '_compileTemplate',
			value: function _compileTemplate() {
				var _this = this;

				return this._getTemplate().then(function (template) {
					var _template = '\n\t\t\t\t\t\t<div\n\t\t\t\t\t\t\tclass="nfm-container"\n\t\t\t\t\t\t\tng-style="{\n\t\t\t\t\t\t\t\t\'transition-duration\' : transitionDuration,\n\t\t\t\t\t\t\t\t\'background-color\' : backdrop\n\t\t\t\t\t\t\t}"\n\t\t\t\t\t\t>\n\t\t\t\t\t\t\t<div class="nfm-close" ng-click="__hide__()"></div>\n\t\t\t\t\t\t\t<div class="nfm-modal modal-name-' + _this.conf.name + '" click-outside="__bg_hide__()" ng-style="{\'width\' : modalWidth}">\n\t\t\t\t\t\t\t\t' + template + '\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t';

					_this.conf.$element = $compile(_template)(_this._getScope());

					// bind controller to scope
					_this._bindCtrlToScope();
				}, function (err) {
					console.warn('Failed to load template for modal.');
				});
			}

			// append template element to body
			// animate using $animate

		}, {
			key: '_appendTemplate',
			value: function _appendTemplate() {
				var _this2 = this;

				return this._compileTemplate().then(function () {
					var bodyElem = angular.element($document[0].body);
					var modalElem = _this2.conf.$element;
					var children = bodyElem.children();

					if (children.length > 0) {
						return $animate.enter(modalElem, bodyElem, children[children.length - 1]);
					}

					return $animate.enter(modalElem, bodyElem);
				});
			}

			// register listeners to angular event

		}, {
			key: '_registerListeners',
			value: function _registerListeners() {
				var _this3 = this;

				// on location change, destroy modal
				this._degRegLocCngListnr = $rootScope.$on('$locationChangeSuccess', this._hide.bind(this));

				// listen to escape button event
				$document.on('keyup', function (event) {
					if (_this3.conf.escClose && event.which == keys.esc) {
						_this3._hide();
					}
				});
			}

			// deregister listeners from angular event

		}, {
			key: '_deregisterListeners',
			value: function _deregisterListeners() {
				// deregister location change listener
				this._degRegLocCngListnr();

				// remove keyup events
				$document.off('keyup');
			}

			// show modal (finished everything)

		}, {
			key: '_show',
			value: function _show() {
				var _this4 = this;

				// create modal DOM node
				this._appendTemplate().then(function () {
					// register to event listeners
					_this4._registerListeners();

					// change modal state
					_this4._stateOpen = true;

					// add `bodyClass` class to body
					if (_this4.conf.bodyClass) {
						angular.element($document[0].body).addClass(_this4.conf.bodyClass);
					}

					return _this4._showDeffered.resolve({
						hiding: _this4._hidingDeffered.promise,
						hidden: _this4._hiddenDeffered.promise,
						element: _this4.conf.$element
					});
				});
			}

			// hide modal

		}, {
			key: '_hide',
			value: function _hide(result, closeDelay) {
				var _this5 = this;

				// register to event listeners
				this._deregisterListeners();

				// add delay to modal close
				$timeout(function () {
					_this5._cleanModal(result);
				}, closeDelay || this.conf.closeDelay);
			}

			// clean modal scopes, variables and DOM nodes

		}, {
			key: '_cleanModal',
			value: function _cleanModal(result) {
				var _this6 = this;

				// resolve hide promise with result
				this._hidingDeffered.resolve(result);

				// remove modal DOM node
				$animate.leave(this.conf.$element).then(function () {
					//  remove/destroy modal scope
					_this6._removeScope();

					// change modal state
					_this6._stateOpen = false;

					// resolve hidden promise with result
					_this6._hiddenDeffered.resolve(result);

					// remove `bodyClass` class to body
					if (_this6.conf.bodyClass) {
						angular.element($document[0].body).removeClass(_this6.conf.bodyClass);
					}
				});
			}

			/**********************************************************************/

			// show (launch) modal

		}, {
			key: 'show',
			value: function show() {
				// set promises
				this._setPromises();

				// show modal only it's hidden
				if (this._stateOpen == false) {
					this._show();
				}

				return this._showDeffered.promise;
			}
		}]);

		return nfm;
	}();

	// return class


	return nfm;
}]);