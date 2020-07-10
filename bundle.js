'use strict';

const WidgetState = Object.defineProperties({}, {
	ACTIVE: {
		value: 1,
		writable: false
	},
	SUSPENDED: {
		value: 2,
		writable: false
	},
	TERMINATED: {
		value: 0,
		writable: false
	}
});

class Widget {

	constructor(){
		this.$state = WidgetState.TERMINATED;
		this.$call=null;
		this.$suspend=null;
		this.$terminate=null;
	
		this.$template=null;
		this.$controller=null;
		this.$immutable = false;
	}


	setState(state){
		this.$state = state;
		return this;
	}

	setImmutable(imt){
		this.$immutable = imt;
		return this;
	}


	call(){
		if(this.$immutable == false && this.$state != WidgetState.ACTIVE){
			this.setState(WidgetState.ACTIVE);
			this.$call&&this.$call();
		}
	}

	suspend(){
		if(this.$immutable == false && this.$state == WidgetState.ACTIVE){
			this.setState(WidgetState.SUSPENDED);
			this.$suspend && this.$suspend();
		}
	}

	terminate(){
		if(this.$immutable)
			return;

		this.setState(WidgetState.TERMINATED);
		this.$terminate&&this.$terminate();
	}

	isTerminated(){
		return this.$state == WidgetState.TERMINATED;
	}

	isTemplate(){
		return this.$controller != null && this.$template != null
	}

	getTemplate(){
		return this.$template;
	}

	getController(){
		return this.$controller;
	}

}

const PROVIDER_SUFFIX = 'Provider';

class WidgetService {
	constructor($injector, $provide){
		this.$provide = $provide;
		this.$injector = $injector;
	}

	static get $inject(){
		return ['$injector', '$provide'];
	}

	/**
	 * Esli widget suschestvuet v strukture angulara to mi ego zagruzaem esli net to sozdajom i registriruem
	 * @param {*} name 
	 * @param {*} constructor 
	 */
	getOrCreateWidget(name, constructor){
		if(this.$injector.has(name + PROVIDER_SUFFIX) == false){
			const widget = new Widget();

			widget.$get = function(){
				return Object.assign(this.$injector.instantiate(constructor || function(){}), {
					onCall: function(callback){
						widget.$call = callback;
						return this;
					},
					onSuspend:function(callback){
						widget.$suspend = callback;
						return this;
					},
					onTerminate:function(callback){
						widget.$terminate = callback;
						return this;
					}
				});
			};

			this.$provide.provider(name, widget);
		}

		return this.$injector.get(name + PROVIDER_SUFFIX);
	}

	/**
	 * Metod registracii widgeta, esli widget uze est to pereopredeljaetsja ego nastrujoki
	 * @param {*} name 
	 * @param {*} constructor 
	 */
	register(name, constructor){
		const _widget = this.getOrCreateWidget(name, constructor);

		return {
			template:function(options){
				_widget.$template   = options.template;
				_widget.$controller = options.controller;
			}
		}
	}


	get $get(){
		return [];
	}

}

angular.module('uiDashboardRouter').provider('WidgetService', WidgetService);

const PROVIDER_SUFFIX$1 = 'Provider';

const DashboardState = Object.defineProperties({}, {
	ACTIVE: {
		value: 1,
		writable: false
	},
	SUSPENDED: {
		value: 2,
		writable: false
	},
	TERMINATED: {
		value: 0,
		writable: false
	}
});

class Dashboard{
	//$status;
	//$widgets;
	//$events;

	constructor(){
		this.$status = DashboardState.TERMINATED;
		this.$widgets = [];
		this.$events = {
			call: [],
			suspend: [],
			terminate: []
		};
	}

	getStatus(){
		return this.$status;
	}

	/**
	 * Pomecahem vse widgeti kak neizmenjaemie
	 */
	markAsImmutable(){
		this.$widgets.forEach((widget) => widget.setImmutable(true));
		return this;
	}

