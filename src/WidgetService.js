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
		const $injector = this.$injector;

		if($injector.has(name + PROVIDER_SUFFIX) == false){
			const widget = new Widget();

			widget.$get = function(){
				return Object.assign($injector.instantiate(constructor || function(){}), {
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


export {Widget, WidgetService};
