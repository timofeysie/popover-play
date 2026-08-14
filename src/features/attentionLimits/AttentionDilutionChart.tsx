interface DilutionRow {
  tokens: number;
}

const ROWS: DilutionRow[] = [{ tokens: 4 }, { tokens: 16 }, { tokens: 64 }];

const VIEW_WIDTH = 400;
const BAR_WIDTH = 380;
const BAR_X = (VIEW_WIDTH - BAR_WIDTH) / 2;
const BAR_HEIGHT = 22;
const ROW_GAP = 40;
const LABEL_HEIGHT = 16;
const SEGMENT_GAP = 2;

const VIEW_HEIGHT = ROWS.length * (LABEL_HEIGHT + BAR_HEIGHT + ROW_GAP) - ROW_GAP + 8;

const shareLabel = (tokens: number) => {
  const share = 100 / tokens;
  return share >= 10 ? `${share.toFixed(0)}%` : `${share.toFixed(1)}%`;
};

export function AttentionDilutionChart() {
  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="w-full h-auto"
        role="img"
        aria-label="Three horizontal bars, each the full attention budget split evenly across a different token count: 4 tokens at 25% attention each, 16 tokens at about 6% each, and 64 tokens at about 2% each. The more tokens share the fixed budget, the thinner each token's slice."
      >
        {ROWS.map((row, rowIndex) => {
          const rowTop = rowIndex * (LABEL_HEIGHT + BAR_HEIGHT + ROW_GAP);
          const barTop = rowTop + LABEL_HEIGHT;
          const segmentWidth = (BAR_WIDTH - (row.tokens - 1) * SEGMENT_GAP) / row.tokens;

          return (
            <g key={row.tokens}>
              <text
                x={BAR_X}
                y={rowTop + 11}
                className="fill-muted-foreground text-[10px] font-mono"
              >
                {row.tokens} tokens
              </text>
              <text
                x={BAR_X + BAR_WIDTH}
                y={rowTop + 11}
                textAnchor="end"
                className="fill-foreground text-[10px] font-mono font-semibold"
              >
                {shareLabel(row.tokens)} attention each
              </text>

              {Array.from({ length: row.tokens }, (_, i) => (
                <rect
                  key={i}
                  x={BAR_X + i * (segmentWidth + SEGMENT_GAP)}
                  y={barTop}
                  width={segmentWidth}
                  height={BAR_HEIGHT}
                  className="fill-primary"
                />
              ))}
            </g>
          );
        })}
      </svg>

      <details className="mt-2">
        <summary className="text-[11px] text-muted-foreground cursor-pointer select-none hover:text-foreground">
          View chart data
        </summary>
        <table className="mt-2 w-full text-[11px] font-mono">
          <thead>
            <tr className="text-muted-foreground">
              <th className="text-left font-normal pr-4 pb-1">Tokens sharing the budget</th>
              <th className="text-left font-normal pb-1">Attention share each</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.tokens} className="text-foreground/90">
                <td className="pr-4 py-0.5">{row.tokens}</td>
                <td className="py-0.5">{shareLabel(row.tokens)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      <p className="mt-2 text-[11px] text-muted-foreground italic">
        Illustrative — softmax attention weights always sum to 100%; this shows an
        even split for clarity. Real attention isn't distributed evenly (see
        Attention Sinks and Lost in the Middle), but the shrinking total budget as
        tokens are added is the structural point.
      </p>
    </div>
  );
}
