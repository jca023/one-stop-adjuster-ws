import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, ExternalLink, Video as VideoIcon, Play, Clock, MapPin, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { TrainingEvent } from '../lib/supabase';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const EVENT_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  webinar:     { bg: 'var(--color-surf)',    text: 'var(--color-pearl)' },
  'in-person': { bg: 'var(--color-gold)',    text: 'var(--color-abyss)' },
  workshop:    { bg: 'var(--color-success)', text: 'var(--color-abyss)' },
  deadline:    { bg: '#ef4444',              text: 'white' },
};

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(time: string | null): string {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${pad(m)} ${ampm}`;
}

export default function TrainingCalendar(): React.JSX.Element {
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [events, setEvents] = useState<TrainingEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const detailPanelRef = useRef<HTMLDivElement>(null);

  const todayKey = useMemo(() => {
    const now = new Date();
    return toDateKey(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  // Fetch events for current month
  useEffect(() => {
    async function fetchEvents(): Promise<void> {
      setLoading(true);
      const startDate = toDateKey(viewYear, viewMonth, 1);
      const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
      const endDate = toDateKey(viewYear, viewMonth, daysInMonth);

      const { data } = await supabase
        .from('training_events')
        .select('*')
        .eq('status', 'published')
        .gte('event_date', startDate)
        .lte('event_date', endDate)
        .order('event_date', { ascending: true });

      if (data) setEvents(data as TrainingEvent[]);
      setLoading(false);
    }
    fetchEvents();
  }, [viewYear, viewMonth]);

  // Build event lookup by date
  const eventsByDate = useMemo(() => {
    const map: Record<string, TrainingEvent[]> = {};
    for (const ev of events) {
      if (!map[ev.event_date]) map[ev.event_date] = [];
      map[ev.event_date].push(ev);
    }
    return map;
  }, [events]);

  // Calendar grid data
  const { firstDayOffset, daysInMonth } = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const days = new Date(viewYear, viewMonth + 1, 0).getDate();
    return { firstDayOffset: firstDay, daysInMonth: days };
  }, [viewYear, viewMonth]);

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  function goToPrevMonth(): void {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
    setSelectedDate(null);
  }

  function goToNextMonth(): void {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
    setSelectedDate(null);
  }

  function handleDateClick(day: number): void {
    const key = toDateKey(viewYear, viewMonth, day);
    const newSelection = selectedDate === key ? null : key;
    setSelectedDate(newSelection);
    if (newSelection) {
      // Scroll detail panel into view after React renders it
      setTimeout(() => {
        detailPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 350);
    }
  }

  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] || []) : [];

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Month header */}
      <div className="bg-gradient-to-r from-[var(--color-deep)] to-[var(--color-ocean)] px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={goToPrevMonth}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[var(--color-foam)]" />
          </button>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5 text-[var(--color-gold)]" />
              <h3 className="text-xl font-bold">{monthLabel}</h3>
            </div>
            <p className="text-sm text-[var(--color-mist)]">Training & Webinar Schedule</p>
          </div>

          <button
            onClick={goToNextMonth}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-[var(--color-foam)]" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-[var(--color-ocean)]/30">
        {WEEKDAYS.map((day, idx) => (
          <div
            key={day}
            className={`py-2 text-center text-xs font-medium text-[var(--color-wave)] ${idx < 6 ? 'border-r border-[var(--color-ocean)]/20' : ''}`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {/* Empty cells for offset */}
        {Array.from({ length: firstDayOffset }, (_, i) => (
          <div key={`empty-${i}`} className="min-h-[5.5rem] border-b border-r border-[var(--color-ocean)]/25" />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dateKey = toDateKey(viewYear, viewMonth, day);
          const isToday = dateKey === todayKey;
          const isSelected = dateKey === selectedDate;
          const dayEvents = eventsByDate[dateKey] || [];

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              className={`
                relative min-h-[5.5rem] flex flex-col items-start p-1.5
                border-b border-r border-[var(--color-ocean)]/25
                transition-colors text-left
                ${isSelected
                  ? 'bg-[var(--color-gold)]/20'
                  : 'hover:bg-[var(--color-ocean)]/15'}
              `}
            >
              <span
                className={`
                  w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold mb-0.5 shrink-0
                  ${isToday && !isSelected
                    ? 'ring-2 ring-[var(--color-gold)] text-[var(--color-gold)]'
                    : ''}
                  ${isSelected
                    ? 'bg-[var(--color-gold)] text-[var(--color-abyss)]'
                    : ''}
                `}
              >
                {day}
              </span>
              {dayEvents.length > 0 && (
                <div className="w-full space-y-0.5 overflow-hidden">
                  {dayEvents.slice(0, 2).map((ev) => {
                    const typeColor = EVENT_TYPE_COLORS[ev.event_type] || EVENT_TYPE_COLORS.webinar;
                    return (
                      <div
                        key={ev.id}
                        className="text-[10px] leading-tight font-medium px-1.5 py-0.5 rounded truncate"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${typeColor.bg} 25%, transparent)`,
                          color: typeColor.bg,
                        }}
                      >
                        {ev.title}
                      </div>
                    );
                  })}
                  {dayEvents.length > 2 && (
                    <span className="text-[9px] text-[var(--color-wave)] px-1">
                      +{dayEvents.length - 2} more
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Event count + today indicator */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--color-ocean)]/20 text-sm text-[var(--color-mist)]">
        <span>
          {loading ? 'Loading...' : `${events.length} event${events.length !== 1 ? 's' : ''} this month`}
        </span>
        <button
          onClick={() => {
            const now = new Date();
            setViewYear(now.getFullYear());
            setViewMonth(now.getMonth());
            setSelectedDate(todayKey);
          }}
          className="text-[var(--color-surf)] hover:text-[var(--color-gold)] transition-colors text-sm"
        >
          Today
        </button>
      </div>

      {/* Event detail panel */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            ref={detailPanelRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-4 border-t border-[var(--color-ocean)]/30">
              <h4 className="text-sm font-semibold text-[var(--color-gold)] mb-4 tracking-wide uppercase">
                {formatDate(selectedDate)}
              </h4>

              {selectedEvents.length > 0 ? (
                <div className="space-y-4">
                  {selectedEvents.map((ev) => {
                    const typeColor = EVENT_TYPE_COLORS[ev.event_type] || EVENT_TYPE_COLORS.webinar;
                    const isPast = ev.event_date < todayKey;
                    const hasRecording = !!ev.recording_url;
                    return (
                      <div
                        key={ev.id}
                        className="rounded-xl p-4 space-y-3 border transition-colors"
                        style={{
                          borderColor: `color-mix(in srgb, ${typeColor.bg} 40%, transparent)`,
                          backgroundColor: `color-mix(in srgb, ${typeColor.bg} 5%, transparent)`,
                          boxShadow: `0 0 12px color-mix(in srgb, ${typeColor.bg} 8%, transparent)`,
                        }}
                      >
                        {/* Top row: badge + title + action */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <span
                              className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-2 uppercase tracking-wider"
                              style={{
                                backgroundColor: `color-mix(in srgb, ${typeColor.bg} 20%, transparent)`,
                                color: typeColor.bg,
                                border: `1px solid color-mix(in srgb, ${typeColor.bg} 30%, transparent)`,
                              }}
                            >
                              {ev.event_type}
                            </span>
                            <h5 className="font-bold text-base">{ev.title}</h5>
                          </div>
                          {isPast && hasRecording ? (
                            <a
                              href={ev.recording_url!}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all hover:scale-105"
                              style={{
                                backgroundColor: `color-mix(in srgb, var(--color-gold) 20%, transparent)`,
                                color: 'var(--color-gold)',
                                border: '1px solid color-mix(in srgb, var(--color-gold) 35%, transparent)',
                              }}
                            >
                              <Play className="w-3.5 h-3.5" />
                              Watch Recording
                            </a>
                          ) : !isPast && ev.url ? (
                            <a
                              href={ev.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all hover:scale-105"
                              style={{
                                backgroundColor: `color-mix(in srgb, var(--color-surf) 20%, transparent)`,
                                color: 'var(--color-surf)',
                                border: '1px solid color-mix(in srgb, var(--color-surf) 35%, transparent)',
                              }}
                            >
                              <VideoIcon className="w-3.5 h-3.5" />
                              Join
                            </a>
                          ) : null}
                        </div>

                        {/* Meta row: time + location-type hint */}
                        <div className="flex items-center gap-4 text-sm text-[var(--color-mist)]">
                          {(ev.start_time || ev.end_time) && (
                            <span className="inline-flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-[var(--color-wave)]" />
                              {formatTime(ev.start_time)}
                              {ev.start_time && ev.end_time && ' \u2013 '}
                              {formatTime(ev.end_time)}
                            </span>
                          )}
                          {ev.event_type === 'in-person' && (
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-[var(--color-wave)]" />
                              In Person
                            </span>
                          )}
                        </div>

                        {ev.description && (
                          <p className="text-sm text-[var(--color-mist)] leading-relaxed">{ev.description}</p>
                        )}

                        {ev.fee > 0 && (
                          <div className="flex items-center gap-3 pt-1 border-t border-[var(--color-ocean)]/15">
                            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-success)] pt-2">
                              <DollarSign className="w-3.5 h-3.5" />
                              {Number(ev.fee).toFixed(2)}
                            </span>
                            {ev.venmo_qr_url && (
                              <a
                                href={ev.venmo_qr_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[var(--color-surf)] hover:underline flex items-center gap-1 pt-2"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Pay via Venmo
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-[var(--color-wave)] italic">
                  No events scheduled for this date.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
