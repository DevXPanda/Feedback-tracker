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
  TrendingUp,
  MousePointer2,
  Target
} from "lucide-react";
import { useAuthModal } from "@/context/AuthModalContext";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { openAuthModal } = useAuthModal();
  const { t } = useLanguage();
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
            <h1 className="text-4xl sm:text-7xl font-bold tracking-normal text-slate-900 leading-[1.3] mb-12">
              <span className="block pb-2">{t("hero.title").split(" ")[0]} {t("hero.title").split(" ")[1]}</span>
              <span className="text-primary-600 bg-clip-text">{t("hero.title").split(" ").slice(2).join(" ")}</span>
            </h1>
              
              <div className="flex flex-col items-center gap-8 w-full">
                {!user ? (
                  <button
                    onClick={openAuthModal}
                    className="group w-full sm:w-auto px-12 py-5 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-bold shadow-2xl shadow-gray-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
                  >
                    {t("hero.cta")}
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <Link
                    href={user.role === "admin" ? "/dashboard" : "/team"}
                    className="group w-full sm:w-auto px-12 py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold shadow-2xl shadow-primary-100 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
                  >
                    {t("nav.dashboard")}
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
                <p className="text-sm font-medium text-slate-500">{t("hero.trusted_by")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gray-50/50 border-y border-gray-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <StatItem label={t("landing.stat_active_users")} value="12k+" />
            <StatItem label={t("landing.stat_feedback")} value="1.2M" />
            <StatItem label={t("landing.stat_wards")} value="450+" />
            <StatItem label={t("landing.stat_rate")} value="98%" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-base font-semibold text-primary-600 uppercase tracking-widest mb-4">{t("landing.features_label")}</h2>
            <p className="text-4xl sm:text-5xl font-semibold text-slate-900 tracking-normal leading-[1.3]">
              {t("landing.features_title")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={MousePointer2}
              title={t("landing.feature_1_title")}
              desc={t("landing.feature_1_desc")}
              delay="delay-0"
            />
            <FeatureCard
              icon={Globe}
              title={t("landing.feature_2_title")}
              desc={t("landing.feature_2_desc")}
              delay="delay-100"
            />
            <FeatureCard
              icon={Target}
              title={t("landing.feature_3_title")}
              desc={t("landing.feature_3_desc")}
              delay="delay-200"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 bg-gray-50/30 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary-100/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-100/20 rounded-full blur-[80px]" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-base font-semibold text-primary-600 uppercase tracking-[0.2em] mb-4">{t("landing.testimonials_label")}</h2>
            <p className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-normal leading-[1.3]">
              {t("landing.testimonials_title")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              quote={t("landing.testimonial_1")}
              author="Rajesh Kumar"
              role="Regional Director"
              avatar="1"
            />
            <TestimonialCard
              quote={t("landing.testimonial_2")}
              author="Anita Sharma"
              role="Operations Manager"
              avatar="2"
            />
            <TestimonialCard
              quote={t("landing.testimonial_3")}
              author="Vikram Singh"
              role="Team Lead"
              avatar="3"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="relative isolate overflow-hidden bg-slate-900 px-6 py-24 shadow-2xl rounded-[3rem] sm:px-24 xl:py-32 flex flex-col lg:flex-row items-center gap-16">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-600/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="flex-1 text-center lg:text-left relative z-10">
              <h2 className="text-4xl font-bold tracking-normal text-white sm:text-6xl leading-[1.3]">
                {t("landing.cta_title")}
              </h2>
              <p className="mt-8 text-xl leading-[1.6] text-slate-200 font-normal max-w-xl mx-auto lg:mx-0">
                {t("landing.cta_subtitle")}
              </p>
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                <button
                  onClick={openAuthModal}
                  className="w-full sm:w-auto rounded-2xl bg-white px-10 py-5 text-base font-bold text-slate-900 shadow-xl hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {t("landing.cta_button")}
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button className="text-base font-bold leading-6 text-white flex items-center gap-2 group py-3 px-6 hover:bg-white/5 rounded-2xl transition-all">
                  {t("hero.view_demo")}
                </button>
              </div>
            </div>

            <div className="flex-1 relative w-full max-w-[600px] h-[400px] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse" />
              <div className="relative w-full transform hover:scale-[1.02] transition-transform duration-700">
                {/* Immersive Mock UI */}
                <div className="bg-slate-800/80 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)]">
                  <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary-500/20 text-primary-400 flex items-center justify-center border border-primary-500/20 shadow-lg shadow-primary-500/10">
                        <Users2 className="h-6 w-6" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-2.5 w-24 bg-white/30 rounded-full" />
                        <div className="h-2 w-16 bg-white/10 rounded-full" />
                      </div>
                    </div>
                    <div className="flex -space-x-2">
                      <div className="h-10 w-10 rounded-full bg-white/10 border-2 border-slate-800 flex items-center justify-center text-[10px] text-white/60 font-bold backdrop-blur-md">JD</div>
                      <div className="h-10 w-10 rounded-full bg-primary-500/30 border-2 border-slate-800 flex items-center justify-center text-[10px] text-primary-400 font-bold backdrop-blur-md shadow-lg">AK</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-white/5 rounded-2xl p-5 border border-white/5 backdrop-blur-sm">
                      <div className="h-2 w-12 bg-white/20 rounded-full mb-4" />
                      <div className="flex items-end gap-2">
                        <div className="h-6 w-16 bg-white/40 rounded-lg" />
                        <div className="h-4 w-8 bg-emerald-400/20 rounded-full mb-0.5" />
                      </div>
                    </div>
                    <div className="bg-primary-500/10 rounded-2xl p-5 border border-primary-500/10 backdrop-blur-sm">
                      <div className="h-2 w-12 bg-white/20 rounded-full mb-4" />
                      <div className="h-6 w-20 bg-primary-400/60 rounded-lg shadow-lg shadow-primary-500/10" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]" />
                          <div className="h-2.5 w-40 bg-white/20 rounded-full" />
                        </div>
                        <div className="h-2 w-12 bg-white/10 rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Overlapping Growth Card */}
                <div className="absolute -bottom-10 -right-4 bg-white rounded-3xl p-6 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-gray-100 hidden sm:block animate-in slide-in-from-right-8 duration-1000">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t("landing.growth")}</p>
                      <p className="text-xl font-bold text-gray-900 font-display tracking-tight">+12.5%</p>
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
    <div className={`bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary-100/10 flex flex-col min-h-[200px] animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both ${delay}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 mb-6 shadow-md shadow-primary-50">
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-grow">
        <h3 className="text-lg font-semibold text-slate-900 mb-2 leading-snug">{title}</h3>
        <p className="text-slate-500 text-sm font-normal leading-[1.6]">{desc}</p>
      </div>
    </div>
  );
}

function StatItem({ label, value }) {
  return (
    <div>
      <p className="text-4xl font-semibold text-gray-900 mb-2">{value}</p>
      <p className="text-sm font-medium text-gray-400 uppercase tracking-wide leading-relaxed">{label}</p>
    </div>
  );
}

function TestimonialCard({ quote, author, role, avatar }) {
  return (
    <div className="bg-white p-8 rounded-[2rem] relative border border-gray-100/60 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.1)] group flex flex-col h-full animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
      <div className="absolute -top-4 left-8 h-9 w-9 bg-primary-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 rotate-[-6deg] group-hover:rotate-0 transition-transform">
        <Quote className="h-4 w-4" />
      </div>
      <div className="flex-grow pt-2">
        <p className="text-slate-600 leading-[1.6] mb-8 text-[16px] font-normal italic relative z-10">
          "{quote}"
        </p>
      </div>
      <div className="flex items-center gap-4 pt-6 border-t border-gray-50 mt-auto">
        <div className="h-14 w-14 rounded-2xl bg-primary-50 border-2 border-white overflow-hidden shadow-sm p-0.5 flex-shrink-0">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatar}`} alt={author} className="h-full w-full object-cover" />
        </div>
        <div className="overflow-hidden">
          <p className="font-bold text-gray-900 text-sm mb-0.5 truncate">{author}</p>
          <p className="text-[10px] text-primary-600 font-bold uppercase tracking-[0.15em] truncate">{role}</p>
        </div>
      </div>
    </div>
  );
}
