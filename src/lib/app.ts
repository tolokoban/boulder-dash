import LevelLogic from "./level-logic"

import Gamepad from "./lib/gamepad"


export default function(assets) {
    const canvas = document.getElementById("canvas");
    const gl = canvas.getContext("webgl");
    const env = LevelLogic.createEnv(gl, assets);
    console.info("env=", env);
}
