import React from "react";
import type { Parameters } from "../lib/calculations.tsx";

interface ParameterEditorModalProps {
  show: boolean;
  tempParameters: Parameters;
  tempUseDiscount: boolean;
  setTempParameters: React.Dispatch<React.SetStateAction<Parameters>>;
  setTempUseDiscount: React.Dispatch<React.SetStateAction<boolean>>;
  onReset: () => void;
  onCancel: () => void;
  onSave: () => void;
  UI_TEXT: any;
}

export function ParameterEditorModal({
  show,
  tempParameters,
  tempUseDiscount,
  setTempParameters,
  setTempUseDiscount,
  onReset,
  onCancel,
  onSave,
  UI_TEXT,
}: ParameterEditorModalProps) {
  if (!show) return null;

  const toggleDiscount = () => {
    setTempUseDiscount(!tempUseDiscount);
    setTempParameters((prev) => ({
      ...prev,
      markup: Math.abs(prev.markup),
    }));
  };

  const labels = {
    pricePerKg: `${UI_TEXT.PARAMETER_LABELS.PRICE_PER_KG} (RON)`,
    pricePerHour: `${UI_TEXT.PARAMETER_LABELS.PRICE_PER_HOUR} (RON)`,
    flatWorkFee: `${UI_TEXT.PARAMETER_LABELS.FLAT_WORK_FEE} (RON)`,
    electricityConsumption: `${UI_TEXT.PARAMETER_LABELS.ELECTRICITY_CONSUMPTION} (W)`,
    electricityPrice: `${UI_TEXT.PARAMETER_LABELS.ELECTRICITY_PRICE} (RON/kWh)`,
    markup: tempUseDiscount
      ? `${UI_TEXT.PARAMETER_LABELS.DISCOUNT} (%)`
      : `${UI_TEXT.PARAMETER_LABELS.MARKUP} (%)`,
  } as const;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div
        className="rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: "var(--bg1)",
          borderColor: "var(--dark-border)",
          borderWidth: "1px",
          borderStyle: "solid",
        }}
      >


        <div className="space-y-4 mb-8">
          {Object.entries(tempParameters).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              {key === "markup" ? (
                <div className="flex items-center gap-2 w-3/5">
                  <label
                    className="text-sm font-medium whitespace-nowrap"
                    style={{ color: "var(--dark-text)" }}
                  >
                    {labels[key as keyof typeof labels]}
                  </label>
                  <button
                    onClick={toggleDiscount}
                    className="rotate-btn"
                    style={{ color: "var(--dark-secondary)" }}
                  >
                    ↻
                  </button>
                </div>
              ) : (
                <label
                  className="text-sm font-medium w-3/5 whitespace-nowrap"
                  style={{ color: "var(--dark-text)" }}
                >
                  {labels[key as keyof typeof labels]}
                </label>
              )}

              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9.,]*"
                maxLength={4}
                value={value}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^[0-9]*[.,]?[0-9]*$/.test(val)) {
                    setTempParameters((prev) => ({
                      ...prev,
                      [key]: val.replace(",", "."),
                    }));
                  }
                }}
                className="w-16 rounded-md px-2 py-2 font-mono text-sm text-center"
                style={{
                  backgroundColor: "var(--bg3)",
                  borderColor: "var(--dark-border)",
                  color: "var(--dark-text)",
                }}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onReset}
            className="flex-1 rounded-xl px-4 py-2"
            style={{
              backgroundColor: "transparent",
              borderColor: "var(--border-subtle)",
              borderWidth: "1px",
              borderStyle: "solid",
              color: "var(--text)",
            }}
          >
            {UI_TEXT.COMMON.RESET_BUTTON}
          </button>

          <button
            onClick={onCancel}
            className="flex-1 rounded-xl px-4 py-2"
            style={{
              backgroundColor: "transparent",
              borderColor: "var(--border-subtle)",
              borderWidth: "1px",
              borderStyle: "solid",
              color: "var(--text)",
            }}
          >
            {UI_TEXT.COMMON.CANCEL_BUTTON}
          </button>

          <button
            onClick={onSave}
            className="flex-1 rounded-xl px-4 py-2 font-semibold"
            style={{
              backgroundColor: "var(--accent)",
              borderColor: "var(--accent)",
              borderWidth: "1px",
              borderStyle: "solid",
              color: "#0a0a0a",
            }}
          >
            {UI_TEXT.COMMON.SAVE_BUTTON}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ParameterEditorModal;
