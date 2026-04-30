import { MapPin, MousePointer2, TrendingUp, ChevronRight, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { toast } from "sonner";
import { useState } from "react";
import EditTeamModal from "./EditTeamModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

export default function TeamCard({ team }) {
  const deleteTeam = useMutation(api.teams.deleteTeam);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTeam({ teamId: team._id });
      toast.success("Team deleted successfully");
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error("Failed to delete team");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  return (
    <>
      <Link 
        href={`/dashboard/team/${team._id}`}
        className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-white p-3.5 sm:p-5 border border-gray-200 transition-all hover:border-primary-200"
      >
        <div className="flex flex-col gap-3 sm:gap-5 relative z-10">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <h3 className="text-sm sm:text-lg font-semibold font-display text-gray-800 group-hover:text-primary-600 transition-colors truncate">
                {team.name}
              </h3>
              <div className="mt-0.5 sm:mt-1 flex items-center gap-1 text-[10px] sm:text-sm text-gray-400 font-medium truncate">
                <MapPin className="h-3 sm:h-3.5 w-3 sm:w-3.5 text-gray-400 shrink-0" />
                <span>W{team.ward}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                onClick={handleEdit}
                className="h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded-lg border border-gray-100 bg-white text-gray-400 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50 transition-all md:opacity-0 group-hover:opacity-100"
                title="Edit Team"
              >
                <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </button>
              <button
                onClick={openDeleteModal}
                className="h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded-lg border border-gray-100 bg-white text-gray-400 hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition-all md:opacity-0 group-hover:opacity-100"
                title="Delete Team"
              >
                <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </button>
              <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-500 transition-all">
                <ChevronRight className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-gray-50 pt-3 sm:pt-4 gap-2">
            <div className="flex flex-col gap-0.5 text-left">
              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">
                Clicks
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-2xl font-semibold text-gray-800 font-display">
                  {team.clickCount.toLocaleString()}
                </span>
                <span className="hidden sm:inline text-xs font-medium text-gray-400">total</span>
              </div>
            </div>
            
            <div className="flex -space-x-2 overflow-hidden self-end sm:self-center">
               <div className="inline-block h-5 w-5 sm:h-6 sm:w-6 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-400">
                 +
               </div>
            </div>
          </div>
        </div>
      </Link>

      <EditTeamModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        team={team}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        itemName={team.name}
        isLoading={isDeleting}
      />
    </>
  );
}
