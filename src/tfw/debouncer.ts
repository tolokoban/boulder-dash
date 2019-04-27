type Action<T> = (arg: T) => void;

/**
 * @param {function} action -  Action to call. Two consecutive actions cannot be  called if there is
 * less than `delay` ms between them.
 * @param {number} delay - Number of milliseconds.
 * @returns {function} The function to call as much as you want. It will perform the debouce for you.
 * Put in the same args as the `action` function.
 */
export default function <T>(action: Action<T>, delay: number): Action<T> {
    let timer: number = 0;

    return function(arg: T) {
        if (timer) window.clearTimeout(timer);
        timer = window.setTimeout(() => {
            timer = 0;
            action(arg);
        }, delay) as number;
    }
}
