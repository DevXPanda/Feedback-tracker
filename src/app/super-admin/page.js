"use client";
import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  Plus, 
  Users, 
  ShieldCheck, 
  Search,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Phone
} from "lucide-react";
import { toast } from "sonner";

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [storedUser, setStoredUser] = useState(null);
  const [isAddingUlb, setIsAddingUlb] = useState(false);
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [expandedUlbId, setExpandedUlbId] = useState(null);
  const [newUlb, setNewUlb] = useState({ name: "", code: "" });
  const [newAdmin, setNewAdmin] = useState({ name: "", phone: "", password: "", ulbId: "" });

  const ulbs = useQuery(api.ulbs.list);
  const createUlb = useMutation(api.ulbs.create);
  const createAdmin = useMutation(api.users.createAdmin);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "super_admin") {
      router.push("/");
    } else {
      setStoredUser(user);
    }
  }, [router]);

  const handleCreateUlb = async (e) => {
    e.preventDefault();
    try {
      await createUlb(newUlb);
      toast.success("ULB created successfully!");
      setIsAddingUlb(false);
      setNewUlb({ name: "", code: "" });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await createAdmin(newAdmin);
      toast.success("Admin created successfully!");
      setIsAddingAdmin(false);
      setNewAdmin({ name: "", phone: "", password: "", ulbId: "" });
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!ulbs) return <div className="p-8 text-center text-gray-500">Loading Tenants...</div>;

  return (
    <div className="min-h-screen bg-[#fcfcfd] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-display">Super Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Manage Urban Local Bodies and Global Administrators</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setIsAddingAdmin(true)}
              className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all active:scale-95"
            >
              <Users className="h-4 w-4" />
              Add Admin
            </button>
            <button 
              onClick={() => setIsAddingUlb(true)}
              className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-all active:scale-95"
            >
              <Building2 className="h-4 w-4" />
              New ULB
            </button>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          {/* ULB List */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary-600" />
              Urban Local Bodies
            </h2>
            <div className="bg-white border border-gray-200 rounded-[2rem] overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Code</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {ulbs.map((ulb) => (
                    <React.Fragment key={ulb._id}>
                      <tr 
                        onClick={() => setExpandedUlbId(expandedUlbId === ulb._id ? null : ulb._id)}
                        className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${expandedUlbId === ulb._id ? "bg-primary-50/30" : ""}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800">{ulb.name}</span>
                            {expandedUlbId === ulb._id ? (
                              <Search className="h-3 w-3 text-primary-500" />
                            ) : null}
                          </div>
                        </td>
                        <td className="px-6 py-4"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[10px] font-bold uppercase">{ulb.code}</span></td>
                        <td className="px-6 py-4 text-xs font-mono text-gray-400">{ulb._id}</td>
                      </tr>
                      {expandedUlbId === ulb._id && (
                        <tr>
                          <td colSpan="3" className="px-0 py-0">
                            <UlbAdminsList ulbId={ulb._id} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {ulbs.length === 0 && (
                    <tr>
                      <td colSpan="3" className="px-6 py-12 text-center text-gray-400">No ULBs found. Create one to get started.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Stats / Info */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              Security Overview
            </h2>
            <div className="bg-white border border-gray-200 rounded-[2rem] p-6 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
                  <span className="text-xs font-bold text-emerald-700 uppercase">Total Tenants</span>
                  <span className="text-xl font-black text-emerald-900">{ulbs.length}</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-2">
                    <AlertCircle className="h-3 w-3" />
                    Multi-tenant Note
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    All data is isolated by <code>ulbId</code>. Admins can only see data within their assigned tenant. 
                    Super Admins bypass tenant checks for global visibility.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add ULB Modal */}
      {isAddingUlb && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl border border-white/20">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Create New ULB</h3>
            <p className="text-sm text-gray-500 mb-6">Define a new tenant for the system.</p>
            <form onSubmit={handleCreateUlb} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">ULB Name</label>
                <input 
                  type="text" required
                  placeholder="e.g. New Delhi Municipal Council"
                  className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all"
                  value={newUlb.name}
                  onChange={(e) => setNewUlb({...newUlb, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Tenant Code (Slug)</label>
                <input 
                  type="text" required
                  placeholder="e.g. ndmc"
                  className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all"
                  value={newUlb.code}
                  onChange={(e) => setNewUlb({...newUlb, code: e.target.value.toLowerCase().replace(/\s/g, "")})}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsAddingUlb(false)} className="flex-1 h-12 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="flex-1 h-12 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-500/20 active:scale-95 transition-all">Create ULB</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Admin Modal */}
      {isAddingAdmin && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl border border-white/20">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Create ULB Admin</h3>
            <p className="text-sm text-gray-500 mb-6">Assign a global administrator to a specific ULB.</p>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Full Name</label>
                <input 
                  type="text" required
                  placeholder="Admin Name"
                  className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Phone Number</label>
                <input 
                  type="text" required
                  placeholder="78360XXXXX"
                  className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all"
                  value={newAdmin.phone}
                  onChange={(e) => setNewAdmin({...newAdmin, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Password</label>
                <input 
                  type="password" required
                  placeholder="••••••••"
                  className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Select ULB</label>
                <select 
                  required
                  className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm focus:ring-4 focus:ring-primary-50 focus:border-primary-500 outline-none transition-all"
                  value={newAdmin.ulbId}
                  onChange={(e) => setNewAdmin({...newAdmin, ulbId: e.target.value})}
                >
                  <option value="">Select a ULB...</option>
                  {ulbs.map((ulb) => (
                    <option key={ulb._id} value={ulb._id}>{ulb.name} ({ulb.code})</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsAddingAdmin(false)} className="flex-1 h-12 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="flex-1 h-12 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">Assign Admin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function UlbAdminsList({ ulbId }) {
  const admins = useQuery(api.users.listAdminsByUlb, { ulbId });

  if (!admins) return <div className="px-12 py-4 text-xs text-gray-400 animate-pulse">Loading admins...</div>;

  return (
    <div className="bg-gray-50/50 px-12 py-4 border-l-4 border-primary-500 space-y-3">
      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
        <Users className="h-3 w-3" />
        Assigned Administrators
      </h4>
      <div className="grid gap-3">
        {admins.map(admin => (
          <AdminDetailItem key={admin._id} admin={admin} />
        ))}
        {admins.length === 0 && (
          <p className="text-xs text-gray-400 italic py-2">No admins assigned to this ULB yet.</p>
        )}
      </div>
    </div>
  );
}

function AdminDetailItem({ admin }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const members = useQuery(api.teamMembers.listMembersByAdmin, { adminId: admin._id });

  return (
    <div className="space-y-2">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:border-primary-200 transition-all active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
            {admin.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{admin.name}</p>
            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
               <Phone className="h-2.5 w-2.5" />
               {admin.phone}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1 text-right">Password</p>
            <p className="font-mono text-gray-600 text-xs"><code>{admin.password}</code></p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="ml-6 pl-6 border-l-2 border-gray-100 py-2 space-y-3 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <h5 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="h-3 w-3" />
              Managed Members ({members?.length || 0})
            </h5>
          </div>
          
          {members === undefined ? (
            <div className="grid grid-cols-2 gap-2">
               {[1, 2].map(i => <div key={i} className="h-10 bg-gray-50 rounded-lg animate-pulse" />)}
            </div>
          ) : members.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {members.map(member => (
                <div key={member._id} className="bg-gray-50/50 p-2.5 rounded-xl border border-gray-100 flex items-center justify-between group hover:bg-white hover:border-primary-100 transition-all">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-white border border-gray-100 text-primary-600 flex items-center justify-center font-bold text-[10px] group-hover:bg-primary-50 group-hover:border-primary-50 transition-colors">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700">{member.name}</p>
                      <p className="text-[9px] font-mono text-gray-400">{member.phone}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50/50 rounded-xl p-4 border border-dashed border-gray-200 text-center">
              <p className="text-[10px] text-gray-400 italic font-medium">No members created by this admin yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
