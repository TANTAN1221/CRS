// =====================================================================
// CIVIL REGISTRY PORTAL - INTERACTIVE VISUAL APPOINTMENT CALENDAR
// Displays a real-time monthly calendar grid with per-day slot availability
// badges (Available, Filling Fast, Full, Closed) for Citizens and Admins.
// =====================================================================

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Check } from 'lucide-react';
import { usePortal } from '../context/PortalContext';

const WEEKDAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function formatYMD(year, monthIndex, day) {
  const m = String(monthIndex + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export default function VisualAppointmentCalendar({
  selectedDate,
  onSelectDate,
  selectedSlot = null,
  onSelectSlot = null,
  mode = 'citizen', // 'citizen' | 'admin'
  showTimeSlotPicker = true,
}) {
  const { getDateAvailabilitySummary } = usePortal();

  const initialDateObj = useMemo(() => {
    if (selectedDate) {
      const [y, m, d] = selectedDate.split('-').map(Number);
      if (y && m) return new Date(y, m - 1, d || 1);
    }
    return new Date();
  }, []);

  const [viewYear, setViewYear] = useState(initialDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDateObj.getMonth());

  const todayStr = new Date().toISOString().split('T')[0];

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const calendarCells = useMemo(() => {
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatYMD(viewYear, viewMonth, day);
      const summary = getDateAvailabilitySummary(dateStr);
      cells.push({
        day,
        dateStr,
        ...summary,
      });
    }

    return cells;
  }, [viewYear, viewMonth, getDateAvailabilitySummary]);

  const selectedDateSummary = useMemo(
    () => (selectedDate ? getDateAvailabilitySummary(selectedDate) : null),
    [selectedDate, getDateAvailabilitySummary]
  );

  return (
    <div className="space-y-5">
      {/* Visual Month Calendar Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Calendar Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0e2756] text-white flex items-center justify-center flex-shrink-0">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </h3>
              <p className="text-[11px] text-slate-500">
                {mode === 'admin'
                  ? 'Tap any date to configure open/closed status, active time slots, and citizen capacity'
                  : 'Tap an open date on the calendar to view real-time available time slots'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2">
            {/* Color Legend */}
            <div className="hidden xl:flex items-center gap-3 text-[11px] font-medium text-slate-600 mr-2">
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Filling Fast
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Full
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Closed
              </span>
            </div>

            <div className="inline-flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Previous Month"
                className="p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  setViewYear(now.getFullYear());
                  setViewMonth(now.getMonth());
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700"
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Next Month"
                className="p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Legend Bar */}
        <div className="xl:hidden px-4 py-2 bg-slate-50/60 border-b border-slate-100 flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-600">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Open Slots
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Low Slots
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Full
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-300" /> Closed
          </span>
        </div>

        {/* Weekday Header Row */}
        <div className="grid grid-cols-7 bg-slate-100/80 border-b border-slate-200 text-center text-[11px] font-bold uppercase tracking-wider text-slate-600">
          {WEEKDAY_HEADERS.map((d) => (
            <div key={d} className="py-2.5">
              {d}
            </div>
          ))}
        </div>

        {/* 7-Column Calendar Days Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 bg-white">
          {calendarCells.map((cell, idx) => {
            if (!cell) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[68px] sm:min-h-[84px] bg-slate-50/40"
                />
              );
            }

            const isSelected = selectedDate === cell.dateStr;
            const isToday = cell.dateStr === todayStr;
            const isDisabledForCitizen =
              mode === 'citizen' && (cell.isPast || !cell.isOpen || cell.isFullyBooked);

            const ratio =
              cell.totalCapacity > 0 ? cell.totalAvailable / cell.totalCapacity : 0;

            let badgeClass = 'bg-slate-100 text-slate-500';
            let badgeText = 'Closed';

            if (cell.isOpen) {
              if (cell.totalAvailable === 0) {
                badgeClass = 'bg-rose-50 text-rose-700 border border-rose-200';
                badgeText = 'Full';
              } else if (ratio <= 0.35) {
                badgeClass = 'bg-amber-50 text-amber-800 border border-amber-200';
                badgeText = `${cell.totalAvailable} left`;
              } else {
                badgeClass = 'bg-emerald-50 text-emerald-800 border border-emerald-200';
                badgeText = `${cell.totalAvailable} open`;
              }
            }

            return (
              <button
                key={cell.dateStr}
                type="button"
                disabled={isDisabledForCitizen}
                onClick={() => onSelectDate(cell.dateStr)}
                className={`min-h-[68px] sm:min-h-[84px] p-1.5 sm:p-2.5 text-left flex flex-col justify-between transition-all relative ${
                  isSelected
                    ? 'bg-blue-50/90 ring-2 ring-inset ring-[#0e2756] z-10'
                    : isDisabledForCitizen
                    ? 'bg-slate-50/60 text-slate-400 cursor-not-allowed opacity-65'
                    : 'hover:bg-slate-50 cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold tabular-nums ${
                      isSelected
                        ? 'bg-[#0e2756] text-white'
                        : isToday
                        ? 'bg-blue-100 text-[#0e2756]'
                        : cell.isOpen
                        ? 'text-slate-900'
                        : 'text-slate-400'
                    }`}
                  >
                    {cell.day}
                  </span>
                  {isToday && (
                    <span className="hidden sm:inline text-[10px] font-bold text-[#0e2756] uppercase">
                      Today
                    </span>
                  )}
                </div>

                <div className="w-full mt-1">
                  <span
                    className={`block w-full text-center px-1 py-0.5 rounded text-[10px] font-bold tabular-nums truncate ${badgeClass}`}
                  >
                    {badgeText}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-Time Time Slot Grid for Selected Date */}
      {showTimeSlotPicker && selectedDateSummary && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0e2756]" />
                <h4 className="font-serif font-bold text-sm sm:text-base text-slate-900">
                  Available Time Slots for {selectedDate}
                </h4>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedDateSummary.isOpen
                  ? `${selectedDateSummary.totalAvailable} total citizen slots available across ${selectedDateSummary.openSlotsCount} time windows`
                  : `Closed (${selectedDateSummary.reason})`}
              </p>
            </div>
            <span
              className={`self-start sm:self-auto px-2.5 py-1 rounded-full text-xs font-bold ${
                selectedDateSummary.isOpen
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {selectedDateSummary.isOpen ? 'Open for Booking' : 'Date Closed'}
            </span>
          </div>

          {!selectedDateSummary.isOpen ? (
            <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              This date is marked as <strong>Closed</strong> ({selectedDateSummary.reason}). Please select an open date highlighted in green on the calendar above.
            </div>
          ) : selectedDateSummary.slots.length === 0 ? (
            <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              No active time slots configured for this date.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {selectedDateSummary.slots.map((sl) => {
                const active = selectedSlot === sl.timeSlot;
                const pctBooked =
                  sl.capacity > 0
                    ? Math.min(100, Math.round((sl.bookedCount / sl.capacity) * 100))
                    : 100;

                return (
                  <button
                    key={sl.slotId}
                    type="button"
                    disabled={mode === 'citizen' && sl.isFull}
                    onClick={() => onSelectSlot && onSelectSlot(sl.timeSlot)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                      active
                        ? 'border-[#0e2756] bg-blue-50/80 ring-1 ring-[#0e2756]'
                        : sl.isFull
                        ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed opacity-70'
                        : 'border-slate-200 bg-white hover:border-[#0e2756]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-slate-900">
                        {sl.timeSlot}
                      </span>
                      {active && (
                        <span className="w-5 h-5 rounded-full bg-[#0e2756] text-white flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span
                          className={`font-semibold tabular-nums ${
                            sl.isFull
                              ? 'text-rose-600'
                              : sl.availableCount <= 2
                              ? 'text-amber-700'
                              : 'text-emerald-700'
                          }`}
                        >
                          {sl.isFull
                            ? 'Fully Booked'
                            : `${sl.availableCount} of ${sl.capacity} slots open`}
                        </span>
                        <span className="text-slate-400 tabular-nums">
                          {sl.bookedCount}/{sl.capacity} booked
                        </span>
                      </div>

                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            sl.isFull
                              ? 'bg-rose-500'
                              : sl.availableCount <= 2
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${pctBooked}%` }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
