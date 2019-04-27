export default { createEnv, apply, process };

function isRockOrDiam(level, col, row) {
    var cell = level.getType(col, row);
    return cell === Level.ROCK || cell === Level.DIAM;
}

function isRockOrDiamOrWall(level, col, row) {
    var cell = level.getType(col, row);
    return cell === Level.ROCK || cell === Level.DIAM || cell === Level.WALL;
}

function prepareMove(col, row, vx, vy, env) {
    if (vx === 0 && vy === 0) return;
    var level = env.level;
    var src = level.getType(col, row);
    var dst = level.getType(col + vx, row + vy);
    if (dst === Level.HERO) env.killHero();
    else {
        level.setMove(col, row, vx, vy);
        level.setType(col + vx, row + vy, -src);
    }
};

function processFallingRockOrDiam(level, col, row, env, below) {
    // La pierre est déjà en train de tomber.
    // On regarde s'il y a autre chose que du vide dessous. Si c'est
    // le cas, la chute est stoppée,  mais il peut aussi y avoir des
    // conséquences sur l'élément qui se trouvait en dessous.
    if (below !== Level.VOID) {
        // On arrête la chute dans tous les cas.
        level.setVY(col, row, 0);
        if (below == Level.ROCK || below == Level.WALL || below == Level.DUST) {
            // Le rocher  (ou diamant)  a été  stoppé :  on joue  un son
            // adéquat.
            env.playBoom();
        }
        else if (below == Level.HERO) {
            // On tombe sur le héro : ça le tue.
            env.killHero();
        }
        else if (below == Level.MONS) {
            // On écrase un monstre.
            level.setType(col, row, Level.VOID);
            env.explode(col, row + 1, true);
        }
        else if (below == Level.DIAM) {
            // Si c'est une pierre qui tombe sur un diamant, il explose.
            if (level.getType(col, row) === Level.ROCK) {
                level.setType(col, row, Level.VOID);
                env.explode(col, row + 1);
            }
        }
    } else {
        level.setType(col, row + 1, Level.BOOM);
    }
}

function processSteadyRockOrDiam(level, col, row, env, below) {
    // La pierre est au repos.
    if (below === Level.VOID) {
        level.setMove(col, row, 0, 1);
        level.setType(col, row + 1, Level.BOOM);
    }
    else if (isRockOrDiamOrWall(level, col, row + 1)) {
        if (!isRockOrDiam(level, col, row - 1)) {
            // Si un rocher est posé sur un autre  et qu'il n'est pas sous un rocher/diamant, alors il
            // peut basculer à droite ou à gauche si l'espace est libre.
            if (level.getType(col + 1, row) == Level.VOID
                && level.getType(col + 1, row + 1) == Level.VOID
                && !isRockOrDiam(level, col + 1, row - 1)) {
                // On tombe sur la droite.
                level.setMove(col, row, +1, 0);
            }
            else if (level.getType(col - 1, row) == Level.VOID
                && level.getType(col - 1, row + 1) == Level.VOID
                && !isRockOrDiam(level, col - 1, row - 1)) {
                // On tombe sur la gauche seulement s'il n'y a pas déjà un
                // rocher qui tombe sur la droite juste en face.
                if (col < 2 || !isRockOrDiam(level, col - 2, row) || level.getVX(col - 2, row) < 1) {
                    level.setMove(col, row, -1, 0);
                }
            }
        }
    }
}

function processRockOrDiam(level, col, row, env) {
    level.setVX(col, row, 0); // On arrête tout déplacement horizontal.

    var below = level.getType(col, row + 1);
    var falling = level.getVY(col, row) != 0;
    if (falling) {
        processFallingRockOrDiam(level, col, row, env, below);
    } else {
        processSteadyRockOrDiam(level, col, row, env, below);
    }
}

function processExplosion1(env, level, col, row) {
    // Une explosion a une durée de vie de 2 cycles.
    if (level.getIndex(col, row) > 0) {
        // Encore un cycle...
        level.setIndex(col, row, level.getIndex(col, row) - 1);
    } else {
        // C'est terminé pour l'explosion.
        level.setType(col, row, Level.VOID);
    }
}

function processExplosion2(env, level, col, row) {
    // Une explosion a une durée de vie de 2 cycles.
    if (level.getIndex(col, row) > 0) {
        // Encore un cycle...
        level.setIndex(col, row, level.getIndex(col, row) - 1);
    } else {
        // C'est terminé pour l'explosion.
        level.setType(col, row, Level.DIAM);
        level.setIndex(col, row, Math.floor(Math.random() * 16));
    }
}

