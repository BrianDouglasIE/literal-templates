import test from 'node:test'
import {strict as assert} from 'node:assert'
import {
    clearHelpers,
    clearIncludes,
    clearViews, create, getHelpers, getIncludes, getViews,
    registerHelper, registerInclude,
    registerIncludeDir, registerView,
    registerViewDir, removeHelper, removeInclude, removeView,
    view
} from "./engine.js";

test('[Includes]', async (t) => {
    await t.test('can get include map', () => {
        assert.deepEqual(getIncludes(), {})
    })

    await t.test('can register include', () => {
        registerInclude('test', () => 'test')
        assert.equal('test' in getIncludes(), true)
    })

    await t.test('can remove include', () => {
        registerInclude('test', () => 'test')
        removeInclude('test')
        assert.equal(getIncludes()['test'], undefined)
    })

    await t.test('can remove all includes', () => {
        registerInclude('test', () => 'test')
        registerInclude('test2', () => 'test')
        clearIncludes()
        assert.deepEqual(getIncludes(), {})
    })
})

test('[Helpers]', async (t) => {
    await t.test('can get helper map', () => {
        assert.deepEqual(getHelpers(), {})
    })

    await t.test('can register helper', () => {
        registerHelper('test', () => 'test')
        assert.equal('test' in getHelpers(), true)
    })

    await t.test('can remove helper', () => {
        registerHelper('test', () => 'test')
        removeHelper('test')
        assert.equal(getHelpers()['test'], undefined)
    })

    await t.test('can remove all helpers', () => {
        registerHelper('test', () => 'test')
        registerHelper('test2', () => 'test')
        clearHelpers()
        assert.deepEqual(getHelpers(), {})
    })
})

test('[Templates]', async (t) => {
    await t.test('default var name is data', () => {
        assert.equal(create('hello ${data.name}')({name: 'world'}), 'hello world')
    })

    await t.test('named variables', () => {
        assert.equal(create('hello ${name}', ['name'])('world'), 'hello world')
    })

    await t.test('calling helpers', () => {
        registerHelper('lower', s => s.toLowerCase())
        assert.equal(create('hello ${helpers.lower(name)}', ['name'])('WORLD'), 'hello world')
    })

    await t.test('include helper', () => {
        registerInclude('test', () => 'world')
        assert.equal(create('hello ${include("test")}')(), 'hello world')
        removeInclude('test')
    })
})

test('[Views]', async (t) => {
    await t.test('can get view map', () => {
        assert.deepEqual(getViews(), {})
    })

    await t.test('can register view', () => {
        registerView('test', () => 'test')
        assert.equal('test' in getViews(), true)
    })

    await t.test('can remove view', () => {
        registerView('test', () => 'test')
        removeView('test')
        assert.equal(getViews()['test'], undefined)
    })

    await t.test('view method', () => {
        registerView('test', () => 'test')
        assert.deepEqual(view('test'), 'test')
    })

    await t.test('view method with vars', () => {
        registerView('test', create('hello ${name}', ['name']))
        assert.deepEqual(view('test', 'world'), 'hello world')
    })

    await t.test('view method with helpers', () => {
        registerInclude('test', create('hello ${name}', ['name']))
        registerView('test', create('${include("test", name)}', ['name']))
        assert.deepEqual(view('test', 'world'), 'hello world')
    })

    await t.test('can remove all views', () => {
        registerView('test', () => 'test')
        registerView('test2', () => 'test')
        clearViews()
        assert.deepEqual(getViews(), {})
    })
})

test('[Registering from a directory]', async (t) => {
    await clearIncludes()
    await clearHelpers()
    await clearViews()

    await t.test('can register views from a dir', async () => {
        await registerViewDir('./test_templates/views')
        assert.equal('home' in getViews(), true)
    })

    await t.test('can register includes from a dir', async () => {
        await registerIncludeDir('./test_templates/includes')
        assert.deepEqual(Object.keys(getIncludes()), ['site-header', 'components.timestamp'])
    })

    await t.test('view has correct data', async () => {
        await registerViewDir('./test_templates/views')
        await registerIncludeDir('./test_templates/includes')
        await registerHelper('formatDate', d => d.toISOString())

        const date = new Date()
        const result = view('home', {title: 'Home Page', timestamp: date})
        assert.ok(result.match('<title>Home Page</title>'))
        assert.ok(result.match('<h1>Home Page</h1>'))
        assert.ok(result.match(date.toISOString()))
    })
})

