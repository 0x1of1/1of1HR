import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";
import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
  change?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({ 
  title, 
  value, 
  icon, 
  iconBgColor, 
  iconColor,
  change 
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        </div>
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", iconBgColor, iconColor)}>
          {icon}
        </div>
      </div>
      
      {change && (
        <div className="mt-2 flex items-center text-xs">
          <span className={cn(
            "font-medium flex items-center",
            change.isPositive ? "text-success" : "text-error"
          )}>
            {change.isPositive ? (
              <ArrowUp className="mr-1 h-3 w-3" />
            ) : (
              <ArrowDown className="mr-1 h-3 w-3" />
            )}
            {Math.abs(change.value)}%
          </span>
          <span className="text-slate-400 ml-2">from last month</span>
        </div>
      )}
    </div>
  );
}
