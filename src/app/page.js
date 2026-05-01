"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Star,
  Quote,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Globe,
  Users2,
  TrendingUp
} from "lucide-react";
import { useAuthModal } from "@/context/AuthModalContext";

export default function Home() {
  const { openAuthModal } = useAuthModal();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("user")) : null;
      setUser(storedUser);
    };
    checkAuth();
  }, []);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary-200 to-indigo-200 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex justify-center">
          <div className="max-w-4xl flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-xs font-bold uppercase tracking-wider mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            </div>
            <h1 className="text-4xl sm:text-7xl font-bold tracking-tight text-slate-900 leading-[1.2] mb-12">
              <span className="block pb-2">Feedback Collection</span>
              <span className="text-primary-600 bg-clip-text">Simplified.</span>
            </h1>
              
              <div className="flex flex-col items-center gap-8 w-full">
                {!user ? (
                  <button
                    onClick={openAuthModal}
                    className="group w-full sm:w-auto px-12 py-5 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-bold shadow-2xl shadow-gray-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
                  >
                    Login to Dashboard
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <Link
                    href={user.role === "admin" ? "/dashboard" : "/team"}
                    className="group w-full sm:w-auto px-12 py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold shadow-2xl shadow-primary-100 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
                  >
                    Enter Dashboard
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
                
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="User" />
                      </div>
                    ))}
                    <div className="h-10 w-10 rounded-full border-2 border-white bg-primary-50 flex items-center justify-center text-[10px] font-bold text-primary-600">
                      +2k
                    </div>
                  </div>
                <p className="text-sm font-medium text-slate-500">Trusted by 2,000+ teams</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gray-50/50 border-y border-gray-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <StatItem label="Active Users" value="12k+" />
            <StatItem label="Feedback Collected" value="1.2M" />
            <StatItem label="Wards Covered" value="450+" />
            <StatItem label="Response Rate" value="98%" />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-base font-semibold text-primary-600 uppercase tracking-widest mb-4">Testimonials</h2>
            <p className="text-4xl sm:text-5xl font-semibold text-slate-900 tracking-tight leading-tight">
              Trusted by team leads <br /> across the country
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="The real-time tracking has completely transformed how we manage our field agents. No more manual excel sheets!"
              author="Rajesh Kumar"
              role="Regional Director"
              avatar="1"
            />
            <TestimonialCard
              quote="The interface is so simple that our agents started using it with zero training. High performance, zero friction."
              author="Anita Sharma"
              role="Operations Manager"
              avatar="2"
            />
            <TestimonialCard
              quote="Ward-wise analytics helped us identify gaps in our feedback collection strategy in just 2 days. Truly impressive."
              author="Vikram Singh"
              role="Team Lead"
              avatar="3"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pt-20 sm:pt-32 pb-12 overflow-hidden relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="relative isolate overflow-hidden bg-slate-900 px-8 pt-16 shadow-2xl rounded-[3rem] sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0 border border-white/5">
            {/* Background Glow */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-600/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left relative z-10">
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl leading-[1.1]">
                Ready to optimize <br />
                <span className="text-primary-400">your team performance?</span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-slate-300 font-normal">
                Join 2,000+ teams simplifying their field workflow. Secure, real-time, and mobile-optimized for every agent.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
                <button
                  onClick={openAuthModal}
                  className="rounded-2xl bg-white px-8 py-4 text-sm font-semibold text-slate-900 shadow-xl hover:bg-slate-50 transition-all active:scale-95"
                >
                  Get Started Free
                </button>
                <button className="text-sm font-semibold leading-6 text-white flex items-center gap-2 group">
                  View Demo <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <div className="relative mt-16 h-80 lg:mt-8 flex-grow">
              <div className="lg:absolute lg:left-0 lg:top-12 w-full max-w-[540px] transform lg:rotate-[-2deg] transition-transform hover:rotate-0 duration-700">
                {/* Enhanced Mock UI */}
                <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center border border-primary-500/20">
                        <Users2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="h-2 w-20 bg-white/20 rounded-full mb-2" />
                        <div className="h-1.5 w-12 bg-white/10 rounded-full" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 w-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[10px] text-white/40">JD</div>
                      <div className="h-8 w-8 rounded-full bg-primary-500/20 border border-primary-500/20 flex items-center justify-center text-[10px] text-primary-400 font-bold">AK</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <div className="h-1.5 w-12 bg-white/20 rounded-full mb-3" />
                      <div className="h-4 w-16 bg-white/40 rounded-md" />
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <div className="h-1.5 w-12 bg-white/20 rounded-full mb-3" />
                      <div className="h-4 w-16 bg-primary-400/60 rounded-md" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                          <div className="h-2 w-32 bg-white/20 rounded-full" />
                        </div>
                        <div className="h-2 w-8 bg-white/10 rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating Stats Badge */}
                <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-4 shadow-2xl border border-gray-100 hidden sm:block animate-bounce duration-[3000ms]">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Growth</p>
                      <p className="text-sm font-bold text-gray-900">+12.5%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, delay }) {
  return (
    <div className={`bg-white p-7 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 transition-all hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary-100/20 flex flex-col min-h-[200px] animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both ${delay}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 mb-6 shadow-lg shadow-primary-50">
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-grow">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-500 text-sm font-normal leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function StatItem({ label, value }) {
  return (
    <div>
      <p className="text-4xl font-semibold text-gray-900 mb-2">{value}</p>
      <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">{label}</p>
    </div>
  );
}

function TestimonialCard({ quote, author, role, avatar }) {
  return (
    <div className="bg-gray-50 p-10 rounded-[3rem] relative border border-white transition-all hover:bg-white hover:shadow-2xl hover:shadow-gray-200/50 group">
      <div className="absolute -top-4 left-10 h-8 w-8 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-primary-100">
        <Quote className="h-4 w-4" />
      </div>
      <p className="text-slate-600 leading-relaxed mb-8 text-lg font-normal italic">"{quote}"</p>
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm p-0.5">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatar}`} alt={author} />
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm">{author}</p>
          <p className="text-xs text-primary-600 font-bold uppercase tracking-wider">{role}</p>
        </div>
      </div>
    </div>
  );
}
