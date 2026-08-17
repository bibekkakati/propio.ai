import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import useMetaTags from "@/lib/meta";
import {
    ArrowRight,
    BarChart3,
    Building2,
    Calendar,
    Check,
    DollarSign,
    Download,
    FileText,
    Receipt,
    Sparkles,
    TrendingUp,
    X,
    Zap,
    type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Link, type MetaArgs, type MetaFunction } from "react-router";

interface Feature {
    icon: LucideIcon;
    title: string;
    desc: string;
    color: string;
}

interface HowItWorksStep {
    step: string;
    title: string;
    desc: string;
    icon: LucideIcon;
}

export const meta: MetaFunction<MetaArgs> = () => {
    return useMetaTags({});
};

export default function LandingPage() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const cursorStyle = useMemo(() => {
        const CURSOR_OFFSET = 192;
        return {
            background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
            left: `${mousePosition.x - CURSOR_OFFSET}px`,
            top: `${mousePosition.y - CURSOR_OFFSET}px`,
            transition: "all 0.3s ease-out",
        };
    }, [mousePosition.x, mousePosition.y]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const features: Feature[] = [
        {
            icon: Receipt,
            title: "Add bookings",
            desc: "Capture direct, Airbnb, or OTA bookings.",
            color: "bg-amber-400",
        },
        {
            icon: DollarSign,
            title: "Track expenses",
            desc: "Property-wise expenses with optional bill scanning (Smart Scan).",
            color: "bg-purple-400",
        },
        {
            icon: BarChart3,
            title: "Monthly property summary",
            desc: "Know what each property earns and costs.",
            color: "bg-emerald-400",
        },
        {
            icon: FileText,
            title: "Generate simple receipts",
            desc: "Optional invoice/receipt for direct bookings.",
            color: "bg-yellow-400",
        },
        {
            icon: Download,
            title: "Export anytime",
            desc: "Excel or PDF for your accountant.",
            color: "bg-blue-400",
        },
    ];

    const howItWorksSteps: HowItWorksStep[] = [
        {
            step: "1",
            title: "Add your properties",
            desc: "Just the name. Nothing else. Get started in seconds, not hours.",
            icon: Building2,
        },
        {
            step: "2",
            title: "Log bookings & transactions",
            desc: "Add a bookings, earnings, expenses, and scan bills with Smart Scan.",
            icon: Zap,
        },
        {
            step: "3",
            title: "See monthly clarity",
            desc: "Property finances at a glance. Ready to export or share with your accountant.",
            icon: Calendar,
        },
    ];

    const problemItems: String[] = [
        "Expenses in Excel",
        "Bills in WhatsApp",
        "Direct bookings from Instagram, calls, walk-ins",
        "Accountant called at month-end",
    ];

    const dontDoItems: String[] = [
        "Manage availability or calendars",
        "Use accounting terms",
        "Force GST or tax filing",
        "Replace your accountant",
    ];

    const forItems: String[] = [
        "Homestay & STR owners",
        "3-25 properties",
        "Self-managed",
        "Excel users today",
    ];

    const notForItems: String[] = [
        "Hotels",
        "Large PMS-driven operators",
        "Accounting firms",
    ];

    const expansionItems: String[] = [
        "Property-level earnings",
        "Tax visibility",
        "Accounting & compliance support",
    ];

    return (
        <div className="min-h-screen">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute w-96 h-96 rounded-full opacity-10"
                    style={cursorStyle}
                />
            </div>

            {/* Header */}
            <Header />

            {/* Hero Section */}
            <section className="relative min-h-screen bg-background flex items-center justify-center overflow-hidden pt-16 md:pt-24 pb-20">
                {/* Animated gradient mesh background */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-linear-to-br from-emerald-50/40 via-transparent to-violet-50/40" />
                    <div
                        className="absolute top-0 left-1/4 w-150 h-150 bg-linear-to-br from-emerald-200/30 to-emerald-100/10 rounded-full blur-3xl animate-pulse"
                        style={{ animationDuration: "8s" }}
                    />
                    <div
                        className="absolute bottom-0 right-1/4 w-125 h-125 bg-linear-to-br from-violet-200/30 to-violet-100/10 rounded-full blur-3xl animate-pulse"
                        style={{
                            animationDuration: "10s",
                            animationDelay: "2s",
                        }}
                    />
                    <div
                        className="absolute top-1/3 right-1/3 w-100 h-100 bg-linear-to-br from-amber-100/20 to-orange-100/10 rounded-full blur-3xl animate-pulse"
                        style={{
                            animationDuration: "12s",
                            animationDelay: "4s",
                        }}
                    />

                    {/* Subtle grid pattern */}
                    <div className="absolute inset-0 opacity-[0.02] bg-grid" />
                </div>

                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full mb-8 border border-slate-200/60 shadow-sm"
                        >
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-medium text-slate-700">
                                Replace Excel. Get Clarity.
                            </span>
                        </motion.div>

                        {/* Main headline */}
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 leading-[1.1] tracking-tight text-slate-900 px-4">
                            Stop managing properties
                            <br />
                            <span className="relative inline-block">
                                in{" "}
                                <span className="relative">
                                    <span className="text-slate-400 line-through decoration-2 decoration-gray-500/60">
                                        spreadsheets
                                    </span>
                                    <motion.span
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{
                                            duration: 0.8,
                                            delay: 0.8,
                                            ease: [0.22, 1, 0.36, 1],
                                        }}
                                        className="absolute bottom-0 md:bottom-1 lg:bottom-2 left-0 right-0 h-1 bg-rose-400/60 origin-left"
                                    />
                                </span>
                            </span>
                        </h1>

                        {/* Subheadline */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="text-lg sm:text-xl md:text-2xl text-slate-600 mb-10 sm:mb-12 max-w-2xl mx-auto leading-relaxed font-normal px-4"
                        >
                            Track bookings and expenses per property without
                            accounting jargon or complex software.
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center px-4"
                        >
                            <Link
                                to="/signup"
                                className="w-full sm:w-auto"
                                prefetch="viewport"
                            >
                                <Button
                                    size="lg"
                                    variant="default"
                                    className="w-full group text-base font-medium px-6 sm:px-8 py-5 sm:py-6 rounded-xl shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:shadow-slate-900/30 transition-all duration-300 hover:-translate-y-0.5"
                                >
                                    Start Free Trial
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                size="lg"
                                className="w-full sm:w-auto text-base font-medium px-6 sm:px-8 py-5 sm:py-6 rounded-xl border-2 border-slate-200 hover:border-slate-300 hover:bg-white/80 transition-all duration-300"
                                onClick={() =>
                                    document
                                        .getElementById("how-it-works")
                                        ?.scrollIntoView({ behavior: "smooth" })
                                }
                                aria-label="Scroll to how it works section"
                            >
                                See How It Works
                            </Button>
                        </motion.div>

                        {/* Trust indicators */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 1 }}
                            className="mt-12 sm:mt-16 flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 sm:gap-8 text-xs sm:text-sm text-slate-500 px-4"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span>No credit card required</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span>Setup in 2 minutes</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span>Cancel anytime</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-white to-transparent" />
            </section>

            {/* Problem Recognition */}
            <section
                id="problem"
                className="py-24 px-6 relative overflow-hidden"
            >
                <div className="max-w-4xl mx-auto relative">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {/* Section label */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-px w-12 bg-slate-300" />
                            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                                The Problem
                            </span>
                        </div>

                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-12 sm:mb-16 leading-tight text-slate-900 px-4">
                            This is how most property owners
                            <br className="hidden sm:block" />
                            <span className="text-slate-500 font-semibold">
                                {" "}
                                manage finances today
                            </span>
                        </h2>
                    </motion.div>

                    <div className="grid gap-4">
                        {problemItems.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{
                                    duration: 0.6,
                                    delay: (idx + 1) / 10,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                                className="group"
                            >
                                <div className="flex items-center gap-5 p-6 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 transition-all duration-300">
                                    <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0 group-hover:bg-rose-100 transition-colors duration-300">
                                        <X
                                            className="w-5 h-5 text-rose-500"
                                            strokeWidth={2.5}
                                        />
                                    </div>
                                    <p className="text-lg text-slate-700 font-medium">
                                        {item}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="mt-12 text-center"
                    >
                        <p className="text-2xl text-slate-500 italic font-instrument">
                            "It works—until it doesn't."
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* The Simple Promise */}
            <section
                id="promise"
                className="py-24 px-6 relative overflow-hidden bg-background"
            >
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full mb-6 border border-purple-100">
                            <TrendingUp className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium text-purple-700">
                                Simple. Clear. Effective.
                            </span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                            One place for all your property finances
                        </h2>
                        <p className="text-xl text-gray-700 mb-4 leading-relaxed">
                            Add bookings and expenses for each property. See
                            monthly numbers instantly. Export reports when
                            needed.
                        </p>
                        <p className="text-2xl font-bold bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                            No accounting. No PMS. No confusion.
                        </p>
                    </div>
                </motion.div>
            </section>

            {/* How It Works */}
            <section
                id="how-it-works"
                className="py-32 px-6 relative overflow-hidden"
            >
                <div className="max-w-6xl mx-auto relative">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="text-center mb-20"
                    >
                        {/* Section label */}
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <div className="h-px w-12 bg-slate-700" />
                            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                                How It Works
                            </span>
                            <div className="h-px w-12 bg-slate-700" />
                        </div>

                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight px-4">
                            Three steps to
                            <span className="text-brand opacity-80 font-semibold">
                                {" "}
                                financial clarity
                            </span>
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {howItWorksSteps.map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{
                                    duration: 0.6,
                                    delay: idx * 0.15,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                                className="group"
                            >
                                <div className="relative p-8 h-full rounded-3xl bg-white border border-slate-700/50 hover:border-slate-600/50 transition-all duration-500">
                                    {/* Step number */}
                                    <div className="absolute -top-4 left-8">
                                        <span className="text-sm font-bold px-3 py-1 rounded-full bg-white border border-slate-700">
                                            {step.step}
                                        </span>
                                    </div>

                                    {/* Icon */}
                                    <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                        <step.icon className="w-7 h-7 text-white" />
                                    </div>

                                    <h3 className="text-xl font-semibold mb-3">
                                        {step.title}
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed">
                                        {step.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section
                id="features"
                className="py-32 px-6 relative overflow-hidden"
            >
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-[0.02] bg-grid" />
                <div className="max-w-6xl mx-auto relative">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="text-center mb-20"
                    >
                        {/* Section label */}
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <div className="h-px w-12 bg-slate-300" />
                            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                                Features
                            </span>
                            <div className="h-px w-12 bg-slate-300" />
                        </div>

                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 leading-tight px-4">
                            Everything you need,
                            <br />
                            <span className="text-slate-500 font-semibold">
                                nothing you don't
                            </span>
                        </h2>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{
                                    duration: 0.5,
                                    delay: idx * 0.1,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                                className="group"
                            >
                                <div className="h-full p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-slate-300/80 hover:-translate-y-1 transition-all duration-300">
                                    {/* Icon */}
                                    <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                        <feature.icon className="w-7 h-7 text-white" />
                                    </div>

                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed">
                                        {feature.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}

                        {/* Empty card for visual balance */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{
                                duration: 0.5,
                                delay: 0.5,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className="hidden lg:block"
                        >
                            <div className="h-full p-8 rounded-3xl bg-linear-to-br from-slate-50 to-slate-100/50 border border-slate-200/50 border-dashed flex items-center justify-center">
                                <p className="text-slate-400 text-center">
                                    More features coming soon...
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* What We Don't Do */}
            <section
                id="dont-do"
                className="py-32 px-6 relative overflow-hidden"
            >
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
                            Deliberately simple
                        </h2>
                        <div className="bg-white rounded-3xl p-10 mb-14 shadow-xl border border-gray-100">
                            <p className="text-xl font-semibold mb-6">
                                We don't:
                            </p>
                            <div className="space-y-4">
                                {dontDoItems.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                                            <X
                                                className="w-4 h-4 text-gray-600 font-bold"
                                                strokeWidth={3}
                                            />
                                        </div>
                                        <p className="text-lg text-gray-700 font-medium">
                                            {item}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900 mb-2">
                                This is not accounting software.
                            </p>
                            <p className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent">
                                It's clarity software.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Who It's For */}
            <section
                id="audience"
                className="py-32 px-6 relative overflow-hidden"
            >
                <div className="max-w-6xl mx-auto relative">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="text-center mb-20"
                    >
                        {/* Section label */}
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <div className="h-px w-12 bg-slate-300" />
                            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                                Who It's For
                            </span>
                            <div className="h-px w-12 bg-slate-300" />
                        </div>

                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 leading-tight px-4">
                            Built for property owners
                            <br />
                            <span className="text-slate-500 font-semibold">
                                like you
                            </span>
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* For */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <div className="h-full p-10 rounded-3xl bg-linear-to-br from-emerald-50 to-teal-50/50 border-2 border-emerald-200/60 shadow-lg shadow-emerald-500/5">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                        <Check
                                            className="w-5 h-5 text-white"
                                            strokeWidth={3}
                                        />
                                    </div>
                                    <h3 className="text-2xl font-semibold text-emerald-900">
                                        Perfect for
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    {forItems.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-4"
                                        >
                                            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                                <Check
                                                    className="w-4 h-4 text-emerald-600"
                                                    strokeWidth={3}
                                                />
                                            </div>
                                            <p className="text-lg text-slate-700 font-medium">
                                                {item}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Not for */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            <div className="h-full p-10 rounded-3xl bg-linear-to-br from-slate-50 to-slate-100/50 border-2 border-slate-200/60 shadow-lg shadow-slate-500/5">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 rounded-xl bg-slate-400 flex items-center justify-center shadow-lg shadow-slate-400/30">
                                        <X
                                            className="w-5 h-5 text-white"
                                            strokeWidth={3}
                                        />
                                    </div>
                                    <h3 className="text-2xl font-semibold text-slate-700">
                                        Not designed for
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    {notForItems.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-4"
                                        >
                                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                                                <X
                                                    className="w-4 h-4 text-slate-500"
                                                    strokeWidth={3}
                                                />
                                            </div>
                                            <p className="text-lg text-slate-600 font-medium">
                                                {item}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Expansion */}
            <section
                id="expansion"
                className="py-32 px-6 relative overflow-hidden bg-background"
            >
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-10">
                            Built to grow with you
                        </h2>
                        <div className="flex flex-wrap justify-center gap-4 mb-10">
                            {expansionItems.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="px-6 py-3 bg-white rounded-full border-2 border-gray-200 text-gray-700 font-medium shadow-md hover:shadow-lg transition-all hover:scale-105"
                                >
                                    {item}
                                </div>
                            ))}
                        </div>
                        <p className="text-xl font-semibold text-gray-900">
                            You control what you use.
                        </p>
                    </div>
                </motion.div>
            </section>

            {/* Social Proof */}
            <section
                id="proof"
                className="py-32 px-6 overflow-hidden bg-slate-950 text-white"
            >
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="max-w-3xl mx-auto text-center relative mb-10">
                        <p className="text-2xl sm:text-3xl font-semibold leading-relaxed">
                            "Built after talking to 50+ homestay owners who
                            still use excel or complex accounting softwares."
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/30">
                            P
                        </div>
                        <div className="text-left">
                            <p className="text-white font-semibold">
                                Propio Team
                            </p>
                            <p className="text-slate-400 text-sm">
                                Building for property owners
                            </p>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Final CTA */}
            <section className="py-32 px-6 relative overflow-hidden">
                <div className="max-w-4xl mx-auto text-center relative">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6 sm:mb-8 px-4">
                            Replace Complexities
                            <br />
                            <span className="bg-linear-to-r from-blue-600 via-teal-500 to-blue-700 bg-clip-text text-transparent">
                                in 10 minutes
                            </span>
                        </h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-lg sm:text-xl text-slate-600 mb-10 sm:mb-12 max-w-xl mx-auto px-4"
                        >
                            No accounting knowledge required. Start tracking
                            your properties today.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                        >
                            <Link to="/signup" prefetch="viewport">
                                <Button
                                    size="lg"
                                    variant="default"
                                    className="group text-lg font-medium px-10 py-7 rounded-xl shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:shadow-slate-900/30 transition-all duration-300 hover:-translate-y-0.5"
                                >
                                    Start Free
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                </Button>
                            </Link>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="mt-6 text-sm text-slate-500"
                        >
                            Free forever for 1 property • No credit card
                            required
                        </motion.p>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}
