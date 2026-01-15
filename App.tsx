import React from 'react';
import TeacherSalaryWidget from './components/TeacherSalaryWidget';

const App: React.FC = () => {
  return (
    <div className="min-h-screen py-10 px-4 flex items-center justify-center">
      <TeacherSalaryWidget />
    </div>
  );
};

export default App;
