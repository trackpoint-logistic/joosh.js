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
  constructor() {
    this.$state = WidgetState.TERMINATED;
    this.$call = null;
    this.$suspend = null;
    this.$terminate = null;
    this.$template = null;
    this.$controller = null;
    this.$immutable = false;
  }

  setState(state) {
    this.$state = state;
    return this;
  }

  setImmutable(imt) {
    this.$immutable = imt;
    return this;
  }

  call() {
    if (this.$immutable == false && this.$state != WidgetState.ACTIVE) {
      this.setState(WidgetState.ACTIVE);
      this.$call && this.$call();
    }
  }

  suspend() {
    if (this.$immutable == false && this.$state == WidgetState.ACTIVE) {
      this.setState(WidgetState.SUSPENDED);
      this.$suspend && this.$suspend();
    }
  }

  terminate() {
    if (this.$immutable) {
      return;
    }

    this.setState(WidgetState.TERMINATED);
    this.$terminate && this.$terminate();
  }

  isTerminated() {
    return this.$state == WidgetState.TERMINATED;
  }

  isTemplate() {
    return this.$controller != null && this.$template != null;
  }

  getTemplate() {
    return this.$template;
  }

  getController() {
    return this.$controller;
  }

}

const PROVIDER_SUFFIX = 'Provider';

class WidgetService {
  constructor($injector, $provide) {
    this.$provide = $provide;
    this.$injector = $injector;
  }

  static get $inject() {
    return ['$injector', '$provide'];
  }
  /**
   * Esli widget suschestvuet v strukture angulara to mi ego zagruzaem esli net to sozdajom i registriruem
   * @param {*} name 
   * @param {*} constructor 
   */


