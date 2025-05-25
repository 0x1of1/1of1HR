import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, BarChart3, DollarSign, Users } from "lucide-react";
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Reports() {
  // Sample data for demonstration
  const departmentData = {
    labels: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'],
    datasets: [
      {
        label: 'Employees',
        data: [12, 8, 15, 5, 7],
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
      },
    ],
  };
  
  const attendanceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Present',
        data: [90, 88, 92, 89, 91, 87],
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
      },
      {
        label: 'Absent',
        data: [10, 12, 8, 11, 9, 13],
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
      },
    ],
  };

  const turnoverData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Hires',
        data: [3, 2, 4, 1, 5, 2],
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
      },
      {
        label: 'Departures',
        data: [1, 2, 1, 3, 1, 2],
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  return (
    <MainLayout title="Reports & Analytics">
      <div className="space-y-4 p-8">
        <h1 className="text-2xl font-bold tracking-tight text-black">Reports & Analytics</h1>
        <p className="text-gray-500">View and analyze company statistics and trends.</p>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0">
                <p className="text-sm font-medium text-gray-500">Total Employees</p>
                <Users className="h-5 w-5 text-gray-500" />
              </div>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-black">47</h3>
                <span className="text-xs text-green-500">+2.5%</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0">
                <p className="text-sm font-medium text-gray-500">Attendance Rate</p>
                <BarChart className="h-5 w-5 text-gray-500" />
              </div>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-black">89.5%</h3>
                <span className="text-xs text-red-500">-1.2%</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0">
                <p className="text-sm font-medium text-gray-500">Turnover Rate</p>
                <BarChart3 className="h-5 w-5 text-gray-500" />
              </div>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-black">5.3%</h3>
                <span className="text-xs text-green-500">-0.8%</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0">
                <p className="text-sm font-medium text-gray-500">Avg. Salary</p>
                <DollarSign className="h-5 w-5 text-gray-500" />
              </div>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-black">$72,540</h3>
                <span className="text-xs text-green-500">+3.1%</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="departments">
          <TabsList className="mb-6">
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="turnover">Turnover</TabsTrigger>
          </TabsList>
          
          <TabsContent value="departments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-black">Employee Distribution by Department</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[350px] w-full">
                  <Bar data={departmentData} options={options} height={350} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-black">Attendance Trends (Last 6 Months)</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[350px] w-full">
                  <Bar data={attendanceData} options={options} height={350} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="turnover" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-black">Employee Turnover (Last 6 Months)</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[350px] w-full">
                  <Bar data={turnoverData} options={options} height={350} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}