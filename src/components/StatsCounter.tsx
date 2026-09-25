import React, { useEffect, useRef, useState } from 'react';

interface StatProps {
  icon: string;
  metricNumber: string;
  targetValue: number;
  label: string;
  description: string;
  delayMs?: number;
}

const StatItem: React.FC<StatProps> = ({
  icon,
  metricNumber,
  targetValue,
  label,
  description,
  delayMs = 0,
}) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);

            setTimeout(() => {
              const duration = 1800;
              const start = performance.now();

              const animate = (time: number) => {
                const elapsed = time - start;
                const progress = Math.min(elapsed / duration, 1);
                // Ease-out cubic
                const ease = 1 - Math.pow(1 - progress, 3);
                setCount(Math.floor(ease * targetValue));

                if (progress < 1) {
                  requestAnimationFrame(animate);
                } else {
                  setCount(targetValue);
                }
              };
              requestAnimationFrame(animate);
            }, delayMs);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated, targetValue, delayMs]);

  return (
    <div
      ref={containerRef}
      className="glass-liquid-card rounded-[24px] p-7 sm:p-8 flex flex-col justify-between cursor-default transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-8">
        <span className="w-10 h-10 rounded-2xl bg-[#5231FF]/10 text-[#5231FF] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-[#5231FF] group-hover:text-white">
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
        </span>
        <span className="font-spacemono text-[11px] text-[#6B6B74] tracking-wider uppercase">
          {metricNumber}
        </span>
      </div>

      <div>
        <div className="font-clash font-bold text-4xl sm:text-5xl text-[#5231FF] mb-2 leading-none flex items-center">
          <span>{count}</span>
          <span>+</span>
        </div>
        <div className="font-spacemono uppercase tracking-wider text-xs font-bold text-[#111114]">
          {label}
        </div>
        <p className="font-general text-xs text-[#6B6B74] mt-2 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export const StatsCounterGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
      <StatItem
        icon="calendar_month"
        metricNumber="METRIC // 01"
        targetValue={50}
        label="Events Hosted"
        description="Workshops, hackathons, ideathons & masterclasses."
        delayMs={0}
      />
      <StatItem
        icon="groups"
        metricNumber="METRIC // 02"
        targetValue={500}
        label="Students Engaged"
        description="Active participants across multidisciplinary cohorts."
        delayMs={120}
      />
      <StatItem
        icon="lightbulb"
        metricNumber="METRIC // 03"
        targetValue={10}
        label="Startups Incubated"
        description="Student prototypes transitioned into registered ventures."
        delayMs={240}
      />
      <StatItem
        icon="domain_add"
        metricNumber="METRIC // 04"
        targetValue={15}
        label="Industry Partners"
        description="MoUs with venture hubs, accelerators & tech companies."
        delayMs={360}
      />
    </div>
  );
};
