"use client";
import { X, AlertTriangle, Loader2, Trash2 } from "lucide-react";

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, itemName, isLoading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-6">
            <AlertTriangle className="h-8 w-8" />
          </div>
          
          <h2 className="text-xl font-bold font-display text-gray-900 mb-2">Confirm Deletion</h2>
          <p className="text-sm text-gray-500 leading-relaxed px-2">
            Are you sure you want to delete <span className="text-gray-900 font-semibold">"{itemName}"</span>? This action cannot be undone and will remove all associated data.
          </p>
        </div>

        <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-12 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 h-12 rounded-xl bg-red-600 text-white text-sm font-semibold shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
