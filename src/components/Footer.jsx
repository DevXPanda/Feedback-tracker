"use client";
import Link from "next/link";
import { Twitter, Github, Linkedin, Mail, Globe, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#fcfcfd] pt-6 pb-6 border-t border-gray-100 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-6">
          <div className="max-w-md">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <span className="text-xl font-bold font-display tracking-tight text-gray-900 block">
                Feedback<span className="text-primary-600">Tracker</span>
              </span>
            </Link>
            <p className="text-slate-500 max-w-sm mb-6 leading-relaxed">
              Building the future of field-based feedback collection. We empower our network with real-time data and actionable insights.
            </p>
            <div className="flex gap-4">
              <SocialLink icon={Twitter} />
              {/* <SocialLink icon={Github} /> */}
              <SocialLink icon={Linkedin} />
              <SocialLink icon={Mail} />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-16 md:gap-24 lg:gap-32">
            <div>
              <h4 className="font-bold text-gray-900 mb-4 font-display text-sm tracking-tight">Product</h4>
              <ul className="space-y-3 text-sm text-slate-500 font-medium">
                <li><FooterLink label="Features" /></li>
                <li><FooterLink label="Analytics" /></li>
                <li><FooterLink label="Security" /></li>
                <li><FooterLink label="Pricing" /></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4 font-display text-sm tracking-tight">Company</h4>
              <ul className="space-y-3 text-sm text-slate-500 font-medium">
                <li><FooterLink label="About Us" /></li>
                <li><FooterLink label="Contact" /></li>
                <li><FooterLink label="Privacy Policy" /></li>
                <li><FooterLink label="Terms of Service" /></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="pt-4 border-t border-gray-200/60 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-slate-400 font-medium tracking-tight">
            &copy; {new Date().getFullYear()} FeedbackTracker. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-slate-400 hover:text-primary-600 transition-colors flex items-center gap-1.5 font-medium">
              <Globe className="h-3 w-3" />
              English (US)
            </a>
            <div className="h-4 w-px bg-gray-200" />
            <p className="text-xs text-slate-400 font-medium">Made with ❤️ for field members</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ icon: Icon }) {
  return (
    <a href="#" className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-slate-400 hover:bg-primary-600 hover:text-white transition-all active:scale-90 border border-gray-100">
      <Icon className="h-5 w-5" />
    </a>
  );
}

function FooterLink({ label }) {
  return (
    <a href="#" className="hover:text-primary-600 transition-colors flex items-center gap-1 group py-0.5">
      {label}
      <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
    </a>
  );
}
