'use client';

import { useState, useEffect } from 'react';
import { Download, Search, Calendar, FileText, Filter } from 'lucide-react';
import SuperAdminLayout, { Card, Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell, Button, Pagination } from '@/components/SuperAdminLayout';

interface PatientReport {
  p_id: number;
  cro_number: string;
  patient_name: string;
  dname: string;
  h_name: string;
  amount: number;
  remark: string;
  date: string;
  age: number;
  gender: string;
  mobile: string;
}

export default function SuperAdminPatientReport() {
  const [patients, setPatients] = useState<PatientReport[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<PatientReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Set default dates: from one year ago to today
  const today = new Date();
  const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
  const [fromDate, setFromDate] = useState(oneYearAgo.toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(today.toISOString().split('T')[0]);

  useEffect(() => {
    fetchPatients();
  }, [fromDate, toDate]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://varahasdc.co.in/api/superadmin/patient-report?from_date=${fromDate}&to_date=${toDate}`);
      const data = await response.json();
      
      if (data.success) {
        setPatients(data.data);
        setFilteredPatients(data.data);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter patients based on search
  useEffect(() => {
    let filtered = patients;
    
    if (searchTerm) {
      filtered = filtered.filter(patient => 
        patient.cro_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.patient_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredPatients(filtered);
    setCurrentPage(1);
  }, [patients, searchTerm]);

  const formatDateForDisplay = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
  };

  const exportToExcel = () => {
    const headers = ['S.No', 'CRO', 'Patient Name', 'Doctor Name', 'Hospital Name', 'Amount', 'Remark', 'Date', 'Age', 'Gender', 'Mobile'];
    
    // Create HTML table with styling
    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
            th { background-color: #4472C4; color: white; font-weight: bold; padding: 8px; border: 1px solid #ccc; text-align: center; }
            td { padding: 6px; border: 1px solid #ccc; text-align: left; }
            .number { text-align: right; }
            .center { text-align: center; }
            .header { text-align: center; font-weight: bold; font-size: 16px; }
          </style>
        </head>
        <body>
          <table>
            <tr><th colspan="11" class="header">VARAHA SDC</th></tr>
            <tr><th colspan="11" class="header">PATIENT REPORT (${formatDateForDisplay(fromDate)} to ${formatDateForDisplay(toDate)})</th></tr>
            <thead>
              <tr>
                ${headers.map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${filteredPatients.map((p, index) => `
                <tr>
                  <td class="center">${index + 1}</td>
                  <td class="center">${p.cro_number}</td>
                  <td>${p.patient_name}</td>
                  <td>${p.dname}</td>
                  <td>${p.h_name}</td>
                  <td class="number">₹${p.amount}</td>
                  <td>${p.remark || '-'}</td>
                  <td class="center">${p.date}</td>
                  <td class="center">${p.age}</td>
                  <td class="center">${p.gender}</td>
                  <td>${p.mobile}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Patient-Report-${formatDateForDisplay(fromDate)}-to-${formatDateForDisplay(toDate)}.xls`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <SuperAdminLayout 
      title="Patient Report" 
      subtitle="Patient Queue Management"
      actions={
        <Button onClick={exportToExcel} variant="success" disabled={filteredPatients.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
      }
    >
      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters & Search</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search CRO or Patient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchPatients} disabled={loading} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                {loading ? 'Loading...' : 'Search'}
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Patient Data</h2>
              <span className="text-sm text-gray-500">{filteredPatients.length} records</span>
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableHeaderCell>S.No</TableHeaderCell>
              <TableHeaderCell>CRO</TableHeaderCell>
              <TableHeaderCell>Patient Name</TableHeaderCell>
              <TableHeaderCell>Doctor Name</TableHeaderCell>
              <TableHeaderCell>Hospital Name</TableHeaderCell>
              <TableHeaderCell>Amount</TableHeaderCell>
              <TableHeaderCell>Date</TableHeaderCell>
              <TableHeaderCell>Age</TableHeaderCell>
              <TableHeaderCell>Gender</TableHeaderCell>
              <TableHeaderCell>Mobile</TableHeaderCell>
              <TableHeaderCell>Remark</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell className="text-center" colSpan={11}>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading patients...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center" colSpan={11}>No patients found</TableCell>
                </TableRow>
              ) : (
                filteredPatients
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((patient, index) => (
                  <TableRow key={patient.p_id}>
                    <TableCell>{((currentPage - 1) * itemsPerPage) + index + 1}</TableCell>
                    <TableCell className="font-medium text-blue-600">{patient.cro_number}</TableCell>
                    <TableCell>{patient.patient_name}</TableCell>
                    <TableCell>{patient.dname}</TableCell>
                    <TableCell>{patient.h_name}</TableCell>
                    <TableCell className="font-medium text-green-600">₹{patient.amount}</TableCell>
                    <TableCell>{patient.date}</TableCell>
                    <TableCell>{patient.age}</TableCell>
                    <TableCell>{patient.gender}</TableCell>
                    <TableCell>{patient.mobile}</TableCell>
                    <TableCell>{patient.remark || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {Math.ceil(filteredPatients.length / itemsPerPage) > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredPatients.length / itemsPerPage)}
              onPageChange={setCurrentPage}
              totalItems={filteredPatients.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </Card>
      </div>
    </SuperAdminLayout>
  );
}