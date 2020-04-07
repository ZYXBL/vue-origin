function observe (obj) {
  if (typeof obj !== 'object' || obj === null) {
    return;
  }
  Object.keys(obj).forEach(key => {
    defineReactive(obj, key, obj[key]);
  })
}

function defineReactive (obj, key, val) {
  // 遍历val
  observe(val);

  Object.defineProperty(obj, key, {
    get () {
      console.log('get key:' + key, val);
      return val
    },
    set (newVal) {
      console.log('set key:' + key, 'newVal:' + newVal, 'oldVal:' + val);
      if (newVal !== val) {
        observe(newVal);
        val = newVal
      }
    }
  })
}

function set(obj, key, val) {
  defineReactive(obj, key, val);
}

var obj = { foo: 1, baz: { a: 2 }, c: [1, { a: 3 }] };
// defineReactive(obj, 'foo', 'foo');
observe(obj);
// obj.foo = 'foooooooo';
// obj.foo;
// obj.foo = 'test';
// obj.foo;
// obj.baz = { a: 3 };
// obj.baz.a = 4;
// obj.baz;
// obj.baz.a;
// obj.d = '1';
// set(obj, 'd', '1');
// obj.d;
obj.c;
obj.c[0];
obj.c[1];
obj.c[1] = { b: 2 }
obj.c[1].a = 4;
obj.c[1].a;