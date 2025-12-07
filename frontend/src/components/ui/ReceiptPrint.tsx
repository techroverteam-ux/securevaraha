'use client';


import { X, Printer } from 'lucide-react';

interface ReceiptPrintProps {
  isOpen: boolean;
  onClose: () => void;
  patientData: any;
}

export default function ReceiptPrint({ isOpen, onClose, patientData }: ReceiptPrintProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const convertNumberToWords = (number: number): string => {
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    
    if (number === 0) return 'zero';
    
    let result = '';
    
    if (number >= 1000) {
      result += ones[Math.floor(number / 1000)] + ' thousand ';
      number %= 1000;
    }
    
    if (number >= 100) {
      result += ones[Math.floor(number / 100)] + ' hundred ';
      number %= 100;
    }
    
    if (number >= 20) {
      result += tens[Math.floor(number / 10)] + ' ';
      number %= 10;
    } else if (number >= 10) {
      result += teens[number - 10] + ' ';
      number = 0;
    }
    
    if (number > 0) {
      result += ones[number] + ' ';
    }
    
    return result.trim().toUpperCase() + ' RUPEES ONLY';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b no-print">
          <h2 className="text-xl font-bold text-gray-900">Receipt Print</h2>
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors flex items-center space-x-2"
            >
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Receipt 1 */}
          <div className="receipt-form border border-gray-400 mb-8 p-4">
            <table className="w-full text-center text-xs">
              <thead>
                <tr>
                  <td colSpan={6} className="font-bold text-sm py-1">Dr. S.N. MEDICAL COLLEGE AND ATTACHED GROUP OF HOSPITAL, JODHPUR</td>
                </tr>
                <tr>
                  <td colSpan={6} className="font-bold text-sm py-1">Rajasthan Medical Relief Society, M.D.M. Hospital, Jodhpur</td>
                </tr>
                <tr>
                  <td colSpan={6} className="font-bold text-sm py-1">IMAGING CENTRE UNDER P.P.P.MODE : VARAHA SDC</td>
                </tr>
                <tr>
                  <td colSpan={6} className="font-bold text-sm py-1">256 SLICE DUAL ENERGY CT SCAN, M.D.M HOSPITAL Jodhpur(Raj.) - 342003</td>
                </tr>
                <tr>
                  <td colSpan={6} className="font-bold text-sm py-1">Tel. : +91-291-2648120 , 0291-2648121 , 0291-2648122</td>
                </tr>
              </thead>
            </table>

            <table className="w-full text-xs mt-4">
              <tr>
                <td className="w-16">Reg.No :</td>
                <td className="w-48 border-b border-dotted border-gray-400 px-2">{patientData?.cro || 'N/A'}</td>
                <td className="text-center">
                  <span className="border border-sky-500 rounded-lg px-3 py-1">Cash Receipt</span>
                </td>
                <td className="w-12">Date</td>
                <td className="w-32 border-b border-dotted border-gray-400 px-2">{patientData?.date || new Date().toLocaleDateString()}</td>
              </tr>
            </table>

            <table className="w-full text-xs mt-2">
              <tr>
                <td className="w-16">Ref. By :</td>
                <td className="w-96 border-b border-dotted border-gray-400 px-2">{patientData?.doctor || 'N/A'}</td>
                <td className="w-44">Date and Time of Appointment :</td>
                <td className="border-b border-dotted border-gray-400 px-2">{patientData?.appointmentDate || 'N/A'} At {patientData?.appointmentTime || 'N/A'}</td>
              </tr>
            </table>

            <table className="w-full text-xs mt-2">
              <tr>
                <td className="w-24">Patient Name:</td>
                <td className="w-96 border-b border-dotted border-gray-400 px-2">{patientData?.name || 'N/A'}</td>
                <td className="w-16">Category</td>
                <td className="w-32 border-b border-dotted border-gray-400 px-2">{patientData?.category || 'N/A'}</td>
                <td className="w-12">Age :</td>
                <td className="w-24 border-b border-dotted border-gray-400 px-2">{patientData?.age || 'N/A'}</td>
                <td className="w-16">Gender</td>
                <td className="w-24 border-b border-dotted border-gray-400 px-2">{patientData?.gender || 'N/A'}</td>
              </tr>
            </table>

            <table className="w-full text-xs mt-2">
              <tr>
                <td className="w-16">Address</td>
                <td className="border-b border-dotted border-gray-400 px-2">{patientData?.address || 'N/A'}</td>
                <td className="w-16">Phone:</td>
                <td className="w-64 border-b border-dotted border-gray-400 px-2">{patientData?.phone || 'N/A'}</td>
              </tr>
            </table>

            <table className="w-full text-xs mt-2">
              <tr>
                <td className="w-24">Investigations:</td>
                <td className="border-b border-dotted border-gray-400 px-2">{patientData?.investigations || 'N/A'}</td>
              </tr>
            </table>

            <table className="w-full text-xs mt-2">
              <tr>
                <td className="w-32">For Sum Of Rupees:</td>
                <td className="border-b border-dotted border-gray-400 px-2">
                  {convertNumberToWords(patientData?.totalAmount || 0)}
                </td>
                <td className="w-32 text-center">
                  <div className="border border-sky-500 p-1">
                    <div>Scan Amount</div>
                    <div>₹ {patientData?.scanAmount || 0}</div>
                  </div>
                </td>
                <td className="w-32 text-center">
                  <div className="border border-sky-500 p-1">
                    <div>Received Amount</div>
                    <div>₹ {patientData?.receivedAmount || 0}</div>
                  </div>
                </td>
              </tr>
            </table>

            {patientData?.discount && (
              <table className="w-full text-xs mt-2">
                <tr>
                  <td>Discount</td>
                  <td className="border border-sky-500 p-1">₹ {patientData.discount}</td>
                </tr>
              </table>
            )}

            <table className="w-full text-xs mt-4">
              <tr>
                <td className="text-right" colSpan={6}>
                  For Varaha SDC<br />
                  <span className="mr-12">Jodhpur</span>
                </td>
              </tr>
            </table>
          </div>

          <hr className="my-4" />

          {/* Receipt 2 - Duplicate */}
          <div className="receipt-form border border-gray-400 p-4">
            <table className="w-full text-center text-xs">
              <thead>
                <tr>
                  <td colSpan={6} className="font-bold text-sm py-1">Dr. S.N. MEDICAL COLLEGE AND ATTACHED GROUP OF HOSPITAL, JODHPUR</td>
                </tr>
                <tr>
                  <td colSpan={6} className="font-bold text-sm py-1">Rajasthan Medical Relief Society, M.D.M. Hospital, Jodhpur</td>
                </tr>
                <tr>
                  <td colSpan={6} className="font-bold text-sm py-1">IMAGING CENTRE UNDER P.P.P.MODE : VARAHA SDC</td>
                </tr>
                <tr>
                  <td colSpan={6} className="font-bold text-sm py-1">256 SLICE DUAL ENERGY CT SCAN, M.D.M HOSPITAL Jodhpur(Raj.) - 342003</td>
                </tr>
                <tr>
                  <td colSpan={6} className="font-bold text-sm py-1">Tel. : +91-291-2648120 , 0291-2648121 , 0291-2648122</td>
                </tr>
              </thead>
            </table>

            <table className="w-full text-xs mt-4">
              <tr>
                <td className="w-16">Reg.No :</td>
                <td className="w-48 border-b border-dotted border-gray-400 px-2">{patientData?.cro || 'N/A'}</td>
                <td className="text-center">
                  <span className="border border-sky-500 rounded-lg px-3 py-1">Cash Receipt</span>
                </td>
                <td className="w-12">Date</td>
                <td className="w-32 border-b border-dotted border-gray-400 px-2">{patientData?.date || new Date().toLocaleDateString()}</td>
              </tr>
            </table>

            <table className="w-full text-xs mt-2">
              <tr>
                <td className="w-16">Ref. By :</td>
                <td className="w-96 border-b border-dotted border-gray-400 px-2">{patientData?.doctor || 'N/A'}</td>
                <td className="w-44">Date and Time of Appointment :</td>
                <td className="border-b border-dotted border-gray-400 px-2">{patientData?.appointmentDate || 'N/A'} At {patientData?.appointmentTime || 'N/A'}</td>
              </tr>
            </table>

            <table className="w-full text-xs mt-2">
              <tr>
                <td className="w-24">Patient Name:</td>
                <td className="w-96 border-b border-dotted border-gray-400 px-2">{patientData?.name || 'N/A'}</td>
                <td className="w-16">Category</td>
                <td className="w-32 border-b border-dotted border-gray-400 px-2">{patientData?.category || 'N/A'}</td>
                <td className="w-12">Age :</td>
                <td className="w-24 border-b border-dotted border-gray-400 px-2">{patientData?.age || 'N/A'}</td>
                <td className="w-16">Gender</td>
                <td className="w-24 border-b border-dotted border-gray-400 px-2">{patientData?.gender || 'N/A'}</td>
              </tr>
            </table>

            <table className="w-full text-xs mt-2">
              <tr>
                <td className="w-16">Address</td>
                <td className="border-b border-dotted border-gray-400 px-2">{patientData?.address || 'N/A'}</td>
                <td className="w-16">Phone:</td>
                <td className="w-64 border-b border-dotted border-gray-400 px-2">{patientData?.phone || 'N/A'}</td>
              </tr>
            </table>

            <table className="w-full text-xs mt-2">
              <tr>
                <td className="w-24">Investigations:</td>
                <td className="border-b border-dotted border-gray-400 px-2">{patientData?.investigations || 'N/A'}</td>
              </tr>
            </table>

            <table className="w-full text-xs mt-2">
              <tr>
                <td className="w-32">For Sum Of Rupees:</td>
                <td className="border-b border-dotted border-gray-400 px-2">
                  {convertNumberToWords(patientData?.totalAmount || 0)}
                </td>
                <td className="w-32 text-center">
                  <div className="border border-sky-500 p-1">
                    <div>Scan Amount</div>
                    <div>₹ {patientData?.scanAmount || 0}</div>
                  </div>
                </td>
                <td className="w-32 text-center">
                  <div className="border border-sky-500 p-1">
                    <div>Received Amount</div>
                    <div>₹ {patientData?.receivedAmount || 0}</div>
                  </div>
                </td>
              </tr>
            </table>

            {patientData?.discount && (
              <table className="w-full text-xs mt-2">
                <tr>
                  <td>Discount</td>
                  <td className="border border-sky-500 p-1">₹ {patientData.discount}</td>
                </tr>
              </table>
            )}

            <table className="w-full text-xs mt-4">
              <tr>
                <td className="text-right" colSpan={6}>
                  For Varaha SDC<br />
                  <span className="mr-12">Jodhpur</span>
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .receipt-form {
            page-break-after: always;
          }
          .receipt-form:last-child {
            page-break-after: auto;
          }
        }
      `}</style>
    </div>
  );
}