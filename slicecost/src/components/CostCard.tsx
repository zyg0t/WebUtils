import React, { useState } from "react";
import { DollarSign, Copy, Download } from "lucide-react";
import { formatCurrency } from "../lib/calculations.tsx";
import type { CostBreakdown, ParameterConfig } from "../lib/calculations.tsx";

type CostCardProps = {
  costs: CostBreakdown;
  parameterConfig: ParameterConfig;
  projectName?: string;
  UI_TEXT: any;
  grams: string;
  hours: string;
  minutes: string;
};

const textColor = { color: "var(--text)" };

function CostRow({
  label,
  value,
  valueColor = "var(--text)",
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  valueColor?: string;
}) {
  return (
    <div className="flex justify-between">
      <span style={textColor}>{label}</span>
      <span className="font-mono" style={{ color: valueColor }}>
        {value}
      </span>
    </div>
  );
}

function TotalCostRow({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-lg font-semibold" style={textColor}>{label}</span>
      <span className="font-mono text-2xl font-bold" style={textColor}>
        {value}
      </span>
    </div>
  );
}

function formatCurrencyText(amount: number): string {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "RON",
  }).format(amount);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? currentLine + " " + word : word;
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

function generateCardImageBlob(
  projectName: string | undefined,
  costs: CostBreakdown,
  parameterConfig: ParameterConfig,
  UI_TEXT: any
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const width = 480;
    const padding = 28;
    const gap = 16;
    const fontStack = 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      resolve(null);
      return;
    }

    const projectFont = "bold 32px " + fontStack;
    const rowLabelFont = "500 16px " + fontStack;
    const rowValueFont = "600 16px " + fontStack;
    const totalLabelFont = "bold 24px " + fontStack;
    const totalValueFont = "bold 24px " + fontStack;

    const trimmedProject = projectName?.trim() || "";

    ctx.font = projectFont;
    let projectLines: string[] = [];
    if (trimmedProject) {
      projectLines = wrapText(ctx, trimmedProject, width - 2 * padding);
    }

    const { enabled, value, useDiscount } = parameterConfig;
    const { COST_DETAILS } = UI_TEXT;

    interface RowItem {
      type: 'row' | 'divider';
      label?: string;
      value?: string;
    }

    const items: RowItem[] = [];

    if (enabled.pricePerKg) {
      items.push({ type: 'row', label: COST_DETAILS.MATERIAL_COST, value: formatCurrencyText(costs.materialCost) });
    }
    if (enabled.pricePerHour) {
      items.push({ type: 'row', label: COST_DETAILS.TIME_COST, value: formatCurrencyText(costs.printTimeCost) });
    }
    if (enabled.electricityConsumption && enabled.electricityPrice) {
      items.push({ type: 'row', label: COST_DETAILS.ELECTRICITY_COST, value: formatCurrencyText(costs.electricityCost) });
    }
    if (enabled.flatWorkFee) {
      items.push({ type: 'row', label: COST_DETAILS.WORK_FEE, value: formatCurrencyText(costs.flatWorkFee) });
    }

    items.push({ type: 'divider' });
    items.push({ type: 'row', label: COST_DETAILS.SUBTOTAL, value: formatCurrencyText(costs.subtotal) });

    if (enabled.markup) {
      const markupLabel = useDiscount
        ? COST_DETAILS.DISCOUNT_LABEL(value.markup)
        : COST_DETAILS.MARKUP_LABEL(value.markup);
      const prefix = useDiscount && costs.markupAmount > 0 ? "-" : "";
      items.push({ type: 'row', label: markupLabel, value: prefix + formatCurrencyText(costs.markupAmount) });
    }

    const totalLabel = COST_DETAILS.TOTAL;
    const totalValue = formatCurrencyText(costs.total);

    const projectLinesHeight = projectLines.length > 0
      ? projectLines.length * 28 + gap
      : 0;

    let contentHeight = 0;
    items.forEach(item => {
      if (item.type === 'divider') contentHeight += 16;
      else contentHeight += 32;
    });

    const totalBoxHeight = 58;
    const totalGap = 16;

    const canvasHeight = padding + projectLinesHeight + contentHeight + totalGap + totalBoxHeight + padding;

    canvas.width = width * 2;
    canvas.height = canvasHeight * 2;
    ctx.scale(2, 2);
    ctx.imageSmoothingEnabled = true;

    ctx.beginPath();
    ctx.roundRect(0, 0, width, canvasHeight, 14);
    ctx.fillStyle = "#141414";
    ctx.fill();

    ctx.strokeStyle = "#222222";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    let y = padding;

    if (projectLines.length > 0) {
      ctx.font = projectFont;
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      projectLines.forEach(line => {
        ctx.fillText(line, width / 2, y);
        y += 28;
      });
      y += gap;
    }

    items.forEach(item => {
      if (item.type === 'divider') {
        ctx.strokeStyle = "#222222";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, y + 8);
        ctx.lineTo(width - padding, y + 8);
        ctx.stroke();
        y += 16;
      } else if (item.type === 'row') {
        const textY = y + 16;

        ctx.font = rowLabelFont;
        ctx.fillStyle = "#eaeaea";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(item.label || "", padding, textY);

        ctx.font = rowValueFont;
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "right";
        ctx.fillText(item.value || "", width - padding, textY);

        y += 32;
      }
    });

    y += totalGap;

    ctx.beginPath();
    ctx.roundRect(padding, y, width - 2 * padding, totalBoxHeight, 8);
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    ctx.fill();
    ctx.strokeStyle = "#222222";
    ctx.lineWidth = 1;
    ctx.stroke();

    const totalCenterY = y + totalBoxHeight / 2;

    ctx.font = totalLabelFont;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(totalLabel, padding + 16, totalCenterY);

    ctx.font = totalValueFont;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "right";
    ctx.fillText(totalValue, width - padding - 16, totalCenterY);

    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/png");
  });
}

