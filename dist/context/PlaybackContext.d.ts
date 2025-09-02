import React from "react";
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
export declare const usePlayback: () => PlaybackContextValue;
export declare const PlaybackProvider: React.FC<{
    children: React.ReactNode;
}>;
export {};
//# sourceMappingURL=PlaybackContext.d.ts.map