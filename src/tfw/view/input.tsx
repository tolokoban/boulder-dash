import * as React from "react"
import "../theme.css"
import "./input.css"
import castInteger from "../converter/integer"
import castBoolean from "../converter/boolean"
import castString from "../converter/string"
import Debouncer from "../debouncer"

import Intl from "../intl"
const _ = Intl.make(require("./input.yaml"));

interface IStringSlot {
    (value: string): void;
}

interface IInputProps {
    label?: string;
    value?: string;
    wide?: boolean;
    delay?: number;
    size?: number;
    focus?: boolean;
    type?: "text" | "password" | "submit" | "color" | "date"
    | "datetime-local" | "email" | "month" | "number" | "range"
    | "search" | "tel" | "time" | "url" | "week";
    validator?: (value: string) => any;
    onChange?: IStringSlot
}

interface IInputState {
    error?: string;
}

export default class Input extends React.Component<IInputProps, IInputState> {
    private timerId: number;
    readonly input: React.RefObject<HTMLInputElement>;
    value: string = "";

    constructor(props: IInputProps) {
        super(props);
        this.state = {};
        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.onChange = this.onChange.bind(this);
        this.timerId = 0;
        this.input = React.createRef();
        this.setFocus = Debouncer(this.setFocus.bind(this), 100);
    }

    setFocus() {
        const input = this.input ? this.input.current : null;
        if (!input) return;
        const focus = castBoolean(this.props.focus, false);
        if (focus) {
            console.log("focus =", input);
            input.focus();
        }
    }

    onFocus(event: React.FocusEvent<HTMLInputElement>): void {
        const input = this.input ? this.input.current : null;
        if (!input) return;
        if (!input.classList) return;
        input.classList.remove("thm-bg3");
        input.classList.add("thm-bgSL");
        if (this.props.type !== 'number') {
            // setSelectionRange fails for "number" input.
            input.setSelectionRange(0, input.value.length);
        }
    }

    onBlur(event: React.FocusEvent<HTMLInputElement>): void {
        const input = this.input ? this.input.current : null;
        if (!input) return;
        if (!input.classList) return;
        input.classList.add("thm-bg3");
        input.classList.remove("thm-bgSL");
    }

    onChange(event: React.ChangeEvent<HTMLInputElement>): void {
        if (!this.checkValidity(event.target.value)) return;

        const
            p = this.props,
            slot = p.onChange,
            delay = castInteger(p.delay, 300);

        event.preventDefault();
        this.value = event.target.value;

        if (typeof slot === 'function') {
            if (this.timerId !== 0) window.clearTimeout(this.timerId);
            this.timerId = window.setTimeout(() => {
                const value = this.value;
                if (this.props.type === 'number') {
                    const num = parseFloat(value);
                    console.log("This is a number:", num, typeof num);
                    slot(num)
                } else {
                    slot(value)
                }
            }, delay);
        }
    }

    checkValidity(value: string) {
        let validator = this.props.validator;
        this.setState({ error: null });
        if (typeof validator !== 'function') {
            if (this.props.type !== 'number') return true;
            validator = NUMBER_VALIDATOR;
        }
        console.log("validator =", validator);

        try {
            const result = validator(value);
            console.log("result =", result);

            if (result === true) return true;
            if (typeof result === "string") {
                this.setState({ error: result });
            }
        } catch (ex) {
            console.error(`<Input> Unable to validate "${value}"!`, ex);
        }
        return false;
    }

    componentDidMount() {
        console.log("MOUNT");
        this.setFocus();
    }

    componentDidUpdate(oldProps: IInputProps) {
        console.log("UPDATE");
        const
            newProps = this.props,
            input = this.input ? this.input.current : null;

        //if (input) input.value = castString(newProps.value, "");
        if (castBoolean(this.props.focus, false)) {
            this.setFocus();
        }
    }

    render() {
        const
            p = this.props,
            type = castString(p.type, "text"),
            label = castString(p.label, ""),
            value = castString(p.value, ""),
            wide = castBoolean(p.wide, false),
            size = Math.max(1, castInteger(p.size, 8)),
            error = this.state.error,
            id = nextId();
        const classes = ["tfw-view-input", "thm-ele-button"];
        if (wide) classes.push("wide");
        const header = (error ? <div className="thm-bgSD error">{error}</div> :
            (label ? (<label htmlFor={id} className="thm-bgPD">{label}</label>) : null));
        return (<div className={classes.join(" ")} >
            {header}
            <input
                ref={this.input}
                className="thm-bg3"
                type={type}
                id={id}
                size={size}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                onChange={this.onChange}
                defaultValue={value} />
        </div>);
    }
}


let globalId = 0;
function nextId() {
    return `tfw-view-input-${globalId++}`;
}


const NUMBER_VALIDATOR = (value: string) => isNaN(parseFloat(value)) ? _('nan') : true;
