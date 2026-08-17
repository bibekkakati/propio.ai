const ReportSectionCard = ({ title, icon: Icon, right = null, children }) => (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 shadow-2xs transition-colors p-5 md:p-6">
        <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 font-semibold text-gray-800">
                {Icon && <Icon className="w-4 h-4 text-gray-500" />}
                {title}
            </div>
            {right}
        </div>

        {children}
    </div>
);

export default ReportSectionCard;
