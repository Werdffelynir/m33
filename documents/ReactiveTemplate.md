
```js
// Example usage:
const tpl = new ReactiveTemplateYAML(`
div#popup:
  div.header:
    div.title
    div.close[data-action=close]: "close"
  div.content:
    div.message: "Hello {{user_name}}, status {{user_status}}"    div.center
    
      img[src=/assets/images/scanner.png][width=400][height=200]
      
    div: "user popup text"
`);
document.body.appendChild(tpl.render());
console.log(tpl.state);


// Example usage:
const tpl = new ReactiveTemplateYAML(`
ul.list:
  li.item*3: "Item $ {{item$}}"
`);
document.body.appendChild(tpl.render());
console.log(tpl.state);
```


# list multiples li
```yaml
ul.list:
  li.item*3>span.label: "Label $ {{label$}}"
```

# 
```yaml
  div:
    div:
      div:
        div:
          div: "HelloGame"

```


# 1. Простий модальний попап
```yaml
div#popup:
  div.header:
    div.title: "System Alert"
    div.close[data-action=close]: "×"
  div.content:
    div.message: "Hello {{user_name}}, system is {{status}}"
    div: "Please confirm."
  div.footer:
    button.btn.confirm[data-action=ok]: "Confirm"
    button.btn.cancel[data-action=cancel]: "Cancel"

```


# 2. Панель керування
```yaml
div.panel#main:
  h2.title: "Dashboard: {{current_module}}"
  ul.controls:
    li.control[data-id=start]: "Start Engine"
    li.control[data-id=stop]: "Stop Engine"
    li.control[data-id=status]: "Check {{system_status}}"
  div.output:
    pre: "{{debug_output}}"
```

# 5. Профіль користувача
```yaml
div.profile:
  div.avatar[style=background-image:url({{avatar_url}})]
  div.info:
    h3.name: "{{full_name}}"
    p.email: "{{email}}"
    p.status: "Status: {{status_text}}"
  div.actions:
    button.btn.edit[data-action=edit]: "Edit"
    button.btn.logout[data-action=logout]: "Logout"
```


# 4. Повідомлення в чаті
```yaml
ul.chat:
  li.message.incoming[data-user=alice]: "{{message_1}}"
  li.message.outgoing[data-user=you]: "{{message_2}}"
  li.message.incoming[data-user=bob]: "{{message_3}}"

ul.list:
  - li.item*3: "Item $ {{item$}}"
```



# 
```js
const tpl = new ReactiveTemplate({
    template: `
<div id="popup" class="bg-lightsalmon width-400px">
  <div class="header bg-firebrick uiDraggable" data-id="draggable">Dashboard: {{header}}</div>
  <div>
    <div>{{message}}</div>
    <div>Status {{status}}</div>
    <div>System {{output}}</div>
  </div>
  <div class="bottom text-right">
    <div class="button" data-id="close">close</div>
  </div>
</div>
`,
    state: {
        header: 'ReactiveTemplate',
        message: 'When the distress signal of the first settler on Titan is tripped',
        status: 'status',
        output: 'output',
    },
});
tpl.render();

UI.registerView('tpl', tpl.template)
UI.show('tpl', 700, 200);
UI.setDraggable('tpl', tpl.elements.draggable);

tpl.elements.close.addEventListener('click', () => {
    UI.hide('tpl')
})

```
# 
```js



const templateString = `
<div id="ReactiveTemplatePopup" class="bg-gray-50 color-burlywood width-400px">
    <div class="header table">
        <span>{{header}}</span>
        <span onclick="@close" class="text-right width-30px">X</span>
    </div>
    <div class="message">{{message}}</div>
</div>
`;

const tpl = new ReactiveTemplate({
    template: templateString,
    state: {
        header: 'HelloGame ReactiveTemplate',
        message: null,
        close: (o, e) => {
            UI.hide('ReactiveTemplatePopup')
        },
    }
});

tpl.render();

tpl.state.message = 'JOPER'

tpl.template

tpl.elements


UI.registerView('ReactiveTemplatePopup', tpl.template);

UI.show('ReactiveTemplatePopup', 200, 200);

tpl.subscribe('message', (_value, _prev) => {
    // ...
})


```