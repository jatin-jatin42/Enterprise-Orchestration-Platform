// // src/components/layout/DashboardLayout.tsx
// import React, { useState } from 'react';
// import { Routes, Route } from 'react-router-dom';
// import Sidebar from '../ui/Sidebar';
// import Header from '../ui/Header';
// import Dashboard from '../../pages/Dashboard/Dashboard';
// import Interns from '../../pages/Interns/Interns';

// export const DashboardLayout: React.FC = () => {
//   const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

//   return (
//     <div className="flex flex-col h-screen bg-gray-900">
//       {/* Header - Full width at the top */}
//       <Header onMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
      
//       {/* Main content area with sidebar and page content */}
//       <div className="flex flex-1 overflow-hidden">
//         {/* Sidebar - Starts below header */}
//         <Sidebar 
//           isMobileOpen={isMobileSidebarOpen}
//           setIsMobileOpen={setIsMobileSidebarOpen}
//         />
        
//         {/* Page content */}
//         <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
//           <Routes>
//             <Route path="/" element={<Dashboard />} />
//             <Route path="/interns" element={<Interns />} />
//             {/* Add more routes as needed */}
//           </Routes>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default DashboardLayout;

//frontend/src/components/ui/Layout.tsx
// src/components/layout/DashboardLayout.tsx
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../ui/Sidebar';
import Header from '../ui/Header';
import Dashboard from '../../pages/Dashboard/Dashboard';
import Interns from '../../pages/Interns/Interns';
import ToolsTech from '../../pages/tool&tech/ToolsTech'; // Import ToolsTech
import Projects from '../../pages/Projects/Projects'; // Import Projects
import LearningResource from '../../pages/LeariningResource/LearningResource';
import Profile from '../../pages/Profile/Profile';

export const DashboardLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header - Full width at the top */}
      <Header onMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
      
      {/* Main content area with sidebar and page content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Starts below header */}
        <Sidebar 
          isMobileOpen={isMobileSidebarOpen}
          setIsMobileOpen={setIsMobileSidebarOpen}
        />
        
        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/interns" element={<Interns />} />
            <Route path='/learning' element={<LearningResource/>}/>
            <Route path="projects" element={<Projects />} />
            <Route path="toolstech" element={<ToolsTech />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
