import fs from 'fs';
import path from 'path';

interface CSVData {
  [key: string]: string;
}

class CSVService {
  private csvPath: string;
  private data: CSVData[] = [];
  private isLoaded = false;

  constructor() {
    this.csvPath = path.join(process.cwd(), 'varaosrc_hospital_management.csv');
  }

  private async loadCSV(): Promise<void> {
    if (this.isLoaded) return;

    try {
      const csvContent = fs.readFileSync(this.csvPath, 'utf-8');
      const lines = csvContent.split('\n').filter(line => line.trim());
      
      let currentTable = '';
      let headers: string[] = [];
      
      for (const line of lines) {
        const cleanLine = line.replace(/"/g, '').trim();
        if (!cleanLine) continue;
        
        const values = cleanLine.split(',');
        
        // Check if this is a table header (contains _id, _name, etc.)
        if (values.length > 0 && values[0].includes('_')) {
          headers = values;
          currentTable = values[0].split('_')[0];
          continue;
        }
        
        // Skip empty or invalid rows
        if (values.length !== headers.length || !values[0]) continue;
        
        // Create data object
        const rowData: CSVData = { table: currentTable };
        headers.forEach((header, index) => {
          rowData[header] = values[index] || '';
        });
        
        this.data.push(rowData);
      }
      
      this.isLoaded = true;
      console.log(`✅ CSV loaded: ${this.data.length} records`);
    } catch (error) {
      console.error('❌ CSV loading failed:', error);
      throw error;
    }
  }

  async getPatients(search?: string, category?: string): Promise<any[]> {
    await this.loadCSV();
    
    let patients = this.data.filter(row => 
      row.table === 'patient' || 
      (row.patient_name && row.patient_name !== 'patient_name')
    );

    if (search) {
      patients = patients.filter(p => 
        p.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.contact_number?.includes(search) ||
        p.cro?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category && category !== 'all') {
      patients = patients.filter(p => p.category === category);
    }

    return patients.slice(0, 50);
  }

  async getDoctors(): Promise<any[]> {
    await this.loadCSV();
    return this.data.filter(row => 
      row.table === 'doctor' || 
      (row.dname && row.dname !== 'dname')
    );
  }

  async getHospitals(): Promise<any[]> {
    await this.loadCSV();
    return this.data.filter(row => 
      row.table === 'hospital' || 
      (row.h_name && row.h_name !== 'h_name')
    );
  }

  async getScans(): Promise<any[]> {
    await this.loadCSV();
    return this.data.filter(row => 
      row.table === 'con' || 
      (row.c_p_cro && row.c_p_cro !== 'c_p_cro')
    );
  }

  async getAdmins(): Promise<any[]> {
    await this.loadCSV();
    const admins = this.data.filter(row => 
      row.table === 'admin' || 
      (row.username && row.username !== 'username')
    );
    
    // Add default admin accounts if not found in CSV
    const defaultAdmins = [
      { admin_id: '1', username: 'superadmin', password: 'admin123', admin_type: 'superadmin', name: 'Super Administrator' },
      { admin_id: '2', username: 'admin', password: 'admin123', admin_type: 'admin', name: 'System Administrator' },
      { admin_id: '3', username: 'reception', password: 'admin123', admin_type: 'reception', name: 'Reception Desk' },
      { admin_id: '4', username: 'doctor', password: 'admin123', admin_type: 'doctor', name: 'Dr. Medical Officer' },
      { admin_id: '5', username: 'console', password: 'admin123', admin_type: 'console', name: 'Console Operator' }
    ];
    
    return admins.length > 0 ? admins : defaultAdmins;
  }

  async getDashboardStats(): Promise<any> {
    await this.loadCSV();
    
    const patients = await this.getPatients();
    const scans = await this.getScans();
    const today = new Date().toISOString().split('T')[0];
    const todayScans = scans.filter(s => s.added_on && s.added_on.includes(today));

    return {
      totalPatients: patients.length,
      todayPatients: todayScans.length,
      pendingScans: scans.filter(s => s.status === 'Pending' || s.status === 'Recall').length,
      completedScans: scans.filter(s => s.status === 'Complete').length
    };
  }

  async getNursingQueue(): Promise<any[]> {
    await this.loadCSV();
    const scans = await this.getScans();
    return scans.filter(s => s.status === 'Pending' || s.status === 'Recall').slice(0, 20);
  }

  async getConsoleQueue(): Promise<any[]> {
    await this.loadCSV();
    const scans = await this.getScans();
    return scans.filter(s => s.status === 'Complete').slice(0, 20);
  }
}

export const csvService = new CSVService();