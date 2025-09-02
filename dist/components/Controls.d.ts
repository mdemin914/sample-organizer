import React from "react";
interface ControlsProps {
    onSelectOutput: () => void;
    onSelectInput: () => void;
    onAutoMap: () => void;
    outputSelected: boolean;
    inputSelected?: boolean;
    apiKey: string;
    onApiKeyChange: (v: string) => void;
}
declare const Controls: React.FC<ControlsProps>;
export default Controls;
//# sourceMappingURL=Controls.d.ts.map