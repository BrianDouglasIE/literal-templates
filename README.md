# literal-templates

A lightweight, flexible template engine for Node.js, offering dynamic registration and rendering of template views, includes, and helpers.

## Features

- **Views**: Register, render, or remove named template views.
- **Includes**: Register reusable template snippets ("includes") and use them within your views.
- **Helpers**: Register custom helper functions accessible in your templates.
- **Directory Registration**: Bulk-register views or includes from a directory of files.
- **Template Compilation**: Templates are compiled to JavaScript functions for efficiency, using ES6 template literals for variable interpolation.

## Installation

```bash
npm install @briandouglasie/literal-templates
```

## Usage

### Basic Example

```js
import {
  registerView,
  view,
  registerHelper,
  create
} from '@briandouglasie/literal-templates'

// Register a helper
registerHelper('upper', str => str.toUpperCase())

// Register a view
registerView('greeting', create('Hello ${data.name}!'))

// Render the view
console.log(view('greeting', { name: 'World' })) // Output: Hello World!
```

### Registering Views and Includes from Directories

You can bulk-register all `.html` files in a directory as views or includes:

```js
import { registerViewDir, registerIncludeDir } from '@briandouglasie/literal-templates'

await registerViewDir('./views')    // Registers all .html files as views
await registerIncludeDir('./includes') // Registers all .html files as includes
```

## API Reference

### Views

- **registerView(name, func)**: Register a new view by name.
- **removeView(name)**: Remove a view by name.
- **clearViews()**: Remove all registered views.
- **getViews()**: Get a shallow copy of all registered views.
- **registerViewDir(dirPath, recursive = true, ext = '.html')**: Register all files with the given extension from a directory as views.
- **view(name, vars)**: Render a view with the provided variables.

### Includes

- **registerInclude(name, func)**: Register a new include by name.
- **removeInclude(name)**: Remove an include by name.
- **clearIncludes()**: Remove all registered includes.
- **getIncludes()**: Get a shallow copy of all registered includes.
- **registerIncludeDir(dirPath, recursive = true, ext = '.html')**: Register all files with the given extension from a directory as includes.

### Helpers

- **registerHelper(name, func)**: Register a new helper function.
- **removeHelper(name)**: Remove a helper by name.
- **clearHelpers()**: Remove all registered helpers.
- **getHelpers()**: Get a shallow copy of all registered helpers.

### Templates

- **create(template, varNames = ['data'])**: Compile a template string into a render function.
    - `template`: The template string (can use `${}` for variable interpolation).
    - `varNames`: Array of argument names passed to the template (default: `['data']`).
    - Helpers and includes are always available as `helpers` and `include` in the template context.

## Template Syntax

Templates use [ES6 template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) for variable interpolation:

```js
create('Hello ${data.name}, today is ${helpers.upper(data.day)}!')
```

- `helpers`: Access any registered helper functions.
- `include(name, vars)`: Render an include (only available within templates).
- Variables are passed as the first argument (`data` by default) when rendering.

## Example: Using Includes and Helpers

Suppose you have the following in `includes/header.html`:

```html
<h1>${helpers.upper(data.title)}</h1>
```

Register and use it:

```js
await registerIncludeDir('./includes')
const template = create('${include("header", { title: data.header })} Hello, ${data.name}!')
console.log(template({ header: 'welcome', name: 'Alice' }))
// Output: <h1>WELCOME</h1> Hello, Alice!
```

## License

See [LICENSE](./LICENSE) for details.
