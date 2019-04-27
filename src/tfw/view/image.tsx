import React from "react"
import castStringArray from "../converter/string-array"
import "./image.css"

interface IImageProps {
    src: string;
}

export default class Pack extends React.Component<IImageProps, {}> {
    private ref = React.createRef();

    componentDidUpdate() {
        const div = this.ref.current;
        if (!div) return;

        const img = new Image();
        img.onload = () => {
            div.classList.add("show");
        }
        img.onerror = () => {
        }
        img.src = this.props.src;
    }

    render() {
        const p = this.props;
        const classes = castStringArray(p.classes, []);
        classes.push("tfw-view-image");

        return (<div ref={this.ref}
            style={{ backgroundImage: `url(${p.src})` }}
            className={classes.join(" ")} />);
    }
}
