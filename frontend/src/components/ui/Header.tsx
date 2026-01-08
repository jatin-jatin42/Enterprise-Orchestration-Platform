// // src/components/ui/Header.tsx
// import React, { useState } from 'react';
// import { useAuthStore } from '../../stores/authStore';
// import { 
//   Bell, 
//   Menu,
//   ChevronDown,
//   User,
//   Settings,
//   LogOut,
//   LayoutDashboard
// } from 'lucide-react';

// interface HeaderProps {
//   onMenuToggle: () => void;
// }

// const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
//   const { user, logout } = useAuthStore();
//   const [isProfileOpen, setIsProfileOpen] = useState(false);
//   const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

//   // Mock notifications data
//   const notifications = [
//     { id: 1, text: 'New intern application received', time: '5 min ago', unread: true },
//     { id: 2, text: 'Weekly report is ready', time: '1 hour ago', unread: true },
//     { id: 3, text: 'Meeting with HR at 3 PM', time: '2 hours ago', unread: false },
//   ];

//   const unreadCount = notifications.filter(n => n.unread).length;

//   return (
//     <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200 w-full">
//       <div className="flex items-center justify-between px-4 py-3 sm:px-6">
//         {/* Left Section - Logo & Mobile Menu */}
//         <div className="flex items-center space-x-4">
//           {/* Mobile Menu Button - Only show on responsive */}
//           <button 
//             onClick={onMenuToggle}
//             className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//           >
//             <Menu size={20} className="text-gray-600 dark:text-gray-300" />
//           </button>

//           {/* Logo */}
//           <div className="flex items-center space-x-3">
//             <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
//               <LayoutDashboard className="w-5 h-5 text-white" />
//             </div>
//             <div className="hidden sm:block">
//               <h1 className="text-lg font-bold text-gray-800 dark:text-white">InternFlow</h1>
//               <p className="text-xs text-gray-600 dark:text-gray-400">Management System</p>
//             </div>
//           </div>
//         </div>

//         {/* Right Section - Notifications & Profile */}
//         <div className="flex items-center space-x-2 sm:space-x-4">
//           {/* Notifications */}
//           <div className="relative">
//             <button
//               onClick={() => {
//                 setIsNotificationsOpen(!isNotificationsOpen);
//                 setIsProfileOpen(false);
//               }}
//               className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//             >
//               <Bell size={20} className="text-gray-600 dark:text-gray-300" />
//               {unreadCount > 0 && (
//                 <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
//                   {unreadCount}
//                 </span>
//               )}
//             </button>

//             {/* Notifications Dropdown */}
//             {isNotificationsOpen && (
//               <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50">
//                 <div className="p-4 border-b border-gray-200 dark:border-gray-700">
//                   <div className="flex items-center justify-between">
//                     <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
//                     {unreadCount > 0 && (
//                       <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs rounded-full">
//                         {unreadCount} new
//                       </span>
//                     )}
//                   </div>
//                 </div>
//                 <div className="max-h-96 overflow-y-auto">
//                   {notifications.map((notification) => (
//                     <div
//                       key={notification.id}
//                       className={`p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
//                         notification.unread ? 'bg-blue-50 dark:bg-blue-900/20' : ''
//                       }`}
//                     >
//                       <p className="text-sm text-gray-800 dark:text-white mb-1">
//                         {notification.text}
//                       </p>
//                       <p className="text-xs text-gray-500 dark:text-gray-400">
//                         {notification.time}
//                       </p>
//                     </div>
//                   ))}
//                 </div>
//                 <div className="p-2 border-t border-gray-200 dark:border-gray-700">
//                   <button className="w-full text-center py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
//                     View all notifications
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Profile Dropdown */}
//           <div className="relative">
//             <button
//               onClick={() => {
//                 setIsProfileOpen(!isProfileOpen);
//                 setIsNotificationsOpen(false);
//               }}
//               className="flex items-center space-x-2 sm:space-x-3 p-1 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-0"
//             >
//               {/* User info - hidden on mobile, shown on sm and up */}
//               <div className="hidden sm:block text-right min-w-0 max-w-32">
//                 <p className="font-medium text-gray-800 dark:text-white text-sm truncate">
//                   {user?.username || 'User'}
//                 </p>
//                 <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
//                   {user?.email || ''}
//                 </p>
//               </div>
              
//               {/* Avatar */}
//               <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
//                 {user?.username?.charAt(0)?.toUpperCase() || 'U'}
//               </div>
              
