import AmountLabel from "./amountlabel";
import { Badge } from "./ui/badge";

const ProgressRow = ({ label, badgeVariant, percentage, amount }) => (
    <div className="space-y-2">
        <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
                <Badge variant={badgeVariant} className="capitalize">
                    {label}
                    {percentage !== undefined ? ` • ${percentage}%` : ""}
                </Badge>
            </div>

            <div className="text-sm text-gray-600 whitespace-nowrap">
                <AmountLabel value={amount} />
            </div>
        </div>

        <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
            <div
                className="h-full bg-gray-300/50 rounded-full transition-all"
                style={{ width: `${percentage || 0}%` }}
            />
        </div>
    </div>
);

export default ProgressRow;
