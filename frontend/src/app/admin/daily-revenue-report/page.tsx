'use client';

import { useState, useEffect } from 'react';
import { Download, Calendar, TrendingUp, Search, Filter } from 'lucide-react';
import SuperAdminLayout, { Card, Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell, Button, Pagination } from '@/components/SuperAdminLayout';

interface RevenueData {
  sno?: number;
  date: string;
  cro: string;
  patientId?: string;
  patient_id?: string;
  examination_id?: string;
  patient_name: string;
  patientName?: string;
  age: string;
  gender: string;
  scanNames?: string[];
  scan_names?: string;
  scan_type?: string;
  totalScans?: number;
  total_scan: number;
  amount: number;
  category: string;
  mobile?: string;
  doctor?: string;
  doctor_name?: string;
  hospitalName?: string;
  hospital_name?: string;
}

interface TableData {
  hospitalName: string;
  category: string;
  date: string;
  scanColumns?: number;
  patients?: RevenueData[];
  summaryRows?: SummaryRow[];
  totals: {
    totalScans: number;
    totalAmount: number;
    totalPatients?: number;
  };
}

interface SummaryRow {
  scanNames: string[];
  scanCode: string;
  numberOfScans: number;
  patientCount: number;
  rate: number;
  amount: number;
}

export default function DailyRevenueReport() {
  const [revenueData, setRevenueData] = useState<TableData[]>([]);
  const [filteredData, setFilteredData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  
  const getTodayDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };
  
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [reportType, setReportType] = useState('D'); // D = Detail, S = Summary

  useEffect(() => {
    fetchRevenueData();
  }, [selectedDate, reportType]);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        date: selectedDate,
        type: reportType
      });
      
      const response = await fetch(`https://varahasdc.co.in/api/admin/daily-revenue-report?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRevenueData(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const allPatients: RevenueData[] = [];
    if (Array.isArray(revenueData)) {
      revenueData.forEach((table: TableData) => {
        if (reportType === 'D' && table.patients && Array.isArray(table.patients)) {
          // Detail report - use patients data
          table.patients.forEach(patient => {
            allPatients.push({
              ...patient,
              hospitalName: table.hospitalName,
              hospital_name: table.hospitalName
            });
          });
        } else if (reportType === 'S' && table.summaryRows && Array.isArray(table.summaryRows)) {
          // Summary report - convert summaryRows to display format
          table.summaryRows.forEach((row, index) => {
            allPatients.push({
              sno: index + 1,
              date: table.date,
              cro: row.scanCode,
              patient_name: `${table.hospitalName} - ${table.category}`,
              patientName: `${table.hospitalName} - ${table.category}`,
              age: row.patientCount.toString(),
              gender: 'Summary',
              scan_names: row.scanNames.filter(name => name !== '..').join(', '),
              scanNames: row.scanNames.filter(name => name !== '..'),
              total_scan: row.numberOfScans,
              totalScans: row.numberOfScans,
              amount: row.amount,
              category: table.category,
              hospitalName: table.hospitalName,
              hospital_name: table.hospitalName,
              mobile: '',
              doctor: ''
            });
          });
        }
      });
    }
    
    let filtered = allPatients;
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        (item.patient_name || item.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.cro || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [revenueData, searchTerm, reportType]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRevenue = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleDownloadExcel = () => {
    if (reportType === 'S') {
      generateSummaryExcel();
    } else {
      generateDetailExcel();
    }
  };

  const generateDetailExcel = () => {
    if (!Array.isArray(revenueData) || revenueData.length === 0) {
      alert('No data available for export');
      return;
    }

    let htmlContent = `<html><meta http-equiv="Content-Type" content="text/html; charset=Windows-1252"><body>`;
    
    revenueData.forEach(table => {
      if (!table.patients || table.patients.length === 0) return;
      
      const maxScans = Math.max(...table.patients.map(p => p.total_scan || p.totalScans || 0));
      const totalCols = 10 + maxScans;
      console.log('Testing',maxScans,totalCols);
      htmlContent += `
        <table border="1">
          <tr><th colspan="${totalCols}" style="background-color:#2F75B5; color:white">VARAHA SDC : IMAGING UNDER P.P.P. MODE</th></tr>
          <tr><th colspan="${totalCols}" style="background-color:#2F75B5; color:white">RAJASTHAN MEDICARE RELIEF SOCIETY, MDM HOSPITAL</th></tr>
          <tr><th style="text-margin:center; background-color:#FFEA00; color:black" colspan="${totalCols}">${table.hospitalName} (${table.category}) ${selectedDate}</th></tr>
          <tr>
            <th style="background-color:#2F75B5; color:white">S.No</th>
            <th style="background-color:#2F75B5; color:white">DATE</th>
            <th style="background-color:#2F75B5; color:white">CRO NO. / REG. NO.</th>
            <th style="background-color:#2F75B5; color:white">PATIENT ID</th>
            <th style="background-color:#2F75B5; color:white">NAME OF PATIENT</th>
            <th style="background-color:#2F75B5; color:white">AGE</th>
            <th style="background-color:#2F75B5; color:white">GENDER</th>
      `;
      
      for (let i = 1; i <= maxScans; i++) {
        htmlContent += `<th style="background-color:#2F75B5; color:white">Scan Type ${i}</th>`;
      }
      
      htmlContent += `
            <th style="background-color:#2F75B5; color:white">TOTAL SCAN</th>
            <th style="background-color:#2F75B5; color:white">AMOUNT</th>
            <th style="background-color:#2F75B5; color:white">CATEGORY</th>
          </tr>
      `;
      
      let totalScans = 0;
      let totalAmount = 0;
      
      table.patients.forEach((patient, index) => {
        const patientScans = patient.scanNames || (patient.scan_names || patient.scan_type || '').split(',').map(s => s.trim()).filter(s => s);
        const age = (patient.age || '').toString().replace('ear', '');
        const gender = (patient.gender || '').substring(0, 1);
        const patientId = patient.patientId || patient.examination_id || patient.patient_id || '';
        
        htmlContent += `
          <tr>
            <td>${patient.sno || index + 1}</td>
            <td>${selectedDate}</td>
            <td>${patient.cro || ''}</td>
            <td>${patientId}</td>
            <td>${patient.patientName || patient.patient_name || ''}</td>
            <td>${age}</td>
            <td>${gender}</td>
        `;
        
        // Fill scan columns with actual scan names
        for (let i = 0; i < maxScans; i++) {
          const scanName = patientScans[i] || '';
          htmlContent += `<td>${scanName}</td>`;
        }
        
        const patientTotalScans = parseInt(String(patient.totalScans || patient.total_scan || 0));
        const patientAmount = parseFloat(String(patient.amount || 0));
        
        htmlContent += `
            <td style='text-align:right'>${patientTotalScans}</td>
            <td style='text-align:right'>${patientAmount.toFixed(2)}</td>
            <td>${patient.category}</td>
          </tr>
        `;
        
        totalScans += patientTotalScans;
        totalAmount += patientAmount;
      });
      
      htmlContent += `
        <tr>
          <th style="background-color:#FFEA00; color:black"> </th>
          <th style="background-color:#FFEA00; color:black"> </th>
          <th style="background-color:#FFEA00; color:black"> </th>
          <th style="background-color:#FFEA00; color:black"> </th>
          <th style="background-color:#FFEA00; color:black"></th>
          <th style="background-color:#FFEA00; color:black"></th>
          <th style="background-color:#FFEA00; color:black"></th>
      `;
      
      for (let i = 1; i < maxScans; i++) {
        htmlContent += `<th style="background-color:#FFEA00; color:black"></th>`;
      }
      
      htmlContent += `
          <th style="background-color:#FFEA00; color:black">Total </th>
          <th style="background-color:#FFEA00; color:black;text-align:right">${totalScans} </th>
          <th style="background-color:#FFEA00; color:black;text-align:right">${totalAmount.toFixed(2)}  </th>
          <th style="background-color:#FFEA00; color:black"> </th>
        </tr>
        </table><br><br>
      `;
    });
    
    htmlContent += '</body></html>';
    
    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DAILY REVENUE REPORT-${selectedDate}.xls`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateSummaryExcel = async () => {
    if (!Array.isArray(revenueData) || revenueData.length === 0) {
      alert('No data available for export');
      return;
    }

    const date1 = new Date('2023-06-01');
    const dateParts = selectedDate.split('-');
    const date2 = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const billNo = diffDays + 85;
    const billNumber = billNo === 85 ? '85 (A)' : billNo;
    
    const globalMaxColumns = Math.max(...revenueData.map(table => 
      table.summaryRows ? Math.max(...table.summaryRows.map(row => row.scanCode.split('+').length)) : 0
    ));
    const totalCols = globalMaxColumns + 5;
    
    let htmlContent = `<html><meta http-equiv="Content-Type" content="text/html; charset=Windows-1252"><body><table border="1"><tr><th colspan="${totalCols}">VARAHA SDC : 256 SLICE CT SCAN</th></tr><tr><th style="text-margin:center;" colspan="${totalCols}">(IMAGING UNDER P.P.P MODE)</th></tr><tr><th style="text-margin:center;" colspan="${totalCols}">RAJASTHAN MEDICARE RELIEF SOCIETY, MDM HOSPITAL , Jodhpur</th></tr><tr><th style="background-color:#FFEA00; color:black;text-align:left;" colspan="${totalCols}">Bill No. :- 2023/VDC_MDM/CT${billNumber}</th></tr><tr><th style="text-align:center;" colspan="${totalCols}">&nbsp;</th></tr><tr><th style="text-align:right;" colspan="${totalCols}">RMRS, MDM Hospital, Jodhpur</th></tr><tr><th style="text-align:right;" colspan="${totalCols}">SUMMARY FOR THE PERIOD OF</th></tr><tr><th style="background-color:#FFEA00; color:black;text-align:right;" colspan="${totalCols}">${selectedDate}</th></tr>`;
    
    let grandTotalScans = 0;
    let grandTotalForms = 0;
    let grandTotalAmount = 0;
    
    revenueData.forEach(table => {
      if (!table.summaryRows || table.summaryRows.length === 0) return;
      
      const maxScanColumns = Math.max(...table.summaryRows.map(row => row.scanCode.split('+').length));
      
      htmlContent += `<tr><th style="background-color:#FFEA00; color:black">(${table.hospitalName} ${table.category})</th></tr>`;
      htmlContent += '<tr>';
      
      for (let i = 1; i <= maxScanColumns; i++) {
        htmlContent += `<th style="background-color:#2F75B5; color:white">${i}. SCAN NAME</th>`;
      }
      
      htmlContent += `<th style="background-color:#2F75B5; color:white">SCAN NO. ( Scan Code)</th><th style="background-color:#2F75B5; color:white">NO. OF SCAN</th><th style="background-color:#2F75B5; color:white">PATIENT/ FORMS</th><th style="background-color:#2F75B5; color:white">RATE</th><th style="background-color:#2F75B5; color:white">AMOUNT</th></tr>`;
      
      let totalScans = 0;
      let totalPatients = 0;
      let totalAmount = 0;
      
      table.summaryRows.forEach(row => {
        htmlContent += '<tr>';
        
        for (let i = 0; i < maxScanColumns; i++) {
          htmlContent += `<td>${row.scanNames[i] || '..'}</td>`;
        }
        
        htmlContent += `<td style="text-align:center">${row.scanCode}</td><td style="text-align:center">${row.numberOfScans}</td><td style="text-align:center">${row.patientCount}</td><td style="text-align:center">${row.rate}</td><td style="text-align:right">${row.amount}</td></tr>`;
        
        totalScans += row.numberOfScans;
        totalPatients += row.patientCount;
        totalAmount += row.amount;
      });
      
      htmlContent += `<tr><th style="background-color:#FFEA00; color:black; text-align:left" colspan="${maxScanColumns}">Total </th><th style="background-color:#FFEA00; color:black;text-align:center"> </th><th style="background-color:#FFEA00; color:black;text-align:center">${totalScans}</th><th style="background-color:#FFEA00; color:black;text-align:center">${totalPatients}</th><th style="background-color:#FFEA00; color:black;text-align:center"> </th><th style="background-color:#FFEA00; color:black;text-align:right">${totalAmount.toFixed(2)}</th></tr><tr><th colspan="${maxScanColumns + 5}">&nbsp;</th></tr>`;
      
      grandTotalScans += totalScans;
      grandTotalForms += totalPatients;
      grandTotalAmount += totalAmount;
    });
    
    const netReceivable = parseFloat((grandTotalAmount - (grandTotalAmount * 0.25)).toFixed(2));
    
    // Convert amount to words (proper conversion)
    const numberToWords = (amount: number) => {
      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      
      const convertHundreds = (num: number): string => {
        let result = '';
        if (num >= 100) {
          result += ones[Math.floor(num / 100)] + ' Hundred ';
          num %= 100;
        }
        if (num >= 20) {
          result += tens[Math.floor(num / 10)] + ' ';
          num %= 10;
        }
        if (num > 0) {
          result += ones[num] + ' ';
        }
        return result;
      };
      
      if (amount === 0) return 'Zero Rupees Only';
      
      const rupees = Math.floor(amount);
      const paisa = Math.round((amount - rupees) * 100);
      
      let result = '';
      let tempAmount = rupees;
      const crores = Math.floor(tempAmount / 10000000);
      tempAmount %= 10000000;
      const lakhs = Math.floor(tempAmount / 100000);
      tempAmount %= 100000;
      const thousands = Math.floor(tempAmount / 1000);
      tempAmount %= 1000;
      const hundreds = tempAmount;
      
      if (crores > 0) result += convertHundreds(crores) + 'Crore ';
      if (lakhs > 0) result += convertHundreds(lakhs) + 'Lakh ';
      if (thousands > 0) result += convertHundreds(thousands) + 'Thousand ';
      if (hundreds > 0) result += convertHundreds(hundreds);
      
      result = result.trim();
      if (result) result += ' Rupees';
      else result = 'Zero Rupees';
      
      if (paisa > 0) {
        result += ' And ' + convertHundreds(paisa).trim() + ' Paisa';
      }
      
      return result + ' Only';
    };
    
    // Fetch paid patients data from API
    let paidPatients = 0;
    let paidScans = 0;
    let paidAmount = 0;
    
    try {
      const paidResponse = await fetch(`https://varahasdc.co.in/api/admin/paid-patients?s_date=${selectedDate}`);
      if (paidResponse.ok) {
        const paidData = await paidResponse.json();
        if (paidData.success) {
          paidPatients = paidData.tot_patient || 0;
          paidScans = paidData.tot_scan || 0;
          paidAmount = parseFloat((paidData.tot_amt || 0).toFixed(2));
        }
      }
    } catch (error) {
      console.error('Error fetching paid patients data:', error);
    }
    
    htmlContent += `<tr><th style="background-color:#FFEA00; color:black; text-align:left" colspan="${globalMaxColumns}">NET AMOUNT</th><th style="background-color:#FFEA00; color:black;text-align:center">${grandTotalScans}</th><th style="background-color:#FFEA00; color:black;text-align:center">${grandTotalForms}</th><th style="background-color:#FFEA00; color:black;text-align:center"> </th><th style="background-color:#FFEA00; color:black;text-align:right">${grandTotalAmount.toFixed(2)}</th></tr><tr><th colspan="${totalCols}">&nbsp;</th></tr><tr><th style="background-color:#2F75B5; color:white" colspan="${totalCols}">SUMMARY FOR THE PERIOD</th></tr><tr><td><B>PARTICULAR</td>`;
    
    for (let i = 1; i < globalMaxColumns; i++) {
      htmlContent += '<td></td>';
    }
    
    htmlContent += `<td style="text-align:center"><B>SCAN</td><td></td><td style="text-align:center"><B>AMOUNT</td></tr><tr><td>GROSS TOTAL</td>`;
    
    for (let i = 1; i < globalMaxColumns; i++) {
      htmlContent += '<td></td>';
    }
    
    htmlContent += `<td style="text-align:center">${grandTotalScans}</td><td></td><td style="text-align:right">${grandTotalAmount.toFixed(2)}</td></tr><tr><td>(-) 25% FREE SHARE OF MDM</td>`;
    
    for (let i = 1; i < globalMaxColumns; i++) {
      htmlContent += '<td></td>';
    }
    
    htmlContent += `<td style="text-align:center">${parseFloat((grandTotalScans * 0.25).toFixed(2))}</td><td></td><td style="text-align:right">${(grandTotalAmount * 0.25).toFixed(2)}</td></tr><tr><th colspan="${globalMaxColumns}" style="background-color:#FFEA00; color:black; text-align:left">NET RECEIVABLE</th><th style="background-color:#FFEA00; color:black; text-align:center">${parseFloat((grandTotalScans - (grandTotalScans * 0.25)).toFixed(2))}</th><th style="background-color:#FFEA00; color:black;"></th><th style="background-color:#FFEA00; color:black;text-align:right">${netReceivable.toFixed(2)}</th></tr><tr><th colspan="${totalCols}">&nbsp;</th></tr><tr><th colspan="${totalCols}">&nbsp;</th></tr><tr><th colspan="${globalMaxColumns}" style="text-align:left"><u>RUPEES ${numberToWords(netReceivable).toUpperCase()}</u></th><th colspan="4"></th></tr><tr><th colspan="${globalMaxColumns}" style="text-align:left">*TOTAL PAID PATIENT = ${paidPatients}, TOTAL SCAN = ${paidScans}, TOTAL AMOUNT = ${paidAmount.toFixed(2)}</th><th colspan="4" style="text-align:right">For : VARAHA SDC</th></tr></table></body></html>`;
    
    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DAILY SUMMARY REPORT-${selectedDate}.xls`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <SuperAdminLayout 
      title="Daily Revenue Report" 
      subtitle="Daily Revenue Analysis"
      actions={
        <Button onClick={handleDownloadExcel} variant="success" disabled={revenueData.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Download Excel
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
              <input
                type="date"
                value={selectedDate.split('-').reverse().join('-')}
                onChange={(e) => {
                  const parts = e.target.value.split('-');
                  const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                  setSelectedDate(formattedDate);
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
              <div className="flex items-center space-x-4 mt-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="reportType"
                    value="D"
                    checked={reportType === 'D'}
                    onChange={(e) => setReportType(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Detail</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="reportType"
                    value="S"
                    checked={reportType === 'S'}
                    onChange={(e) => setReportType(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Summary</span>
                </label>
              </div>
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
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchRevenueData} disabled={loading} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                {loading ? 'Loading...' : 'Search'}
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Revenue Data</h2>
              <span className="text-sm text-gray-500">{filteredData.length} records</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableHeaderCell>S.No</TableHeaderCell>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>{reportType === 'S' ? 'Scan Code' : 'CRO'}</TableHeaderCell>
                <TableHeaderCell>{reportType === 'S' ? 'Hospital - Category' : 'Patient Name'}</TableHeaderCell>
                <TableHeaderCell>{reportType === 'S' ? 'Patient Count' : 'Age'}</TableHeaderCell>
                <TableHeaderCell>Gender</TableHeaderCell>
                <TableHeaderCell>Mobile</TableHeaderCell>
                <TableHeaderCell>Category</TableHeaderCell>
                <TableHeaderCell>Hospital</TableHeaderCell>
                <TableHeaderCell>Doctor</TableHeaderCell>
                {(() => {
                  const maxScans = Math.max(...filteredData.map(item => {
                    if (reportType === 'S' && 'scanNames' in item && item.scanNames) {
                      return item.scanNames.length;
                    }
                    return item.total_scan || item.totalScans || 0;
                  }), 0);
                  return Array.from({length: maxScans}, (_, i) => (
                    <TableHeaderCell key={i}>Scan Type {i + 1}</TableHeaderCell>
                  ));
                })()}
                <TableHeaderCell>Total Scan</TableHeaderCell>
                <TableHeaderCell>Amount</TableHeaderCell>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell className="text-center" colSpan={13 + Math.max(...filteredData.map(item => {
                      if (reportType === 'S' && 'scanNames' in item && item.scanNames) {
                        return item.scanNames.length;
                      }
                      return item.total_scan || item.totalScans || 0;
                    }), 0)}>Loading...</TableCell>
                  </TableRow>
                ) : !filteredData || filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell className="text-center" colSpan={13 + Math.max(...(filteredData.length > 0 ? filteredData : [{total_scan: 0}]).map(item => {
                      if (reportType === 'S' && 'scanNames' in item && item.scanNames) {
                        return item.scanNames.length;
                      }
                      return item.total_scan || 0;
                    }), 0)}>No revenue data found</TableCell>
                  </TableRow>
                ) : (
                  paginatedRevenue.map((item, index) => {
                    const scanNames = item.scanNames || (item.scan_names ? item.scan_names.split(', ') : []) || [];
                    return (
                      <TableRow key={item.cro || index}>
                        <TableCell>{startIndex + index + 1}</TableCell>
                        <TableCell>{item.date}</TableCell>
                        <TableCell className="font-medium text-red-600">{item.cro || ''}</TableCell>
                        <TableCell>{item.patient_name || item.patientName || ''}</TableCell>
                        <TableCell>{item.age || ''}</TableCell>
                        <TableCell>{item.gender || ''}</TableCell>
                        <TableCell>{item.mobile || ''}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 font-medium">
                            {item.category || ''}
                          </span>
                        </TableCell>
                        <TableCell>{item.hospitalName || item.hospital_name || ''}</TableCell>
                        <TableCell>{item.doctor || item.doctor_name || ''}</TableCell>
                        {(() => {
                          const maxScans = Math.max(...filteredData.map(item => {
                            if (reportType === 'S' && 'scanNames' in item && item.scanNames) {
                              return item.scanNames.length;
                            }
                            return item.total_scan || item.totalScans || 0;
                          }), 0);
                          return Array.from({length: maxScans}, (_, i) => (
                            <TableCell key={i}>{scanNames[i] || ''}</TableCell>
                          ));
                        })()}
                        <TableCell className="text-center">{item.total_scan || item.totalScans || 0}</TableCell>
                        <TableCell className="font-medium text-green-600">₹{parseFloat(String(item.amount || 0)).toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredData.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </Card>
      </div>
    </SuperAdminLayout>
  );
}