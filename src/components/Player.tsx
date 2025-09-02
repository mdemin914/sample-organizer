import React from "react";
import { usePlayback } from "../context/PlaybackContext";
import { Box, IconButton, Slider, Typography } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import LoopIcon from "@mui/icons-material/Loop";

function format(t: number) {
  const m = Math.floor(t / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(t % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

const Player: React.FC = () => {
  const {
    currentSrc,
    playing,
    duration,
    currentTime,
    toggle,
    seek,
    volume,
    setVolume,
    loop,
    toggleLoop,
  } = usePlayback();

  const disabled = !currentSrc;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        p: 1,
        bgcolor: "background.paper",
        borderTop: 1,
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
        gap: 2,
        zIndex: (theme) => theme.zIndex.appBar + 1,
      }}
    >
      <IconButton size="small" onClick={toggle} disabled={disabled}>
        {playing ? <PauseIcon /> : <PlayArrowIcon />}
      </IconButton>

      <IconButton
        size="small"
        onClick={toggleLoop}
        color={loop ? "primary" : "default"}
        disabled={disabled}
      >
        <LoopIcon />
      </IconButton>
      <Typography
        variant="body2"
        sx={{
          flex: 1,
          minWidth: 0,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {currentSrc ? currentSrc.split("/").pop() : "No track"}
      </Typography>
      <Typography variant="caption">{format(currentTime)}</Typography>
      <Slider
        min={0}
        max={duration || 1}
        value={disabled ? 0 : currentTime}
        onChange={(_, v) => seek(v as number)}
        sx={{ width: 150, mx: 1 }}
        disabled={disabled}
      />
      <Typography variant="caption">{format(duration)}</Typography>
      <Slider
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={(_, v) => setVolume(v as number)}
        sx={{ width: 100 }}
        disabled={disabled}
      />
    </Box>
  );
};

export default Player;
