import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { ref, onValue, update, remove } from 'firebase/database';
import { Student } from '../../types';
import { Checkbox } from '../ui/Checkbox';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Search } from 'lucide-react';

interface EnrollStudentsProps {
  courseId: string;
  onComplete: () => void;
}

const EnrollStudents: React.FC<EnrollStudentsProps> = ({ courseId, onComplete }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Load all students
    const studentsRef = ref(db, 'students');
    const unsubscribeStudents = onValue(studentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const studentsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setStudents(studentsArray);
      } else {
        setStudents([]);
      }
    });

    // Load enrolled students for this course
    const enrollmentsRef = ref(db, `enrollments/${courseId}`);
    const unsubscribeEnrollments = onValue(enrollmentsRef, (snapshot) => {
      setEnrolledStudents(snapshot.val() || {});
      setLoading(false);
    });

    return () => {
      unsubscribeStudents();
      unsubscribeEnrollments();
    };
  }, [courseId]);

  const handleEnrollmentChange = async (studentId: string, isEnrolled: boolean) => {
    const updates = {};
    updates[`enrollments/${courseId}/${studentId}`] = isEnrolled || null;
    await update(ref(db), updates);
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="Search students..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div>Loading enrollments...</div>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          {filteredStudents.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400">No students found</div>
          ) : (
            <div className="space-y-2">
              {filteredStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {student.email} • {student.id.substring(0, 8)}
                    </p>
                  </div>
                  <Checkbox
                    checked={!!enrolledStudents[student.id]}
                    onCheckedChange={(checked) => 
                      handleEnrollmentChange(student.id, !!checked)
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button onClick={onComplete}>Done</Button>
      </div>
    </div>
  );
};

export default EnrollStudents;