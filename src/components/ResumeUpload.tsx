import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { resumeParser } from '../services/resumeParser';

interface ResumeUploadProps {
  onFileUploaded: (data: { name?: string; email?: string; phone?: string; text: string }) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onFileUploaded }) => {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      try {
        const parsedData = await resumeParser.parseFile(file);
        onFileUploaded(parsedData);
      } catch (error) {
        console.error('Error parsing resume:', error);
      }
    }
  }, [onFileUploaded]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  return (
    <div className="max-w-md mx-auto">
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
        <p className="text-sm text-gray-500 mb-4">
          Drag and drop your resume, or click to browse
        </p>
        <p className="text-xs text-gray-400">
          Supports PDF and DOCX files up to 10MB
        </p>
      </div>
      
      {fileRejections.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <div className="text-sm text-red-700">
              {fileRejections[0].errors[0].message}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;