"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categorizeSample = categorizeSample;
const rules = [
    { keywords: ["kick", "bass"], path: "drums/kick/" },
    { keywords: ["snare"], path: "drums/snare/" },
    { keywords: ["hihat", "hat"], path: "drums/cymbals/hi-hats/" },
    { keywords: ["crash"], path: "drums/cymbals/crash/" },
    { keywords: ["tom"], path: "drums/toms/" },
    { keywords: ["cymbal"], path: "drums/cymbals/" },
];
function categorizeSample(fileName) {
    const lower = fileName.toLowerCase();
    for (const { keywords, path } of rules) {
        for (const key of keywords) {
            if (lower.includes(key)) {
                return { categoryPath: path, confidence: 0.9 };
            }
        }
    }
    return { categoryPath: "drums/other/", confidence: 0.5 };
}
//# sourceMappingURL=categorizeSamples.js.map