import React from "react";
import { FileText } from "lucide-react";
import { validateMinutes, validatePositiveNumber } from "../lib/calculations.tsx";

interface WorkDetailsFormProps {
  grams: string;
  hours: string;
  minutes: string;
  projectName: string;
  fileName: string;
  setGrams: (v: string) => void;
  setHours: (v: string) => void;
  setMinutes: (v: string) => void;
  setProjectName: (v: string) => void;
  onOpenGcode: () => void;
  UI_TEXT: any;
}

export function WorkDetailsForm({
  grams,
  hours,
  minutes,
  projectName,
  fileName,
  setGrams,
  setHours,
  setMinutes,
  setProjectName,
  onOpenGcode,
  UI_TEXT,
}: WorkDetailsFormProps) {
  return (
    <div
      className="rounded-lg p-6"
      style={{
        backgroundColor: "var(--bg1)",
        borderColor: "var(--border-subtle)",
        borderWidth: "1px",
        borderStyle: "solid",
      }}
    >
      <h2
        className="text-xl font-semibold mb-4 flex items-center gap-2"
        style={{ color: "var(--text)" }}
      >
        <FileText className="w-5 h-5" style={{ color: "var(--accent)" }} />
        {UI_TEXT.WORK_DETAILS.TITLE}
      </h2>

      <div className="grid grid-cols-1 gap-4 mb-4">
        <div>
          <label
            htmlFor="projectName"
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--text)" }}
          >
            {UI_TEXT.WORK_DETAILS.PROJECT_NAME}
          </label>
          <input
            id="projectName"
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder={fileName || UI_TEXT.WORK_DETAILS.PROJECT_NAME_PLACEHOLDER}
            className="w-full rounded-md px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent appearance-none"
            style={{
              backgroundColor: "var(--bg3)",
              borderColor: "var(--border-subtle)",
              color: "var(--text)",
              MozAppearance: "textfield",
            }}
          />
        </div>

        <div>
          <label
            htmlFor="grams"
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--text)" }}
          >
            {UI_TEXT.WORK_DETAILS.FILAMENT_WEIGHT}
          </label>
          <div className="relative">
            <input
              id="grams"
              type="text"
              inputMode="decimal"
              pattern="[0-9.,]*"
              value={grams}
              maxLength={10}
              onChange={(e) => {
                const val = e.target.value;
                if (/^[0-9]*[.,]?[0-9]*$/.test(val)) {
                  setGrams(val.replace(",", "."));
                }
              }}
              placeholder="0"
              className="w-full rounded-md px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent appearance-none"
              style={{
                backgroundColor: "var(--bg3)",
                borderColor: "var(--border-subtle)",
                color: "var(--text)",
                MozAppearance: "textfield",
              }}
            />
            <span
              className="absolute right-3 top-2 text-sm"
              style={{ color: "var(--accent)" }}
            >
              g
            </span>
          </div>
          {grams && !validatePositiveNumber(grams) && (
            <p className="text-red-600 text-sm mt-1">
              {UI_TEXT.VALIDATION.POSITIVE_NUMBER}
            </p>
          )}
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--text)" }}
          >
            {UI_TEXT.WORK_DETAILS.PRINT_TIME}
          </label>

          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <input
                id="hours"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={hours}
                maxLength={8}
                onChange={(e) =>
                  setHours(e.target.value.replace(/[^0-9]/g, ""))
                }
                placeholder="0"
                className="w-full rounded-md px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent appearance-none"
                style={{
                  backgroundColor: "var(--bg3)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--text)",
                  MozAppearance: "textfield",
                }}
              />
              <span
                className="absolute right-2 top-2 text-xs"
                style={{ color: "var(--accent)" }}
              >
                {UI_TEXT.UNITS.HOURS}
              </span>
            </div>

            <div className="relative">
              <input
                id="minutes"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={minutes}
                maxLength={8}
                onChange={(e) =>
                  setMinutes(e.target.value.replace(/[^0-9]/g, ""))
                }
                placeholder="0"
                className="w-full rounded-md px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-transparent appearance-none"
                style={{
                  backgroundColor: "var(--bg3)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--text)",
                  MozAppearance: "textfield",
                }}
              />
              <span
                className="absolute right-2 top-2 text-xs"
                style={{ color: "var(--accent)" }}
              >
                {UI_TEXT.UNITS.MINUTES}
              </span>
            </div>
          </div>

          {minutes && !validateMinutes(minutes) && (
            <p className="text-red-600 text-sm mt-1">
              {UI_TEXT.VALIDATION.MINUTES_RANGE}
            </p>
          )}
        </div>

        <div>
          <button
            onClick={onOpenGcode}
            className="w-full rounded-xl px-4 py-2 flex items-center justify-center gap-2"
            style={{
              backgroundColor: "var(--bg3)",
              borderColor: "var(--border-subtle)",
              borderWidth: "1px",
              borderStyle: "solid",
              color: "#ffffff",
            }}
          >
            <FileText className="w-4 h-4" style={{ color: "#ffffff" }} />
            {UI_TEXT.WORK_DETAILS.OPEN_GCODE}
          </button>
        </div>
      </div>
    </div>
  );
}

export default WorkDetailsForm;
