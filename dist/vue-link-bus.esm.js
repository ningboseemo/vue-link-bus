/*!
 * vue-link-bus v1.0.0
 * https://github.com/yangmingshan/vue-bus
 * @license MIT
 */
function getLink (value, pre, next) {
  if ( pre === void 0 ) pre = null;
  if ( next === void 0 ) next = null;

  return {value: value, pre: pre, next: next}
}

var Bus = function Bus () {
  this._events = {};
  this.vmUids = {};
};
Bus.prototype.$on = function $on (event, fn, vm) {
  var bus = this;
  if (Array.isArray(event)) {
    for (var i = 0; i < event.length; i++) {
      this.$on(event[i], fn, vm);
    }
  } else {
    var node;
    if (bus._events[event]) {
      node = getLink(fn, bus._events[event]);
      bus._events[event].next = node;
    } else {
      node = getLink(fn, bus._events[event]);
      bus._events[event] = node;
    }
    node.name = event;
    if (vm) {
      if (bus.vmUids[vm._uid]) {
        bus.vmUids[vm._uid].push(node);
      } else {
        bus.vmUids[vm._uid] = [node];
      }
    }
    node = null;
  }
  return bus
};
Bus.prototype.$off = function $off (event, fn, vm) {
  var bus = this;
  // 清空所有事件
  if (!arguments.length) {
    bus._events = Object.create(null);
    return bus
  }
  if (Array.isArray(event)) {
    for (var i = 0; i < event.length; i++) {
      bus.$off(event[i], fn, vm);
    }
    return bus
  }

  var cbs = bus._events[event];
  if (!cbs) {
    return bus
  }

  if (!fn) {
    bus._events[event] = null;
    return bus
  }

  var cb = cbs;
  // 链表操作
  while (cb) {
    var node = cb;
    if (fn === node.value) {
      if (node.pre) {
        node.pre.next = node.next;
        if (node.next) {
          node.next.pre = node.pre;
        }
      } else {
        bus._events[event] = null;
      }
    }
    cb = node.pre;
  }
  return bus
};
Bus.prototype.$once = function $once (event, fn, vm) {
  var bus = this;
  bus.$on(event, function () {
      var arg = [], len = arguments.length;
      while ( len-- ) arg[ len ] = arguments[ len ];

    bus.$off(event, fn, vm);
    fn.apply(void 0, arg);
  }, vm);
  return bus
};
Bus.prototype.$clear = function $clear (vm) {
  var bus = this;
  if (!vm) {
    bus._events = Object.create(null);
    return bus
  }
  var _uid = vm._uid;
  if (_uid) {
    var cbs = bus.vmUids[_uid];
    if (!cbs) {
      return bus
    }
    cbs.forEach(function (item) {
      if (item.pre) {
        item.pre.next = item.next;
        if (item.next) {
          item.next.pre = item.pre;
        }
      } else if (item.next) {
        item.next.pre = null;
      } else {
        delete bus._events[item.name];
      }
    });
  }
  delete bus.vmUids[_uid];
  return bus
};
Bus.prototype.$emit = function $emit (event) {
    var arg = [], len = arguments.length - 1;
    while ( len-- > 0 ) arg[ len ] = arguments[ len + 1 ];

  var bus = this;
  var cbs = bus._events[event];
  if (cbs) {
    var cb = cbs;
    while (cb) {
      var node = cb;
      if (node.value) {
        var fn = node.value;
        if (typeof fn !== 'function') {
          console.error(("[" + event + "]的回调不是一个函数"));
        }
        fn.apply(void 0, arg);
      }
      cb = node.pre;
    }
  }
  return bus
};

var _Vue;
var installed = false;

function index (Vue) {
  if (installed && _Vue === Vue) { return }
  _Vue = Vue;
  installed = true;
  Vue.prototype.$bus2 = new Bus();
  Vue.mixin({
    beforeDestroy: function beforeDestroy() {
      this.$bus2.$clear(this);
    },
  });
}

export default index;
