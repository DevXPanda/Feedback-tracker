"use client";
import { useState } from "react";
import { X, Target, Calendar, Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { toast } from "sonner";

export default function TargetModal({ isOpen, onClose, teamId, userId }) {
  const [target, setTarget] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [label, setLabel] = useState("Daily Target");
  const [isLoading, setIsLoading] = useState(false);

  const setTargetMutation = useMutation(api.targets.setTarget);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!target || !startDate || !endDate) return;

    setIsLoading(true);
    try {
      await setTargetMutation({
        target: parseInt(target),
        startDate: new Date(startDate).setHours(0, 0, 0, 0),
        endDate: new Date(endDate).setHours(23, 59, 59, 999),
        teamId,
        userId,
        label,
      });
      toast.success("Target set successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to set target.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
              <Target className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold font-display text-gray-800 tracking-tight">Set Feedback Target</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Target Description</label>
            <input 
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Daily Target, Weekend Drive"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-primary-400/20 focus:border-primary-400 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Target Count</label>
            <input 
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Number of entries"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-primary-400/20 focus:border-primary-400 transition-all font-display text-lg"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-xs outline-none focus:ring-2 focus:ring-primary-400/20 focus:border-primary-400 transition-all"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-xs outline-none focus:ring-2 focus:ring-primary-400/20 focus:border-primary-400 transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl text-base font-semibold font-display shadow-md shadow-primary-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Activate Target"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