//               {/* Chevron - hidden on mobile */}
//               <ChevronDown 
//                 size={16} 
//                 className={`hidden sm:block text-gray-400 dark:text-gray-500 transition-transform flex-shrink-0 ${
//                   isProfileOpen ? 'rotate-180' : ''
//                 }`}
//               />
//             </button>

//             {/* Profile Dropdown Menu */}
//             {isProfileOpen && (
//               <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50">
//                 {/* User Info in Dropdown */}
//                 <div className="p-4 border-b border-gray-200 dark:border-gray-700 sm:hidden">
//                   <div className="flex items-center space-x-3">
//                     <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
//                       {user?.username?.charAt(0)?.toUpperCase() || 'U'}
//                     </div>
//                     <div className="min-w-0">
//                       <p className="font-medium text-gray-800 dark:text-white text-sm truncate">
//                         {user?.username || 'User'}
//                       </p>
//                       <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
//                         {user?.email || ''}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="p-2">
//                   <button className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
//                     <User size={16} className="mr-3 text-gray-500 dark:text-gray-400" />
//                     Your Profile
//                   </button>
//                   <button className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
//                     <Settings size={16} className="mr-3 text-gray-500 dark:text-gray-400" />
//                     Settings
//                   </button>
//                 </div>
                
//                 <div className="p-2 border-t border-gray-200 dark:border-gray-700">
//                   <button 
//                     onClick={logout}
//                     className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
//                   >
//                     <LogOut size={16} className="mr-3" />
//                     Sign out
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Close dropdowns when clicking outside */}
//       {(isProfileOpen || isNotificationsOpen) && (
//         <div 
//           className="fixed inset-0 z-40" 
//           onClick={() => {
//             setIsProfileOpen(false);
//             setIsNotificationsOpen(false);
//           }}
//         />
//       )}
//     </header>
//   );
// };

// export default Header;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { 
  Bell, 
  Menu,
  ChevronDown,
  User,
  LogOut,
  LayoutDashboard
} from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate(); // ✅ NEW - Added
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Mock notifications data
  const notifications = [
    { id: 1, text: 'New intern application received', time: '5 min ago', unread: true },
    { id: 2, text: 'Weekly report is ready', time: '1 hour ago', unread: true },
    { id: 3, text: 'Meeting with HR at 3 PM', time: '2 hours ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  // ✅ NEW - Added handler for Profile navigation
  const handleProfileClick = () => {
    setIsProfileOpen(false);
    navigate('/dashboard/profile');
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200 w-full">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        {/* Left Section - Logo & Mobile Menu */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button - Only show on responsive */}
          <button 
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Menu size={20} className="text-gray-600 dark:text-gray-300" />
          </button>

          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-800 dark:text-white">InternFlow</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Management System</p>
            </div>
          </div>
        </div>

        {/* Right Section - Notifications & Profile */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Notifications */}
          {/* <div className="relative">
            <button
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsProfileOpen(false);
              }}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Bell size={20} className="text-gray-600 dark:text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                  {unreadCount}
                </span>
              )}
            </button>

            
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        notification.unread ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <p className="text-sm text-gray-800 dark:text-white mb-1">
                        {notification.text}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {notification.time}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                  <button className="w-full text-center py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div> */}

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotificationsOpen(false);
              }}
              className="flex items-center space-x-2 sm:space-x-3 p-1 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-0"
            >
              {/* User info - hidden on mobile, shown on sm and up */}
              <div className="hidden sm:block text-right min-w-0 max-w-32">
                <p className="font-medium text-gray-800 dark:text-white text-sm truncate">
                  {user?.username || 'User'}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {user?.email || ''}
                </p>
              </div>
              
              {/* Avatar */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              
              {/* Chevron - hidden on mobile */}
              <ChevronDown 
                size={16} 
                className={`hidden sm:block text-gray-400 dark:text-gray-500 transition-transform flex-shrink-0 ${
                  isProfileOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                {/* User Info in Dropdown */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 sm:hidden">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 dark:text-white text-sm truncate">
                        {user?.username || 'User'}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {user?.email || ''}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-2">
                  {/* ✅ MODIFIED - Added onClick handler to navigate to profile */}
                  <button 
                    onClick={handleProfileClick}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <User size={16} className="mr-3 text-gray-500 dark:text-gray-400" />
                    Your Profile
                  </button>
                  {/* ❌ REMOVED - Settings button */}
                </div>
                
                <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                  <button 
                    onClick={logout}
                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <LogOut size={16} className="mr-3" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close dropdowns when clicking outside */}
      {(isProfileOpen || isNotificationsOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setIsProfileOpen(false);
            setIsNotificationsOpen(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;
