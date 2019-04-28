import "./index.css"

import React from "react";
import ReactDOM from 'react-dom'
import WebGL from "./lib/webgl"
import Assets from "./assets"
import { IAssets } from "./types"

import Importer from "./lib/importer"

Importer
    .parseUrl("preview/C3L1.png")
    .then(msg => console.log(msg))
    .catch(err => console.error(err));



//WebGL.fetchAssets(Assets).then(start);

function start(assets: IAssets) {
    document.body.removeChild(document.getElementById("splash"));
    ReactDOM.render((
        <React.Fragment>
            <canvas id="canvas"></canvas>
            <header>
                <div>Life x <b id='life'>3</b></div>
                <div><b id='score'>0</b></div>
                <div id='bonus'>0</div>
                <div><b id='diam'>12</b> x <img src="diam.gif" /></div>
            </header>
            <div id="welcome">
                <div className="tbl" id="highscores">
                </div>
                <center><button id="btnStart">START</button></center>
            </div>
            <div id="congrat" className="hide">
                <div><span id="new-score"></span><span> points</span></div>
                <input id="name" maxLength="9" size="8" defaultValue="" />
                <button id="btnOk">OK</button>
            </div>
        </React.Fragment>
    ), document.getElementById("root"));

    import("./lib/app").then(app => {
        try {
            console.log("app=", app);
            app.default.go(assets);
        }
        catch (ex) {
            console.error(ex);
        }
    });
}
