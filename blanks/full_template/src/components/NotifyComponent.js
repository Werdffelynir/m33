import {ReaComponent} from "../../engine/ReaComponent.js";
import {Ut} from "../../engine/Ut.js";


const CSS = `
@import url('./../../engine/uii/themedarkblue.css') layer(themedarkblue);

@layer theater {

    #NotifyComponent{
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    @scope (#NotifyComponent) {
        --bgWrapper: rgba(0,0,0,0.25);
        
        .NotifyComponentBg {
            width: 100%;
            height: 100%;
            background-color: var(--bgWrapper);
            position: absolute;
        }
        .NotifyComponentWin{
            width: 600px;
            position: absolute;
            left: calc(50% - 300px);
            top: 20%;
            background-color: var(--basicBorderColor);
            color: var(--inputTextColor);
        }
        .NotifyComponentWin .head{
            background-color: var(--basicBackgroundColor);
            color: var(--basicTextColor);
            padding: 5px;
        
        }
        .NotifyComponentContent{
            min-height: 100px;
        }
        .UIIButton {
            background-color: var(--buttonBackgroundColor);
            color: var(--buttonTextColor);
        }
        .UIIButton:hover {
            background-color: var(--buttonTextColor);
            color: var(--buttonBackgroundColor);
        }
        .subNotifyMessage{
            z-index: 666;
            position: fixed;
            left: 1px;
            bottom: 1px;
            background: var(--cc13);
            padding: 1px 5px;
            box-shadow: 0 0 50px -20px var(--cc15);
            transition: all 1s ease-in-out;
            user-select: none;
            font-size: 90%;
         }
    }
    
    
}




`;

const TemplateString = `
div.themeDesktop
  div.subNotifyMessage.hide[data-id=notifyElement]: "{{notifyMessage}}"
  div.NotifyComponentBg[data-id=bgElement]
  div.UIIDesktop.NotifyComponentWin[data-id=winElement]
    div
      div.line.head[data-id=draggable]: "{{title}}"
      div.NotifyComponentContent
        div.pad10: "{{message}}"
      
      div.pad10.fx-end-center
        div[data-id=message_actions]
          div.UIIButton[data-id=close]: "Close"
        div.hide.fx-center-center[data-id=alert_actions]
          div.UIIButton[data-id=ok]: "Ok"
          div.UIIButton[data-id=cancel]: "Cancel"
`;

/**
 * ```
 * NotifyComponent.notify( message, title )
 * NotifyComponent.message( message, title )
 * NotifyComponent.alert(cb, message, title )
 *
 * ```
 */
export class NotifyComponent extends ReaComponent {

    constructor(register) {
        super(register, {
            parent: register.rootUIElement || document.body,
        });
        this.name = 'NotifyComponent';

        /** @type {UIManager} */
        this.uiman = register.uiman;
        this.autoCloseDelay = 3000;
    }

    setup() {
        this.uiman.registerView(this.name, this.root);

        this._bindEvents()
        this._lastInstanceTimeout = null;
    }

    _bindEvents() {
        this._click = () => this.hide();
        this._cancel = () => {}
        this._ok = () => {}

        this.elements.close.addEventListener('click', (e) => this._click(e))
        this.elements.cancel.addEventListener('click', (e) => this._cancel(e))
        this.elements.ok.addEventListener('click', (e) => this._ok(e))
    }

    async create() {
        await super.create({
            template: TemplateString,
            css: CSS,
            state: {title: '', message: '', notifyMessage: ''},
        });
    }

    notify(message) {
        const elem = this.elements['notifyElement'];
        const bg = this.elements['bgElement'];
        const win = this.elements['winElement'];

        elem.textContent = String(message)
        elem.classList.remove('hide');
        bg.classList.add('hide');
        win.classList.add('hide');

        this.uiman.show(this.name);

        const delay = Ut.delay(t=>{

            elem.textContent = ''
            elem.classList.add('hide');
            bg.classList.remove('hide');
            win.classList.remove('hide');
            this.uiman.hide(this.name);

        }, this.autoCloseDelay)
        this.notifydelay = delay();
    }

    alert(cb, message, title = null) {
        if (typeof cb !== "function") return console.warn(`First parameter is not callable. type: ` + typeof cb );

        clearTimeout(this._lastInstanceTimeout);
        this.winActions('alert')
        this._cancel = () => {
            const res = cb(false, ()=>this.hide());
            this.hide();
        }
        this._ok = () => {
            const res = cb(true, ()=>this.hide());
            if (res === true) {
                this.hide();
            }
        }
        this.win(message, title);
        document.body.style.overflow = 'hidden';
    }
    message(message, title = null) {
        clearTimeout(this._lastInstanceTimeout);
        this.winActions('message')
        this.win(message, title);
        if (this.autoCloseDelay && this.autoCloseDelay > 500) {
            const delay = Ut.delay(t=>this._click(), this.autoCloseDelay)
            this._lastInstanceTimeout = delay()
        }
    }

    show() {
        this.uiman.show(this.name);
        this.uiman.setPosition(this.name, 0, window.scrollY || 0);
        this.uiman.eventBus?.publish(`notification:showed`);
    }

    hide() {
        this.uiman.hide(this.name);
        this.uiman.eventBus?.publish(`notification:hidden`);
        document.body.style.overflow = 'auto';
    }

    winActions(type = 'message') {
        const elAction = this.elements['alert_actions'];
        const elMessage = this.elements['message_actions'];
        switch (type) {
            case "alert":
                elAction.classList.remove('hide')
                elMessage.classList.add('hide')

                this.root.classList.remove('message')
                this.root.classList.add('alert')
                break;
            case "message":
                elAction.classList.add('hide')
                elMessage.classList.remove('hide')

                this.root.classList.remove('alert')
                this.root.classList.add('message')
                break;
        }
    }
    win(message, title = null) {
        this.state.message = message;

        if (title)
            this.state.title = title;

        this.show();
    }

}

