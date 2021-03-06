var HistoryManager = (function(_super,environment){

	__extends(HistoryManager, _super);

	var origin;

	function HistoryManager () {
		

		origin = location.pathname;

		addEventListener('popstate',function(e){
			var activityManager = environment.getService("ACTIVITY_MANAGER");
			activityManager.startActivityById(e.state);
		});

	}

	HistoryManager.prototype.registerActivity = function(activity) {
		//Registramos la actividad en el historial.
		history.pushState(activity.id,activity.title,origin+activity.slug);
	};

	HistoryManager.prototype.back = function() {
		history.back();
	};

	HistoryManager.prototype.forward = function() {
		history.forward();
	};

	HistoryManager.prototype.goTo = function(pos) {
		!isNaN(parseInt(pos)) && history.go(pos);
	};
	
	HistoryManager.prototype.hasLastActivity = function() {
		return false;
	};

	HistoryManager.prototype.getLatestActivity = function() {
		return false;
	};

	return HistoryManager;

})(Component,environment);