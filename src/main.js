import {WidgetService} from './WidgetService.js';
import {DashboardService} from './DashboardService.js';

angular.module('DashboardRouter',[])
	.provider('WidgetService', WidgetService)
	.provider('DashboardService', DashboardService);