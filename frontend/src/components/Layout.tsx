import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', roles: ['admin', 'sales', 'warehouse', 'accounts'] },
  { to: '/customers', label: 'Customers', roles: ['admin', 'sales', 'warehouse', 'accounts'] },
  { to: '/products', label: 'Products', roles: ['admin', 'sales', 'warehouse', 'accounts'] },
  { to: '/challans', label: 'Challans', roles: ['admin', 'sales', 'warehouse', 'accounts'] },
];

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-[#0F1115]">
      <aside className="w-60 bg-[#1A1D24] border-r border-[#2A2E38] flex flex-col">
        <div className="p-5 border-b border-[#2A2E38]">
          <h1 className="text-white font-semibold text-lg">Mini ERP</h1>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems
            .filter((item) => user && item.roles.includes(user.role))
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-[#22262F] hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
        </nav>

        <div className="p-3 border-t border-[#2A2E38]">
          <div className="px-3 py-2">
            <p className="text-white text-sm font-medium">{user?.name}</p>
            <p className="text-gray-500 text-xs capitalize">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-[#22262F] transition"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}