// Directions du monstre en fonction de attIndex.
// Il essaie  d'aller dans sa  direction et si c'est  impossible, il
// essaie sur sa droite et ainsi de suite...
const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
function processMonster(env, level, col, row) {
    var dir = level.getIndex(col, row);
    var d, k;
    var vx, vy, v;
    var target;
    for (k = 5; k > 1; k--) {
        d = (dir + k) % 4;
        v = dirs[d];
        vx = v[0];
        vy = v[1];
        target = level.getType(col + vx, row + vy);
        switch (target) {
            case Level.VOID:
                prepareMove(col, row, vx, vy, env);
                level.setIndex(col, row, d);
                return;
            case Level.HERO:
                env.killHero();
                return;
            case Level.ROCK:
            case Level.DIAM:
                if (d == 0) {
                    // Si on  monte vers  une pierre,  c'est qu'elle  nous fonce
                    // dessus.
                    env.explode(col, row, true);
                    return;
                }
                break;
            case Level.BOOM:
                env.explode(col, row, true);
                return;
        }
    }
    level.setMove(col, row, 0, 0);
}

function processHero(env, level, col, row, heroMoves, action) {
    // Si le héro est mort, on ne fait rien du tout.
    if (!env.isHeroAlive) {
        env.camX = 0;
        env.camY = 0;
        return;
    }

    var move = true;

    var vx = 0;
    var vy = 0;

    switch (action) {
        case GameInputs.UP:
            vx = 0;
            vy = -1;
            break;
        case GameInputs.RIGHT:
            vx = 1;
            vy = 0;
            level.setIndex(col, row, 0);
            break;
        case GameInputs.DOWN:
            vx = 0;
            vy = 1;
            break;
        case GameInputs.LEFT:
            vx = -1;
            vy = 0;
            level.setIndex(col, row, 1);
            break;
        case GameInputs.SUICIDE:
            env.killHero();
            move = false;
            break;
        default:
            move = false;
            break;
    }

    if (move) {
        var nextX = col + vx;
        var nextY = row + vy;
        var cell = level.getType(nextX, nextY);
        if (cell === Level.WALL || cell === Level.HERO) {
            // Les murs arrêtent le déplacement. Les clones aussi.
            env.camX = col;
            env.camY = row;
            env.camVX = 0;
            env.camVY = 0;
            return;
        }

        if (cell === Level.ROCK) {
            // Les rochers aussi, mais ils  peuvent être poussés s'ils ont
            // un espace vide derrière eux.
            if (vx === +1 && level.getType(nextX + 1, nextY) === Level.VOID) {
                level.setVX(nextX, nextY, +1);
                level.flag(nextX, nextY);
            }
            else if (vx === -1 && level.getType(nextX - 1, nextY) === Level.VOID) {
                level.setVX(nextX, nextY, -1);
            }
            // Le héro s'arrête net parce que le rocher est lourd.
            level.setMove(col, row, 0, 0);
            vx = vy = 0;
        }
        else {
            heroMoves.push([col, row]);
            level.flag(nextX, nextY);
            level.setMove(col, row, vx, vy);
        }
    }
    env.camX = col;
    env.camY = row;
    env.camVX = vx;
    env.camVY = vy;
}



// Déterminer les déplacements futurs.
function process(env, action) {
    // Chaque héro peut manger de la terres (feuilles), mais il faut
    // la retirer dans  un deuxième temps pour éviter  des effets de
    // bord sur la chute de pierres vers la gauche.
    // En effet, si on a une pile de pierre à deux cases à droite du
    // héro et  que ce dernier  creuse juste à droite,  la prochaine
    // case analysée sera celle de la pierre et on verra qu'il n'y a
    // plus rien  à gauche, alors  qu'en réalité, c'est le  héro qui
    // est censé prendre cette place.
    // Le résultat  sera que  la pierre  et le  héro auront  la même
    // cellule comme destination.
    // `heroMoves` contient les coordonnées du héro.
    var heroMoves = [];

    var level = env.level;
    var row, col, cell;
    for (row = 0; row < level.rows; row++) {
        for (col = 0; col < level.cols; col++) {
            if (level.hasFlag(col, row)) {
                level.unflag(col, row);
                continue;
            }

            cell = level.getType(col, row);
            if (cell === Level.ROCK || cell === Level.DIAM) {
                processRockOrDiam(level, col, row, env);
            }
            else if (level.getType(col, row) === Level.HERO) {
                processHero(env, level, col, row, heroMoves, action);
            }
            else if (cell === Level.MONS) {
                processMonster(env, level, col, row);
            }
            else if (cell === Level.EXP1) {
                processExplosion1(env, level, col, row);
            }
            else if (cell === Level.EXP2) {
                processExplosion2(env, level, col, row);
            }
        }
    }
    heroMoves.forEach(function(move) {
        var col = move[0];
        var row = move[1];
        var vx = level.getVX(col, row);
        var vy = level.getVY(col, row);
        col += vx;
        row += vy;
        var cell = level.getType(col, row);
        if (cell === Level.DUST) {
            level.setType(col, row, Level.VOID);
        }
        else if (cell === Level.DIAM) {
            env.eatDiam();
            level.setType(col, row, Level.VOID);
        }
        else if (cell === Level.EXIT) env.nextLevel();
        else if (cell !== Level.VOID) env.killHero();
    });

}

