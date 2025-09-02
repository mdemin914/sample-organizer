import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";

interface PlaybackContextValue {
  currentSrc: string | null;
  playing: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  loop: boolean;
  toggleLoop: () => void;
  play: (src: string) => void;
  toggle: () => void;
  seek: (time: number) => void;
  setVolume: (v: number) => void;
}

const PlaybackContext = createContext<PlaybackContextValue | undefined>(
  undefined
);

export const usePlayback = () => {
  const ctx = useContext(PlaybackContext);
  if (!ctx) throw new Error("PlaybackContext missing");
  return ctx;
};

export const PlaybackProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const audioRef = useRef(new Audio());
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(0.6);
  const [loop, setLoop] = useState(false);

  // listeners
  useEffect(() => {
    const audio = audioRef.current;
    const timeHandler = () => setCurrentTime(audio.currentTime);
    const endHandler = () => {
      if (loop) {
        audio.currentTime = 0;
        audio.play();
      } else {
        setPlaying(false);
      }
    };
    audio.addEventListener("timeupdate", timeHandler);
    audio.addEventListener("ended", endHandler);
    return () => {
      audio.removeEventListener("timeupdate", timeHandler);
      audio.removeEventListener("ended", endHandler);
    };
  }, []);

  const play = (src: string) => {
    const audio = audioRef.current;
    if (currentSrc !== src) {
      audio.src = `file://${src}`;
      setCurrentSrc(src);
      audio.load();
      audio.volume = volume;
      audio.onloadedmetadata = () => setDuration(audio.duration);
    }
    audio.play();
    setPlaying(true);
  };

  const toggle = () => {
    const audio = audioRef.current;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  };

  const seek = (t: number) => {
    audioRef.current.currentTime = t;
    setCurrentTime(t);
  };

  const setVolume = (v: number) => {
    setVolumeState(v);
    audioRef.current.volume = v;
  };

  const toggleLoop = () => setLoop((l) => !l);

  return (
    <PlaybackContext.Provider
      value={{
        currentSrc,
        playing,
        duration,
        currentTime,
        volume,
        play,
        toggle,
        seek,
        setVolume,
        loop,
        toggleLoop,
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
};
