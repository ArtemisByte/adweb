export function Stepper({ steps, activeIndex }: { steps: string[]; activeIndex: number }) {
  return (
    <div className="stepper" aria-label="Steps">
      {steps.map((s, i) => {
        const cls = i === activeIndex ? "step active" : i < activeIndex ? "step done" : "step";
        return (
          <div key={s} className={cls}>
            {i + 1}. {s}
          </div>
        );
      })}
    </div>
  );
}
