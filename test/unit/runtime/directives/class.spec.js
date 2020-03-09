import { createPage, getPageData } from '../../helpers'

describe(':class', () => {
  let warn
  beforeEach(() => {
    warn = console.warn
    console.warn = jasmine.createSpy()
    jasmine.clock().install()
  })

  afterEach(() => {
    jasmine.clock().uninstall()
    console.warn = warn
  })

  function assertClass (assertions) {
    const pageOptions = {
      mpType: 'page',
      template: `<div class="foo" :class="value"></div>`,
      data: {
        value: ''
      }
    }

    assertions.forEach(([value, expected], i) => {
      let _value
      if (typeof value === 'function') {
        _value = value(pageOptions.data.value)
      } else {
        _value = value
      }
      const options = Object.assign({}, pageOptions, {
        data: {
          value: _value
        }
      })
      const { page } = createPage(options)
      if (expected) {
        expect(getPageData(page, '0').h['0'].cl).toEqual(expected)
      } else {
        expect(
          getPageData(page, '0').h === undefined ||
          getPageData(page, '0').h['0'].cl === ''
        ).toBeTruthy()
      }
    })
  }

  it('with plain string', () => {
    assertClass([
      ['foo megalo', 'foo megalo'],
      ['megalo', 'megalo']
    ])
  })

  it('with array', () => {
    assertClass([
      [['megalo', 'box'], 'megalo box'],
      [['', undefined], '']
    ])
  })

  it('with object', () => {
    assertClass([
      [{ megalo: true, box: true }, 'megalo box'],
      [null, '']
    ])
  })

  it('with array of mixed values', () => {
    assertClass([
      [['x', { y: true, z: true }], 'x y z'],
      [null, '']
    ])
  })

  it('class merge between parent and child', done => {
    function expectRootClass (expected) {
      expect(page.data.$root['0v0'].h[0].rcl).toBe(expected)
    }

    const pageOptions = {
      mpType: 'page',
      template: '<child class="a" :class="value"></child>',
      data: { value: 'b' },
      components: {
        child: {
          template: '<div class="c" :class="value"></div>',
          data: () => ({ value: 'd' })
        }
      }
    }

    const { page, vm } = createPage(pageOptions)

    const child = vm.$children[0]

    expectClass(page).toEqual('d')
    // static class of child is stored in 'h[0].rcl' of the child
    expectRootClass('b a')

    vm.value = 'e'
    waitForUpdate(() => {
      expectRootClass('e a')
      expectClass(page).toEqual('d')
    }).then(() => {
      child.value = 'f'
    }).then(() => {
      expectRootClass('e a')
      expectClass(page).toEqual('f')
    }).then(() => {
      vm.value = { foo: true }
      child.value = ['bar', 'baz']
    }).then(() => {
      expectRootClass('foo a')
      expectClass(page).toEqual('bar baz')
    }).then(done)

    function expectClass (page) {
      return expect(getPageData(page, '0,0').h['0'].cl)
    }
  })

  // TODO: support this
  it('class merge between multiple nested components sharing same element', done => {
    pending()
    const pageOptions = {
      mpType: 'page',
      template: `
        <component1 :class="componentClass1">
          <component2 :class="componentClass2">
            <component3 :class="componentClass3">
              some text
            </component3>
          </component2>
        </component1>
      `,
      data: {
        componentClass1: 'componentClass1',
        componentClass2: 'componentClass2',
        componentClass3: 'componentClass3'
      },
      components: {
        component1: {
          render () {
            return this.$slots.default[0]
          }
        },
        component2: {
          render () {
            return this.$slots.default[0]
          }
        },
        component3: {
          template: '<div class="staticClass"><slot></slot></div>'
        }
      }
    }

    const { page } = createPage(pageOptions)

    const { rootVM: vm } = page
    expectClass(page).toBe('componentClass3 componentClass2 componentClass1')

    vm.componentClass1 = 'c1'
    waitForUpdate(() => {
      expectClass(page).toBe('componentClass3 componentClass2 c1')
    }).then(() => {
      vm.componentClass2 = 'c2'
    }).then(() => {
      expect(getPageData(page, '0').h['0']).toEqual(1)
    }).then(() => {
      // expectClass(page).toBe('componentClass3 c2 c1')
      // vm.componentClass3 = 'c3'
    }).then(() => {
      // expectClass(page).toBe('c3 c2 c1')
    }).then(done)

    function expectClass (page) {
      return expect(getPageData(page, '0').h['0'].cl)
    }
  })

  it('deep update', done => {
    const pageOptions = {
      mpType: 'page',
      template: '<div :class="test"></div>',
      data: {
        test: { a: true, b: false }
      }
    }

    const { page, vm } = createPage(pageOptions)

    expectClass(page).toBe('a')
    vm.test.b = true
    waitForUpdate(() => {
      expectClass(page).toBe('a b')
    }).then(done)

    function expectClass (page) {
      return expect(getPageData(page, '0').h['0'].cl)
    }
  })

  it('should warn about ${staticClass}', () => {
    createPage({
      mpType: 'page',
      template: '<div class="{{test}}"></div>',
      data: {
        test: { a: true, b: false }
      }
    })
    expect(console.warn.calls.argsFor(0)[0]).toContain(
      'class="{{test}}": Interpolation inside attributes has been removed. Use v-bind or the colon shorthand instead. For example, instead of <div class="{{ val }}">, use <div :class="val">.'
    )
  })

  it('class merge between parent and child and no binding in child', done => {
    function expectRootClass (expected) {
      expect(page.data.$root['0v0'].h[0].rcl).toBe(expected)
    }

    const pageOptions = {
      mpType: 'page',
      template: '<child class="a" :class="value"></child>',
      data: { value: 'b' },
      components: {
        child: {
          template: '<div class="c"></div>',
          data: () => ({ value: 'd' })
        }
      }
    }

    const { page, vm } = createPage(pageOptions)

    const child = vm.$children[0]

    // static class of child is stored in 'h[0].rcl' of the child
    expectRootClass('b a')

    vm.value = 'e'
    waitForUpdate(() => {
      expectRootClass('e a')
    }).then(() => {
      child.value = 'f'
    }).then(() => {
      expectRootClass('e a')
    }).then(() => {
      vm.value = { foo: true }
      child.value = ['bar', 'baz']
    }).then(() => {
      expectRootClass('foo a')
    }).then(done)
  })

  it('class merge between parent and child and only static class on parent', () => {
    function expectRootClass (expected) {
      expect(page.data.$root['0v0'].h[0].rcl).toBe(expected)
    }

    const pageOptions = {
      mpType: 'page',
      template: '<child class="a" ></child>',
      data: { value: 'b' },
      components: {
        child: {
          template: '<div class="c"></div>'
        }
      }
    }

    const { page } = createPage(pageOptions)

    expectRootClass('a')
  })
})
