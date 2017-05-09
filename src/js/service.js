angular
.module('thatisuday.ng-full-modal')
.factory('nfm',
['_nfm', '$rootScope', '$animate', '$document', '$compile', '$controller', '$http', '$q', '$templateRequest', '$timeout', '$sce',
function(_nfm, $rootScope, $animate, $document, $compile, $controller, $http, $q, $templateRequest, $timeout, $sce) {
	
	// key codes
	var keys = {
		enter : 13,
		esc   : 27,
		left  : 37,
		right : 39
	};
	
	// create modal class
	class nfm{

		constructor(conf){
			// set modal service configurations
			this.conf = angular.extend({}, _nfm, conf);

			// set modal open/close state
			this._stateOpen = false;
		}

		// set promises for modal
		_setPromises(){
			this._showDeffered 		= 	$q.defer();
			this._hidingDeffered 	= 	$q.defer();
			this._hiddenDeffered 	= 	$q.defer();
		}

		// from `$sce`, allow url as resource url
		_secureTemplateUrl(url){
			return $sce.trustAsResourceUrl(url);
		}

		// get template html
		_getTemplate(){
			var deferred = $q.defer();
			
			if(this.conf.template){
				deferred.resolve(this.conf.template);
			}
			else if(this.conf.templateUrl){
				let url = this._secureTemplateUrl(this.conf.templateUrl);

				$templateRequest(url, true)
				.then(template => deferred.resolve(template))
				.catch(err => deferred.reject(err));
			}
			else if(this.conf.templateHost && this.conf.templateFile){
				let url = this._secureTemplateUrl(this.conf.templateHost + this.conf.templateFile);

				$templateRequest(url, true)
				.then(template => deferred.resolve(template))
				.catch(err => deferred.reject(err));
			}
			else{
				deferred.reject(new Error('Please provide template or templateUrl for modal.'));
			}

			return deferred.promise;
		}

		// create/get modal scope
		_getScope(){
			if(!this.conf.scope){
				// create new scope
				this.conf.scope = $rootScope.$new();
			
				// add extra functionality to scope object
				this.conf.scope.__hide__ = (this.conf.bgClose) ? angular.noop : this._hide.bind(this);
				this.conf.scope.__bg_hide__ = (this.conf.bgClose) ? this._hide.bind(this) : angular.noop;

				this.conf.scope.transitionDuration = this.conf.transitionDuration;
				this.conf.scope.modalWidth = this.conf.modalWidth;
				this.conf.scope.backdrop = this.conf.backdrop;
			}

			return this.conf.scope;
		}

		// remove scope
		_removeScope(){
			this._getScope().$destroy();
			delete this.conf.scope;
		}

		// get controller
		_getController(){
			if(!this.conf.controller){
				throw new Error('Failed to retrieve controller for the modal.');
			}

			return this.conf.controller;
		}

		// set injectable variable
		_setInjectable(injectables){
			this.conf._injectables = this.conf._injectables || {};
			angular.extend(this.conf._injectables, injectables);
		}

		// get controller injectable dependencies
		_getInjectables(){
			return this.conf._injectables;
		}

		// bind controller to scope and set injectable dependencies for controller
		_bindCtrlToScope(){
			this._setInjectable(angular.extend({
				$scope 		: 	this._getScope(),
				$element 	: 	this.conf.$element,
				hide 		: 	this._hide.bind(this)
			}, this.conf.inject));

			$controller(this._getController(), this._getInjectables());
		}

		// compile modal template
		_compileTemplate(){
			return this._getTemplate().then(
				(template) => {
					let _template = `
						<div
							class="nfm-container"
							ng-style="{
								'transition-duration' : transitionDuration,
								'background-color' : backdrop
							}"
						>
							<div class="nfm-close" ng-click="__hide__()"></div>
							<div class="nfm-modal modal-name-${this.conf.name}" click-outside="__bg_hide__()" ng-style="{'width' : modalWidth}">
								${template}
							</div>
						</div>
					`;

					// bind controller to scope
					this._bindCtrlToScope();

					// compile
					this.conf.$element = $compile(_template)(this._getScope());
				},
				(err) => {
					console.warn('Failed to load template for modal.');
				}
			);
		}

		// append template element to body
		// animate using $animate
		_appendTemplate(){
			return this._compileTemplate().then(() => {
				let bodyElem = angular.element($document[0].body);
				let modalElem = this.conf.$element;
				let children = bodyElem.children();

				if(children.length > 0){
					return $animate.enter(modalElem, bodyElem, children[children.length - 1]);
				}

				return $animate.enter(modalElem, bodyElem);
			});
		}

		// register listeners to angular event
		_registerListeners(){
			// on location change, destroy modal
			this._degRegLocCngListnr = $rootScope.$on('$locationChangeSuccess', this._hide.bind(this));

			// listen to escape button event
			$document.on('keyup', (event) => {
				if(this.conf.escClose && event.which == keys.esc){
					this._hide();
				}
			});
		}

		// deregister listeners from angular event
		_deregisterListeners(){
			// deregister location change listener
			this._degRegLocCngListnr();

			// remove keyup events
			$document.off('keyup');
		}

		// show modal (finished everything)
		_show(){
			// create modal DOM node
			this._appendTemplate().then(() => {
				// register to event listeners
				this._registerListeners();

				// change modal state
				this._stateOpen = true;

				// add `bodyClass` class to body
				if(this.conf.bodyClass){
					angular.element($document[0].body).addClass(this.conf.bodyClass);
				}

				return this._showDeffered.resolve({
					hiding 	: this._hidingDeffered.promise,
					hidden 	: this._hiddenDeffered.promise,
					element : this.conf.$element
				});
			});
		}

		// hide modal
		_hide(result, closeDelay){
			// register to event listeners
			this._deregisterListeners();

			// add delay to modal close
			$timeout(() => {
				this._cleanModal(result);
			}, (closeDelay || this.conf.closeDelay));
		}

		// clean modal scopes, variables and DOM nodes
		_cleanModal(result){

			// resolve hide promise with result
			this._hidingDeffered.resolve(result);

			// remove modal DOM node
			$animate.leave(this.conf.$element).then(() => {
				//  remove/destroy modal scope
				this._removeScope();

				// change modal state
				this._stateOpen = false;

				// resolve hidden promise with result
				this._hiddenDeffered.resolve(result);
				
				// remove `bodyClass` class to body
				if(this.conf.bodyClass){
					angular.element($document[0].body).removeClass(this.conf.bodyClass);
				}
			});
		}


		/**********************************************************************/


		// show (launch) modal
		show(injectables){
			// set dynamic injectables
			if(injectables && typeof injectables == 'object'){
				this._setInjectable(injectables);
			}

			// set promises
			this._setPromises();

			// show modal only it's hidden
			if(this._stateOpen == false){
				this._show();
			}
			
			return this._showDeffered.promise;
		}
	}

	// return class
	return nfm;
}]);