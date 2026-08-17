import { Building2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { cn } from "@/lib/utils";

export default function PropertySelector({
    className = "",
    properties,
    value,
    onSelect,
}: {
    className?: string;
    properties: Record<string, any>[];
    value: string;
    onSelect: (value: string) => void;
}) {
    return (
        <Select value={value} onValueChange={onSelect}>
            <SelectTrigger
                data-testid="property-selector"
                className={cn("w-fit max-w-52 bg-white", className)}
            >
                <Building2 className="w-4 h-4 mr-2 text-gray-500" />
                <SelectValue placeholder="Select property" />
            </SelectTrigger>
            <SelectContent>
                {properties?.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                        {p.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
