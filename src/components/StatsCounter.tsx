import React, { useEffect, useRef, useState } from 'react';
import { SiteStats } from '../types';

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
    if (hasAnimated) {
      setCount(targetValue);
      return;
    }

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
      className="optimus-card rounded-[2px] p-6 sm:p-7 flex flex-col justify-between cursor-default transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-6">
        <span className="w-8 h-8 rounded-[2px] border border-[#e5e5e5] bg-[#fafaf9] text-[#000000] flex items-center justify-center">
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        </span>
        <span className="font-spacemono text-[10px] text-[#888888] tracking-widest uppercase">
          {metricNumber}
        </span>
      </div>

      <div>
        <div className="font-instrument text-4xl sm:text-5xl text-[#000000] font-normal mb-2 leading-none flex items-center tracking-tight">
          <span>{count}</span>
          <span className="text-[#888888]">+</span>
        </div>
        <div className="font-instrument text-xs uppercase tracking-wider font-medium text-[#000000]">
          {label}
        </div>
        <p className="font-instrument text-xs text-[#666666] mt-2 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

interface StatsCounterGridProps {
  stats?: SiteStats;
}

export const StatsCounterGrid: React.FC<StatsCounterGridProps> = ({ stats }) => {
  const eventsVal = stats?.eventsHosted ?? 50;
  const studentsVal = stats?.studentsEngaged ?? 500;
  const startupsVal = stats?.startupsIncubated ?? 10;
  const partnersVal = stats?.industryPartners ?? 15;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      <StatItem
        icon="calendar_month"
        metricNumber="METRIC // 01"
        targetValue={eventsVal}
        label="Events Hosted"
        description="Workshops, hackathons, ideathons & masterclasses."
        delayMs={0}
      />
      <StatItem
        icon="groups"
        metricNumber="METRIC // 02"
        targetValue={studentsVal}
        label="Students Engaged"
        description="Active participants across multidisciplinary cohorts."
        delayMs={120}
      />
      <StatItem
        icon="lightbulb"
        metricNumber="METRIC // 03"
        targetValue={startupsVal}
        label="Startups Incubated"
        description="Student prototypes transitioned into registered ventures."
        delayMs={240}
      />
      <StatItem
        icon="domain_add"
        metricNumber="METRIC // 04"
        targetValue={partnersVal}
        label="Industry Partners"
        description="MoUs with venture hubs, accelerators & tech companies."
        delayMs={360}
      />
    </div>
  );
};
