import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import {
  Box,
  Typography,
  Divider,
  Snackbar,
  Alert,
  ThemeProvider,
  createTheme,
  IconButton,
  CssBaseline,
} from "@mui/material";
import { categorizeSample } from "./utils/categorizeSamples";
import Controls from "./components/Controls";
import ImportSamples from "./components/ImportSamples";
import Destination from "./components/Destination";
import { TreeView } from "@mui/x-tree-view/TreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { mapFilenamesBatched } from "./services/openaiUtil";
import { randomSample } from "./utils/randomSample";
import { PlaybackProvider } from "./context/PlaybackContext";
import Player from "./components/Player";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

interface Mapping {
  src: string;
  dest: string;
  confidence: number;
}

const steps = [
  "Select Output Directory",
  "Scan Structure",
  "Select Input Directory",
  "Automatic Mapping",
  "Review & Edit",
  "Copy Files",
];

function App() {
  const [outputDir, setOutputDir] = useState<string | null>(null);
  const [inputDir, setInputDir] = useState<string | null>(null);
  const [outputStructure, setOutputStructure] = useState<string[]>([]);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [apiKey, setApiKey] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [dark, setDark] = useState(false);
  const theme = React.useMemo(
    () => createTheme({ palette: { mode: dark ? "dark" : "light" } }),
    [dark]
  );
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);

  interface FolderNode {
    name: string;
    path: string;
    count: number;
    children: Record<string, FolderNode>;
  }

  const folderTree = React.useMemo<FolderNode[]>(() => {
    if (!outputDir) return [];
    const root: Record<string, FolderNode> = {};

    outputStructure.forEach((filePath) => {
      const rel = filePath.replace(`${outputDir}/`, "");
      const parts = rel.split("/").slice(0, -1); // ignore filename
      let current = root;
      let accumPath = "";
      parts.forEach((segment, idx) => {
        accumPath = accumPath ? `${accumPath}/${segment}` : segment;
        if (!current[segment]) {
          current[segment] = {
            name: segment,
            path: accumPath,
            count: 0,
            children: {},
          };
        }
        // increment count for this folder
        current[segment].count += 1;
        current = current[segment].children;
      });
    });

    return Object.values(root);
  }, [outputDir, outputStructure]);

  const childFolders = React.useMemo(() => {
    if (!outputDir) return [] as string[];
    const dirSet = new Set<string>();
    outputStructure.forEach((f) => {
      const dir = f.substring(0, f.lastIndexOf("/"));
      if (dir.startsWith(outputDir)) dirSet.add(dir);
    });
    // Keep only leaf dirs (no other dir starts with this path + '/')
    const allDirs = Array.from(dirSet);
    return allDirs.filter(
      (d) => !allDirs.some((other) => other !== d && other.startsWith(`${d}/`))
    );
  }, [outputStructure, outputDir]);

  const renderTree = (nodes: FolderNode[]) =>
    nodes.map((node) => (
      <TreeItem key={node.path} nodeId={node.path} label={node.name}>
        {Object.keys(node.children).length > 0 &&
          renderTree(Object.values(node.children))}
      </TreeItem>
    ));

  const handleSelectOutput = async () => {
    const dir = await window.api.selectDirectory();
    if (dir) {
      setOutputDir(dir);
      const files = await window.api.scanDirectory(dir);
      setOutputStructure(files);
    }
  };

  const handleSelectInput = async () => {
    const dir = await window.api.selectDirectory();
    if (dir) {
      setInputDir(dir);
      if (!outputDir) return;
      const files = await window.api.scanDirectory(dir);
      const newMappings: Mapping[] = files.map((file) => {
        const { categoryPath, confidence } = categorizeSample(file);
        return {
          src: file,
          dest: `${outputDir}/${categoryPath}${file.split("/").pop()}`!,
          confidence,
        };
      });
      setMappings(newMappings);
    }
  };

  const handleAutoMap = async () => {
    try {
      if (!outputDir || !inputDir) return;
      if (!apiKey) {
        setError("Please enter OpenAI API key");
        return;
      }

      const files = await window.api.scanDirectory(inputDir);
      const examples = randomSample(files, 10).map((f) => ({
        file: f,
        folder: childFolders[Math.floor(Math.random() * childFolders.length)],
      }));

      const mapping = await mapFilenamesBatched({
        filenames: files,
        folders: childFolders,
        apiKey,
        examples,
      });
      const newM: Mapping[] = files.map((f) => ({
        src: f,
        dest: `${outputDir}/${mapping[f]}/${f.split("/").pop()}`,
        confidence: 1,
      }));
      setMappings(newM);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleRowUpdate = (idx: number, newFolder: string) => {
    setMappings((prev) =>
      prev.map((m, i) =>
        i === idx
          ? {
              ...m,
              dest: `${outputDir}/${newFolder}/${m.src.split("/").pop()}`,
              aiFolder: newFolder,
              confidence: 1,
            }
          : m
      )
    );
  };

  const content = (
    <Box
      sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}
    >
      <Typography variant="h4" gutterBottom>
        Sample Organizer
      </Typography>
      <Controls
        onSelectOutput={handleSelectOutput}
        onSelectInput={handleSelectInput}
        onAutoMap={handleAutoMap}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        outputSelected={!!outputDir}
        inputSelected={!!inputDir}
      />

      <Divider sx={{ my: 2 }} />

      <Box
        sx={{
          display: "flex",
          gap: 2,
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <ImportSamples
          mappings={mappings}
          inputDir={inputDir}
          outputDir={outputDir}
          apiKey={apiKey}
          onMappingChange={handleRowUpdate}
          onError={setError}
          folderList={childFolders}
        />

        <Destination folderTree={folderTree} outputDir={outputDir} />
      </Box>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );

  return content;
}

const Root = () => {
  const [dark, setDark] = React.useState(true);
  const theme = React.useMemo(
    () => createTheme({ palette: { mode: dark ? "dark" : "light" } }),
    [dark]
  );
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PlaybackProvider>
        <App />
        <IconButton
          sx={{ position: "fixed", top: 8, right: 8 }}
          onClick={() => setDark((d) => !d)}
          color="inherit"
          size="small"
        >
          {dark ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
        <Player />
      </PlaybackProvider>
    </ThemeProvider>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(<Root />);
