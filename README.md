# vue-link-bus
实现组件销毁就注销事件

## 安装
```
$ yarn add vue-link-bus
$ npm install vue-link-bus --save
```

## 使用
```
import Bus from 'vue-link-bus'

Vue.use(Bus)

Vue.component('com1', {
  created () {
    // 第一种使用方式，传入第三参数，组件销毁可以注销绑定的事件
    this.$bus.$on('events', () => console.log('收到'), this)

    // 第二种使用方式,这种使用方式需要手动注销事件
    fn = () => {
      console.log('收到2')
    }
    this.$bus.$on('events2', fn)
    this.$once('beforeDestroy', () => {
      this.$bus.$off('events2', fn)
    })
  }
})

```
## 包含的方法
`$on` 注册事件
`$off` 注销事件
`$once` 注册一次性事件
`$emit` 事件通知
