import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { formatPeso } from '../lib/format';
import { useAppStore } from '../store/useAppStore';
import { getBillStatus, getBillRemaining, computeDecision } from '../lib/engines/decisionEngine';

const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const PRIORITY_COLORS = {
  CRITICAL:  '#C0392B',
  IMPORTANT: '#D4920A',
  FLEXIBLE:  '#2471A3',
};

function getDaysInMonth(year, month)  { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year, month) { return new Date(year, month, 1).getDay(); }

function getStressLevel(events) {
  const total = events.reduce((s, e) => s + e.amount, 0);
  if (total > 80000) return 'CRITICAL';
  if (total > 30000) return 'IMPORTANT';
  if (total > 0)     return 'FLEXIBLE';
  return null;
}

export default function Calendar() {
  const today = new Date();
  const [year, setYear]           = useState(today.getFullYear());
  const [month, setMonth]         = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);

  const state    = useAppStore();
  const decision = computeDecision(state);

  // Build calendar events from unpaid bills
  const calendarEvents = useMemo(() => {
    return state.bills
      .filter(b => getBillStatus(b) !== 'PAID')
      .map(b => ({
        date:     b.dueDate,
        label:    b.name,
        amount:   getBillRemaining(b),
        type:     b.priority,
        business: b.business,
      }));
  }, [state.bills]);

  const getEventsForDate = (dateStr) => calendarEvents.filter(e => e.date === dateStr);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay    = getFirstDayOfMonth(year, month);
  const cells       = Array.from({ length: firstDay + daysInMonth }, (_, i) => i < firstDay ? null : i - firstDay + 1);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const selectedDateStr = selectedDate
    ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`
    : null;
  const selectedEvents = selectedDateStr ? getEventsForDate(selectedDateStr) : [];

  const upcoming = useMemo(() => {
    return calendarEvents
      .filter(e => new Date(e.date + 'T00:00:00') >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [calendarEvents]);

  // Show stress alert when upcoming 30-day obligations exist and health is not SAFE
  const showStressAlert = decision.status !== 'SAFE' && decision.upcoming30 > 0;

  return (
    <div style={{ background: 'var(--color-cream)' }}>
      <PageHeader title="Cash Plan" subtitle="Upcoming obligations" />

      {/* Calendar */}
      <div className="px-4 mb-4">
        <div className="card overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3" style={{ borderBottom: '1px solid var(--color-ink-faint)' }}>
            <motion.button whileTap={{ scale: 0.88 }} onClick={prevMonth} className="tap w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.05)' }}>
              <ChevronLeft size={17} strokeWidth={2} />
            </motion.button>
            <span className="font-bold text-base" style={{ color: 'var(--color-ink)' }}>
              {MONTHS[month]} {year}
            </span>
            <motion.button whileTap={{ scale: 0.88 }} onClick={nextMonth} className="tap w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.05)' }}>
              <ChevronRight size={17} strokeWidth={2} />
            </motion.button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 px-2 pt-3 pb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[11px] font-semibold" style={{ color: 'var(--color-ink-quaternary)' }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-0 px-2 pb-3">
            {cells.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} />;

              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const events  = getEventsForDate(dateStr);
              const stress  = getStressLevel(events);
              const isToday    = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const isSelected = day === selectedDate;

              return (
                <motion.button
                  key={day}
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setSelectedDate(isSelected ? null : day)}
                  className="tap relative flex flex-col items-center gap-0.5 py-2 rounded-2xl"
                  style={{
                    background: isSelected ? 'var(--color-forest)' : isToday ? 'var(--color-forest-pale)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  <span className="text-sm font-semibold" style={{ color: isSelected ? 'white' : isToday ? 'var(--color-forest)' : 'var(--color-ink)' }}>
                    {day}
                  </span>
                  {stress && (
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: isSelected ? 'white' : PRIORITY_COLORS[stress], opacity: isSelected ? 0.7 : 1 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Selected date events */}
          {selectedEvents.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
              style={{ borderTop: '1px solid var(--color-ink-faint)' }}
            >
              <div className="px-4 py-3 space-y-2">
                <p className="label-caps mb-2">
                  {MONTHS[month]} {selectedDate} Obligations
                </p>
                {selectedEvents.map((e, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PRIORITY_COLORS[e.type] }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>{e.label}</span>
                      <span className="text-xs" style={{ color: 'var(--color-ink-quaternary)' }}>{e.business}</span>
                    </div>
                    <span className="font-bold text-sm tabular" style={{ color: 'var(--color-ruby-light)' }}>
                      {formatPeso(e.amount)}
                    </span>
                  </div>
                ))}
                <div className="pt-2 flex items-center justify-between" style={{ borderTop: '1px solid var(--color-ink-faint)' }}>
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-ink-secondary)' }}>Total</span>
                  <span className="font-bold text-base tabular" style={{ color: 'var(--color-ruby-light)' }}>
                    {formatPeso(selectedEvents.reduce((s, e) => s + e.amount, 0))}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Upcoming important dates */}
      <div className="px-4">
        <p className="label-caps mb-3">Upcoming Obligations</p>

        {upcoming.length === 0 ? (
          <div className="card p-6 text-center mb-3">
            <p className="text-3xl mb-2">&#x2705;</p>
            <p className="text-sm font-medium" style={{ color: 'var(--color-ink-quaternary)' }}>
              No upcoming unpaid obligations.
            </p>
          </div>
        ) : (
          <div className="card overflow-hidden mb-3">
            {upcoming.map((event, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3"
                style={i < upcoming.length - 1 ? { borderBottom: '1px solid var(--color-ink-faint)' } : {}}
              >
                <div className="flex-shrink-0 text-center">
                  <div
                    className="w-10 h-10 rounded-2xl flex flex-col items-center justify-center"
                    style={{ background: PRIORITY_COLORS[event.type] + '15' }}
                  >
                    <span className="text-[10px] font-bold" style={{ color: PRIORITY_COLORS[event.type], lineHeight: 1 }}>
                      {new Date(event.date + 'T00:00:00').toLocaleDateString('en', { month: 'short' }).toUpperCase()}
                    </span>
                    <span className="text-sm font-bold" style={{ color: PRIORITY_COLORS[event.type], lineHeight: 1.2 }}>
                      {new Date(event.date + 'T00:00:00').getDate()}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-ink)' }}>{event.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-ink-quaternary)' }}>{event.business}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm tabular" style={{ color: 'var(--color-ruby-light)' }}>
                    {formatPeso(event.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cash stress warning — only shown when health is not SAFE */}
        {showStressAlert && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-3 p-4 rounded-2xl flex items-start gap-3"
            style={{ background: 'var(--color-amber-pale)', border: '1px solid rgba(212,146,10,0.2)' }}
          >
            <AlertTriangle size={18} strokeWidth={2} style={{ color: 'var(--color-amber)', flexShrink: 0, marginTop: 1 }} />
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--color-amber)' }}>Cash Stress Alert</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-amber)' }}>
                {formatPeso(decision.upcoming30)} due in 30 days vs {formatPeso(decision.realCash)} real cash on hand.
                Consider early collection or fund transfer.
              </p>
            </div>
          </motion.div>
        )}

        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}
