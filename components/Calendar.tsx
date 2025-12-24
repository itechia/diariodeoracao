
import React from 'react';
import { Prayer, Category } from '../types';

interface CalendarProps {
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  prayers: Prayer[];
  onAddClick: () => void;
  categories?: Category[];
}

const Calendar: React.FC<CalendarProps> = ({
  currentDate,
  setCurrentDate,
  selectedDate,
  setSelectedDate,
  prayers,
  onAddClick,
  categories
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const paddingPrev = Array.from({ length: firstDayOfMonth }, (_, i) => ({
    day: prevMonthLastDay - firstDayOfMonth + i + 1,
    currentMonth: false,
    date: new Date(year, month - 1, prevMonthLastDay - firstDayOfMonth + i + 1)
  }));

  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    currentMonth: true,
    date: new Date(year, month, i + 1)
  }));

  const totalSlots = 42;
  const paddingNextCount = totalSlots - (paddingPrev.length + currentMonthDays.length);
  const paddingNext = Array.from({ length: paddingNextCount }, (_, i) => ({
    day: i + 1,
    currentMonth: false,
    date: new Date(year, month + 1, i + 1)
  }));

  const allDays = [...paddingPrev, ...currentMonthDays, ...paddingNext];

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  const getCategoryColor = (catName: string) => {
    const cat = categories?.find(c => c.name === catName);
    const theme = cat?.colorTheme || 'slate';
    return `bg-${theme}-500`;
  };

  const getPrayersForDay = (date: Date) => {
    return prayers.filter(p => new Date(p.date).toDateString() === date.toDateString());
  };

  return (
    <section className="flex-1 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white capitalize">
            {currentDate.toLocaleString('pt-BR', { month: 'long' })} {year}
          </h1>
          <p className="text-slate-500 dark:text-text-secondary text-sm">Toque em um dia para ver ou adicionar orações</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddClick}
            className="flex-1 sm:flex-none bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            <span className="whitespace-nowrap">Nova Oração</span>
          </button>

          <div className="flex items-center gap-1 bg-white dark:bg-surface-dark rounded-lg p-1 border border-slate-200 dark:border-surface-border shadow-sm">
            <button onClick={handlePrevMonth} className="size-8 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-surface-border text-slate-600 dark:text-white transition-colors">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button onClick={handleToday} className="px-3 py-1 text-sm font-bold text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-surface-border rounded transition-colors capitalize">
              {selectedDate.toDateString() === new Date().toDateString()
                ? 'Hoje'
                : selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
            </button>
            <button onClick={handleNextMonth} className="size-8 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-surface-border text-slate-600 dark:text-white transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-surface-border overflow-hidden shadow-xl dark:shadow-none min-h-[500px] md:min-h-[600px] transition-colors duration-300">
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-surface-border bg-slate-50 dark:bg-[#151b1f]">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
            <div key={d} className="py-3 text-center text-xs font-bold text-slate-500 dark:text-text-secondary uppercase tracking-widest">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 flex-1">
          {allDays.map((d, idx) => {
            const dayPrayers = getPrayersForDay(d.date);
            const isSelected = selectedDate.toDateString() === d.date.toDateString();
            const isToday = new Date().toDateString() === d.date.toDateString();

            return (
              <div
                key={idx}
                onClick={() => setSelectedDate(d.date)}
                className={`
                  relative border-b border-r border-slate-100 dark:border-surface-border/50 p-2 lg:p-3 transition-all cursor-pointer flex flex-col gap-2 group
                  ${!d.currentMonth ? 'opacity-30' : 'opacity-100'}
                  ${isSelected ? 'bg-blue-50/50 dark:bg-surface-border/40 z-10 ring-2 ring-inset ring-primary' : 'hover:bg-slate-50 dark:hover:bg-surface-border/30'}
                `}
              >
                <div className="flex justify-between items-start">
                  <span className={`
                    text-sm font-medium transition-colors
                    ${isToday ? 'flex items-center justify-center size-6 rounded-full bg-primary text-white font-bold shadow-md' : 'text-slate-500 dark:text-text-secondary group-hover:text-slate-900 dark:group-hover:text-white'}
                    ${isSelected && !isToday ? 'text-primary' : ''}
                  `}>
                    {d.day}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 overflow-hidden">
                  {dayPrayers.slice(0, 4).map((p, pIdx) => (
                    <div
                      key={pIdx}
                      className={`size-1.5 rounded-full ${getCategoryColor(p.category)}`}
                    />
                  ))}
                  {dayPrayers.length > 4 && (
                    <div className="text-[8px] leading-none text-slate-400 dark:text-text-secondary">+{dayPrayers.length - 4}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Calendar;
