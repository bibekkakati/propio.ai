import { Toolbox } from "lucide-react";

export default function ComingSoon() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-linear-to-br from-sky-50 to-blue-50">
            <div className="text-center">
                <div className="flex justify-center items-center gap-2 mb-8">
                    <div className="animate-swing">
                        <Toolbox className="w-12 h-12" />
                    </div>
                </div>
                <h1 className="text-xl md:text-3xl font-bold mb-2">
                    Coming Soon
                </h1>
                <p className="text-lg">Men and women both are at work.</p>
            </div>
        </div>
    );
}
