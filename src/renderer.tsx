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
import Library from "./components/Library";
import { TreeView } from "@mui/x-tree-view/TreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { mapFilenamesBatched } from "./services/openaiUtil";
import { randomSample } from "./utils/randomSample";
import { PlaybackProvider } from "./context/PlaybackContext";
import Player from "./components/Player";
import Settings from "./components/Settings";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import SettingsIcon from "@mui/icons-material/Settings";

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
  const [allDirectories, setAllDirectories] = useState<string[]>([]);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [apiKey, setApiKey] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [dark, setDark] = useState(false);
  const theme = React.useMemo(
    () => createTheme({ palette: { mode: dark ? "dark" : "light" } }),
    [dark]
  );
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Load settings on app startup
  React.useEffect(() => {
    const loadAppSettings = async () => {
      try {
        const settings = await window.api.loadSettings();

        // Pre-populate API key
        if (settings.apiKey) {
          setApiKey(settings.apiKey);
        }

        // Auto-select default destination if explicitly saved in settings
        if (settings.defaultDestination) {
          try {
            const [files, directories] = await Promise.all([
              window.api.scanDirectory(settings.defaultDestination),
              window.api.scanDirectories(settings.defaultDestination),
            ]);
            setOutputDir(settings.defaultDestination);
            setOutputStructure(files);
            setAllDirectories(directories);
          } catch (err) {
            console.warn("Failed to load default destination:", err);
            // Don't show error to user, just continue without default
          }
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
        // Don't show error to user, app should work without settings
      } finally {
        setSettingsLoaded(true);
      }
    };

    loadAppSettings();
  }, []);

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

  // Function to find the full path of a folder by searching through all directories
  const findFolderPath = React.useCallback((folderName: string): string => {
    if (!outputDir || !folderName) return folderName;
    
    // First try exact folder name match at root level
    const rootLevelPath = `${outputDir}/${folderName}`;
    if (allDirectories.includes(rootLevelPath)) {
      return rootLevelPath;
    }
    
    // Then search through all subdirectories for a folder ending with this name
    const matchingDir = allDirectories.find(dir => {
      const folderNameFromPath = dir.split('/').pop();
      return folderNameFromPath === folderName;
    });
    
    if (matchingDir) {
      return matchingDir;
    }
    
    // If no exact match found, return the original construction as fallback
    return rootLevelPath;
  }, [outputDir, allDirectories]);

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
      const [files, directories] = await Promise.all([
        window.api.scanDirectory(dir),
        window.api.scanDirectories(dir),
      ]);
      setOutputStructure(files);
      setAllDirectories(directories);
    }
  };

  const handleSelectInput = async () => {
    const dir = await window.api.selectDirectory();
    if (dir) {
      setInputDir(dir);
      if (!outputDir) return;
      const files = await window.api.scanDirectory(dir);
      const newMappings: Mapping[] = files.map((file) => {
        return {
          src: file,
          dest: "", // Empty destination - user must use AI auto-map or manually set
          confidence: 0,
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
      const newM: Mapping[] = files.map((f) => {
        const folderPath = findFolderPath(mapping[f]);
        return {
          src: f,
          dest: `${folderPath}/${f.split("/").pop()}`,
          confidence: 1,
        };
      });
      setMappings(newM);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleRowUpdate = (idx: number, newFolder: string) => {
    setMappings((prev) =>
      prev.map((m, i) => {
        if (i === idx) {
          const folderPath = findFolderPath(newFolder);
          return {
            ...m,
            dest: `${folderPath}/${m.src.split("/").pop()}`,
            aiFolder: newFolder,
            confidence: 1,
          };
        }
        return m;
      })
    );
  };

  const content = (
    <Box
      sx={{
        p: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        pb: 8.75, // Add bottom padding to account for sticky Player component
      }}
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
          allDirectories={allDirectories}
          onFolderCreated={async () => {
            if (outputDir) {
              // Refresh both file and directory lists when a new folder is created
              const [files, directories] = await Promise.all([
                window.api.scanDirectory(outputDir),
                window.api.scanDirectories(outputDir),
              ]);
              setOutputStructure(files);
              setAllDirectories(directories);
            }
          }}
        />

        <Library folderTree={folderTree} outputDir={outputDir} />
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
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const theme = React.useMemo(
    () => createTheme({ palette: { mode: dark ? "dark" : "light" } }),
    [dark]
  );
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PlaybackProvider>
        <App />
        <Box
          sx={{
            position: "fixed",
            top: 8,
            right: 8,
            display: "flex",
            gap: 0.5,
          }}
        >
          <IconButton
            onClick={() => setSettingsOpen(true)}
            color="inherit"
            size="small"
          >
            <SettingsIcon />
          </IconButton>
          <IconButton
            onClick={() => setDark((d) => !d)}
            color="inherit"
            size="small"
          >
            {dark ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
        <Player />
        <Settings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </PlaybackProvider>
    </ThemeProvider>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(<Root />);
