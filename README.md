# ng-full-modal
Probably the best angular responsive modal service...

[demo](https://rawgit.com/thatisuday/ng-full-modal/master/demo/index.html)


***

## install 
```
npm install --save ng-full-modal
bower install --save ng-full-modal
```

***

## Dependencies

- angular
- angular-animate
- click outside

***

## include
```
angular
.module('yourApp', ['ngAnimate', 'thatisuday.ng-full-modal'])
```

***

## options
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

## config
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

## service
```
angular.module('yourApp'),
.controller('main', function($scope, nfm){
	var user = {name: 'Uday Hiwarale'};

	var formModal = new nfm({
    // template : '<div></div>',
    // templateUrl : 'http://127.0.0.1:3000/demo/templates/form-modal.html',
		templateFile : 'form-modal.html',
		inject : {
			user : user,
		},
		controller : ['$scope', '$element', 'hide', 'user', function($scope, $element, hide, user){
			$scope.msg = "Hello World";
			$scope.formData = user || {};

			$scope.done = function(){
				hide($scope.formData);
			};

			$scope.hideModal = function(){
				hide(null);
			};

			$scope.hideWithDelay = function(){
				hide(null, 2000);
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