export function CostCard({
  costs,
  parameterConfig,
  projectName,
  UI_TEXT,
}: CostCardProps) {
  const { enabled, value, useDiscount } = parameterConfig;
  const { COST_DETAILS } = UI_TEXT;

  const [copyState, setCopyState] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveState, setSaveState] = useState<'idle' | 'success'>('idle');

  const handleCopyImage = async () => {
    try {
      const blob = await generateCardImageBlob(projectName, costs, parameterConfig, UI_TEXT);
      if (!blob) throw new Error("Could not generate image");

      if (typeof ClipboardItem !== "undefined") {
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob
          })
        ]);
        setCopyState('success');
        setTimeout(() => setCopyState('idle'), 2000);
      } else {
        throw new Error("ClipboardItem not supported in this browser");
      }
    } catch (error) {
      console.error("Clipboard copy failed", error);
      setCopyState('error');
      setTimeout(() => setCopyState('idle'), 2000);
    }
  };

  const handleSaveImage = async () => {
    try {
      const blob = await generateCardImageBlob(projectName, costs, parameterConfig, UI_TEXT);
      if (!blob) throw new Error("Could not generate image");

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeProjectName = projectName?.trim()
        ? projectName.trim().replace(/[^a-zA-Z0-9_-]/g, "_")
        : "slicecost_estimate";
      a.download = `${safeProjectName}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSaveState('success');
      setTimeout(() => setSaveState('idle'), 2000);
    } catch (error) {
      console.error("Save image failed", error);
    }
  };

  return (
    <div className="rounded-lg p-6 bg-[var(--bg1)] border border-[var(--border-subtle)]">
      <div className="mb-4">
        <h2
          className="text-xl font-semibold flex items-center gap-2"
          style={textColor}
        >
          <DollarSign className="w-5 h-5 text-[var(--accent)]" />
          {COST_DETAILS.TITLE}
        </h2>

        {!!projectName?.trim() && (
          <div className="my-4 px-2 text-center">
            <p
              className="text-2xl font-extrabold leading-snug break-words"
              style={{ color: "var(--text)", overflowWrap: "anywhere" }}
            >
              {projectName}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2 text-sm bg-[var(--bg1)] p-4 rounded border border-[var(--border-subtle)]">
        {enabled.pricePerKg && (
          <CostRow
            label={COST_DETAILS.MATERIAL_COST}
            value={formatCurrency(costs.materialCost)}
          />
        )}

        {enabled.pricePerHour && (
          <CostRow
            label={COST_DETAILS.TIME_COST}
            value={formatCurrency(costs.printTimeCost)}
          />
        )}

        {enabled.electricityConsumption && enabled.electricityPrice && (
          <CostRow
            label={COST_DETAILS.ELECTRICITY_COST}
            value={formatCurrency(costs.electricityCost)}
          />
        )}

        {enabled.flatWorkFee && (
          <CostRow
            label={COST_DETAILS.WORK_FEE}
            value={formatCurrency(costs.flatWorkFee)}
          />
        )}

        <hr className="border-[var(--border-subtle)]" />

        <CostRow
          label={COST_DETAILS.SUBTOTAL}
          value={formatCurrency(costs.subtotal)}
        />

        {enabled.markup && (
          <CostRow
            label={
              useDiscount
                ? COST_DETAILS.DISCOUNT_LABEL(value.markup)
                : COST_DETAILS.MARKUP_LABEL(value.markup)
            }
            value={
              <>
                {useDiscount && costs.markupAmount > 0 && "-"}
                {formatCurrency(costs.markupAmount)}
              </>
            }
          />
        )}

        <hr className="border-[var(--border-subtle)]" />

        <TotalCostRow
          label={COST_DETAILS.TOTAL}
          value={formatCurrency(costs.total)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <button
          onClick={handleCopyImage}
          disabled={costs.total === 0}
          className="flex items-center justify-center gap-2 py-2 px-3 text-sm font-semibold rounded-lg transition-all duration-200"
          style={{
            backgroundColor: copyState === 'success' ? '#16a34a' : 'var(--btn-bg)',
            color: '#ffffff',
            borderColor: copyState === 'success' ? '#16a34a' : copyState === 'error' ? '#dc2626' : 'var(--dark-border)',
            borderWidth: '1.5px',
            borderStyle: 'solid',
            opacity: costs.total === 0 ? 0.5 : 1,
            cursor: costs.total === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          <Copy className="w-4 h-4" />
          {copyState === 'success'
            ? COST_DETAILS.COPY_SUCCESS
            : copyState === 'error'
              ? COST_DETAILS.COPY_ERROR
              : COST_DETAILS.COPY_IMAGE}
        </button>

        <button
          onClick={handleSaveImage}
          disabled={costs.total === 0}
          className="flex items-center justify-center gap-2 py-2 px-3 text-sm font-semibold rounded-lg transition-all duration-200"
          style={{
            backgroundColor: saveState === 'success' ? '#16a34a' : 'var(--btn-bg)',
            color: '#ffffff',
            borderColor: saveState === 'success' ? '#16a34a' : 'var(--dark-border)',
            borderWidth: '1.5px',
            borderStyle: 'solid',
            opacity: costs.total === 0 ? 0.5 : 1,
            cursor: costs.total === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          <Download className="w-4 h-4" />
          {saveState === 'success'
            ? COST_DETAILS.SAVE_SUCCESS
            : COST_DETAILS.SAVE_IMAGE}
        </button>
      </div>
    </div>
  );
}

export default CostCard;

