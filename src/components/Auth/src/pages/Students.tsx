import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { ref, onValue, push, update, remove } from 'firebase/database';
import { Student } from '../types';
import StudentList from '../components/Students/StudentList';
import StudentForm from '../components/Students/StudentForm';
import ImportExcel from '../components/Students/ImportExcel';
import { Button } from '../components/ui/Button';
import { Plus, Upload } from 'lucide-react';
import { Modal } from '../components/ui/Modal';

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);

  useEffect(() => {
    const studentsRef = ref(db, 'students');
    const unsubscribe = onValue(studentsRef, (snapshot) => {
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
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddStudent = async (student: Omit<Student, 'id'>) => {
    const newStudentRef = push(ref(db, 'students'));
    await update(newStudentRef, student);
  };

  const handleUpdateStudent = async (id: string, student: Partial<Student>) => {
    await update(ref(db, `students/${id}`), student);
  };

  const handleDeleteStudent = async (id: string) => {
    await remove(ref(db, `students/${id}`));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Student Management</h2>
        <div className="flex space-x-2">
          <Button onClick={() => setShowImport(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Import Excel
          </Button>
          <Button onClick={() => {
            setEditStudent(null);
            setShowForm(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      <StudentList 
        students={students} 
        loading={loading}
        onEdit={(student) => {
          setEditStudent(student);
          setShowForm(true);
        }}
        onDelete={handleDeleteStudent}
      />

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editStudent ? 'Edit Student' : 'Add New Student'}
      >
        <StudentForm
          initialData={editStudent}
          onSubmit={async (data) => {
            if (editStudent) {
              await handleUpdateStudent(editStudent.id, data);
            } else {
              await handleAddStudent(data);
            }
            setShowForm(false);
          }}
        />
      </Modal>

      <Modal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        title="Import Students from Excel"
      >
        <ImportExcel
          onComplete={() => setShowImport(false)}
        />
      </Modal>
    </div>
  );
};

export default Students;