"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Plus, UserPlus, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AddTeamForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    teamName: "",
    ward: "",
    memberName: "",
    email: "",
    password: "",
  });

  const createTeam = useMutation(api.teams.createTeam);
  const createUser = useMutation(api.users.createUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Create Team
      const teamId = await createTeam({
        name: formData.teamName,
        ward: formData.ward,
      });

      // 2. Create User (Team Member)
      await createUser({
        name: formData.memberName,
        email: formData.email,
        password: formData.password,
        role: "team",
        teamId: teamId,
      });

      toast.success("Team and member created successfully!");
      setFormData({
        teamName: "",
        ward: "",
        memberName: "",
        email: "",
        password: "",
      });
    } catch (error) {
      toast.error(error.message || "Failed to create team/member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
        <Plus className="h-3.5 w-3.5 text-primary-500" />
        <h2 className="text-base font-semibold font-display text-gray-800">Add Team & Member</h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            Team Details
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1 ml-0.5 uppercase">Team Name</label>
              <input
                required
                type="text"
                className="block w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-400/10"
                placeholder="Marketing"
                value={formData.teamName}
                onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1 ml-0.5 uppercase">Ward</label>
              <input
                required
                type="text"
                className="block w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-400/10"
                placeholder="Ward 04"
                value={formData.ward}
                onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            Member Access
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1 ml-0.5 uppercase">Member Name</label>
              <input
                required
                type="text"
                className="block w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-400/10"
                placeholder="John Doe"
                value={formData.memberName}
                onChange={(e) => setFormData({ ...formData, memberName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1 ml-0.5 uppercase">Email Address</label>
                <input
                  required
                  type="email"
                  className="block w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-400/10"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1 ml-0.5 uppercase">Password</label>
                <input
                  required
                  type="password"
                  className="block w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-400/10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        disabled={loading}
        type="submit"
        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs mt-2"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <UserPlus className="h-3.5 w-3.5" />
        )}
        Create Team & Member
      </button>
    </form>
  );
}
