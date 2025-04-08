import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { Course } from '../types';
import AttendanceTracker from '../components/Attendance/AttendanceTracker';
import AttendanceReport from '../components/Attendance/AttendanceReport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { CalendarCheck, FileText } from 'lucide-react';

const Attendance: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const coursesRef = ref(db, 'courses');
    const unsubscribe = onValue(coursesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const coursesArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setCourses(coursesArray);
      } else {
        setCourses([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Attendance Management</h2>
      
      <Tabs defaultValue="track">
        <TabsList>
          <TabsTrigger value="track">
            <CalendarCheck className="w-4 h-4 mr-2" />
            Track Attendance
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="w-4 h-4 mr-2" />
            View Reports
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="track">
          <AttendanceTracker courses={courses} loading={loading} />
        </TabsContent>
        
        <TabsContent value="reports">
          <AttendanceReport courses={courses} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Attendance;