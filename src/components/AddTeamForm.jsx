"use client";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Plus, UserPlus, Shield, Loader2, Users } from "lucide-react";
import { toast } from "sonner";

export default function AddTeamForm() {
  const [activeTab, setActiveTab] = useState("team"); // 'team' or 'member'
  const [loading, setLoading] = useState(false);
  
  // Team Form State
  const [teamData, setTeamData] = useState({
    name: "",
    ward: "",
  });

  // Member Form State
  const [memberData, setMemberData] = useState({
    teamId: "",
    name: "",
    phone: "",
    password: "",
  });

  const teams = useQuery(api.teams.getTeams);
  const createTeamMutation = useMutation(api.teams.createTeam);
  const createUserMutation = useMutation(api.users.createUser);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createTeamMutation({
        name: teamData.name,
        ward: teamData.ward,
      });
      toast.success("Team created successfully!");
      setTeamData({ name: "", ward: "" });
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
    } catch (error) {
      toast.error(error.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab("team")}
          className={`flex-1 py-3 text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === "team" 
              ? "text-primary-600 bg-primary-50/30 border-b-2 border-primary-600" 
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Plus className="h-3.5 w-3.5" />
          Create Team
        </button>
        <button
          onClick={() => setActiveTab("member")}
          className={`flex-1 py-3 text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === "member" 
              ? "text-primary-600 bg-primary-50/30 border-b-2 border-primary-600" 
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <UserPlus className="h-3.5 w-3.5" />
          Add Member
        </button>
      </div>

      <div className="p-5">
        {activeTab === "team" ? (
          <form onSubmit={handleCreateTeam} className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Team Details
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1 ml-0.5 uppercase">Team Name</label>
                  <input
                    required
                    type="text"
                    className="block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-xs outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-400/10"
                    placeholder="Marketing"
                    value={teamData.name}
                    onChange={(e) => setTeamData({ ...teamData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1 ml-0.5 uppercase">Ward</label>
                  <input
                    required
                    type="text"
                    className="block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-xs outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-400/10"
                    placeholder="Ward 04"
                    value={teamData.ward}
                    onChange={(e) => setTeamData({ ...teamData, ward: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-4 rounded-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs mt-2"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              Create Team
            </button>
          </form>
        ) : (
          <form onSubmit={handleAddMember} className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Member Access
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1 ml-0.5 uppercase">Select Team</label>
                  <select
                    required
                    className="block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-xs outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-400/10 appearance-none"
                    value={memberData.teamId}
                    onChange={(e) => setMemberData({ ...memberData, teamId: e.target.value })}
                  >
                    <option value="">Select a team...</option>
                    {teams?.map((team) => (
                      <option key={team._id} value={team._id}>
                        {team.name} ({team.ward})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1 ml-0.5 uppercase">Member Name</label>
                  <input
                    required
                    type="text"
                    className="block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-xs outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-400/10"
                    placeholder="John Doe"
                    value={memberData.name}
                    onChange={(e) => setMemberData({ ...memberData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1 ml-0.5 uppercase">Phone Number</label>
                  <input
                    required
                    type="tel"
                    className="block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-xs outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-400/10"
                    placeholder="9876543210"
                    value={memberData.phone}
                    onChange={(e) => setMemberData({ ...memberData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1 ml-0.5 uppercase">Password</label>
                  <input
                    required
                    type="password"
                    className="block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-xs outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-400/10"
                    placeholder="••••••••"
                    value={memberData.password}
                    onChange={(e) => setMemberData({ ...memberData, password: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <button
              disabled={loading || !teams?.length}
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-4 rounded-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs mt-2"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <UserPlus className="h-3.5 w-3.5" />
              )}
              Add Member
            </button>
            {!teams?.length && (
              <p className="text-[10px] text-amber-600 font-medium text-center">
                Create a team first before adding members.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
