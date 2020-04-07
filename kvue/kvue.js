class KVue {
  constructor(options) {
    this.$options = options;
    this.vm = options.el;

    this.$data = options.data;
    // 1.响应式处理
    observe(this.$data);

    // 1.1数据代理
    proxy(this, '$data');
    // 2.编译
    new Compile(options.el, this);
  }
}

// Dep：管理watcher
class Dep {
  constructor () {
    this.watchers = []
  }

  addDep (watcher) {
    this.watchers.push(watcher)
  }

  notify () {
    this.watchers.forEach(w => w.update())
  }
}

// let watchers = []
// Watcher
class Watcher {
  constructor (vm, key, updater) {
    this.vm = vm
    this.key = key
    this.updater = updater
    
    // watchers.push(this)
    // 和Dep建立关系
    Dep.target = this
    this.vm[this.key] // 触发get，可以做依赖收集
    Dep.target = null
  }

  update () {
    this.updater.call(this.vm, this.vm[this.key])
  }
}

// 编译器：解析模板中插件表达式或者指令
class Compile {
  // vm是KVue实例用于初始化和更新页面
  // el是一个选择器，可以获取模板dom
  constructor (el, vm) {
    this.$vm = vm;
    // 获取模板
    this.$el = document.querySelector(el)

    this.complie(this.$el)
  }

  complie (el) {
    const childNodes = el.childNodes;
    console.log(childNodes)
    // 遍历所有子节点
    Array.from(childNodes).forEach(node => {
      // 元素类型
      if (this.isElement(node)) {
        console.log('编译元素', node.nodeName);
        this.complieHtml(node);
        
      } else if(this.isInter(node)) {
        console.log('编译插值', node);
        this.complieText(node)
      }

      if (node.childNodes && node.childNodes.length) {
        this.complie(node)
      }
    })
  }

  // 编译插值文本
  complieText(node) {
    const dir = RegExp.$1.trim();
    // node.textContent = this.$vm[dir];
    this.update(node, dir, 'text')
  }

  // 编译元素
  complieHtml(node) {
    let nodeAttrs = node.attributes;

    Array.from(nodeAttrs).forEach(attr => {
      // attr对象 { name: 'k-text', value: 'counter' }
      let attrName = attr.name
      let exp = attr.value
      if (this.isDir(attrName)) {
        let dir = attrName.substring(2)
        this[dir] && this[dir](node, exp)
      }
    })
  }

  // k-text
  text(node, exp) {
    // node.innerText = this.$vm[exp]
    this.update(node, exp, 'text')
  }

  // k-html
  html(node, exp) {
    // node.innerHTML = this.$vm[exp]
    this.update(node, exp, 'html')
  }

  isDir (attr) {
    return attr.indexOf('k-') === 0
  }

  isElement(node) {
    return node.nodeType === 1
  }

  isInter (node) {
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
  }

  // 更新方法
  update(node, exp, dir) {
    const fn = this[dir + 'Updater']
    // 初始化
    fn && fn(node, this.$vm[exp])

    // 更新
    new Watcher(this.$vm, exp, function(val) {
      fn && fn(node, val)
    })
  }

  textUpdater (node, value) {
    node.textContent = value
  }

  htmlUpdater(node, value) {
    node.innerHTML = value
  }
}

// 分辨响应式数据对象是对象还是数组
class Observer {
  constructor(value) {
    this.value = value
    this.walk(value)
  }

  walk (obj) {
    Object.keys(obj).forEach(key => {
      defineReactive(obj, key, obj[key])
    })
  }
}

function proxy(vm, prop) {
  Object.keys(vm[prop]).forEach(key => {
    Object.defineProperty(vm, key, {
      get () {
        return vm[prop][key]
      },
      set (newVal) {
        vm[prop][key] = newVal
      }
    })
  })
}

function observe (obj) {
  if (typeof obj !== 'object' || obj === null) {
    return;
  }
  // Object.keys(obj).forEach(key => {
  //   defineReactive(obj, key, obj[key]);
  // })
  
  // 创建ob实例
  new Observer(obj);
}

function defineReactive (obj, key, val) {
  // 遍历val
  observe(val);

  // 创建Dep实例和key一一对应
  const dep = new Dep()

  Object.defineProperty(obj, key, {
    get () {
      console.log('get key:' + key, val);
      // 依赖收集
      Dep.target && dep.addDep(Dep.target)
      return val
    },
    set (newVal) {
      console.log('set key:' + key, 'newVal:' + newVal, 'oldVal:' + val);
      if (newVal !== val) {
        observe(newVal);
        val = newVal

        // 更新
        // watchers.forEach(w => w.update())
        dep.notify()
      }
    }
  })
}

function set(obj, key, val) {
  defineReactive(obj, key, val);
}