// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract StudentResultSystem is AccessControl {
    using Counters for Counters.Counter;
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant TEACHER_ROLE = keccak256("TEACHER_ROLE");
    
    Counters.Counter private _resultIdCounter;
    
    struct Result {
        uint256 id;
        string studentId;
        string examName;
        string resultHash; // IPFS hash of the complete result
        uint256 timestamp;
        address uploadedBy;
    }
    
    // Mapping from result ID to Result
    mapping(uint256 => Result) private _results;
    
    // Mapping from student ID to their result IDs
    mapping(string => uint256[]) private _studentResults;
    
    // Events
    event ResultUploaded(uint256 resultId, string studentId, string examName, string resultHash, address uploadedBy);
    event TeacherAdded(address teacher);
    event TeacherRemoved(address teacher);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    // Add a teacher (only admin)
    function addTeacher(address teacher) external onlyRole(ADMIN_ROLE) {
        grantRole(TEACHER_ROLE, teacher);
        emit TeacherAdded(teacher);
    }
    
    // Remove a teacher (only admin)
    function removeTeacher(address teacher) external onlyRole(ADMIN_ROLE) {
        revokeRole(TEACHER_ROLE, teacher);
        emit TeacherRemoved(teacher);
    }
    
    // Upload a result (only teachers or admins)
    function uploadResult(
        string memory studentId,
        string memory examName,
        string memory resultHash
    ) external onlyRole(TEACHER_ROLE) returns (uint256) {
        uint256 resultId = _resultIdCounter.current();
        _resultIdCounter.increment();
        
        Result memory newResult = Result({
            id: resultId,
            studentId: studentId,
            examName: examName,
            resultHash: resultHash,
            timestamp: block.timestamp,
            uploadedBy: msg.sender
        });
        
        _results[resultId] = newResult;
        _studentResults[studentId].push(resultId);
        
        emit ResultUploaded(resultId, studentId, examName, resultHash, msg.sender);
        
        return resultId;
    }
    
    // Get a specific result
    function getResult(uint256 resultId) external view returns (
        uint256 id,
        string memory studentId,
        string memory examName,
        string memory resultHash,
        uint256 timestamp,
        address uploadedBy
    ) {
        Result memory result = _results[resultId];
        return (
            result.id,
            result.studentId,
            result.examName,
            result.resultHash,
            result.timestamp,
            result.uploadedBy
        );
    }
    
    // Get all result IDs for a student
    function getStudentResultIds(string memory studentId) external view returns (uint256[] memory) {
        return _studentResults[studentId];
    }
    
    // Verify if a result hash matches the stored hash (for result verification)
    function verifyResult(uint256 resultId, string memory resultHash) external view returns (bool) {
        return keccak256(abi.encodePacked(_results[resultId].resultHash)) == keccak256(abi.encodePacked(resultHash));
    }
}