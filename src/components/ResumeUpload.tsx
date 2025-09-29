import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { resumeParser } from '../services/resumeParser';

interface ResumeUploadProps {
  onFileUploaded: (data: { name?: string; email?: string; phone?: string; text: string }) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onFileUploaded }) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[], fileRejections: any[]) => {
      setError(null);
      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        if (rejection.errors && rejection.errors.length > 0) {
          setError(rejection.errors[0].message);
        } else {
          setError('File rejected. Please check the file type and size.');
        }
        return;
      }
      const file = acceptedFiles[0];
      if (file) {
        try {
          const parsedData = await resumeParser.parseFile(file);
          if (!parsedData.text || parsedData.text.trim().length === 0) {
            setError('Failed to extract text from the resume. Please try another file.');
            return;
          }
          onFileUploaded(parsedData);
        } catch (err: any) {
          if (err && err.name === 'NotReadableError') {
            setError('Could not read the file. Please check your file and try again.');
          } else {
            setError('Resume parsing failed. Please upload a valid PDF or DOCX file.');
          }
          console.error('Error parsing resume:', err);
        }
      }
    },
    [onFileUploaded],
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <div className="max-w-md mx-auto">
      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
          {isDragActive ? (
            <Upload className="h-8 w-8 text-blue-600" />
          ) : (
            <FileText className="h-8 w-8 text-gray-600" />
          )}
        </div>
        <p className="text-lg font-medium text-gray-900 mb-2">
          {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
        </p>
        <p className="text-sm text-gray-500 mb-4">Drag and drop your resume, or click to browse</p>
        <p className="text-xs text-gray-400">Supports PDF and DOCX files up to 10MB</p>
      </div>
      {/* Keep fileRejections for fallback */}
      {fileRejections.length > 0 && !error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <div className="text-sm text-red-700">{fileRejections[0].errors[0].message}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
