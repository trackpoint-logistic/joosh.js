var EX = angular.module('EX',['DashboardRouter']);


EX.controller('FM.TrackingTabController',['$scope', 'DashboardService', 'FM.TrackingDashboard',
	function(scope, DashboardService, TrackingDashboard){
		//console.log(TrackingDashboard);

		scope.call=function(){
			DashboardService.call('FM.TrackingDashboard')
		}
	}
	])

.controller('FM.DailyReportTabController',['$scope', 'DashboardService',
	function(scope, DashboardService){
		scope.call=function(){
			DashboardService.call('FM.DailyReport')
		}

	}
	])


.controller('FM.DailyReportController',['FM.DailyReportWidget', '$element','$q',
	function(Widget, $element,$q){
		Widget
			.onCall(function(){
				console.log($element)
				Array.prototype.slice.call($element).map(x => x.hidden=false);
			})
			.onSuspend(function(){
				Array.prototype.slice.call($element).map(x => x.hidden=true);
			})
			.onTerminate(function(){
				Array.prototype.slice.call($element).map(x => x.hidden=true);
			})

	}
	])
.controller('PB.MapPanelController',['PB.MapPanelWidget','$element', '$scope',
	function(Widget, $element, $scope){
		Widget
			.onCall(function(){
				Array.prototype.slice.call($element).map(x => x.hidden=false);
			})
			.onSuspend(function(){
				Array.prototype.slice.call($element).map(x => x.hidden=true);
			})
			.onTerminate(function(){
				Array.prototype.slice.call($element).map(x => x.hidden=true);
			})

	}
	])
.controller('FM.PackageNavigationSidebarController',['FM.PackageNavigationSidebarWidget','$element',
	function(Widget, $element){
		Widget
			.onCall(function(){
				Array.prototype.slice.call($element).map(x => x.hidden=false);
			})
			.onSuspend(function(){
				Array.prototype.slice.call($element).map(x => x.hidden=true);
			})
			.onTerminate(function(){
				Array.prototype.slice.call($element).map(x => x.hidden=true);
			})
	}
	]);



EX.config(['WidgetServiceProvider',
	function (WidgetService){
		WidgetService.register('FM.DailyReportWidget').
			template({
				controller:'FM.DailyReportController',
				template: 'FM.DailyReportWidget.html'
			})

		WidgetService.register('PB.MapPanelWidget').
			template({
				controller:'PB.MapPanelController',
				template: 'PB.MapPanelWidget.html'
			})


		WidgetService.register('FM.PackageNavigationSidebarWidget').
			template({
				controller:'FM.PackageNavigationSidebarController',
				template: 'FM.PackageNavigationSidebarWidget.html'
			})
	}
	]);


EX.config(['DashboardServiceProvider',
	function (DashboardService){

		DashboardService.register('FM.TrackingDashboard')
			.widget('PB.MapPanelWidget')
			.widget('FM.PackageNavigationSidebarWidget');

 		DashboardService.register('FM.DailyReport')
			.widget('FM.DailyReportWidget');
	}
])

