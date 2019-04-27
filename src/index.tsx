import "./index.css"
import WebGL from "./lib/webgl"
import Assets from "./assets"

console.info("Assets=", Assets);
WebGL.fetchAssets(Assets).then(start);


function start(assets) {
    import("./lib/app").then(app => app(assets));
}
