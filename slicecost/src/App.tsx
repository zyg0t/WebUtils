import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  DEFAULT_PARAMETERS,
  DEFAULT_ENABLED,
  UI_TEXTS,
  type Language,
} from "./config/constants";
import { readGcodeMetadata } from "./lib/utils";
import { calculateCosts } from "./lib/calculations";
import type {
  Parameters,
  ParameterConfig,
  CostBreakdown,
} from "./lib/calculations";
import WorkDetailsForm from "./components/WorkDetailsForm";
import ParametersPanel from "./components/ParametersPanel";
import CostCard from "./components/CostCard";
import ParameterEditorModal from "./components/ParameterEditorModal";

export default function App() {
  const [grams, setGrams] = useState<string>("");
  const [hours, setHours] = useState<string>("");
  const [minutes, setMinutes] = useState<string>("");
  const [showParameterEditor, setShowParameterEditor] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [projectName, setProjectName] = useState<string>("");

  const [parameterConfig, setParameterConfig] = useState<ParameterConfig>(
    () => {
      const saved = localStorage.getItem("3d-calc-parameters");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (!parsed.useDiscount) parsed.useDiscount = false;
          return parsed;
        } catch {
        }
      }
      return {
        enabled: DEFAULT_ENABLED,
        value: { ...DEFAULT_PARAMETERS },
        useDiscount: false,
      };
    },
  );

  const [tempParameters, setTempParameters] = useState<Parameters>(
    parameterConfig.value,
  );
  const [tempEnabled, setTempEnabled] = useState<
    Record<keyof Parameters, boolean>
  >(parameterConfig.enabled);
  const [tempUseDiscount, setTempUseDiscount] = useState<boolean>(
    parameterConfig.useDiscount,
  );

  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem("language") as Language) || "en";
  });
  const UI_TEXT = UI_TEXTS[language];

  useEffect(() => {
    localStorage.setItem("3d-calc-parameters", JSON.stringify(parameterConfig));
  }, [parameterConfig]);

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const costs: CostBreakdown = useMemo(
    () =>
      calculateCosts(
        parseFloat(grams) || 0,
        parseFloat(hours) || 0,
        parseFloat(minutes) || 0,
        {
          enabled: parameterConfig.enabled,
          value: parameterConfig.value,
          useDiscount: parameterConfig.useDiscount,
        },
      ),
    [grams, hours, minutes, parameterConfig],
  );

  const handleOpenGcode = useCallback(async () => {
    try {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".gcode";

      const file = await new Promise<File | null>((resolve) => {
        input.onchange = (e) => {
          resolve((e.target as HTMLInputElement).files?.[0] || null);
        };
        input.click();
      });

      if (!file) return;

      const fullFileName = file.name;
      setFileName(fullFileName);

      const { filamentUsed, printTime } = await readGcodeMetadata(file);
      setGrams(filamentUsed.toString());

      const hoursMatch = printTime.match(/(\d+)h/);
      const minutesMatch = printTime.match(/(\d+)m/);
      setHours(hoursMatch ? hoursMatch[1] : "0");
      setMinutes(minutesMatch ? minutesMatch[1] : "0");
    } catch (error: any) {
      if (error.message.includes("Missing metadata")) {
        console.error("Missing metadata in G-code file");
      } else {
        console.error("Error processing G-code file");
      }
    }
  }, [UI_TEXT]);

  const saveParameters = useCallback(() => {
    setParameterConfig({
      enabled: tempEnabled,
      value: tempParameters,
      useDiscount: tempUseDiscount,
    });
    setShowParameterEditor(false);
  }, [tempEnabled, tempParameters, tempUseDiscount]);

  const resetToDefaults = useCallback(() => {
    setTempParameters({ ...DEFAULT_PARAMETERS });
    setTempEnabled({ ...DEFAULT_ENABLED });
    setTempUseDiscount(false);
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "transparent", color: "var(--text)" }}
    >
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="relative text-center mb-8">
          <a
            href="https://zyg0t.github.io/WebUtils/"
            className="header-btn absolute left-0 top-0"
            title="WebUtils"
          >
            <i className="fas fa-shapes"></i>
          </a>

          <button
            onClick={() => setLanguage(language === "en" ? "ro" : "en")}
            className="header-btn absolute right-0 top-0"
          >
            {language === "en" ? "🇬🇧" : "🇷🇴"}
          </button>

          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-3xl font-bold">
              Slice<span style={{ color: "var(--accent)" }}>Cost</span>
            </h1>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <WorkDetailsForm
              grams={grams}
              hours={hours}
              minutes={minutes}
              projectName={projectName}
              fileName={fileName}
              setGrams={setGrams}
              setHours={setHours}
              setMinutes={setMinutes}
              setProjectName={setProjectName}
              onOpenGcode={() => void handleOpenGcode()}
              UI_TEXT={UI_TEXT}
            />
          </div>

          <div className="space-y-6">
            <ParametersPanel
              parameterConfig={parameterConfig}
              setParameterConfig={setParameterConfig}
              onEditClick={() => {
                setTempParameters(parameterConfig.value);
                setTempEnabled(parameterConfig.enabled);
                setShowParameterEditor(true);
              }}
              UI_TEXT={UI_TEXT}
            />
          </div>

          <div className="space-y-6">
            <CostCard
              costs={costs}
              parameterConfig={parameterConfig}
              grams={grams}
              hours={hours}
              minutes={minutes}
              projectName={projectName}
              UI_TEXT={UI_TEXT}
            />
          </div>
        </div>

        <ParameterEditorModal
          show={showParameterEditor}
          tempParameters={tempParameters}
          tempUseDiscount={tempUseDiscount}
          setTempParameters={setTempParameters}
          setTempUseDiscount={setTempUseDiscount}
          onReset={resetToDefaults}
          onCancel={() => setShowParameterEditor(false)}
          onSave={saveParameters}
          UI_TEXT={UI_TEXT}
        />
      </div>

    </div>
  );
}
