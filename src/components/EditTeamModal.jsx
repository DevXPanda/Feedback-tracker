"use client";
import { useState, useEffect } from "react";
import { X, Edit3, Loader2, Save } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { toast } from "sonner";

export default function EditTeamModal({ isOpen, onClose, team }) {
  const [name, setName] = useState("");
  const [ward, setWard] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const updateTeam = useMutation(api.teams.updateTeam);

  useEffect(() => {
    if (team) {
      setName(team.name);
      setWard(team.ward);
    }
  }, [team]);

  if (!isOpen || !team) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !ward) return;

    setIsLoading(true);
    try {
      await updateTeam({
        teamId: team._id,
        name,
        ward,
      });
      toast.success("Team updated successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to update team.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Edit3 className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold font-display text-gray-800 tracking-tight">Edit Team</h2>
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
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 text-left block">Team Name</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Marketing"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-primary-400/20 focus:border-primary-400 transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 text-left block">Ward Location</label>
            <input 
              type="text"
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              placeholder="e.g. Ward 04"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-primary-400/20 focus:border-primary-400 transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl text-base font-semibold font-display shadow-md shadow-primary-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Save className="h-5 w-5" />
                Update Team
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
