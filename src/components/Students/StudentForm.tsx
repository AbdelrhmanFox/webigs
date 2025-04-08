import React, { useState } from 'react';
import { Student } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface StudentFormProps {
  initialData?: Student | null;
  onSubmit: (data: Omit<Student, 'id'>) => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState<Omit<Student, 'id'>>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    mobile: initialData?.mobile || '',
    cohort: initialData?.cohort || '',
    campus: initialData?.campus || '',
    school: initialData?.school || '',
    major: initialData?.major || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Full Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <Input
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <Input
        label="Mobile Number"
        name="mobile"
        value={formData.mobile}
        onChange={handleChange}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Cohort"
          name="cohort"
          value={formData.cohort}
          onChange={handleChange}
        />
        <Input
          label="Campus"
          name="campus"
          value={formData.campus}
          onChange={handleChange}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="School"
          name="school"
          value={formData.school}
          onChange={handleChange}
        />
        <Input
          label="Major"
          name="major"
          value={formData.major}
          onChange={handleChange}
        />
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" variant="primary">
          {initialData ? 'Update Student' : 'Add Student'}
        </Button>
      </div>
    </form>
  );
};

export default StudentForm;