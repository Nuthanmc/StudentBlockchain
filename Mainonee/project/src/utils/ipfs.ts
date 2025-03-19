import { create } from 'ipfs-http-client';

// Create an IPFS client
const projectId = import.meta.env.VITE_IPFS_PROJECT_ID;
const projectSecret = import.meta.env.VITE_IPFS_PROJECT_SECRET;
const auth = 'Basic ' + btoa(projectId + ':' + projectSecret);

const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
});

// Upload file to IPFS
export const uploadToIPFS = async (file: File): Promise<string> => {
  try {
    const added = await ipfs.add(file);
    return added.path;
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    throw error;
  }
};

// Upload JSON data to IPFS
export const uploadJSONToIPFS = async (data: any): Promise<string> => {
  try {
    const jsonString = JSON.stringify(data);
    const buffer = new TextEncoder().encode(jsonString);
    const added = await ipfs.add(buffer);
    return added.path;
  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error);
    throw error;
  }
};

// Get content from IPFS
export const getFromIPFS = async (cid: string): Promise<any> => {
  try {
    const stream = ipfs.cat(cid);
    const decoder = new TextDecoder();
    let data = '';
    
    for await (const chunk of stream) {
      data += decoder.decode(chunk);
    }
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Error getting content from IPFS:', error);
    throw error;
  }
};

export default ipfs;