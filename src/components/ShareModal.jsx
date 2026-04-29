"use client";
import { useState } from "react";
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  MessageCircle, 
  Facebook, 
  Instagram,
  Send
} from "lucide-react";
import { toast } from "sonner";

export default function ShareModal({ isOpen, onClose, trackingUrl, memberName }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(trackingUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`Hi, I'm ${memberName}. Please provide your feedback here: ${trackingUrl}`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(trackingUrl)}`,
    // Instagram doesn't support direct URL sharing via web links for stories/posts, usually just profile link
    instagram: `https://www.instagram.com/`, 
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-sm transform overflow-hidden rounded-3xl bg-white p-8 shadow-2xl transition-all animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
            <Share2 className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-semibold font-display text-gray-900 tracking-tight">Share Your Link</h3>
          <p className="mt-2 text-sm text-gray-500">Every click through this link will be credited to you.</p>
        </div>

        {/* Copy Section */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <input 
              readOnly
              type="text" 
              value={trackingUrl}
              className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-xs font-medium text-gray-500 outline-none pr-12"
            />
            <button 
              onClick={handleCopy}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-white border border-gray-100 p-2 text-gray-500 hover:text-primary-600 shadow-sm transition-all active:scale-95"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-3 gap-4">
          <SocialButton 
            icon={MessageCircle} 
            label="WhatsApp" 
            color="bg-[#25D366]" 
            onClick={() => window.open(shareLinks.whatsapp, '_blank')}
          />
          <SocialButton 
            icon={Facebook} 
            label="Facebook" 
            color="bg-[#1877F2]" 
            onClick={() => window.open(shareLinks.facebook, '_blank')}
          />
          <SocialButton 
            icon={Instagram} 
            label="Instagram" 
            color="bg-gradient-to-tr from-[#FFB700] via-[#FF0069] to-[#7600C5]" 
            onClick={() => window.open(shareLinks.instagram, '_blank')}
          />
        </div>
      </div>
    </div>
  );
}

function SocialButton({ icon: Icon, label, color, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-2 group"
    >
      <div className={`h-12 w-12 rounded-2xl ${color} text-white flex items-center justify-center shadow-md transition-transform group-hover:-translate-y-1 group-active:scale-95`}>
        <Icon className="h-6 w-6" />
      </div>
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
    </button>
  );
}
