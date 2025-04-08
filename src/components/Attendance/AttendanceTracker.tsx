import React, { useState } from 'react';
import { db } from '../../firebaseConfig';
import { ref, update } from 'firebase/database';
import { Course } from '../../types';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Calendar } from '../ui/Calendar';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '../ui/Alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface AttendanceTrackerProps {
  courses: Course[];
  loading: boolean;
}

const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ courses, loading }) => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [studentIds, setStudentIds] = useState<string[]>(['']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleStudentIdChange = (index: number, value: string) => {
    const newStudentIds = [...studentIds];
    newStudentIds[index] = value;
    setStudentIds(newStudentIds);
    
    // Add new empty field if last field is being filled
    if (index === studentIds.length - 1 && value.trim() !== '') {
      setStudentIds([...newStudentIds, '']);
    }
  };

  const handleRemoveStudentId = (index: number) => {
    if (studentIds.length > 1) {
      const newStudentIds = studentIds.filter((_, i) => i !== index);
      setStudentIds(newStudentIds);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!selectedCourse) {
      setError('Please select a course');
      return;
    }

    if (!date) {
      setError('Please select a date');
      return;
    }

    const validStudentIds = studentIds.filter(id => id.trim() !== '');
    if (validStudentIds.length === 0) {
      setError('Please enter at least one student ID');
      return;
    }

    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const updates = {};
      
      validStudentIds.forEach(id => {
        updates[`attendance/${selectedCourse}/${formattedDate}/${id}`] = true;
      });

      await update(ref(db), updates);
      setSuccess(true);
      setStudentIds(['']); // Reset form
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to record attendance. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select
            label="Select Course"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            disabled={loading}
            required
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
              Date
            </label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Student IDs
          </label>
          {studentIds.map((id, index) => (
            <div key={index} className="flex space-x-2 items-center">
              <Input
                value={id}
                onChange={(e) => handleStudentIdChange(index, e.target.value)}
                placeholder="Enter student ID"
              />
              {studentIds.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveStudentId(index)}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Attendance recorded successfully!</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end">
          <Button type="submit">Submit Attendance</Button>
        </div>
      </form>
    </div>
  );
};

export default AttendanceTracker;