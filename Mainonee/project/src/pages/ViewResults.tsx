import React, { useState } from 'react';
import { getStudentResultIds, getResult } from '../utils/web3';
import { getFromIPFS } from '../utils/ipfs';
import { Search, FileText, ExternalLink } from 'lucide-react';
import ConnectWallet from '../components/ConnectWallet';

interface ResultData {
  id: number;
  studentId: string;
  examName: string;
  resultHash: string;
  timestamp: number;
  uploadedBy: string;
  details?: {
    name: string;
    marks: {
      subject: string;
      score: number;
      maxScore: number;
    }[];
    totalScore: number;
    totalMaxScore: number;
    percentage: number;
    grade: string;
  };
}

const ViewResults: React.FC = () => {
  const [studentId, setStudentId] = useState('');
  const [results, setResults] = useState<ResultData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedResult, setSelectedResult] = useState<ResultData | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentId.trim()) {
      setError('Please enter a student ID');
      return;
    }
    
    setLoading(true);
    setError('');
    setResults([]);
    setSelectedResult(null);
    
    try {
      // Get all result IDs for the student
      const resultIds = await getStudentResultIds(studentId);
      
      if (resultIds.length === 0) {
        setError('No results found for this student ID');
        setLoading(false);
        return;
      }
      
      // Get details for each result
      const resultsData: ResultData[] = [];
      
      for (const id of resultIds) {
        const result = await getResult(Number(id));
        resultsData.push({
          id: Number(result[0]),
          studentId: result[1],
          examName: result[2],
          resultHash: result[3],
          timestamp: Number(result[4]),
          uploadedBy: result[5],
        });
      }
      
      setResults(resultsData);
    } catch (error) {
      console.error('Error fetching results:', error);
      setError('Error fetching results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const viewResultDetails = async (result: ResultData) => {
    try {
      setLoading(true);
      
      // Fetch result details from IPFS
      const details = await getFromIPFS(result.resultHash);
      
      setSelectedResult({
        ...result,
        details,
      });
    } catch (error) {
      console.error('Error fetching result details:', error);
      setError('Error fetching result details from IPFS');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div>
      <ConnectWallet />
      
      <h1 className="text-3xl font-bold mb-6">View Student Results</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
              Student ID
            </label>
            <input
              type="text"
              id="studentId"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Enter student ID"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="self-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700 transition disabled:opacity-50 flex items-center"
            >
              {loading ? 'Searching...' : (
                <>
                  <Search size={18} className="mr-2" />
                  Search
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {results.length > 0 && !selectedResult && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <h2 className="text-xl font-semibold p-4 bg-gray-50 border-b">Results for Student ID: {studentId}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exam Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText size={18} className="text-gray-400 mr-2" />
                        <span>{result.examName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(result.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => viewResultDetails(result)}
                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {selectedResult && selectedResult.details && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {selectedResult.examName} - {selectedResult.details.name}
            </h2>
            <button
              onClick={() => setSelectedResult(null)}
              className="text-white bg-indigo-700 px-3 py-1 rounded hover:bg-indigo-800"
            >
              Back to Results
            </button>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Student Information</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <p><span className="font-medium">Name:</span> {selectedResult.details.name}</p>
                  <p><span className="font-medium">Student ID:</span> {selectedResult.studentId}</p>
                  <p><span className="font-medium">Exam Date:</span> {formatDate(selectedResult.timestamp)}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Result Summary</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <p><span className="font-medium">Total Score:</span> {selectedResult.details.totalScore}/{selectedResult.details.totalMaxScore}</p>
                  <p><span className="font-medium">Percentage:</span> {selectedResult.details.percentage.toFixed(2)}%</p>
                  <p><span className="font-medium">Grade:</span> <span className="font-bold">{selectedResult.details.grade}</span></p>
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold mb-2">Subject Marks</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedResult.details.marks.map((mark, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {mark.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {mark.score}/{mark.maxScore}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {((mark.score / mark.maxScore) * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-semibold mb-2">Verification Information</h3>
              <div className="bg-gray-50 p-4 rounded">
                <p><span className="font-medium">Result ID:</span> {selectedResult.id}</p>
                <p className="flex items-center">
                  <span className="font-medium mr-2">IPFS Hash:</span>
                  <span className="text-sm text-gray-600 truncate">{selectedResult.resultHash}</span>
                  <a
                    href={`https://ipfs.io/ipfs/${selectedResult.resultHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 ml-2"
                  >
                    <ExternalLink size={16} />
                  </a>
                </p>
                <p className="flex items-center">
                  <span className="font-medium mr-2">Uploaded By:</span>
                  <span className="text-sm text-gray-600">{selectedResult.uploadedBy}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewResults;