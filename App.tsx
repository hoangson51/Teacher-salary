import React, { useState, useEffect } from 'react';
import TeacherSalaryWidget from './components/TeacherSalaryWidget';
import EmbedGenerator from './components/EmbedGenerator';

const App: React.FC = () => {
  const [isEmbed, setIsEmbed] = useState(false);

  useEffect(() => {
    // Check if the current URL has ?embed=true
    // Support both query param and hash-based query for robustness
    const checkEmbed = () => {
        const searchParams = new URLSearchParams(window.location.search);
        // Also check if there is a query string in the hash (e.g. /#/route?embed=true)
        const hashQuery = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
        const hashParams = new URLSearchParams(hashQuery);
        
        if (searchParams.get('embed') === 'true' || hashParams.get('embed') === 'true') {
            setIsEmbed(true);
        }
    };
    
    checkEmbed();
  }, []);

  // If in embed mode, only render the widget centered
  if (isEmbed) {
    return (
      <div className="min-h-screen p-4 flex items-start justify-center bg-transparent">
        <TeacherSalaryWidget />
      </div>
    );
  }

  // Default view with Generator sidebar
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
            {/* Sidebar Generator - Sticky on Desktop */}
            <div className="w-full lg:w-4/12 lg:sticky lg:top-10">
                <EmbedGenerator />
            </div>
            
            {/* Widget Preview */}
            <div className="w-full lg:w-8/12 flex flex-col items-center">
                <div className="w-full transition-all duration-300 ease-in-out">
                    <TeacherSalaryWidget />
                </div>
            </div>
        </div>
    </div>
  );
};

export default App;