import Level from "./level"
import Levels from "./levels"
import HighScore from "./high-score"
import Transition from "./transition"
import GameInputs from "./game-inputs"
import LevelLogic from "./level-logic"
import RainPainter from "./rain-painter"
import WallPainter from "./wall-painter"
import LevelPainter from "./level-painter"
import BackgroundPainter from "./background-painter"
import TextureAggregator from "./texture-aggregator"

import { IAssets, IEnvironment } from "../types"

import Gamepad from "./gamepad"


function go(assets: IAssets) {
    const divName: HTMLInputElement = getById("name") as HTMLInputElement;
    const divNewScore: HTMLElement = getById("new-score");
    const divCongrat: HTMLElement = getById("congrat");
    const divWelcome: HTMLElement = getById("welcome");
    const divBonus: HTMLElement = getById("bonus");
    const canvas: HTMLCanvasElement = getById("canvas") as HTMLCanvasElement;
    const gl = canvas.getContext("webgl");
    if (!gl) return;
    const env: IEnvironment = LevelLogic.createEnv(gl, assets);
    console.info("env=", env);

    initLevel(env, parseInt(location.search.substr(1)));

    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);
    gl.clearDepth(0);
    gl.depthFunc(gl.GREATER);

    var rainPainter = new RainPainter(env);
    var transition = new Transition(gl, assets);
    var highscore = new HighScore();

    env.demoMode = true;
    refreshHighScores(highscore);
    var onStart = function() {
        hideHighScores();
        transition.start(function() {
            env.demoMode = false;
            initLevel(env, parseInt(location.search.substr(1)));
        }, 1000);
    };

    onClick("btnStart", onStart);
    onClick("btnOk", function() {
        var name = divName.value.trim();
        if (name.length === 0) {
            divName.focus();
            return;
        }
        var newScore = parseInt(divNewScore.textContent);
        highscore.addScore(name, newScore);
        divCongrat.className = "hide";
        refreshHighScores(highscore);
        env.demoMode = true;
    });

    function anim(time) {
        window.requestAnimationFrame(anim);

        var action = GameInputs.action;
        if (env.demoMode) {
            if (action === GameInputs.START) {
                if (divCongrat.className != "hide") {
                    onStart();
                }
                else if (divWelcome.className != "hide") {
                    onStart();
                }
            }
            action = GameInputs.STILL;
        }

        env.time = time;
        var width = canvas.clientWidth;
        var height = canvas.clientHeight;
        canvas.setAttribute("width", width);
        canvas.setAttribute("height", height);
        env.width = width;
        env.height = height;
        env.w = Math.min(width, height) < 481 ? 2 : 1;
        gl.viewport(0, 0, width, height);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        transition.draw(time, width, height);

        if (env.demoMode) {
            // Animation d'attente pendant l'affichage des HighScores.
            rainPainter.draw(env);
        }
        else {
            //#(synchro)
            // A la synchro, on fait les calculs de mouvements.
            if (env.nextSynchro < 0) {
                env.nextSynchro = Math.ceil(time / env.cellTime) * env.cellTime;
            }
            else if (time >= env.nextSynchro) {
                env.nextSynchro = Math.ceil(time / env.cellTime) * env.cellTime;

                LevelLogic.apply(env);
                LevelLogic.process(env, action);
                env.levelPainter.update();

                env.bonus--;
                if (env.bonus === 0) env.killHero();
                divBonus.textContent = env.bonus;

                if (env.wait > -1) {
                    env.wait--;
                    if (env.wait <= 0) {
                        if (env.isLevelDone) {
                            transition.start(function() {
                                env.score += env.bonus;
                                initLevel(env, env.levelNumber + 1);
                            }, 1200);
                        } else {
                            env.life--;
                            if (env.life <= 0) {
                                addNewScore(highscore, env.score);
                                env.levelNumber = 0;
                                env.demoMode = true;
                            } else {
                                initLevel(env, env.levelNumber);
                            }
                        }
                        env.wait = -1;
                    }
                }
            }
            //#(synchro)

            //#(camera)
            // Positionner la caméra sur le héro.
            // Sauf si le cadrage arrive hors tableau.
            var t = (time % env.cellTime) / env.cellTime;
            if (env.level.cols * 64 / env.w < width) {
                env.x = env.level.cols / 2;
            } else {
                env.x = Math.min(
                    Math.max(
                        env.camX + t * env.camVX,
                        width * env.w * .5 / 64
                    ),
                    env.level.cols - 1 - width * env.w * .5 / 64
                );
            }
            if (env.level.rows * 64 / env.w < height) {
                env.y = env.level.rows / 2;
            } else {
                env.y = Math.min(
                    Math.max(
                        env.camY + t * env.camVY,
                        height * env.w * .5 / 64
                    ),
                    env.level.rows - 1 - height * env.w * .5 / 64
                );
            }
            //#(camera)

            // On affiche tout.
            env.levelPainter.draw(env);
            env.z = 0.2;
            env.wallPainter.draw(env);
            env.z = 0;
            env.backgroundPainter.draw(env);
        }
    }
    window.requestAnimationFrame(anim);
}


