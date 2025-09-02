import { mapFilenamesToFolders, classifyFile } from "../openaiUtil";

const folders = ["kicks", "snares"];

describe("mapFilenamesToFolders (live)", () => {
  it("returns a mapping from the real OpenAI API", async () => {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }

    const result = await mapFilenamesToFolders({
      filenames: ["Test_Kick_001.wav"],
      folders,
      apiKey: process.env.OPENAI_API_KEY!,
      examples: [{ file: "Acoustic_Snare.wav", folder: "snares" }],
    });

    expect(Object.keys(result)).toContain("Test_Kick_001.wav");
    expect(folders).toContain(result["Test_Kick_001.wav"]);
  }, 20000);

  it("classifies Cymatics melody sample correctly", async () => {
    if (!process.env.OPENAI_API_KEY)
      throw new Error("OPENAI_API_KEY is not set");

    const file =
      "Cymatics - 2022 Melody Collection (BETA)/2022 Melody Collection (BETA)/DrillCymatics - Empty The Clip - 140 BPM D Min.wav";

    const res = await classifyFile(file, {
      folders,
      apiKey: process.env.OPENAI_API_KEY!,
    });

    expect(folders).toContain(res);
  }, 20000);
});
