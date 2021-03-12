function getLink (value, pre = null, next = null) {
  return {value, pre, next}
}

class Bus {
  constructor () {
    this._events = {}
    this.vmUids = {}
  }
  $on (event, fn, vm) {
    let bus = this
    if (Array.isArray(event)) {
      for (let i = 0; i < event.length; i++) {
        this.$on(event[i], fn, vm)
      }
    } else {
      let node
      if (bus._events[event]) {
        node = getLink(fn, bus._events[event])
        bus._events[event].next = node
      } else {
        node = getLink(fn, bus._events[event])
        bus._events[event] = node
      }
      node.name = event
      if (vm) {
        if (bus.vmUids[vm._uid]) {
          bus.vmUids[vm._uid].push(node)
        } else {
          bus.vmUids[vm._uid] = [node]
        }
      }
      node = null
    }
    return bus
  }
  $off (event, fn, vm) {
    let bus = this
    // 清空所有事件
    if (!arguments.length) {
      bus._events = Object.create(null)
      return bus
    }
    if (Array.isArray(event)) {
      for (let i = 0; i < event.length; i++) {
        bus.$off(event[i], fn, vm)
      }
      return bus
    }

    let cbs = bus._events[event]
    if (!cbs) {
      return bus
    }

    if (!fn) {
      bus._events[event] = null
      return bus
    }

    let cb = cbs
    // 链表操作
    while (cb) {
      let node = cb
      if (fn === node.value) {
        if (node.pre) {
          node.pre.next = node.next
          if (node.next) {
            node.next.pre = node.pre
          }
        } else {
          bus._events[event] = null
        }
      }
      cb = node.pre
    }
    return bus
  }
  $once (event, fn, vm) {
    let bus = this
    bus.$on(event, (...arg) => {
      bus.$off(event, fn, vm)
      fn(...arg)
    }, vm)
    return bus
  }
  $clear (vm) {
    let bus = this
    if (!vm) {
      bus._events = Object.create(null)
      return bus
    }
    let _uid = vm._uid
    if (_uid) {
      let cbs = bus.vmUids[_uid]
      if (!cbs) {
        return bus
      }
      cbs.forEach(item => {
        if (item.pre) {
          item.pre.next = item.next
          if (item.next) {
            item.next.pre = item.pre
          }
        } else if (item.next) {
          item.next.pre = null
        } else {
          delete bus._events[item.name]
        }
      })
    }
    delete bus.vmUids[_uid]
    return bus
  }
  $emit (event, ...arg) {
    let bus = this
    let cbs = bus._events[event]
    if (cbs) {
      let cb = cbs
      while (cb) {
        let node = cb
        if (node.value) {
          let fn = node.value
          if (typeof fn !== 'function') {
            console.error(`[${event}]的回调不是一个函数`)
          }
          fn(...arg)
        }
        cb = node.pre
      }
    }
    return bus
  }
}

let _Vue
let installed = false

export default function (Vue) {
  if (installed && _Vue === Vue) return
  _Vue = Vue
  installed = true
  Vue.prototype.$bus2 = new Bus()
  Vue.mixin({
    beforeDestroy() {
      this.$bus2.$clear(this)
    },
  })
}
