"use client";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { X, Plus, UserPlus, Loader2, Sparkles, Layout } from "lucide-react";
import { toast } from "sonner";

export default function CreateActionModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("team");
  const [loading, setLoading] = useState(false);
  
  const [teamData, setTeamData] = useState({ name: "", ward: "" });
  const [memberData, setMemberData] = useState({ teamId: "", name: "", phone: "", password: "" });

  const teams = useQuery(api.teams.getTeams);
  const createTeamMutation = useMutation(api.teams.createTeam);
  const createUserMutation = useMutation(api.users.createUser);

  if (!isOpen) return null;

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createTeamMutation({ name: teamData.name, ward: teamData.ward });
      toast.success("Team created successfully!");
      setTeamData({ name: "", ward: "" });
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberData.teamId) {
      toast.error("Please select a team");
      return;
    }
    setLoading(true);
    try {
      await createUserMutation({
        name: memberData.name,
        phone: memberData.phone,
        password: memberData.password,
        role: "team",
        teamId: memberData.teamId,
      });
      toast.success("Member added successfully!");
      setMemberData({ teamId: "", name: "", phone: "", password: "" });
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-[2rem] border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div>
            <h2 className="text-xl font-bold font-display text-gray-900">Quick Create</h2>
            <p className="text-xs text-gray-500 mt-1">Manage your team structure and members.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-white hover:text-gray-600 transition-all border border-transparent hover:border-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 bg-gray-100/50 mx-6 mt-6 rounded-2xl">
          <button
            onClick={() => setActiveTab("team")}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === "team" ? "bg-white text-primary-600 border border-gray-100" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Plus className="h-3.5 w-3.5" />
            Create Team
          </button>
          <button
            onClick={() => setActiveTab("member")}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === "member" ? "bg-white text-primary-600 border border-gray-100" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Add Member
          </button>
        </div>

        <div className="p-8 pt-6">
          {activeTab === "team" ? (
            <form onSubmit={handleCreateTeam} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Team Name</label>
                  <input
                    required
                    type="text"
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-400 transition-all"
                    placeholder="e.g. Marketing"
                    value={teamData.name}
                    onChange={(e) => setTeamData({ ...teamData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Ward Location</label>
                  <input
                    required
                    type="text"
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-400 transition-all"
                    placeholder="e.g. Ward 04"
                    value={teamData.ward}
                    onChange={(e) => setTeamData({ ...teamData, ward: e.target.value })}
                  />
                </div>
              </div>
              <button
                disabled={loading}
                type="submit"
                className="w-full h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Create New Team
              </button>
            </form>
          ) : (
            <form onSubmit={handleAddMember} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Select Team</label>
                  <div className="relative">
                    <select
                      required
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-400 transition-all appearance-none"
                      value={memberData.teamId}
                      onChange={(e) => setMemberData({ ...memberData, teamId: e.target.value })}
                    >
                      <option value="">Choose a team...</option>
                      {teams?.map((team) => (
                        <option key={team._id} value={team._id}>{team.name} ({team.ward})</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <Layout className="h-4 w-4" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    required
                    type="text"
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-400 transition-all"
                    placeholder="e.g. John Doe"
                    value={memberData.name}
                    onChange={(e) => setMemberData({ ...memberData, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Phone</label>
                    <input
                      required
                      type="tel"
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-400 transition-all"
                      placeholder="9876..."
                      value={memberData.phone}
                      onChange={(e) => setMemberData({ ...memberData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
                    <input
                      required
                      type="password"
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-400 transition-all"
                      placeholder="••••"
                      value={memberData.password}
                      onChange={(e) => setMemberData({ ...memberData, password: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <button
                disabled={loading || !teams?.length}
                type="submit"
                className="w-full h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Add Team Member
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
