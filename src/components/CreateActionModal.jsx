"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { X, UserPlus, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function CreateActionModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [memberData, setMemberData] = useState({ name: "", phone: "", password: "" });

  const createUserMutation = useMutation(api.users.createUser);

  if (!isOpen) return null;

  const handleAddMember = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createUserMutation({
        name: memberData.name,
        phone: memberData.phone,
        password: memberData.password,
        role: "team",
        // teamId is explicitly not sent here, making it an independent member
      });
      
      toast.success("Member added successfully!");
      setMemberData({ name: "", phone: "", password: "" });
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-[400px] bg-white rounded-2xl border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl p-8 relative">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white mb-4 shadow-md shadow-primary-100">
            <UserPlus className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-semibold font-display text-gray-800 tracking-tight">Add Member</h2>
          <p className="text-xs text-gray-500 mt-2">Create a new member in your network.</p>
        </div>

        <form onSubmit={handleAddMember} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1 uppercase tracking-wider">Full Name</label>
            <input
              required
              type="text"
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-400/10"
              placeholder="e.g. John Doe"
              value={memberData.name}
              onChange={(e) => setMemberData({ ...memberData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1 uppercase tracking-wider">Phone Number</label>
            <input
              required
              type="tel"
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-400/10"
              placeholder="9876..."
              value={memberData.phone}
              onChange={(e) => setMemberData({ ...memberData, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1 uppercase tracking-wider">Pin / Password</label>
            <input
              required
              type="password"
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-400/10"
              placeholder="••••"
              value={memberData.password}
              onChange={(e) => setMemberData({ ...memberData, password: e.target.value })}
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm shadow-none mt-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Create Member</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-50 text-center">
          <p className="text-[10px] text-gray-400 italic">
            New members will be able to log in using their phone and password.
          </p>
        </div>
      </div>
    </div>
  );
}