function initLevel(env, levelNumber) {
    if (typeof levelNumber !== 'number' || isNaN(levelNumber)) levelNumber = 0;
    if (levelNumber === 0) {
        env.life = 3;
        env.score = 0;
    }
    levelNumber %= Levels.length;
    if (env.backgroundPainter) env.backgroundPainter.destroy();
    if (env.wallPainter) env.wallPainter.destroy();
    if (env.levelPainter) env.levelPainter.destroy();

    var level = new Level(Levels[levelNumber]);
    console.info("[script] level.tint=", level.tint);
    env.assets.levelTexture = TextureAggregator(env.assets, level.tint);

    env.level = level;
    env.camX = level.cols / 2;
    env.camY = level.rows / 2;
    env.camVX = 0;
    env.camVY = 0;
    env.eatenDiams = 0;
    env.nextSynchro = -1;
    env.isHeroAlive = true;
    env.isLevelDone = false;
    env.bonus = level.cols * level.rows * 4;
    env.wait = -1;
    env.levelNumber = levelNumber;

    env.assets.musicSound.pause();
    env.assets.musicSound.currentTime = 0;
    env.assets.musicSound.play();

    var tinter = new TextureAggregator.Tinter(env.assets.hueVert, env.assets.hueFrag);
    var backgroundTexture = env.assets.backgroundTexture;
    env.backgroundPainter = new BackgroundPainter(env, tinter.shiftHue(backgroundTexture, level.tint.void));
    var wallTexture = env.assets.wallTexture;
    env.wallPainter = new WallPainter(env, tinter.shiftHue(wallTexture, level.tint.wall));
    env.levelPainter = new LevelPainter(env);

    document.getElementById("diam").textContent = level.need;
    document.getElementById("life").textContent = env.life;
    document.getElementById("score").textContent = env.score;
    document.getElementById("bonus").textContent = env.bonus;

    return level;
}


function addNewScore(highscore, score) {
    if (highscore.isAnHighScore(score)) {
        var divCongrat = divCongrat;
        divCongrat.className = "";
        divNewScore.textContent = "" + score;
        divName.focus();
    } else {
        refreshHighScores(highscore);
    }
}


function refreshHighScores(highscore) {
    var div = document.getElementById("highscores");
    div.innerHTML = "";
    var scores = highscore.getScores();
    scores.forEach(function(item, pos) {
        var name = item[0];
        var score = item[1];
        var row = document.createElement("div");
        div.appendChild(row);
        if (pos == highscore.getLastHighScoreIndex()) {
            row.className = "highlighted";
        }
        var cell1 = document.createElement("div");
        cell1.textContent = name;
        var cell2 = document.createElement("div");
        cell2.textContent = score;
        row.appendChild(cell1);
        row.appendChild(cell2);
    });
    showHighScores();
}


function showHighScores() {
    const elem = document.getElementById("welcome");
    if (elem) elem.className = "";
}


function hideHighScores() {
    const elem = document.getElementById("welcome");
    if (elem) elem.className = "hide";
}


function onClick(id: string, handler: () => void) {
    const element = document.getElementById(id);
    if (!element) {
        throw Error(`No element found with id="${id}"!`);
    }
    element.addEventListener("click", handler);
}


function getById(id: string): HTMLElement {
    const elem = document.getElementById(id);
    if (!elem) {
        throw Error(`Unable to find element with id="${id}"!`);
    }
    return elem;
}

export default { go };
