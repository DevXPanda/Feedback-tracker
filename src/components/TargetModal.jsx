"use client";
import { useState, useMemo } from "react";
import { X, Target, Calendar, Loader2, Search, User } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

export default function TargetModal({ isOpen, onClose, initialUserId }) {
  const { t } = useLanguage();
  const [userId, setUserId] = useState(initialUserId || "");
  const [target, setTarget] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [label, setLabel] = useState(t("modals.daily_target"));
  const [isLoading, setIsLoading] = useState(false);
  const [searchMember, setSearchMember] = useState("");

  const users = useQuery(api.users.getUsers) || [];
  const setTargetMutation = useMutation(api.targets.setTarget);

  const filteredUsers = useMemo(() => {
    return users
      .filter(u => u.role !== "admin")
      .filter(u => 
        u.name.toLowerCase().includes(searchMember.toLowerCase()) ||
        u.phone?.includes(searchMember)
      );
  }, [users, searchMember]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!target || !startDate || !endDate || (!initialUserId && !userId)) {
      toast.error(t("modals.fill_all_fields"));
      return;
    }

    setIsLoading(true);
    try {
      const selectedUser = users.find(u => u._id === (initialUserId || userId));
      await setTargetMutation({
        target: parseInt(target),
        startDate: new Date(startDate).setHours(0, 0, 0, 0),
        endDate: new Date(endDate).setHours(23, 59, 59, 999),
        teamId: selectedUser?.teamId,
        userId: initialUserId || userId,
        label,
      });
      toast.success(t("common.save"));
      onClose();
    } catch (error) {
      toast.error(t("modals.error_set_target"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="relative w-full max-w-[440px] transform overflow-hidden rounded-2xl bg-white p-8 shadow-2xl transition-all animate-in fade-in zoom-in duration-200 border border-gray-200">
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-white mb-4 shadow-md shadow-amber-100">
            <Target className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-semibold font-display text-gray-800 tracking-tight">{t("modals.set_target_title")}</h2>
          <p className="text-xs text-gray-500 mt-2">{t("modals.set_target_desc")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!initialUserId && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1 uppercase tracking-wider">{t("modals.select_member")}</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t("dashboard.search_placeholder")}
                  value={searchMember}
                  onChange={(e) => setSearchMember(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50/30 text-sm outline-none focus:ring-2 focus:ring-primary-400/10 focus:border-primary-400 transition-all mb-2"
                />
              </div>
              <div className="max-h-[140px] overflow-y-auto rounded-lg border border-gray-100 bg-white">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(u => (
                    <button
                      key={u._id}
                      type="button"
                      onClick={() => setUserId(u._id)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                        userId === u._id ? "bg-primary-50 text-primary-700 font-semibold" : "text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                         <User className="h-3.5 w-3.5 text-gray-400" />
                         <span>{u.name}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">{u.phone}</span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-gray-400">{t("dashboard.no_results")}</div>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1 uppercase tracking-wider">{t("modals.target_goal")}</label>
            <div className="grid grid-cols-2 gap-3">
              <input 
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder={t("modals.target_label")}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-400/10 focus:border-primary-400 transition-all"
              />
              <input 
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder={t("modals.goal_count")}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-400/10 focus:border-primary-400 transition-all font-bold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-600 ml-1 uppercase tracking-wider">{t("modals.start_date")}</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-xs outline-none focus:ring-2 focus:ring-primary-400/10 focus:border-primary-400 transition-all"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-600 ml-1 uppercase tracking-wider">{t("modals.end_date")}</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-xs outline-none focus:ring-2 focus:ring-primary-400/10 focus:border-primary-400 transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm shadow-none mt-4"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Target className="h-4 w-4" />
                <span>{t("modals.activate_button")}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
