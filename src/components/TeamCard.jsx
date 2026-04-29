import { MapPin, MousePointer2, TrendingUp, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function TeamCard({ team }) {
  return (
    <Link 
      href={`/dashboard/team/${team._id}`}
      className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-gray-200 transition-all hover:border-primary-200 hover:shadow-md hover:shadow-primary-50/50"
    >
      <div className="flex flex-col gap-5 relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold font-display text-gray-800 group-hover:text-primary-600 transition-colors">
              {team.name}
            </h3>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-400">
              <MapPin className="h-3.5 w-3.5 text-gray-400" />
              <span>Ward {team.ward}</span>
            </div>
          </div>
          
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-500 transition-all">
            <ChevronRight className="h-5 w-5" />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-50 pt-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">
              Click Count
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold text-gray-800 font-display">
                {team.clickCount.toLocaleString()}
              </span>
              <span className="text-xs font-medium text-gray-400">total clicks</span>
            </div>
          </div>
          
          <div className="flex -space-x-2 overflow-hidden">
             <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-400">
               +
             </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
