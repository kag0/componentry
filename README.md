# componentry

really simple [web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components).  
no build tools or dependencies needed.

## get started
[fiddle](https://jsfiddle.net/6yqfkon4)

### import the script

we'll bring handlebars along as well as our templating engine (although you can use any function that takes an object and returns HTML). 

```html
<script src="https://cdn.jsdelivr.net/gh/kag0/componentry/componentry.min.js">
</script>
<script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js">
</script>
```

### build a template

```html
<script id="list-component-template" type="text/x-handlebars-template">
  <ul>
    {{#each items}}
    <li>{{this}}</li>
    {{/each}}
  </ul>
</script>
```

### create your component

> **note:** remember to use the `defer` attribute in your script element if you register your component outside of the body of your page.

```javascript
componentry.register(
  'list-component', // the name which will become your element type
  Handlebars.compile(
    document.getElementById("list-component-template").innerHTML
  ), // any function that takes an object and returns HTML
  { jsAttributes: ['items'] } // any attributes which should be parsed as JSON 
);
```

### use your component

just use your new component as if it were a built-in element type.

```html
<list-component items='["red", "green", "blue"]'></list-component>
```

renders as: 

<ul>
  <li>red</li>
  <li>green</li>
  <li>blue</li>
</ul>

## templating

componentry works with any template engine. 
handlebars is used in these examples for simplicity.

### attributeData

attributes on elements of our component are transformed into an object.
so the attribute data for 

```html
<list-component id="myList" items='["red", "green", "blue"]'></list-component>
```

would be

```javascript
{items: ["red", "green", "blue"]}
```

this data can be accessed on the created element

```javascript
document.getElementById("myList").componentry.attributeData;
```

### defaults

to set default values for attributes which aren't provided, pass them in the configuration object when the component is registered.

```javascript
componentry.register(
  'my-colored-box',
  myTemplate,
  { defaults: { color: "red" } } 
);
```

### `transformAttributes` and `templateData`

if our `attributeData` needs to be processed before being passed to the template, we can pass a `transformAttributes` function when we register our component.
for example, if we wanted to use the mustache way of looping over sections instead of the handlebars `each` helper, we might do this

```html
<script id="list-component-template" type="text/x-handlebars-template">
  <ul>
    {{#items}}
    <li>{{item}}</li>
    {{/items}}
  </ul>
</script>
<list-component id="myList" items='["red", "green", "blue"]'></list-component>
<script>
componentry.register(
  'list-component',
  Handlebars.compile(
    document.getElementById("list-component-template").innerHTML
  ), 
  { 
    jsAttributes: ['items'],
    transformAttributes: attributeData => {
      attributeData.items = attributeData.items.map(i => {return {item: i}});
      return attributeData;
    }
  } 
);
</script>
```

the object returned by `transformAttributes` is the `templateData`.
this data can be accessed on the created element

```javascript
document.getElementById("myList").componentry.templateData;
```

### object attributes

you may have noticed in our list example, we've been using `jsAttributes: ['items']` when we register our component.
attribute names set with `jsAttributes` are parsed as JSON when `attributeData` is generated. 
this way you can provide complex attributes like objects or arrays for your component.

### updating attributes

[try it](https://jsfiddle.net/bysm3tjq)  
components are automatically updated when the element's attributes are updated.  

### update helpers

[try it](https://jsfiddle.net/ag3pct7s)  
if you use handlebars as your template engine, you can generate callback helpers which you can use to update attributes on the component.

> **note:** update helpers require that your element have an id

```html
<script id="list-component-template" type="text/x-handlebars-template">
  <ul>
    {{#each items}}
    <li>{{this}}</li>
    {{/each}}
  </ul>
  <button onclick='{{updateItems}}(existingItems => {existingItems.push("more"); return existingItems;})'>
  more!
  </button>
</script>

<list-component id="list" items='["red", "green", "blue"]'></list-component>

<script>
componentry.register(
  'list-component', 
  Handlebars.compile(
    document.getElementById("list-component-template").innerHTML
  ), 
  { 
    jsAttributes: ['items'],
    generateUpdaters: true
  }
);
</script>
```

## styling

the most straightforward way to style our components is to add a `<style>` element to the template. 
this would also mean that the style could change with the input parameters.

if we have a more general style that we know we won't want to update, we can pass a `<style>` element when we register the component.

```javascript
let style = document.createElement('style');
style.innerText = 'li { font-family: sans-serif; }'
componentry.register(
  'list-component', 
  Handlebars.compile(
    document.getElementById("list-component-template").innerHTML
  ), 
  { 
    jsAttributes: ['items'],
    style: style
  } 
);
```

external styles can also be linked with `<link>` elements.

> **note:** external styles may cause a FUC (Flash of Unstyled Content). 
styles from `<style>` elements will not have this behavior, regardless of if they're in the template or passed in when the component is registered.

```javascript
let style = document.createElement('link');
elem.setAttribute('rel', 'stylesheet');
elem.setAttribute('href', 'style.css');
```

or for convenience

```javascript
let style = componentry.linkStyle('style.css');
```

styles will only apply to the component, not the rest of the page.