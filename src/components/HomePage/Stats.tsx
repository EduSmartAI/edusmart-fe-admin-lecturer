// src/components/Stats.tsx
import React from "react";

interface StatItem {
  value: string;
  label: string;
  colorClass: string;
}

const stats: StatItem[] = [
  { value: "15K+", label: "Students", colorClass: "text-blue-500" },
  { value: "75%", label: "Total success", colorClass: "text-blue-400" },
  { value: "35", label: "Main questions", colorClass: "text-blue-500" },
  { value: "26", label: "Chief experts", colorClass: "text-blue-400" },
  { value: "16", label: "Years of experience", colorClass: "text-blue-500" },
];

const Stats: React.FC = () => (
  <section className="pt-12 bg-white dark:bg-gray-900">
    {/* Header */}
    <div className="max-w-3xl mx-auto text-center px-4">
      <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white pb-12">
        Thành công của chúng tôi
      </div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">
        Ornare id fames interdum porttitor nulla turpis etiam. Diam vitae
        sollicitudin at nec nam et pharetra gravida. Adipiscing a quis ultrices
        eu ornare tristique vel nisl orci.
      </p>
    </div>

    {/* Stats grid */}
    <div className="mt-12 max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 text-center">
      {stats.map((item, idx) => (
        <div key={idx}>
          <span
            className={`text-4xl md:text-5xl font-extrabold ${item.colorClass}`}
          >
            {item.value}
          </span>
          <p className="mt-2 text-gray-800 dark:text-gray-200">{item.label}</p>
        </div>
      ))}
    </div>
  </section>
);

export default Stats;
