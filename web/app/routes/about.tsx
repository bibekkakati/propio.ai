import { Button } from "@/components/ui/button";
import useMetaTags from "@/lib/meta";
import { ArrowLeft, Heart, Target, Users, Zap } from "lucide-react";
import type { MetaArgs, MetaFunction } from "react-router";
import { useNavigate } from "react-router";

export const meta: MetaFunction<MetaArgs> = () => {
    return useMetaTags({ title: "About" });
};

export default function AboutPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2"
                    >
                        <div className="w-8 h-8 bg-linear-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">
                                S
                            </span>
                        </div>
                        <span className="text-xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            Propio
                        </span>
                    </button>
                    <div className="flex items-center gap-6">
                        <Button
                            onClick={() => navigate("/signin")}
                            className="bg-gray-900 hover:bg-gray-800 shadow-lg"
                            size="sm"
                        >
                            Sign In
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-32 pb-16 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </button>

                    <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                        About Propio
                    </h1>
                    <p className="text-xl text-gray-600 leading-relaxed">
                        Built for homestay owners who deserve better than Excel.
                    </p>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-gray-100">
                        <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                        <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                            <p>
                                Propio was born from a simple observation: most
                                homestay and short-term rental owners in India
                                manage their finances in Excel spreadsheets,
                                WhatsApp messages, and scattered notes.
                            </p>
                            <p>
                                After talking to 50+ property owners, we
                                realized they didn't need complex accounting
                                software or expensive property management
                                systems. They needed <strong>clarity</strong>.
                            </p>
                            <p>
                                So we built Propio - a simple tool that helps
                                you track bookings and expenses per property,
                                see your monthly numbers instantly, and get back
                                to what matters: running great properties.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-16 px-4 sm:px-6 bg-linear-to-b from-gray-50/50 to-transparent">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold mb-12 text-center">
                        What We Believe
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            {
                                icon: Target,
                                title: "Simplicity First",
                                desc: "Complex software creates confusion. We deliberately keep things simple so you can focus on your properties, not learning software.",
                                color: "#3b82f6",
                            },
                            {
                                icon: Heart,
                                title: "Built for Owners",
                                desc: "We speak your language. No accounting jargon, no PMS complexity. Just tools that make sense for people managing 3-25 properties.",
                                color: "#ef4444",
                            },
                            {
                                icon: Zap,
                                title: "Fast & Practical",
                                desc: "Add a booking in 30 seconds. See your monthly summary instantly. Export reports when needed. Built for real workflows.",
                                color: "#10b981",
                            },
                            {
                                icon: Users,
                                title: "Growing Together",
                                desc: "We start simple but grow with you. As your needs evolve, we add features—but only the ones that truly help.",
                                color: "#8b5cf6",
                            },
                        ].map((value, idx) => (
                            <div
                                key={idx}
                                className="bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-gray-200 shadow-lg hover:shadow-xl transition-all"
                            >
                                <div
                                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 shadow-lg"
                                    style={{
                                        background: `linear-gradient(135deg, ${value.color}, ${value.color}dd)`,
                                    }}
                                >
                                    <value.icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">
                                    {value.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {value.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 px-4 sm:px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                    <div className="bg-linear-to-br from-blue-50 to-purple-50 rounded-3xl p-10 border-2 border-blue-100 shadow-xl">
                        <p className="text-2xl font-semibold text-gray-900 leading-relaxed">
                            Replace Excel with clarity. Help 10,000 Indian
                            homestay owners get back 2 hours per week—time they
                            can spend on guests, not spreadsheets.
                        </p>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-16 px-4 sm:px-6 bg-linear-to-b from-gray-50/50 to-transparent">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold mb-12 text-center">
                        The Team
                    </h2>
                    <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-gray-100">
                        <p className="text-xl text-gray-700 leading-relaxed mb-6">
                            We're a small team of builders who understand
                            hospitality and software. We've helped build tools
                            for thousands of businesses—now we're focused on
                            making property finance tracking simple.
                        </p>
                        <p className="text-lg text-gray-600">
                            Based in India. Building for India. Supporting
                            property owners nationwide.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                        Ready to replace Excel?
                    </h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Join property owners getting clarity on their finances.
                    </p>
                    <Button
                        onClick={() => navigate("/signin")}
                        size="lg"
                        className="bg-linear-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 text-lg px-10 py-6 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                    >
                        Get Started Free
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                                <span className="text-gray-900 font-bold text-lg">
                                    S
                                </span>
                            </div>
                            <span className="text-xl font-bold">Propio</span>
                        </div>
                        <div className="flex gap-8">
                            <button
                                onClick={() => navigate("/")}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                Home
                            </button>
                            <a
                                href="#"
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                Privacy
                            </a>
                            <a
                                href="#"
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                Terms
                            </a>
                        </div>
                    </div>
                    <div className="mt-8 text-center text-gray-500 text-sm">
                        © 2025 Propio. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
