import React, { useState } from 'react';

const EmbedGenerator: React.FC = () => {
  // Use the specific URL requested by the user
  const [baseUrl] = useState('https://teacher-salary-wine.vercel.app');

  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Clean URL construction
  const embedUrl = `${baseUrl}/?embed=true`;
  const iframeCode = `<iframe src="${embedUrl}" width="100%" height="650" style="border:none; border-radius: 8px; overflow: hidden;" title="Widget tính lương giáo viên"></iframe>`;

  const copyToClipboard = (text: string, setCopied: (val: boolean) => void) => {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(() => {
             fallbackCopy(text, setCopied);
        });
    } else {
        fallbackCopy(text, setCopied);
    }
  };

  const fallbackCopy = (text: string, setCopied: (val: boolean) => void) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Fallback: Unable to copy', err);
      }
      document.body.removeChild(textArea);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-none border border-gray-200 font-sans h-full">
      <div className="mb-6">
        <h2 className="text-xl font-bold font-serif text-gray-900">Tạo mã nhúng (Embed)</h2>
        <p className="text-sm text-gray-500 mt-1">Tùy chỉnh nội dung và lấy mã nhúng hoặc link trực tiếp</p>
      </div>

      {/* 1. Direct Link */}
      <div className="mb-6">
        <label className="flex items-center text-sm font-bold text-gray-900 mb-2">
            <svg className="w-4 h-4 mr-1.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
            1. Link trực tiếp (URL)
        </label>
        <div className="relative flex rounded-md shadow-sm">
          <input
            type="text"
            readOnly
            value={embedUrl}
            onClick={(e) => e.currentTarget.select()}
            className="block w-full rounded-l-lg border-gray-300 bg-gray-50 border p-3 text-sm text-gray-500 focus:border-primary focus:ring-primary outline-none"
          />
          <button
            onClick={() => copyToClipboard(embedUrl, setCopiedUrl)}
            className="relative -ml-px inline-flex items-center space-x-2 rounded-r-lg border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
          >
            {copiedUrl ? (
                <span className="text-green-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Đã copy
                </span>
            ) : (
                <span className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    Copy
                </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. Embed Code */}
      <div className="mb-3">
        <label className="flex items-center text-sm font-bold text-gray-900 mb-2">
            <svg className="w-4 h-4 mr-1.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
            2. Mã nhúng (Iframe Code)
        </label>
        <div className="relative rounded-lg bg-[#0F172A] p-4 font-mono text-sm text-gray-300 shadow-inner">
            <textarea
                readOnly
                rows={5}
                className="w-full resize-none bg-transparent outline-none text-xs leading-relaxed text-gray-300"
                value={iframeCode}
                onClick={(e) => e.currentTarget.select()}
            />
            <button
                onClick={() => copyToClipboard(iframeCode, setCopiedCode)}
                className="absolute top-3 right-3 flex items-center gap-1.5 rounded bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition-colors border border-white/10"
            >
                {copiedCode ? (
                    <>
                        <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        <span>Copied</span>
                    </>
                ) : (
                    <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                        <span>Copy</span>
                    </>
                )}
            </button>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4 pl-1">
        <a 
            href={embedUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
        >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            Mở xem thử trong tab mới
        </a>
        <span className="text-xs text-gray-400 italic">Tự động thích ứng chiều cao</span>
      </div>
    </div>
  );
};

export default EmbedGenerator;