# Auto mate web component

This is an experiment to help automate form filling.  
You can specify an selector for a form and this component will fill that form.  
If it can't find the form it will wait for it to be present.

## Usage

Just import the init script on a page and it will take care of the rest.

### Local

```html
<script src="./init.js" type="module"></script>
```

### From CDN

#### Latest version

```html
<script src="https://cdn.jsdelivr.net/gh/overtune/auto-mate@latest/src/init.js" type="module"></script>
```

#### Fixed version

```html
<script src="https://cdn.jsdelivr.net/gh/overtune/auto-mate@v1.5.0/src/init.js" type="module"></script>
```

### Inject to site

You can inject the script on any website by using the console in the browser devtools.  
Paste and runt the following code:
```js 
const scriptEl = document.createElement('script');
scriptEl.src = "https://cdn.jsdelivr.net/gh/overtune/auto-mate@v1.5.0/src/init.js";
scriptEl.type = "module";
document.body.appendChild(scriptEl);
```
