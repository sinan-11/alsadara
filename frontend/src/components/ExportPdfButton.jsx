import { useState } from 'react';
import { mobileAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineDocumentDownload } from 'react-icons/hi';

const ExportPdfButton = ({ filters }) => {
  const [generating, setGenerating] = useState(false);

  const handleExport = async () => {
    setGenerating(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.status && filters.status !== 'ALL') params.status = filters.status;
      if (filters.brand) params.brand = filters.brand;

      const response = await mobileAPI.exportPdf(params);

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const contentDisposition = response.headers['content-disposition'];
      let filename = 'mobile-stock-report.pdf';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match) filename = match[1];
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Stock report downloaded');
    } catch (error) {
      if (error.response?.data instanceof Blob) {
        const text = await error.response.data.text();
        try {
          const json = JSON.parse(text);
          toast.error(json.message || 'Failed to generate PDF');
        } catch {
          toast.error('Failed to generate PDF');
        }
      } else {
        toast.error(error.response?.data?.message || 'Failed to generate PDF');
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={generating}
      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {generating ? (
        <>
          <div className="w-4 h-4 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
          <span className="hidden sm:inline">Generating...</span>
        </>
      ) : (
        <>
          <HiOutlineDocumentDownload className="w-5 h-5" />
          <span className="hidden sm:inline">Export PDF</span>
        </>
      )}
    </button>
  );
};

export default ExportPdfButton;
