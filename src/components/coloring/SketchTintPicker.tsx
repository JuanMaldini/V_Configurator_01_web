import { Sketch } from "@uiw/react-color";
import "./SketchTintPicker.css";

export type SketchTintPickerProps = {
  hex: string;
  onHexChange: (hex: string) => void;
};

export function SketchTintPicker({ hex, onHexChange }: SketchTintPickerProps) {
  return (
    <div className="sketch-tint-picker">
      <Sketch
        color={hex}
        disableAlpha={true}
        presetColors={false}
        style={{ "--tint-preview-color": hex } as React.CSSProperties}
        onChange={(color) => {
          // Defensive: if a hexa ever slips in, keep it as #RRGGBB.
          const nextHex = typeof color.hex === "string" ? color.hex.slice(0, 7) : hex;
          onHexChange(nextHex);
        }}
      />
    </div>
  );
}
