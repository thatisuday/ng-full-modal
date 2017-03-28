# ng-full-modal
Probably the best angular responsive modal service...

**[demo](https://rawgit.com/thatisuday/ng-full-modal/master/demo/main.html)**


***

## Install 
```
npm install --save ng-full-modal
bower install --save ng-full-modal
```

***

## Dependencies

- angular (js)
- angular-animate (js)
- click-outside (js)
- ng-full-modal.min.js, ng-full-modal.min.css

***

## Include App
```
angular
.module('yourApp', ['ngAnimate', 'thatisuday.ng-full-modal'])
```

***

## Options
```
closeDelay          :   0,                  //  Delay in closing the modal (in milliseconds)
templateHost        :   null,               //  Template files will be served from the location, e.g. http://localhost/templates/
transitionDuration  :   '0.3s',             //  Modal show/hide animation duration
escClose            :   true,               //  Close modal on esc button click
bgClose             :   true,               //  Close modal on background click,
modalWidth          :   '700px',            //  Modal width
backdrop            :   'rgba(0,0,0,0.9)'   //  backdrop color of modal container
```

***

## Config Plugin
```
angular.module('yourApp')
.config(function(_nfmProvider){
	_nfmProvider.set({
		templateHost : 'http://127.0.0.1:3000/demo/templates/',
		bodyClass : 'modal-on',
		transitionDuration: '0.3s'
	});
})
```

***

## Service (how o use?)
```
angular.module('yourApp'),
.controller('main', function($scope, nfm){
	var user = {name: 'Uday Hiwarale'};
	
	// create new instace of modal
	var formModal = new nfm({
		// template : '<div><h1>Hello World! I am inside modal...</h1></div>',
		// templateUrl : 'http://127.0.0.1:3000/demo/templates/form-modal.html',
		templateFile : 'form-modal.html', // will append to `templateHost` to make full url
		inject : {
			user : user,
		},
		controller : ['$scope', '$element', 'hide', 'user', function($scope, $element, hide, user){
			$scope.msg = "Hello World";
			$scope.formData = user || {};

			$scope.done = function(){
				hide($scope.formData); // pass result
			};

			$scope.hideModal = function(){
				hide(null);
			};

			$scope.hideWithDelay = function(){
				hide(null, 2000); // add 2s delay, override `closeDelay`
			};
		}]
	});

	$scope.showModal = function(){
		formModal.show().then(function(modal){
			console.log('modal...', modal);

			modal.hiding.then(function(result){
				console.log('hiding...', 'result: ', result);
			});

			modal.hidden.then(function(result){
				console.log('hidden...', 'result: ', result);
			});
		});
	};
});
```

> new nfm(options), here options can override global options
