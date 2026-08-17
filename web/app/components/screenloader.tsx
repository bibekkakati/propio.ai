import { LoaderCircle } from "lucide-react";

export default function ScreenLoader() {
    return (
        <div className="flex items-center justify-center w-full min-h-screen">
            <LoaderCircle className="animate-spin size-10" />
        </div>
    );
}
