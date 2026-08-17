import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

export default function MonthYearPopover({
    month,
    year,
    children,
    onChange,
}: {
    month: number;
    year: number;
    children: React.ReactNode;
    onChange: (month: number, year: number) => void;
}) {
    const [activeYear, setActiveYear] = useState<number>(year);

    const onSelect = async (month: number) => {
        onChange(month, activeYear);
    };

    return (
        <Popover modal>
            <PopoverTrigger asChild>{children}</PopoverTrigger>
            <PopoverContent align="start" className="w-fit p-3">
                {/* Year navigation */}
                <div className="flex items-center justify-between mb-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setActiveYear(activeYear - 1)}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-semibold text-gray-800">
                        {activeYear}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setActiveYear(activeYear + 1)}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>

                {/* Month grid */}
                <div className="grid grid-cols-3 gap-2">
                    {MONTHS.map((m, idx) => {
                        const isSelected =
                            idx + 1 === month && year === activeYear;
                        return (
                            <Button
                                key={m}
                                onClick={() => onSelect(idx + 1)}
                                variant={isSelected ? "default" : "ghost"}
                                size="default"
                                className="h-8 px-3"
                            >
                                {m.slice(0, 3)}
                            </Button>
                        );
                    })}
                </div>
            </PopoverContent>
        </Popover>
    );
}
