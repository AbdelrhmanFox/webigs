import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { db } from '../../firebaseConfig';
import { ref, push } from 'firebase/database';
import { Button } from '../ui/Button';
import { Alert, AlertDescription, AlertTitle } from '../ui/Alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

const ImportExcel: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Process and validate data
      const students = jsonData.map((item: any) => ({
        name: item['Name'] || '',
        email: item['Email'] || '',
        mobile: item['Mobile'] || '',
        cohort: item['Cohort'] || '',
        campus: item['Campus'] || '',
        school: item['School'] || '',
        major: item['Major'] || ''
      }));

      // Add to database
      const batchPromises = students.map((student) => 
        push(ref(db, 'students'), student)
      );

      await Promise.all(batchPromises);
      setSuccess(true);
      setTimeout(onComplete, 2000);
    } catch (err) {
      setError('Failed to import students. Please check the file format.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Select Excel File
        </label>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-primary file:text-white
            hover:file:bg-primary-dark"
        />
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
          <AlertDescription>Students imported successfully!</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onComplete}>
          Cancel
        </Button>
        <Button
          onClick={handleImport}
          disabled={loading || !file}
        >
          {loading ? 'Importing...' : 'Import Students'}
        </Button>
      </div>
    </div>
  );
};

export default ImportExcel;