  getOrCreateWidget(name, constructor) {
    const $injector = this.$injector;

    if ($injector.has(name + PROVIDER_SUFFIX) == false) {
      const widget = new Widget();

      widget.$get = function () {
        return Object.assign($injector.instantiate(constructor || function () {}), {
          onCall: function (callback) {
            widget.$call = callback;
            return this;
          },
          onSuspend: function (callback) {
            widget.$suspend = callback;
            return this;
          },
          onTerminate: function (callback) {
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


  register(name, constructor) {
    const _widget = this.getOrCreateWidget(name, constructor);

    return {
      template: function (options) {
        _widget.$template = options.template;
        _widget.$controller = options.controller;
      }
    };
  }

  get $get() {
    return [];
  }

}

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

class Dashboard {
  constructor() {
    this.$status = DashboardState.TERMINATED;
    this.$widgets = [];
    this.$events = {
      call: [],
      suspend: [],
      terminate: []
    };
  }

  getStatus() {
    return this.$status;
  }
  /**
   * Pomecahem vse widgeti kak neizmenjaemie
   */


  markAsImmutable() {
    var _a = this.$widgets;

    var _f = widget => {
      return widget.setImmutable(true);
    };

    for (var _i = 0; _i < _a.length; _i++) {
      _f(_a[_i], _i, _a);
    }

    undefined;
    return this;
  }

  call()
  /*arguments*/
  {
    var _a2 = this.$widgets;

    var _f2 = widget => {
      return widget.setImmutable(false).call.apply(widget, arguments);
    };

    for (var _i2 = 0; _i2 < _a2.length; _i2++) {
      _f2(_a2[_i2], _i2, _a2);
    }

    undefined;
    var _a3 = this.$events.call;

    var _f3 = event => {
      return event.apply(event, arguments);
    };

    for (var _i3 = 0; _i3 < _a3.length; _i3++) {
      _f3(_a3[_i3], _i3, _a3);
    }

    undefined;
    this.$status = DashboardState.ACTIVE;
    return this;
  }

  suspend() {
    var _a4 = this.$widgets;

    var _f4 = widget => {
      return widget.suspend();
    };

    for (var _i4 = 0; _i4 < _a4.length; _i4++) {
      _f4(_a4[_i4], _i4, _a4);
    }

    undefined;
    var _a5 = this.$events.suspend;

    var _f5 = event => {
      return event();
    };

    for (var _i5 = 0; _i5 < _a5.length; _i5++) {
      _f5(_a5[_i5], _i5, _a5);
    }

    undefined;
    this.$status = DashboardState.SUSPENDED;
    return this;
  }

  terminate() {
    var _a6 = this.$widgets;

    var _f6 = widget => {
      return widget.terminate();
    };

    for (var _i6 = 0; _i6 < _a6.length; _i6++) {
      _f6(_a6[_i6], _i6, _a6);
    }

    undefined;
    var _a7 = this.$events.terminate;

    var _f7 = event => {
      return event();
    };

    for (var _i7 = 0; _i7 < _a7.length; _i7++) {
      _f7(_a7[_i7], _i7, _a7);
    }

    undefined;
    this.$status = DashboardState.TERMINATED;
    return this;
  }

  widgets() {
    return this.$widgets;
  }

  create($templateRequest, $controller, $compile, $rootScope) {
    var _a8 = this.$widgets;

    var _f8 = function (widget) {
      if (widget.isTerminated() == false) {
        return true;
      }

      if (widget.isTemplate() == false) {
        return true;
      }

      const desktop = document.getElementById("desktop");
      return $templateRequest(widget.getTemplate()).then(function success(html) {
        const scope = angular.extend($rootScope.$new());
        const element = angular.element(html);
        $controller(widget.getController(), {
          $scope: scope,
          $element: element
        });

        var _a9 = Array.prototype.slice.call(element);

        var _f9 = x => {
          return desktop.appendChild(x);
        };

        for (var _i9 = 0; _i9 < _a9.length; _i9++) {
          _f9(_a9[_i9], _i9, _a9);
        }

        undefined;
        $compile(element)(scope);
      });
    };

    var _r8 = [];

    for (var _i8 = 0; _i8 < _a8.length; _i8++) {
      _r8.push(_f8(_a8[_i8], _i8, _a8));
    }

    return _r8;
  }

}

class DashboardService {
  constructor(widgetService, $injector, $provide) {
    this.widgetService = widgetService;
    this.$provide = $provide;
    this.$injector = $injector;
  }

  static get $inject() {
    return ['WidgetServiceProvider', '$injector', '$provide'];
  }

  getOrCreateDashboard(name, constructor) {
    const $injector = this.$injector;

    if ($injector.has(name + PROVIDER_SUFFIX$1) == false) {
      const dashboard = new Dashboard();

      dashboard.$get = function () {
        return Object.assign($injector.instantiate(constructor || function () {}), {
          onCall: function (callback) {
            dashboard.$events.call.push(callback);
            return this;
          },
          onSuspend: function (callback) {
            dashboard.$events.suspend.push(callback);
            return this;
          },
          onTerminate: function (callback) {
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


  register(name, constructor) {
    const dashboard = this.getOrCreateDashboard(name, constructor);
    const widgetService = this.widgetService;
    return {
      widget: function (name, constructor) {
        const widget = widgetService.getOrCreateWidget(name, constructor);
        dashboard.widgets().push(widget);
        return this;
      },
      tempalte: function (options) {
        const widget = new Widget();
        widget._template = options.template;
        widget._controller = options.controller;
        dashboard.widgets().push(widget);
      }
    };
  }
  /**
   * Metod
   */


  get $get() {
    return ['$q', '$templateRequest', '$controller', '$compile', '$rootScope', function ($q, $templateRequest, $controller, $compile, $rootScope) {
      const $injector = this.$injector; //Na dannij moment aktivnij deshbord

      let $active = null;
      return {
        call: function (name) {
          if ($injector.has(name + PROVIDER_SUFFIX$1) == false) {
            return;
          }

          const dashboard = $injector.get(name + PROVIDER_SUFFIX$1);

          if ($active == dashboard) {
            return;
          }

          dashboard.markAsImmutable();

          if (dashboard.getStatus() == DashboardState.TERMINATED) {
            $q.all(dashboard.create($templateRequest, $controller, $compile, $rootScope)).then(() => {
              if ($active) {
                $active.suspend();
              }

              $active = dashboard.call();
            });
          } else {
            if ($active) {
              $active.suspend();
            }

            $active = dashboard.call();
          }
        },
        terminate: function () {
          if ($active) {
            $active.terminate();
          }
        }
      };
    }];
  }

}

angular.module('DashboardRouter', []).provider('WidgetService', WidgetService).provider('DashboardService', DashboardService);