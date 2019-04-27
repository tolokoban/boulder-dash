export default {
    /**
     * @param {string|React.ReactElement<any>} message
     * @param {()=>void|null} onClose
     */
    alert,
    show
};

import * as React from "react"
import ReactDOM from 'react-dom'
import Icon from "../view/icon"
import EscapeHandler from "../escape-handler"
import castString from "../converter/string"
import castBoolean from "../converter/boolean"
import "./dialog.css"

import Button from "../view/button"

import Intl from "../intl";
const _ = Intl.make(require("./dialog.yaml"));

interface IOptions {
    onClose?: () => void;
    closeOnEscape?: boolean;
    icon?: string;
    title?: string;
    content?: React.ReactElement<any>;
    footer?: React.ReactElement<any>[] | React.ReactElement<any>;
}

class Dialog {
    _screen: HTMLElement;
    _options: IOptions;
    footer: React.ReactElement<any>[] | React.ReactElement<any> | null = null;

    constructor(options: IOptions = {}) {
        this._options = Object.assign({
            closeOnEscape: true,
            footer: <Button
                icon="close"
                label={_('close')}
                flat={true}
                onClick={() => this.hide()} />
        }, options);
        this._options.closeOnEscape = castBoolean(this._options.closeOnEscape, true);
        this.footer = this._options.footer;
        const screen = document.createElement("div");
        screen.className = "tfw-factory-dialog";
        document.body.appendChild(screen);
        this._screen = screen;
        this.hide = this.hide.bind(this);
        if (this._options.closeOnEscape) {
            EscapeHandler.add(() => this._hide());
        }
    }

    show() {
        const opt = this._options;
        const title = castString(opt.title, "").trim();
        const icon = castString(opt.icon, "").trim();
        let footer: React.ReactElement<any> | null =
            this.footer ? (<footer className="thm-bg1" >{this.footer}</footer>) : null;
        let header = null;
        if (title.length > 0) {
            header = (<header className="thm-bgPD">
                {icon.length > 0 ? <Icon content={icon} /> : null}
                <div>{title}</div>
            </header>)
        }

        ReactDOM.render((
            <div className="thm-ele-dialog thm-bg2" >
                {header}
                <div>{opt.content}</div>
                {footer}
            </div>
        ), this._screen);
        setTimeout(() => this._screen.classList.add("show"), 10);
    }

    hide() {
        EscapeHandler.fire();
    }

    _hide() {
        const screen = this._screen;
        screen.classList.remove("show");
        setTimeout(() => {
            document.body.removeChild(screen);
        }, 200);
        const onClose = this._options.onClose;
        if (typeof onClose === 'function') {
            requestAnimationFrame(onClose);
        }
    }
}

function alert(content: string | React.ReactElement<any>, onClose: () => void | null = null): Dialog {
    const dialog = new Dialog({ onClose, content });
    dialog.footer = (<Button
        icon="close"
        label={_('close')}
        flat={true}
        onClick={dialog.hide} />);
    dialog.show();
    return dialog;
}

function show(options: IOptions): Dialog {
    const dialog = new Dialog(options);
    dialog.show();
    return dialog;
}
