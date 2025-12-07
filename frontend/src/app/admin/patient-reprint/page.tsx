'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Printer, FileText, User, RefreshCw } from 'lucide-react';
import SuperAdminLayout from '@/components/SuperAdminLayout';
import DateRangeFilter from '@/components/ui/DateRangeFilter';
import { formatDate, getCurrentDate, formatTime12Hour } from '@/utils/dateFormat';

interface ScanDetail {
  name: string;
  charges: number;
}

interface PatientData {
  patient_id: number;
  cro: string;
  patient_name: string;
  age: string;
  gender: string;
  contact_number: string;
  address: string;
  category: string;
  amount: number;
  date: string;
  doctor_name: string;
  hospital_short: string;
  scan_details: ScanDetail[];
  total_amount: number;
  time_slot: string;
  allot_date?: string;
  allot_time?: string;
  allot_time_out?: string;
}

interface PatientListItem {
  patient_id: number;
  cro: string;
  patient_name: string;
  age: string;
  gender: string;
  category: string;
  amount: number;
}

export default function PatientReprint() {
  const [searchCRO, setSearchCRO] = useState('');
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [patientList, setPatientList] = useState<PatientListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [currentDateRange, setCurrentDateRange] = useState<{from_date: string, to_date: string} | null>(null);

  useEffect(() => {
    if (currentDateRange) {
      fetchPatientList();
    }
  }, [currentDateRange]);

  const fetchPatientList = useCallback(async () => {
    if (!currentDateRange) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        from_date: currentDateRange.from_date,
        to_date: currentDateRange.to_date
      });
      
      const response = await fetch(`https://varahasdc.co.in/api/admin/patient-list?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setPatientList(data.data);
      }
    } catch (error) {
      console.error('Error fetching patient list:', error);
    } finally {
      setLoading(false);
    }
  }, [currentDateRange]);

  const handleSearch = async () => {
    if (!searchCRO.trim()) {
      fetchPatientList();
      return;
    }
    await handleSearchByCRO(searchCRO);
  };

  const handleReprintPatient = async (cro: string) => {
    setSearchCRO(cro);
    await handleSearchByCRO(cro);
  };

  const handleSearchByCRO = async (cro: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`https://varahasdc.co.in/api/admin/patient-reprint?cro=${encodeURIComponent(cro)}`);
      const data = await response.json();
      
      if (data.success) {
        setPatientData(data.data);
      } else {
        setError(data.error || 'Patient not found');
        setPatientData(null);
      }
    } catch (error) {
      console.error('Error searching patient:', error);
      setError('Failed to search patient');
      setPatientData(null);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patientList.filter(patient =>
    patient.patient_name?.toLowerCase().includes(searchCRO.toLowerCase()) ||
    patient.cro?.toLowerCase().includes(searchCRO.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, startIndex + itemsPerPage);

  // Convert number to words function
  const numberToWords = (num: number): string => {
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    
    if (num === 0) return 'zero';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
    
    return num.toString();
  };

  const handlePrint = () => {
    if (!patientData) return;
    
    const receiptData = {
      cro: patientData.cro,
      patient_id: patientData.patient_id,
      patient_name: patientData.patient_name,
      age: patientData.age,
      gender: patientData.gender,
      address: patientData.address || '',
      contact_number: patientData.contact_number || '',
      category: patientData.category || '',
      doctor_name: patientData.doctor_name,
      date: patientData.date,
      allot_date: patientData.allot_date,
      time_slot: patientData.time_slot || '',
      allot_time: patientData.allot_time || '',
      allot_time_out: patientData.allot_time_out || '',
      appointmentTime: `${formatDate(patientData.allot_date || patientData.date)} ${patientData.allot_time ? formatTime12Hour(patientData.allot_time) : ''}-${patientData.allot_time_out ? formatTime12Hour(patientData.allot_time_out) : ''}`,
      scan_names: patientData.scan_details?.map(s => s.name).join(', ') || '',
      amount: patientData.amount || 0,
      amount_reci: patientData.category === 'GEN / Paid' ? (patientData.total_amount || patientData.amount || 0) : 0,
      total_scan_amount: patientData.total_amount || patientData.amount || 0
    };
    
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${receiptData.cro}</title>
        <style>
          .admission_form { text-align: center; color: #000000; font-size: 10px; width: 100%; }
          .admission_form table { width: 98%; font-size: 10px; margin: -5px 8px; }
          .admission_form .form_input { padding: 2px 1%; font-size: 10px; border: none; font-weight: bold; font-style: italic; width: 99%; border-bottom: 1px dotted #000000; }
          .admission_form .form_input_box { border-bottom: 0px dotted #000000; padding: 0px 0px 2px 0px; width: 100%; display: inline-block; }
          @media print { .no_print, .no_print * { display: none !important; } .admission_div_desc { border: 0px !important; } .page_break { page-break-after: always; } }
        </style>
      </head>
      <body bgcolor="#FFFFFF" leftmargin="0" topmargin="0" marginwidth="0" marginheight="0" onload="window.print(); setTimeout(() => window.close(), 1000);">
        <div class="admission_form" align="center" style="border:solid thin; margin-top:18px;width:93.0%;margin-left:30px;">
          <table align="center" style="margin-top:2px;">
            <tr><td colspan="6"><b>Dr. S.N. MEDICAL COLLEGE AND ATTACHED GROUP OF HOSPITAL, JODHPUR</b></td></tr>
            <tr><td colspan="6"><b>Rajasthan Medical Relief Society, M.D.M. Hospital, Jodhpur</b></td></tr>
            <tr><td colspan="6"><b>IMAGING CENTRE UNDER P.P.P.MODE : VARAHA SDC</b></td></tr>
            <tr><td colspan="6"><b>256 SLICE DUAL ENERGY CT SCAN, M.D.M HOSPITAL Jodhpur(Raj.) - 342003</b></td></tr>
            <tr><td colspan="6"><b>Tel. : +91-291-2648120 , 0291-2648121 , 0291-2648122</b></td></tr>
          </table>
          
          <table>
            <tr>
              <td width="55">Reg.No :</td>
              <td width="200"><span class="form_input_box"><input type="text" class="form_input" value="${receiptData.cro}(${receiptData.patient_id})"></span></td>
              <td colspan="6"><span style="margin-left:30%; border: 1px solid #02C; border-radius: 11px;padding: 3px 15px;">Cash Receipt</span></td>
              <td width="36">Date</td>
              <td width="144"><span class="form_input_box"><input type="text" class="form_input" value="${formatDate(receiptData.date || new Date())}"></span></td>
            </tr>
          </table>
          
          <table>
            <tr>
              <td width="56">Ref. By :</td>
              <td width="482"><span class="form_input_box"><input type="text" class="form_input" value="${receiptData.doctor_name}"></span></td>
              <td width="174">Date and Time of Appointment :</td>
              <td width="316"><span class="form_input_box"><input type="text" class="form_input" value="${receiptData.appointmentTime}"></span></td>
            </tr>
          </table>
          
          <table>
            <tr>
              <td width="78">Patient Name:</td>
              <td width="650"><span class="form_input_box"><input type="text" class="form_input" value="${receiptData.patient_name}"></span></td>
              <td width="33">Age :</td>
              <td width="144"><span class="form_input_box"><input type="text" class="form_input" value="${receiptData.age}"></span></td>
              <td width="36">Gender</td>
              <td width="144"><span class="form_input_box"><input type="text" class="form_input" value="${receiptData.gender}"></span></td>
            </tr>
          </table>
          
          <table>
            <tr>
              <td width="40">Address</td>
              <td width="687"><span class="form_input_box"><input type="text" class="form_input" value="${receiptData.address}"></span></td>
              <td width="120"><span class="form_input_box"><label>Category</label><input type="text" class="form_input" value="${receiptData.category}"></span></td>
              <td width="33">Phone:</td>
              <td width="333"><span class="form_input_box"><input type="text" class="form_input" value="${receiptData.contact_number}"></span></td>
            </tr>
          </table>
          
          <table>
            <tr>
              <td width="59">Investigations:</td>
              <td width="1042"><span class="form_input_box"><input type="text" class="form_input" value="${receiptData.scan_names}"></span></td>
            </tr>
          </table>
          
          <table>
            <tr>
              <td width="100">For Sum Of Rupees:</td>
              <td width="733"><span class="form_input_box"><input type="text" class="form_input" value="${receiptData.category === 'GEN / Paid' ? numberToWords(receiptData.amount_reci).toUpperCase() : 'ZERO'} RUPEES ONLY"></span></td>
              <td width="30"><label>Scan Amount</label><input type="text" value="₹ ${receiptData.total_scan_amount}" style="border:1px solid #5E60AE;"></td>
              <td width="30"><label>Received Amount</label><input type="text" value="₹ ${receiptData.category === 'GEN / Paid' ? receiptData.amount_reci : 0}" style="border:1px solid #5E60AE;"></td>
            </tr>
          </table>
          
          <table>
            <tr>
              <td colspan="6" align="right">For Varaha SDC, Jodhpur</span></td>
            </tr>
            <tr>
              <td></td>
            </tr>
          </table>
        </div>
        
        <hr>
        
        <div class="admission_form" align="center" style="border:solid thin; margin-top:18px;width:93.0%;margin-left:30px;">
          <table align="center" style="margin-top:2px;">
            <tr><td colspan="6"><b>Dr. S.N. MEDICAL COLLEGE AND ATTACHED GROUP OF HOSPITAL, JODHPUR</b></td></tr>
            <tr><td colspan="6"><b>Rajasthan Medical Relief Society, M.D.M. Hospital, Jodhpur</b></td></tr>
            <tr><td colspan="6"><b>IMAGING CENTRE UNDER P.P.P.MODE : VARAHA SDC</b></td></tr>
            <tr><td colspan="6"><b>256 SLICE DUAL ENERGY CT SCAN, M.D.M HOSPITAL Jodhpur(Raj.) - 342003</b></td></tr>
            <tr><td colspan="6"><b>Tel. : +91-291-2648120 , 0291-2648121 , 0291-2648122</b></td></tr>
          </table>
          
          <table>
            <tr>
              <td width="55">Reg.No :</td>
              <td width="200"><span class="form_input_box"><input type="text" class="form_input" value="${receiptData.cro}(${receiptData.patient_id})"></span></td>
              <td colspan="6"><span style="margin-left:30%; border: 1px solid #02C; border-radius: 11px;padding: 3px 15px;">Cash Receipt</span></td>
              <td width="36">Date</td>
              <td width="144"><span class="form_input_box"><input type="text" class="form_input" value="${formatDate(receiptData.date || new Date())}"></span></td>
            </tr>
          </table>
          
          <table>
            <tr>
              <td width="56">Ref. By :</td>
              <td width="482"><span class="form_input_box"><input type="text" class="form_input" value="${receiptData.doctor_name}"></span></td>
              <td width="174">Date and Time of Appointment :</td>
              <td width="316"><span class="form_input_box"><input type="text" class="form_input" value="${receiptData.appointmentTime}"></span></td>
            </tr>
          </table>
          
          <table>
            <tr>
              <td width="78">Patient Name:</td>
              <td width="650"><span class="form_input_box"><input type="text" class="form_input" value="${receiptData.patient_name}"></span></td>
              <td width="33">Age :</td>
              <td width="144"><span class="form_input_box"><input type="text" class="form_input" value="${receiptData.age}"></span></td>
              <td width="36">Gender</td>
              <td width="144"><span class="form_input_box"><input type="text" class="form_input" value="${receiptData.gender}"></span></td>
            </tr>
          </table>
          
          <table>
            <tr>
              <td width="40">Address</td>
              <td width="687"><span class="form_input_box"><input type="text" class="form_input" value="${receiptData.address}"></span></td>
              <td width="120"><span class="form_input_box"><label>Category</label><input type="text" class="form_input" value="${receiptData.category}"></span></td>
              <td width="33">Phone:</td>
              <td width="333"><span class="form_input_box"><input type="text" class="form_input" value="${receiptData.contact_number}"></span></td>
            </tr>
          </table>
          
          <table>
            <tr>
              <td width="59">Investigations:</td>
              <td width="1042"><span class="form_input_box"><input type="text" class="form_input" value="${receiptData.scan_names}"></span></td>
            </tr>
          </table>
          
          <table>
            <tr>
              <td width="20">For Sum Of Rupees:</td>
              <td width="550"><span class="form_input_box"><input type="text" class="form_input" value="${receiptData.category === 'GEN / Paid' ? numberToWords(receiptData.amount_reci).toUpperCase() : 'ZERO'} RUPEES ONLY"></span></td>
              <td width="30"><label>Scan Amount</label><input type="text" value="₹ ${receiptData.total_scan_amount}" style="border:1px solid #5E60AE;"></td>
              <td width="30"><label>Received Amount</label><input type="text" value="₹ ${receiptData.category === 'GEN / Paid' ? receiptData.amount_reci : 0}" style="border:1px solid #5E60AE;"></td>
            </tr>
          </table>
          
          <table>
            <tr>
              <td colspan="6" align="right">For Varaha SDC, Jodhpur</span></td>
            </tr>
            <tr>
              <td></td>
            </tr>
          </table>
        </div>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    if (printWindow) {
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
    }
  };

  return (
    <SuperAdminLayout 
      title="Patient Reprint" 
      subtitle="Reprint Patient Receipt"
    >
      <div className="space-y-6">
        {/* Date Range Filter */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <DateRangeFilter onDateChange={(fromDate, toDate) => setCurrentDateRange({ from_date: fromDate, to_date: toDate })} />
        </div>

        {/* Search Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Search className="h-6 w-6 text-red-600 mr-2" />
            Search Patient for Reprint
          </h2>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter CRO No or Patient Name
              </label>
              <input
                type="text"
                value={searchCRO}
                onChange={(e) => setSearchCRO(e.target.value)}
                placeholder="Enter CRO Number or Patient Name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex items-end space-x-2">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Search className="h-4 w-4 mr-2" />
                {loading ? 'Searching...' : 'Submit'}
              </button>
              <button
                onClick={fetchPatientList}
                disabled={loading || !currentDateRange}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Patient List Table */}
        {!patientData && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <User className="h-6 w-6 text-red-600 mr-2" />
                Patient List ({filteredPatients.length})
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CRO</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                    </tr>
                  ) : paginatedPatients.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-gray-500">No patients found</td>
                    </tr>
                  ) : (
                    paginatedPatients.map((patient, index) => (
                      <tr key={patient.patient_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{startIndex + index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.cro}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.patient_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.age}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.gender}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{patient.amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <button
                            onClick={() => handleReprintPatient(patient.cro)}
                            className="flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            <Printer className="h-4 w-4 mr-1" />
                            Reprint
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredPatients.length)} of {filteredPatients.length} results
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {/* Show first page */}
                    {currentPage > 3 && (
                      <>
                        <button
                          onClick={() => setCurrentPage(1)}
                          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          1
                        </button>
                        {currentPage > 4 && <span className="px-2 text-gray-500">...</span>}
                      </>
                    )}
                    
                    {/* Show current page and surrounding pages */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      if (page > totalPages) return null;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg ${
                            currentPage === page
                              ? 'bg-red-600 text-white'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    {/* Show last page */}
                    {currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && <span className="px-2 text-gray-500">...</span>}
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Patient Receipt Preview */}
        {patientData && (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FileText className="h-6 w-6 text-red-600 mr-2" />
              Patient Receipt - CRO: {patientData.cro}
            </h2>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Patient Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Name:</span> {patientData.patient_name}</div>
                  <div><span className="font-medium">CRO:</span> {patientData.cro}</div>
                  <div><span className="font-medium">Age:</span> {patientData.age}</div>
                  <div><span className="font-medium">Gender:</span> {patientData.gender}</div>
                  <div><span className="font-medium">Phone:</span> {patientData.contact_number}</div>
                  <div><span className="font-medium">Doctor:</span> {patientData.doctor_name}</div>
                  <div className="col-span-2"><span className="font-medium">Address:</span> {patientData.address}</div>
                  <div><span className="font-medium">Category:</span> {patientData.category}</div>
                  <div><span className="font-medium">Amount:</span> ₹{patientData.amount}</div>
                  <div><span className="font-medium">Date:</span> {formatDate(patientData.date)}</div>
                </div>
              </div>
              
              {patientData.scan_details && patientData.scan_details.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Scan Details</h4>
                  <div className="space-y-2">
                    {patientData.scan_details.map((scan, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{scan.name}</span>
                        <span>₹{scan.charges}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between font-medium">
                      <span>Total Amount:</span>
                      <span>₹{patientData.total_amount}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setPatientData(null)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Receipt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
}