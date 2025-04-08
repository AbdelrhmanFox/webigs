import React, { useState } from 'react';
import { Course } from '../../types';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';

interface CourseFormProps {
  initialData?: Course | null;
  onSubmit: (data: Omit<Course, 'id'>) => void;
}

const CourseForm: React.FC<CourseFormProps> = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState<Omit<Course, 'id'>>({
    name: initialData?.name || '',
    code: initialData?.code || '',
    instructor: initialData?.instructor || '',
    schedule: initialData?.schedule || '',
    description: initialData?.description || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Course Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <Input
          label="Course Code"
          name="code"
          value={formData.code}
          onChange={handleChange}
          required
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Instructor"
          name="instructor"
          value={formData.instructor}
          onChange={handleChange}
          required
        />
        <Input
          label="Schedule"
          name="schedule"
          value={formData.schedule}
          onChange={handleChange}
          placeholder="e.g. Mon/Wed 10:00-11:30"
          required
        />
      </div>
      <Textarea
        label="Description"
        name="description"
        value={formData.description || ''}
        onChange={handleChange}
        rows={3}
      />
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" variant="primary">
          {initialData ? 'Update Course' : 'Add Course'}
        </Button>
      </div>
    </form>
  );
};

export default CourseForm;