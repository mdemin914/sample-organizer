import React, { useState } from "react";
import {
  Paper,
  Typography,
  Box,
  IconButton,
  CircularProgress,
  Pagination,
  Stack,
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

interface Props {
  mappings: Mapping[];
  inputDir: string | null;
  outputDir: string | null;
  apiKey: string;
  folderList: string[];
  onMappingChange: (idx: number, newFolder: string) => void;
  onError: (msg: string) => void;
}

const ImportSamples: React.FC<Props> = ({
  mappings,
  inputDir,
  outputDir,
  apiKey,
  folderList = [],
  onMappingChange,
  onError,
}) => {
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50); // 50 items per page
  const { currentSrc, playing, play, toggle } = usePlayback();

  // Calculate pagination
  const totalPages = Math.ceil(mappings.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, mappings.length);
  const currentPageMappings = mappings.slice(startIndex, endIndex);

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  // Reset to page 1 when mappings change (new data loaded)
  React.useEffect(() => {
    setCurrentPage(1);
  }, [mappings.length]);

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
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header row using flexbox */}
        <Box
          sx={{
            display: "flex",
            backgroundColor: "action.hover",
            borderBottom: 1,
            borderColor: "divider",
            py: 1,
            px: 2,
            fontWeight: "medium",
            fontSize: "0.875rem",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              flex: 10,
              minWidth: 0,
              pr: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            Source
          </Box>
          <Box
            sx={{
              flex: 8,
              minWidth: 0,
              pr: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            Destination
          </Box>
          <Box
            sx={{
              flex: 2,
              minWidth: 0,
              pr: 1,
            }}
          ></Box>
        </Box>

        {/* Table rows with pagination */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
          {currentPageMappings.map((m, index) => {
            const actualIndex = startIndex + index;

            // Adjust path displays
            const srcRel = inputDir ? m.src.replace(`${inputDir}/`, "") : m.src;
            const destRel = outputDir
              ? m.dest.replace(`${outputDir}/`, "")
              : m.dest;
            const srcParts = srcRel.split("/");
            const fileName = srcParts.pop();
            const srcFolder = srcParts.join("/");
            const destFolder = destRel.split("/").slice(0, -1).join("/");

            return (
              <Box
                key={actualIndex}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  px: 2,
                  py: 0.5,
                  minHeight: 38,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <Box
                  sx={{
                    flex: 10,
                    minWidth: 0,
                    pr: 1,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    variant="body2"
                    noWrap
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={fileName}
                  >
                    {fileName}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={srcFolder}
                  >
                    {srcFolder}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    flex: 8,
                    minWidth: 0,
                    pr: 1,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    variant="body2"
                    noWrap
                    sx={{
                      cursor: "pointer",
                      textDecoration: "underline",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={destFolder}
                    onClick={async () => {
                      if (!outputDir) return;
                      const fullPath = destFolder.startsWith(outputDir)
                        ? destFolder
                        : `${outputDir}/${destFolder}`;
                      await window.api.openPath(fullPath);
                    }}
                  >
                    {destFolder}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    flex: 2,
                    minWidth: 0,
                    display: "flex",
                    gap: 0.5,
                    pr: 1,
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (currentSrc === m.src) toggle();
                      else play(m.src);
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
                    disabled={!apiKey || loadingIdx === actualIndex}
                    onClick={async () => {
                      if (folderList.length === 0) return;
                      setLoadingIdx(actualIndex);
                      try {
                        const folder = await classifyFile(m.src, {
                          folders: folderList,
                          apiKey,
                        });
                        onMappingChange(actualIndex, folder);
                      } catch (e) {
                        onError((e as Error).message);
                      } finally {
                        setLoadingIdx(null);
                      }
                    }}
                  >
                    {loadingIdx === actualIndex ? (
                      <CircularProgress size={16} />
                    ) : (
                      <AutoFixHighIcon fontSize="inherit" />
                    )}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={async () => {
                      const res = await (window as any).api.moveFile(
                        m.src,
                        m.dest
                      );
                      if (!res.success) onError(res.error || "Move failed");
                    }}
                  >
                    <DriveFileMoveIcon fontSize="inherit" />
                  </IconButton>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Pagination controls */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ px: 2, py: 1, borderTop: 1, borderColor: "divider" }}
        >
          <Typography variant="body2" color="text.secondary">
            Showing {startIndex + 1}-{endIndex} of {mappings.length} items
          </Typography>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="small"
          />
        </Stack>
      </Box>
    </Paper>
  );
};

export default ImportSamples;
