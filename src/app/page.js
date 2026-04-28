import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="relative isolate overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:grid lg:grid-cols-2 lg:gap-x-16 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:pt-8">
          <div className="mt-24 sm:mt-32 lg:mt-16">
            <a href="#" className="inline-flex space-x-6">
              <span className="rounded-full bg-primary-600/10 px-3 py-1 text-sm font-semibold leading-6 text-primary-600 ring-1 ring-inset ring-primary-600/10">
                Latest updates
              </span>
              <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-slate-600">
                <span>Just shipped v1.0</span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </span>
            </a>
          </div>
          <h1 className="mt-10 text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl font-display leading-[1.1]">
            Feedback Collection <span className="text-primary-600">Simplified.</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Empower your field teams to collect feedback efficiently. Track real-time progress, manage ward distribution, and gain actionable insights from our centralized dashboard.
          </p>
          <div className="mt-10 flex items-center gap-x-6">
            <Link href="/login" className="btn-primary flex items-center gap-2">
              Get Started <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/dashboard" className="text-sm font-semibold leading-6 text-slate-900 flex items-center gap-1 hover:text-primary-600 transition-colors">
              View Admin Dashboard <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        
        <div className="mt-16 sm:mt-24 lg:mt-0 flex items-center">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 w-full">
            <FeatureCard 
              icon={Zap} 
              title="Real-time Tracking" 
              desc="Watch team progress live as feedback entries come in."
            />
            <FeatureCard 
              icon={BarChart3} 
              title="Advanced Analytics" 
              desc="Deep dive into ward-wise performance metrics."
            />
            <FeatureCard 
              icon={ShieldCheck} 
              title="Secure Access" 
              desc="Role-based permissions for admins and team members."
            />
            <FeatureCard 
              icon={CheckCircle2} 
              title="One-click Feedback" 
              desc="Optimized mobile flow for field agents."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="glass-card rounded-[2rem] p-7 border border-white/40 shadow-xl transition-all hover:scale-[1.03] flex flex-col min-h-[220px]">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white mb-6 shadow-lg shadow-primary-200">
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-grow">
        <h3 className="text-xl font-bold font-display text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
