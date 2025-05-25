import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Eye, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DepartmentStat } from "@shared/schema";

interface DepartmentTableProps {
  className?: string;
}

// Mock department data for initial UI
const initialDepartments = [
  {
    id: 1,
    department: "engineering",
    headCount: 48,
    openPositions: 5,
    attritionRate: "7.2%",
    avgTenure: "2.5 years"
  },
  {
    id: 2,
    department: "marketing",
    headCount: 32,
    openPositions: 2,
    attritionRate: "12.5%",
    avgTenure: "1.8 years"
  },
  {
    id: 3,
    department: "sales",
    headCount: 64,
    openPositions: 3,
    attritionRate: "15.2%",
    avgTenure: "1.2 years"
  },
  {
    id: 4,
    department: "product",
    headCount: 27,
    openPositions: 1,
    attritionRate: "5.8%",
    avgTenure: "3.2 years"
  },
  {
    id: 5,
    department: "hr",
    headCount: 12,
    openPositions: 0,
    attritionRate: "4.1%",
    avgTenure: "4.5 years"
  }
];

export function DepartmentTable({ className }: DepartmentTableProps) {
  const { data: departments, isLoading } = useQuery<DepartmentStat[]>({
    queryKey: ["/api/department-stats"],
    // Using initialDepartments as placeholder until real data is fetched
    // When real implementation is ready, remove this placeholder
    placeholderData: initialDepartments as unknown as DepartmentStat[],
  });

  const formatDepartmentName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Department Overview</CardTitle>
        <Button size="sm" className="text-xs bg-secondary-500 text-white hover:bg-secondary-600">
          <Download className="h-3 w-3 mr-1" /> Export
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs text-slate-700 uppercase">Department</TableHead>
                <TableHead className="text-xs text-slate-700 uppercase">Head Count</TableHead>
                <TableHead className="text-xs text-slate-700 uppercase">Open Positions</TableHead>
                <TableHead className="text-xs text-slate-700 uppercase">Attrition Rate</TableHead>
                <TableHead className="text-xs text-slate-700 uppercase">Avg. Tenure</TableHead>
                <TableHead className="text-xs text-slate-700 uppercase">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments?.map(dept => (
                <TableRow key={dept.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    {formatDepartmentName(dept.department)}
                  </TableCell>
                  <TableCell>{dept.headCount}</TableCell>
                  <TableCell>{dept.openPositions}</TableCell>
                  <TableCell>{dept.attritionRate}</TableCell>
                  <TableCell>{dept.avgTenure}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary-600 hover:text-secondary-700">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
