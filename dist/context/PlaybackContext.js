"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaybackProvider = exports.usePlayback = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const PlaybackContext = (0, react_1.createContext)(undefined);
const usePlayback = () => {
    const ctx = (0, react_1.useContext)(PlaybackContext);
    if (!ctx)
        throw new Error("PlaybackContext missing");
    return ctx;
};
exports.usePlayback = usePlayback;
const PlaybackProvider = ({ children, }) => {
    const audioRef = (0, react_1.useRef)(new Audio());
    const [currentSrc, setCurrentSrc] = (0, react_1.useState)(null);
    const [playing, setPlaying] = (0, react_1.useState)(false);
    const [duration, setDuration] = (0, react_1.useState)(0);
    const [currentTime, setCurrentTime] = (0, react_1.useState)(0);
    const [volume, setVolumeState] = (0, react_1.useState)(0.6);
    const [loop, setLoop] = (0, react_1.useState)(false);
    // listeners
    (0, react_1.useEffect)(() => {
        const audio = audioRef.current;
        const timeHandler = () => setCurrentTime(audio.currentTime);
        const endHandler = () => {
            if (loop) {
                audio.currentTime = 0;
                audio.play();
            }
            else {
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
    const play = (src) => {
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
        }
        else {
            audio.play();
            setPlaying(true);
        }
    };
    const seek = (t) => {
        audioRef.current.currentTime = t;
        setCurrentTime(t);
    };
    const setVolume = (v) => {
        setVolumeState(v);
        audioRef.current.volume = v;
    };
    const toggleLoop = () => setLoop((l) => !l);
    return ((0, jsx_runtime_1.jsx)(PlaybackContext.Provider, { value: {
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
        }, children: children }));
};
exports.PlaybackProvider = PlaybackProvider;
//# sourceMappingURL=PlaybackContext.js.map