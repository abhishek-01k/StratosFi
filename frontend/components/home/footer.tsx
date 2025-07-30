import React from 'react';
import { Zap, Twitter, Github, MessageCircle, FileText } from 'lucide-react';

const Footer = () => {
    const socialLinks = [
        { icon: Twitter, href: '#', label: 'Twitter' },
        { icon: Github, href: '#', label: 'GitHub' },
    ];

    return (
        <footer className="relative overflow-hidden border-t border-slate-800 bg-slate-900/50">
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
                    backgroundSize: '100px 100px'
                }}></div>
            </div>

            <div className="container relative mx-auto px-4 lg:px-8">
                <div className="py-16 lg:py-20">
                    <div className=" flex gap-12">
                        <div className="">
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <Zap className="size-10 text-blue-400" />
                                    <div className="absolute inset-0 rounded-full bg-blue-400/20 blur-lg"></div>
                                </div>
                                <span className="text-3xl font-bold text-white">1.5inch</span>
                            </div>

                            <p className="max-w-md text-lg leading-relaxed text-slate-300">
                                Advanced DeFi strategies extending 1inch Limit Order Protocol with
                                cutting-edge features for the next generation of decentralized trading.
                            </p>

                            <div className="flex space-x-4">
                                {socialLinks.map((social) => (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        className="group flex size-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-400 transition-all duration-300 hover:border-slate-600 hover:bg-slate-700 hover:text-white"
                                        aria-label={social.label}
                                    >
                                        <social.icon className="size-5 transition-transform duration-300 group-hover:scale-110" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div className="flex w-full flex-1 gap-8">
                            <div className="flex w-full flex-col py-8">
                                <div className="flex flex-col items-center justify-between gap-6">
                                    <div className="text-center lg:text-left">
                                        <h3 className="mb-2 text-lg font-semibold text-white">
                                            Stay Updated
                                        </h3>
                                        <p className="text-sm text-slate-400">
                                            Get the latest updates on new features and protocol developments.
                                        </p>
                                    </div>

                                    <div className="flex w-full max-w-md lg:w-auto">
                                        <input
                                            type="email"
                                            placeholder="Enter your email"
                                            className="flex-1 rounded-l-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white transition-colors duration-300 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                                        />
                                        <button className="rounded-r-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:from-blue-600 hover:to-purple-700">
                                            Subscribe
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800 py-6">
                    <div className="flex flex-col items-center justify-between gap-4 text-sm text-slate-400 md:flex-row">
                        <div className="flex items-center space-x-6">
                            <span>© 2024 1.5inch Protocol. All rights reserved.</span>
                        </div>

                        <div className="flex items-center space-x-6">
                            <span className="flex items-center space-x-2">
                                <div className="size-2 animate-pulse rounded-full bg-green-400"></div>
                                <span>Status: All Systems Operational</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;