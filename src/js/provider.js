angular
.module('thatisuday.ng-full-modal')
.provider('_nfm', function(){
	var defOpts = {
		closeDelay 			: 	0, 					// 	Delay in closing the modal (in milliseconds)
		templateHost 		: 	null, 				//	Template files will be served from the location, e.g. http://localhost/templates/
		transitionDuration 	: 	'0.3s', 			//	Modal show/hide animation duration
		escClose			: 	true,				//	Close modal on esc button click
		bgClose				: 	true,				//	Close modal on background click,
		modalWidth 			: 	'700px',			// 	Modal width
		backdrop			: 	'rgba(0,0,0,0.9)'	// 	backdrop color of modal container
	};

	return{
		set : function(newOpts){
			angular.extend(defOpts, newOpts); 
		},
		$get : function(){
			return defOpts;
		}
	}
})