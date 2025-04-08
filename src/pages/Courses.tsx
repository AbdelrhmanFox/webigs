import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { ref, onValue, push, update, remove } from 'firebase/database';
import { Course } from '../types';
import CourseList from '../components/Courses/CourseList';
import CourseForm from '../components/Courses/CourseForm';
import EnrollStudents from '../components/Courses/EnrollStudents';
import { Button } from '../components/ui/Button';
import { Plus, Users } from 'lucide-react';
import { Modal } from '../components/ui/Modal';

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showEnroll, setShowEnroll] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

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

  const handleAddCourse = async (course: Omit<Course, 'id'>) => {
    const newCourseRef = push(ref(db, 'courses'));
    await update(newCourseRef, course);
  };

  const handleUpdateCourse = async (id: string, course: Partial<Course>) => {
    await update(ref(db, `courses/${id}`), course);
  };

  const handleDeleteCourse = async (id: string) => {
    await remove(ref(db, `courses/${id}`));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Course Management</h2>
        <Button onClick={() => {
          setSelectedCourse(null);
          setShowForm(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Course
        </Button>
      </div>

      <CourseList 
        courses={courses} 
        loading={loading}
        onEdit={(course) => {
          setSelectedCourse(course);
          setShowForm(true);
        }}
        onDelete={handleDeleteCourse}
        onEnroll={(course) => {
          setSelectedCourse(course);
          setShowEnroll(true);
        }}
      />

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={selectedCourse ? 'Edit Course' : 'Add New Course'}
      >
        <CourseForm
          initialData={selectedCourse}
          onSubmit={async (data) => {
            if (selectedCourse) {
              await handleUpdateCourse(selectedCourse.id, data);
            } else {
              await handleAddCourse(data);
            }
            setShowForm(false);
          }}
        />
      </Modal>

      <Modal
        isOpen={showEnroll}
        onClose={() => setShowEnroll(false)}
        title={`Enroll Students - ${selectedCourse?.name || ''}`}
        size="lg"
      >
        {selectedCourse && (
          <EnrollStudents 
            courseId={selectedCourse.id} 
            onComplete={() => setShowEnroll(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default Courses;