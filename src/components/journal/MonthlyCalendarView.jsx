import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flag } from 'lucide-react';

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  // 0 = Sunday
  return new Date(year, month - 1, 1).getDay();
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function MonthlyCalendarView({ year, month, entries }) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Build a map: day number -> array of entries
  const dayMap = useMemo(() => {
    const map = {};
    entries.forEach(e => {
      const d = new Date(e.entry_date + 'T00:00:00');
      const day = d.getDate();
      if (!map[day]) map[day] = [];
      map[day].push(e);
    });
    return map;
  }, [entries]);

  const cells = [];
  // empty leading cells
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const dayEntries = dayMap[day] || [];
          const hasEntries = dayEntries.length > 0;

          // Determine flag: if any analyzed entry exists, use majority
          const scored = dayEntries.filter(e => e.flag);
          const greens = scored.filter(e => e.flag === 'green').length;
          const reds = scored.filter(e => e.flag === 'red').length;
          const flag = scored.length > 0 ? (greens >= reds ? 'green' : 'red') : null;

          const today = new Date();
          const isToday = today.getFullYear() === year && (today.getMonth() + 1) === month && today.getDate() === day;

          return (
            <motion.div
              key={day}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: day * 0.01 }}
              className={`
                aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 text-xs font-medium
                ${isToday ? 'ring-2 ring-primary bg-primary/10' : 'bg-muted/30'}
                ${hasEntries ? 'cursor-default' : 'opacity-60'}
              `}
            >
              <span className={isToday ? 'text-primary font-bold' : ''}>{day}</span>
              {flag && (
                <Flag
                   className={`w-2.5 h-2.5 ${flag === 'green' ? 'text-emerald-400' : 'text-red-400'}`}
                   style={{ fill: 'currentColor' }}
                 />
              )}
              {hasEntries && !flag && (
                <div className="w-1 h-1 rounded-full bg-primary/60" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}