import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { ref, onValue } from 'firebase/database';
import StatsCard from '../components/Dashboard/StatsCard';
import { Student, Course } from '../types';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const studentsRef = ref(db, 'students');
    const coursesRef = ref(db, 'courses');

    const unsubscribeStudents = onValue(studentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStudents(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      } else {
        setStudents([]);
      }
    });

    const unsubscribeCourses = onValue(coursesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCourses(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      } else {
        setCourses([]);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeStudents();
      unsubscribeCourses();
    };
  }, []);

  // Calculate attendance percentage per course (mock data for demo)
  const getAttendancePercentage = (courseId: string) => {
    const randomPercentage = Math.floor(Math.random() * 30) + 70; // Random between 70-100%
    return randomPercentage;
  };

  const coursesWithAttendance = courses.map(course => ({
    ...course,
    attendancePercentage: getAttendancePercentage(course.id)
  }));

  const barChartData = {
    labels: courses.map(course => course.name),
    datasets: [
      {
        label: 'Attendance Percentage',
        data: courses.map(course => getAttendancePercentage(course.id)),
        backgroundColor: '#4361ee',
      }
    ]
  };

  const pieChartData = {
    labels: ['Present', 'Absent'],
    datasets: [
      {
        data: [85, 15], // Mock data
        backgroundColor: ['#4cc9f0', '#f72585'],
      }
    ]
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total Students" 
          value={students.length} 
          icon="users" 
          trend="up" 
          trendValue="12%"
        />
        <StatsCard 
          title="Total Courses" 
          value={courses.length} 
          icon="book" 
          trend="up" 
          trendValue="5%"
        />
        <StatsCard 
          title="Avg Attendance" 
          value="87%" 
          icon="calendar-check" 
          trend="down" 
          trendValue="3%"
        />
        <StatsCard 
          title="Active Today" 
          value={Math.floor(students.length * 0.75)} 
          icon="activity" 
          trend="up" 
          trendValue="8%"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Course Attendance Rates
          </h3>
          <Bar 
            data={barChartData} 
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Attendance by Course',
                },
              },
              scales: {
                y: {
                  min: 0,
                  max: 100,
                  ticks: {
                    callback: (value) => `${value}%`
                  }
                }
              }
            }}
          />
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Overall Attendance Distribution
          </h3>
          <div className="h-64 flex items-center justify-center">
            <Pie 
              data={pieChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
          Recent Courses
        </h3>
        {loading ? (
          <div>Loading courses...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {coursesWithAttendance.slice(0, 3).map((course) => (
              <div key={course.id} className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-800 dark:text-white">
                  {course.name} ({course.code})
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {course.instructor} • {course.schedule}
                </p>
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Attendance</span>
                    <span>{course.attendancePercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${course.attendancePercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;