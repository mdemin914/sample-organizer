"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapFilenamesToFolders = mapFilenamesToFolders;
exports.mapFilenamesBatched = mapFilenamesBatched;
exports.classifyFile = classifyFile;
const openai_1 = __importDefault(require("openai"));
const SYSTEM_PROMPT = "You classify sample filenames into predefined folder names and return strict JSON.  If you are not sure, return the most logical missing folder";
async function mapFilenamesToFolders({ filenames, folders, apiKey, examples = [], }) {
    const openai = new openai_1.default({ apiKey, dangerouslyAllowBrowser: true });
    const examplesText = examples
        .map((e) => `${e.file} -> ${e.folder}`)
        .join("\n");
    const userContent = `Folders:\n${folders
        .map((f) => "- " + f)
        .join("\n")}\n\nReturn JSON exactly in the shape {\"<filename>\": \"<folder>\"}.\n\nExamples:\n${examplesText}\n\nFiles to classify:\n${filenames.join("\n")}`;
    console.log(userContent);
    let response;
    try {
        response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0,
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: userContent },
            ],
        });
    }
    catch (e) {
        if (e.status === 401) {
            throw new Error("OpenAI API unauthorized – check API key");
        }
        throw e;
    }
    console.log(JSON.stringify(response, null, 2));
    return JSON.parse(response.choices[0].message.content);
}
async function mapFilenamesBatched(req) {
    const { filenames, batchSize = 200 } = req;
    const result = {};
    for (let i = 0; i < filenames.length; i += batchSize) {
        const slice = filenames.slice(i, i + batchSize);
        const batchMapping = await mapFilenamesToFolders({
            ...req,
            filenames: slice,
        });
        Object.assign(result, batchMapping);
    }
    return result;
}
async function classifyFile(filename, req) {
    const res = await mapFilenamesToFolders({ ...req, filenames: [filename] });
    return res[filename];
}
//# sourceMappingURL=openaiUtil.js.map