"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomSample = randomSample;
function randomSample(arr, n) {
    const copy = [...arr];
    const result = [];
    while (copy.length && result.length < n) {
        const idx = Math.floor(Math.random() * copy.length);
        result.push(copy.splice(idx, 1)[0]);
    }
    return result;
}
//# sourceMappingURL=randomSample.js.map