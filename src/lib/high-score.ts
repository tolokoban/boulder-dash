import { TScores } from "../types"

/**
 * Les  high-scores  sont  stoqués  sous forme  d'un  tableau  de  8
 * éléments.  Chaque  élément  est  lui-même un  tableau  avec  deux
 * éléments : le nom du joueur et son score.
 */
const DEFAULT_HIGH_SCORES: TScores = [
    ['Daisy', 17132],
    ['John', 16000],
    ['Samantha', 11728],
    ['Henry', 8226],
    ['Virginia', 4100],
    ['William', 1950],
    ['Natalia', 900],
    ['Paul', 650]
];

/**
 * Lire les scores depuis le local storage.
 */
function loadFromLocalStorage(): TScores {
    var scores = window.localStorage.getItem("boulder-dash/scores");
    if (!scores) {
        return DEFAULT_HIGH_SCORES;
    } else {
        try {
            scores = JSON.parse(scores);
            if (!Array.isArray(scores)) return DEFAULT_HIGH_SCORES;
        } catch (ex) {
            console.error(ex);
            return DEFAULT_HIGH_SCORES;
        }
    }
    return scores;
};

/**
 * Sauvegarder les scores dans le local storage.
 */
function saveToLocalStorage(scores: TScores) {
    window.localStorage.setItem("boulder-dash/scores", JSON.stringify(scores));
}

/**
 * Classe de gestion des high-scores.
 */
export default class HighScore {
    _scores: TScores = loadFromLocalStorage();
    _lastNewHighScore: number = -1;

    /**
     * Retourner une copie des scores.
     */
    getScores(): TScores {
        return this._scores.slice();
    }

    /**
     *
     */
    getLastHighScoreIndex(): number {
        return this._lastNewHighScore;
    }

    /**
     * Vérifier si le score donné peut figurer parmi les 8 meilleurs.
     */
    isAnHighScore(score: number): boolean {
        return score > this._scores[this._scores.length - 1][1];
    }

    /**
     * @param {string} name - Nom du joueur.
     * @param {number} score - Son score.
     */
    addScore(name: string, score: number) {
        const scores = this._scores;
        for (let k = 0; k < scores.length; k++) {
            if (score > scores[k][1]) {
                // Mémorisons l'emplacement du dernier score inséré
                // ça permettra de le mettre en évidence.
                this._lastNewHighScore = k;
                // On insère le score à sa place.
                scores.splice(k, 0, [name, score]);
                // On s'assure qu'il n'y en a pas plus que 8.
                while (scores.length > 8) scores.pop();
                saveToLocalStorage(scores);
                return true;
            }
        }
        return false;
    }
}