// Appliquer les déplacements de chaque cellule.
function apply(env) {
    var level = env.level;
    var row, col;
    var isHeroAlive = false;
    for (row = 0; row < level.rows; row++) {
        for (col = 0; col < level.cols; col++) {
            if (level.getType(col, row) === Level.HERO) isHeroAlive = true;
            if (level.hasFlag(col, row)) {
                // Cellule avec un flag : il ne faut pas la traiter.
                level.unflag(col, row);
                continue;
            }
            var vx = level.getVX(col, row);
            var vy = level.getVY(col, row);
            if (vx != 0 || vy != 0) {
                level.move(col, row, col + vx, row + vy);
                if (vx > 0 || vy > 0) {
                    // On  flag une  cellule  si  elle est  à  droite ou  en
                    // dessous de  la cellule courante.  Cela  évitera de la
                    // prendre  en compte  une  deuxième fois  dans le  même
                    // cycle.
                    level.flag(col + vx, row + vy);
                }
            }
        }
    }
    if (!isHeroAlive) env.killHero();
}

function createEnv(gl, assets) {
    return {
        gl: gl,
        assets: assets,
        x: 0, y: 0, z: 0, w: 1,
        cellTime: 180,  // Temps en ms pour traverser une cellule.
        nextSynchro: -1,
        levelNumber: 0,
        score: 0,
        bonus: 0,
        divDiam: document.getElementById("diam"),
        divScore: document.getElementById("score"),
        //#(eatDiam)
        eatenDiams: 0,
        eatDiam: function() {
            // Les assets finissant par 'ogg', 'mp3' ou 'wav'
            // sont transpformés en tag AUDIO.
            assets.diamSound.pause();
            // Il n'existe pas de méthode `stop()`.
            // On doit donc faire une pause, puis
            // remettre le curseur au début de la piste.
            assets.diamSound.currentTime = 0;
            assets.diamSound.play();
            this.eatenDiams++;
            console.log(this.eatenDiams, "/", this.level.need);
            if (this.eatenDiams == this.level.need) {
                this.level.setType(this.level.exitX, this.level.exitY, Level.EXIT);
                assets.exitSound.play();
            }
            this.score += 50;
            if (this.divDiam) {
                this.divDiam.textContent = Math.max(0, this.level.need - this.eatenDiams);
                this.divScore.textContent = this.score;
            }
        },
        //#(eatDiam)
        // Bruit du rocher dont la chute est stoppée par un obstacle.
        playBoom: function() {
            assets.rockSound.pause();
            assets.rockSound.currentTime = 0;
            assets.rockSound.play();
        },
        explode: function(col, row, makeDiams) {
            var level = this.level;
            var x, y;
            this.makeDiams = makeDiams;
            for (y = row - 1; y < row + 2; y++) {
                for (x = col - 1; x < col + 2; x++) {
                    if (level.getType(x, y) !== Level.WALL && level.getType(x, y) !== Level.EXIT) {
                        level.setType(x, y, makeDiams ? Level.EXP2 : Level.EXP1);
                        level.setIndex(x, y, 1);
                        level.setMove(x, y, 0, 0);
                    }
                }
            }
            assets.explSound.pause();
            assets.explSound.currentTime = 0;
            assets.explSound.play();
        },
        // Vie te mort du Héro.
        isHeroAlive: true,
        killHero: function() {
            if (!this.isHeroAlive) return;

            this.camVX = this.camVY = 0;

            this.isHeroAlive = false;
            var col, row;
            for (row = 0; row < this.level.rows; row++) {
                for (col = 0; col < this.level.cols; col++) {
                    if (this.level.getType(col, row) === Level.HERO) {
                        this.explode(col, row);
                    }
                }
            }
            this.wait = 4;
        },
        isLevelDone: false,
        nextLevel: function() {
            this.isLevelDone = true;
            this.killHero();
        }
    };
}
