import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', hires: 4, terminations: 2, netChange: 2 },
  { name: 'Feb', hires: 3, terminations: 1, netChange: 2 },
  { name: 'Mar', hires: 5, terminations: 2, netChange: 3 },
  { name: 'Apr', hires: 7, terminations: 3, netChange: 4 },
  { name: 'May', hires: 2, terminations: 4, netChange: -2 },
  { name: 'Jun', hires: 6, terminations: 1, netChange: 5 },
  { name: 'Jul', hires: 8, terminations: 2, netChange: 6 }
];

interface ActivityChartProps {
  className?: string;
}

export function ActivityChart({ className }: ActivityChartProps) {
  const [timeRange, setTimeRange] = useState("7days");
  
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Employee Activity</CardTitle>
        <div className="flex items-center gap-2">
          <Select defaultValue={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTerminations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="hires" 
                stroke="#6366f1" 
                fillOpacity={1} 
                fill="url(#colorHires)" 
                name="New Hires"
              />
              <Area 
                type="monotone" 
                dataKey="terminations" 
                stroke="#ef4444" 
                fillOpacity={1} 
                fill="url(#colorTerminations)" 
                name="Terminations"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="p-2">
            <p className="text-xs font-medium text-slate-500">New Hires</p>
            <p className="text-lg font-semibold text-slate-900">18</p>
          </div>
          <div className="p-2">
            <p className="text-xs font-medium text-slate-500">Terminations</p>
            <p className="text-lg font-semibold text-slate-900">6</p>
          </div>
          <div className="p-2">
            <p className="text-xs font-medium text-slate-500">Net Change</p>
            <p className="text-lg font-semibold text-success">+12</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
