import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { Course } from '../../types';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Calendar } from '../ui/Calendar';
import { format, subDays } from 'date-fns';
import { Bar } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import { Download } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface AttendanceReportProps {
  courses: Course[];
  loading: boolean;
}

interface AttendanceData {
  date: string;
  presentStudents: string[];
}

const AttendanceReport: React.FC<AttendanceReportProps> = ({ courses, loading }) => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    if (!selectedCourse) return;

    const fetchAttendanceData = async () => {
      setReportLoading(true);
      const attendanceRef = ref(db, `attendance/${selectedCourse}`);
      const unsubscribe = onValue(attendanceRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const attendanceArray: AttendanceData[] = Object.keys(data).map(date => ({
            date,
            presentStudents: Object.keys(data[date])
          }));
          setAttendanceData(attendanceArray);
        } else {
          setAttendanceData([]);
        }
        setReportLoading(false);
      });

      return () => unsubscribe();
    };

    fetchAttendanceData();
  }, [selectedCourse]);

  const filteredData = attendanceData.filter(item => {
    if (!startDate || !endDate) return true;
    const itemDate = new Date(item.date);
    return itemDate >= startDate && itemDate <= endDate;
  });

  const exportToExcel = () => {
    const wsData = [
      ['Date', 'Present Students', 'Attendance Count'],
      ...filteredData.map(item => [
        item.date,
        item.presentStudents.join(', '),
        item.presentStudents.length
      ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');
    XLSX.writeFile(wb, `attendance_report_${selectedCourse}.xlsx`);
  };

  const chartData = {
    labels: filteredData.map(item => format(new Date(item.date), 'MMM dd')),
    datasets: [
      {
        label: 'Attendance Count',
        data: filteredData.map(item => item.presentStudents.length),
        backgroundColor: '#4361ee',
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Select
          label="Select Course"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          disabled={loading}
        >
          <option value="">Select a course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name} ({course.code})
            </option>
          ))}
        </Select>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Start Date
          </label>
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={setStartDate}
            className="rounded-md border"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            End Date
          </label>
          <Calendar
            mode="single"
            selected={endDate}
            onSelect={setEndDate}
            className="rounded-md border"
          />
        </div>
      </div>

      {selectedCourse && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">
              Attendance Report
            </h3>
            <Button onClick={exportToExcel} disabled={filteredData.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export to Excel
            </Button>
          </div>

          {reportLoading ? (
            <div>Loading attendance data...</div>
          ) : filteredData.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400">No attendance records found</div>
          ) : (
            <>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <Bar 
                  data={chartData} 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      title: {
                        display: true,
                        text: 'Daily Attendance Count',
                      },
                    },
                  }}
                />
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Attendance Count
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredData.map((item) => (
                      <tr key={item.date}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {format(new Date(item.date), 'PPP')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {item.presentStudents.length}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceReport;