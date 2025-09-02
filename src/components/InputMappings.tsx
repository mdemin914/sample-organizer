import React, { useState } from "react";
import {
  Paper,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  IconButton,
  CircularProgress,
  Chip,
} from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import { classifyFile } from "../services/openaiUtil";
import { usePlayback } from "../context/PlaybackContext";

interface Mapping {
  src: string;
  dest: string;
  confidence: number;
  aiFolder?: string;
}

function getFileName(path: string) {
  return path.split("/").pop() || path;
}

interface Props {
  mappings: Mapping[];
  inputDir: string | null;
  outputDir: string | null;
  apiKey: string;
  folderList: string[];
  onMappingChange: (idx: number, newFolder: string) => void;
  onError: (msg: string) => void;
}

const InputMappings: React.FC<Props> = ({
  mappings,
  inputDir,
  outputDir,
  apiKey,
  folderList = [],
  onMappingChange,
  onError,
}) => {
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null);
  const { currentSrc, playing, play, toggle } = usePlayback();

  const duplicateSet = React.useMemo(() => {
    const nameCount: Record<string, number> = {};
    mappings.forEach((m) => {
      const name = getFileName(m.src);
      nameCount[name] = (nameCount[name] || 0) + 1;
    });
    return new Set(Object.keys(nameCount).filter((k) => nameCount[k] > 1));
  }, [mappings]);

  return (
    <Paper
      sx={{
        minWidth: 0,
        flex: 3,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        p: 1,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Importing Samples – {mappings.length}
      </Typography>
      {inputDir && (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
          {inputDir}
        </Typography>
      )}
      <TableContainer sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Source</TableCell>
              <TableCell>Destination</TableCell>
              <TableCell>Conf</TableCell>
              <TableCell>Dup</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mappings.map((m, idx) => {
              const srcRel = inputDir
                ? m.src.replace(`${inputDir}/`, "")
                : m.src;
              const destRel = outputDir
                ? m.dest.replace(`${outputDir}/`, "")
                : m.dest;
              const srcParts = srcRel.split("/");
              const fileName = srcParts.pop();
              const srcFolder = srcParts.join("/");
              const destFolder = destRel.split("/").slice(0, -1).join("/");
              return (
                <TableRow key={idx}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{fileName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {srcFolder}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ cursor: "pointer", textDecoration: "underline" }}
                        onClick={async () => {
                          if (!outputDir) return;
                          const fullPath = destFolder.startsWith(outputDir)
                            ? destFolder
                            : `${outputDir}/${destFolder}`;
                          console.log("renderer openPath", fullPath);
                          await window.api.openPath(fullPath);
                        }}
                      >
                        {destFolder}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{(m.confidence * 100).toFixed(0)}%</TableCell>
                  <TableCell>
                    {duplicateSet.has(getFileName(m.src)) && (
                      <Chip label="Dup" size="small" color="warning" />
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (currentSrc === m.src) {
                          toggle();
                        } else {
                          play(m.src);
                        }
                      }}
                    >
                      {currentSrc === m.src && playing ? (
                        <StopIcon fontSize="inherit" />
                      ) : (
                        <PlayArrowIcon fontSize="inherit" />
                      )}
                    </IconButton>
                    <IconButton
                      size="small"
                      disabled={!apiKey || loadingIdx === idx}
                      onClick={async () => {
                        if (folderList.length === 0) return;
                        setLoadingIdx(idx);
                        try {
                          const folder = await classifyFile(m.src, {
                            folders: folderList,
                            apiKey,
                          });
                          onMappingChange(idx, folder);
                        } catch (e) {
                          onError((e as Error).message);
                        } finally {
                          setLoadingIdx(null);
                        }
                      }}
                    >
                      {loadingIdx === idx ? (
                        <CircularProgress size={16} />
                      ) : (
                        <AutoFixHighIcon fontSize="inherit" />
                      )}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={async () => {
                        const destFull = m.dest;
                        const res = await window.api.moveFile(m.src, destFull);
                        if (!res.success) {
                          onError(res.error || "Move failed");
                        }
                      }}
                    >
                      <DriveFileMoveIcon fontSize="inherit" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default InputMappings;