	call(/*arguments*/){
		this.$widgets.forEach((widget) => widget.setImmutable(false).call.apply(widget, arguments));
		this.$events.call.forEach((event) => event.apply(event, arguments));

		this.$status = DashboardState.ACTIVE;
		return this;
	}

	suspend(){
		this.$widgets.forEach((widget) => widget.suspend());
		this.$events.suspend.forEach((event) => event());
		this.$status = DashboardState.SUSPENDED;
		return this;
	}

	terminate(){
		this.$widgets.forEach((widget) => widget.terminate());
		this.$events.terminate.forEach((event) => event());
		this.$status = DashboardState.TERMINATED;
		return this;
	}

	widgets(){
		return this.$widgets;
	}

	create($templateRequest, $controller, $compile, $rootScope){
		return this.$widgets.map(function(widget){
			if(widget.isTerminated() == false){
				return true
			}
			
			if(widget.isTemplate() == false){
				return true
			}

			const desktop = document.getElementById("desktop");

			return $templateRequest(widget.getTemplate()).then(function success(html){
				
				const scope = angular.extend($rootScope.$new());
				const element = angular.element(html);

				console.log(widget.getController(), scope);
				
				$controller(widget.getController(), {
					$scope: scope,
					$element: element
				});

				Array.prototype.slice.call(element).forEach(x => desktop.appendChild(x));
				$compile(element)(scope);
			});
			
		});
	}
}

class DashboardService{

	constructor(widgetService, $injector, $provide){
		this.widgetService = widgetService;
		this.$provide = $provide;
		this.$injector = $injector;
	}

	static get $inject() {
		return ['PB.WidgetServiceProvider', '$injector', '$provide'];
	}

	getOrCreateDashboard(name, constructor){
		if(this.$injector.has(name + PROVIDER_SUFFIX$1) == false){
			const dashboard = new Dashboard();

			dashboard.$get = function(){
				return Object.assign($injector.instantiate(constructor || function(){}), {
					onCall: function(callback){
						dashboard.$events.call.push(callback);
						return this;
					},
					onSuspend:function(callback){
						dashboard.$events.suspend.push(callback);
						return this;
					},
					onTerminate:function(callback){
						dashboard.$events.terminate.push(callback);
						return this;
					}
				});
			};

			this.$provide.provider(name, dashboard);
		}
		
		return this.$injector.get(name + PROVIDER_SUFFIX$1);
	}

	/**
	 * Metod registracii deshborda
	 * @param {*} name 
	 * @param {*} constructor 
	 */
	register(name, constructor){
		const dashboard = this.getOrCreateDashboard(name, constructor);

		return {
			widget: function(name, constructor){
				dashboard.widgets().push(this.widgetService.$widget(name, constructor));
				return this;
			},
			tempalte: function(options){
				const widget = new Widget();
				widget._template   = options.template;
				widget._controller = options.controller;
				dashboard.widgets().push(widget);
			}
		}
	}

	/**
	 * Metod
	 */
	get $get(){
		return ['$q', '$templateRequest', '$controller', '$compile', '$rootScope',
			function($q, $templateRequest, $controller, $compile, $rootScope){
				return {
					call:function(name){

						if($injector.has(name + providerSuffix) == false)
							return;

						const dashboard = $injector.get(name + providerSuffix);
						console.log(dashboard);

						if($active == dashboard)
							return;

						dashboard.markAsImmutable();

						if(dashboard.getStatus() == DashboardState.TERMINATED){
							$q.all(dashboard.create($templateRequest, $controller, $compile, $rootScope)).then(() =>{
								if($active)
									$active.suspend();

								$active = dashboard.call();
							});

						}else {
							if($active)
								$active.suspend();

							$active = dashboard.call();
						}

					},
					terminate: function(){
						if($active)
							$active.terminate();
					}
				};
			}
		]
	}
}

angular.module('uiDashboardRouter').provider('DashboardService', DashboardService);
