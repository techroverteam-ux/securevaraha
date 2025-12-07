import mysql from 'mysql2/promise';
import { csvService } from './csvService';

// Primary database configuration (Live Namecheap)
const primaryDbConfig = {
  host: process.env.DB_HOST || 'varahasdc.co.in',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'varaosrc_prc',
  password: process.env.DB_PASSWORD || 'PRC!@#456&*(',
  database: process.env.DB_NAME || 'varaosrc_hospital_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  ssl: undefined
};

// Fallback database configuration (Local)
const fallbackDbConfig = {
  host: process.env.LOCAL_DB_HOST || '127.0.0.1',
  port: 3306,
  user: process.env.LOCAL_DB_USER || 'varaosrc_prc',
  password: process.env.LOCAL_DB_PASSWORD || 'PRC!@#456&*(',
  database: process.env.LOCAL_DB_NAME || 'varaosrc_hospital_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let primaryPool: mysql.Pool;
let fallbackPool: mysql.Pool;
let isPrimaryDbAvailable = false;
let isFallbackDbAvailable = false;

export const getConnection = async () => {
  if (isPrimaryDbAvailable && primaryPool) {
    return primaryPool;
  }
  
  if (isFallbackDbAvailable && fallbackPool) {
    return fallbackPool;
  }
  
  await testConnection();
  
  if (isPrimaryDbAvailable && primaryPool) {
    return primaryPool;
  }
  
  if (isFallbackDbAvailable && fallbackPool) {
    return fallbackPool;
  }
  
  throw new Error('No database connection available');
};

export const testConnection = async () => {
  try {
    if (!primaryPool) {
      primaryPool = mysql.createPool(primaryDbConfig);
    }
    await primaryPool.execute('SELECT 1 as test');
    console.log('✅ Primary database (Namecheap) connected successfully');
    isPrimaryDbAvailable = true;
    return true;
  } catch (error) {
    console.error('❌ Primary database connection failed:', error);
    console.log('🔄 Trying fallback database...');
    
    try {
      if (!fallbackPool) {
        fallbackPool = mysql.createPool(fallbackDbConfig);
      }
      await fallbackPool.execute('SELECT 1 as test');
      console.log('✅ Fallback database connected successfully');
      isFallbackDbAvailable = true;
      return true;
    } catch (fallbackError) {
      console.error('❌ Fallback database connection failed:', fallbackError);
      console.log('📄 Falling back to CSV data source');
      isPrimaryDbAvailable = false;
      isFallbackDbAvailable = false;
      return false;
    }
  }
};

export const isDbConnected = () => isPrimaryDbAvailable || isFallbackDbAvailable;
export const isPrimaryDbConnected = () => isPrimaryDbAvailable;
export const isFallbackDbConnected = () => isFallbackDbAvailable;

// Database operations with CSV fallback
export const dbQuery = async (query: string, params: any[] = []): Promise<any> => {
  if (isPrimaryDbAvailable || isFallbackDbAvailable) {
    try {
      const connection = await getConnection();
      const [rows] = await connection.execute(query, params);
      return rows;
    } catch (error) {
      console.error('MySQL query failed, switching to CSV:', error);
      isPrimaryDbAvailable = false;
      isFallbackDbAvailable = false;
    }
  }
  
  console.log('🔄 Using CSV fallback for query:', query.substring(0, 50) + '...');
  if (query.toLowerCase().includes('patient_new')) {
    return await csvService.getPatients();
  } else if (query.toLowerCase().includes('doctor')) {
    return await csvService.getDoctors();
  } else if (query.toLowerCase().includes('hospital')) {
    return await csvService.getHospitals();
  } else if (query.toLowerCase().includes('con')) {
    return await csvService.getScans();
  } else if (query.toLowerCase().includes('admin')) {
    return await csvService.getAdmins();
  }
  
  return [];
};

// Secure function to sanitize input
export const secure = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/[<>"'&]/g, (match) => {
      const entities: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[match] || match;
    })
    .trim();
};

testConnection().catch(console.error);