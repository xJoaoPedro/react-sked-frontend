"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarClock, Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePicker({ value, onChange, ...calendarProps }) {
  const [date, setDate] = React.useState<Date | undefined>();

  React.useEffect(() => {
    setDate(value);
  }, [value]);

  const handleSelect = (selected: Date | undefined) => {
    setDate(selected);
    onChange?.(selected);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id="date-picker-simple"
          className={`h-8 w-full min-w-0 rounded-lg border border-input bg-gray-200/50 hover:bg-gray-200 px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 text-foreground`}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date
            ? format(date, "dd/MM/yyyy", { locale: ptBR })
            : "Selecione uma data"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Calendar
          className="w-full"
          locale={ptBR}
          mode="single"
          selected={date}
          onSelect={handleSelect}
          {...calendarProps}
        />

        <div className="flex justify-between p-1">
          <Button onClick={() => handleSelect(undefined)} variant="destructive"><Trash2 className="w-4 h-4 mr-2" /> Limpar</Button>

          <Button onClick={() => handleSelect(new Date())}><CalendarClock className="w-4 h-4" /> Hoje</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
