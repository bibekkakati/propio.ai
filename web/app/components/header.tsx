import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Link } from "react-router";

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 left-0 right-0 z-50"
        >
            <div className="mx-2 sm:mx-4 mt-2 sm:mt-4">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 bg-white/70 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-slate-200/50 shadow-lg shadow-slate-900/5">
                    <div className="flex justify-between items-center">
                        <Link to="/">
                            <img
                                src="/assets/logo-light.png"
                                className="h-7 w-auto"
                            />
                        </Link>

                        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
                            <Link
                                to="/#features"
                                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200"
                            >
                                Features
                            </Link>
                            <Link
                                to="/#how-it-works"
                                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200"
                            >
                                How It Works
                            </Link>
                        </nav>

                        <div className="flex items-center gap-2 sm:gap-3">
                            <Link
                                to="/signin"
                                className="hidden sm:block"
                                prefetch="viewport"
                            >
                                <Button
                                    variant="ghost"
                                    className="text-sm rounded-xl"
                                >
                                    Sign In
                                </Button>
                            </Link>
                            <Link
                                to="/signup"
                                className="hidden sm:block"
                                prefetch="viewport"
                            >
                                <Button
                                    variant="default"
                                    className="text-sm rounded-xl"
                                >
                                    Get Started
                                </Button>
                            </Link>

                            {/* Mobile menu button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden"
                                onClick={() =>
                                    setMobileMenuOpen(!mobileMenuOpen)
                                }
                            >
                                {mobileMenuOpen ? (
                                    <X className="w-5 h-5 text-slate-900" />
                                ) : (
                                    <Menu className="w-5 h-5 text-slate-900" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Mobile menu */}
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: "auto" }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="md:hidden pt-4 mt-4 border-t border-slate-200"
                        >
                            <nav className="flex flex-col gap-3">
                                <a
                                    href="#features"
                                    className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200 py-2"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Features
                                </a>
                                <a
                                    href="#how-it-works"
                                    className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200 py-2"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    How It Works
                                </a>
                                <div className="flex flex-col gap-2 pt-2">
                                    <Link
                                        to="/signin"
                                        prefetch="viewport"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Button
                                            variant="ghost"
                                            className="w-full text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                                        >
                                            Sign In
                                        </Button>
                                    </Link>
                                    <Link
                                        to="/signup"
                                        prefetch="viewport"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl shadow-lg shadow-slate-900/20">
                                            Get Started
                                        </Button>
                                    </Link>
                                </div>
                            </nav>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.header>
    );
}
