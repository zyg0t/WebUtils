
export async function readGcodeMetadata(
  file: File,
): Promise<{ filamentUsed: number; printTime: string }> {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let filamentUsed = 0;
        let printTime = "";

        const lines = content.split("\n").reverse();

        for (const line of lines) {
          const filamentMatch = line.match(
            /;\s*filament used\s*\[g\]\s*=\s*([\d.]+)/,
          );
          if (filamentMatch) {
            filamentUsed = parseFloat(filamentMatch[1]);
          }

          const timeMatch = line.match(
            /;\s*estimated printing time \(normal mode\)\s*=\s*(?:(\d+)d\s*)?(?:(\d+)h\s*)?(?:(\d+)m\s*)?(?:(\d+)s)?/,
          );

          if (timeMatch) {
            const days = parseInt(timeMatch[1] || "0", 10);
            const hours = parseInt(timeMatch[2] || "0", 10);
            const minutes = parseInt(timeMatch[3] || "0", 10);
            const seconds = parseInt(timeMatch[4] || "0", 10);

            const totalHours = days * 24 + hours;
            printTime = `${totalHours}h ${minutes}m ${seconds}s`;
          }

          if (filamentUsed && printTime) break;
        }

        if (filamentUsed > 0 && printTime) {
          resolve({ filamentUsed, printTime });
        } else {
          reject(new Error("Missing metadata"));
        }
      } catch (error) {
        if (error instanceof Error) {
          reject(new Error(error.message));
        } else {
          reject(new Error("An unknown error occurred"));
        }
      }
    };

    reader.onerror = () => reject(new Error("Error reading file"));
    reader.readAsText(file);
  });
}
