// let watchers = []

// watcher
class Watcher {
  constructor (vm, key, updater) {
    this.vm = vm
    this.key = key
    this.updater = updater

    // watchers.push(this)
    Dep.target = this;
    vm[key];
    Dep.target = null
  }

  update () {
    this.updater.call(this.vm, this.vm[this.key])
  }
}

// Dep:管理watcher
class Dep {
  constructor () {
    this.watchers = []
  }

  addWatch (watcher) {
    this.watchers.push(watcher)
  }

  notify () {
    this.watchers.forEach(w => w.update())
  }
}

// Object.defineProperty使数据响应式
function defineReactive(obj, key, val) {
  // 循环遍历子数据
  observe(val);
  // 每个值声明Dep
  const dep = new Dep();

  Object.defineProperty(obj, key, {
    get () {
      console.log('get', key, val);
      Dep.target && dep.addWatch(Dep.target)
      return val;
    },
    set (newVal) {
      if (newVal !== val) {
        console.log('set', key, newVal);
        observe(newVal);
        val = newVal;

        // 遍历更新
        // watchers.forEach(w => w.update())
        dep.notify()
      }
    }
  })
}

// 对对象循环遍历数据响应式
function observe (obj) {
  if (typeof obj !== 'object' || obj === null) {
    return;
  }

  // Object.keys(obj).forEach(key => {
  //   defineReactive(obj, key, obj[key]);
  // });
  new Observer(obj);
}

// 设置动态数据响应式
function set (obj, key, val) {
  defineReactive(obj, key, val);
}

function proxy (vm, prop) {
  Object.keys(vm[prop]).forEach(key => {
    Object.defineProperty(vm, key, {
      get () {
        return vm[prop][key];
      },
      set (newVal) {
        vm[prop][key] = newVal;
      }
    })
  })
}

class zVue {
  constructor(options) {
    this.$options = options;
    // this.vm = options
    this.$data = options.data;
    // 1.响应式处理
    observe(this.$data);

    // 1.1数据代理
    proxy(this, '$data');

    // 2.模板渲染
    new Compile(options.el, this);
  }
}

// 渲染模板
class Compile {
  constructor (el, vm) {
    // 获取模板
    this.$el = document.querySelector(el);
    this.$vm = vm;
    this.compile(this.$el);
  }

  update (node, exp, dir) {
    const fn = this[dir + 'Update'];
    fn && fn(node, this.$vm[exp])

    new Watcher(this.$vm, exp, function (val) {
      fn && fn(node, val)
    })
  }

  textUpdate (node, value) {
    node.textContent = value;
  }

  htmlUpdate (node, value) {
    node.innerHTML = value;
  }

  compile (el) {
    const childNodes = el.childNodes;
    Array.from(childNodes).forEach(node => {
      if (this.isElement(node)) {
        // 元素值
        this.htmlCompile(node);
      } else if (this.isInter(node)) {
        // 文本插值
        this.textCompile(node);
      }

      if (node.childNodes && node.childNodes.length) {
        this.compile(node);
      }
    })
  }

  textCompile (node) {
    const exp = RegExp.$1.trim();
    this.update(node, exp, 'text')
    // node.textContent = this.$vm[exp];
  }

  htmlCompile (node) {
    const attrs = node.attributes;

    Array.from(attrs).forEach(attr => {
      const name = attr.name;
      const exp = attr.value;
      if (this.isDir(name)) {
        // 自定义指令
        let dir = name.substring(2);
        this[dir] && this[dir](node, exp)
      }
    })
  }

  text (node, exp) {
    // node.innerText = this.$vm[exp]
    this.update(node, exp, 'text')
  }

  html (node, exp) {
    // node.innerHTML = this.$vm[exp]
    this.update(node, exp, 'html')
  }

  // 是否自定义指令
  isDir (name) {
    return name.indexOf('z-') === 0
  }

  // 是否元素插值
  isElement (node) {
    return node.nodeType === 1
  }
  // 是否文本插值
  isInter (node) {
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
  }
}

// 分辨是数组还是对象
class Observer {
  constructor (value) {
    this.value = value;

    this.walk(value);
  }

  walk(obj) {
    Object.keys(obj).forEach(key => {
      defineReactive(obj, key, obj[key]);
    });
  }
}