import React, { useState } from 'react';
import { uploadJSONToIPFS } from '../utils/ipfs';
import { uploadResult } from '../utils/web3';
import { useWeb3 } from '../contexts/Web3Context';
import { Upload, Plus, Minus, CheckCircle, AlertTriangle } from 'lucide-react';
import ConnectWallet from '../components/ConnectWallet';

interface SubjectMark {
  subject: string;
  score: number;
  maxScore: number;
}

const UploadResult: React.FC = () => {
  const { isConnected, isCorrectNetwork, isAdmin, isTeacher } = useWeb3();
  
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [examName, setExamName] = useState('');
  const [subjects, setSubjects] = useState<SubjectMark[]>([
    { subject: '', score: 0, maxScore: 100 }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');
  
  const addSubject = () => {
    setSubjects([...subjects, { subject: '', score: 0, maxScore: 100 }]);
  };
  
  const removeSubject = (index: number) => {
    const newSubjects = [...subjects];
    newSubjects.splice(index, 1);
    setSubjects(newSubjects);
  };
  
  const updateSubject = (index: number, field: keyof SubjectMark, value: string | number) => {
    const newSubjects = [...subjects];
    
    if (field === 'subject') {
      newSubjects[index][field] = value as string;
    } else {
      // Ensure score and maxScore are numbers
      newSubjects[index][field] = Number(value);
    }
    
    setSubjects(newSubjects);
  };
  
  const calculateTotals = () => {
    const totalScore = subjects.reduce((sum, subject) => sum + subject.score, 0);
    const totalMaxScore = subjects.reduce((sum, subject) => sum + subject.maxScore, 0);
    const percentage = (totalScore / totalMaxScore) * 100;
    
    // Calculate grade based on percentage
    let grade = '';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 50) grade = 'D';
    else grade = 'F';
    
    return { totalScore, totalMaxScore, percentage, grade };
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!studentId || !studentName || !examName) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (subjects.some(subject => !subject.subject)) {
      setError('Please provide a name for all subjects');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess(false);
    setTxHash('');
    
    try {
      // Calculate totals
      const { totalScore, totalMaxScore, percentage, grade } = calculateTotals();
      
      // Prepare result data
      const resultData = {
        name: studentName,
        marks: subjects,
        totalScore,
        totalMaxScore,
        percentage,
        grade
      };
      
      // Upload to IPFS
      const ipfsHash = await uploadJSONToIPFS(resultData);
      
      // Upload to blockchain
      const tx = await uploadResult(studentId, examName, ipfsHash);
      
      setTxHash(tx.hash);
      setSuccess(true);
      
      // Reset form
      setStudentId('');
      setStudentName('');
      setExamName('');
      setSubjects([{ subject: '', score: 0, maxScore: 100 }]);
    } catch (error) {
      console.error('Error uploading result:', error);
      setError('Error uploading result. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isConnected || !isCorrectNetwork) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Upload Student Results</h1>
        <ConnectWallet />
      </div>
    );
  }
  
  if (!isAdmin && !isTeacher) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Upload Student Results</h1>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          <div className="flex items-center">
            <AlertTriangle size={20} className="mr-2" />
            <span>You don't have permission to upload results. Only teachers and administrators can upload results.</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Upload Student Results</h1>
      
      {success ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <div className="flex items-center mb-2">
            <CheckCircle size={20} className="mr-2" />
            <span className="font-semibold">Result uploaded successfully!</span>
          </div>
          <p>Transaction Hash: <span className="font-mono text-sm">{txHash}</span></p>
          <button
            onClick={() => setSuccess(false)}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Upload Another Result
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
                  Student ID *
                </label>
                <input
                  type="text"
                  id="studentId"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-1">
                  Student Name *
                </label>
                <input
                  type="text"
                  id="studentName"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="examName" className="block text-sm font-medium text-gray-700 mb-1">
                Exam Name *
              </label>
              <input
                type="text"
                id="examName"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Subject Marks *
                </label>
                <button
                  type="button"
                  onClick={addSubject}
                  className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm"
                >
                  <Plus size={16} className="mr-1" />
                  Add Subject
                </button>
              </div>
              
              {subjects.map((subject, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 mb-3">
                  <div className="col-span-6">
                    <input
                      type="text"
                      placeholder="Subject Name"
                      value={subject.subject}
                      onChange={(e) => updateSubject(index, 'subject', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Score"
                      value={subject.score}
                      min="0"
                      max={subject.maxScore}
                      onChange={(e) => updateSubject(index, 'score', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  
                  <div className="col-span-3">
                    <div className="flex items-center">
                      <span className="mx-2">/</span>
                      <input
                        type="number"
                        placeholder="Max Score"
                        value={subject.maxScore}
                        min="1"
                        onChange={(e) => updateSubject(index, 'maxScore', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="col-span-1 flex items-center">
                    {subjects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSubject(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Minus size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h3 className="text-lg font-semibold mb-2">Result Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Total Score</span>
                  <p className="font-semibold">{calculateTotals().totalScore}/{calculateTotals().totalMaxScore}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Percentage</span>
                  <p className="font-semibold">{calculateTotals().percentage.toFixed(2)}%</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Grade</span>
                  <p className="font-semibold">{calculateTotals().grade}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 transition disabled:opacity-50 flex items-center"
              >
                {loading ? 'Uploading...' : (
                  <>
                    <Upload size={18} className="mr-2" />
                    Upload Result
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UploadResult;