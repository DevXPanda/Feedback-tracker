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
  Send,
  Download
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { QRCodeCanvas } from "qrcode.react";

export default function ShareModal({ isOpen, onClose, trackingUrl, memberName }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(trackingUrl);
      setCopied(true);
      toast.success(t("dashboard.copy_success"));
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error(t("modals.error_copy_link"));
    }
  };

  const handleDownloadQR = () => {
    const qrCanvas = document.getElementById("qr-code-canvas");
    if (qrCanvas) {
      // Create a composite canvas for download
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      const width = 320;
      const height = 380;
      canvas.width = width;
      canvas.height = height;
      
      // White background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      
      // Title
      ctx.fillStyle = "#111827"; // text-gray-900
      ctx.font = "bold 24px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Give your feedback", width / 2, 50);
      
      // Subtitle
      ctx.fillStyle = "#6b7280"; // text-gray-500
      ctx.font = "14px system-ui, -apple-system, sans-serif";
      ctx.fillText("Scan this code to share your thoughts", width / 2, 80);

      // Attribution
      if (memberName) {
        ctx.fillStyle = "#10b981"; // text-emerald-500
        ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
        ctx.fillText(`Tracking for: ${memberName}`, width / 2, height - 30);
      }
      
      // Draw QR Code
      const qrSize = 200;
      const qrX = (width - qrSize) / 2;
      const qrY = 110;
      
      // Ensure crisp scaling
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `QR_${memberName || 'Feedback'}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast.success("QR Code downloaded successfully");
    }
  };

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(t("modals.share_message").replace("{name}", memberName).replace("{url}", trackingUrl))}`,
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
          <h3 className="text-xl font-semibold font-display text-gray-900 tracking-tight">{t("modals.share_title")}</h3>
          <p className="mt-2 text-sm text-gray-500">{t("modals.share_desc")}</p>
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

        {/* QR Code Section */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm inline-block">
            <QRCodeCanvas 
              id="qr-code-canvas"
              value={trackingUrl}
              size={140}
              bgColor={"#ffffff"}
              fgColor={"#111827"}
              level={"Q"}
              includeMargin={false}
              className="rounded-lg"
            />
          </div>
          <button 
            onClick={handleDownloadQR}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 hover:text-primary-600 hover:bg-primary-50 border border-gray-100 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95"
          >
            <Download className="h-4 w-4" />
            Download QR
          </button>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-3 gap-4">
          <SocialButton 
            icon={MessageCircle} 
            label="WHATSAPP" 
            color="bg-[#25D366]" 
            onClick={() => window.open(shareLinks.whatsapp, '_blank')}
          />
          <SocialButton 
            icon={Facebook} 
            label="FACEBOOK" 
            color="bg-[#1877F2]" 
            onClick={() => window.open(shareLinks.facebook, '_blank')}
          />
          <SocialButton 
            icon={Instagram} 
            label="INSTAGRAM" 
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
