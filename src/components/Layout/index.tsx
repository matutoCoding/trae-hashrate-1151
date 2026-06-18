import { useState } from 'react';
import {
  CalendarClock,
  Clock3,
  Receipt,
  Leaf,
  Menu,
  X,
} from 'lucide-react';
import type { PageType } from '../../types';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}

const navItems: { key: PageType; label: string; icon: React.ReactNode }[] = [
  { key: 'schedule', label: '包间排期', icon: <CalendarClock size={20} /> },
  { key: 'rate', label: '时段费率', icon: <Clock3 size={20} /> },
  { key: 'billing', label: '消费核算', icon: <Receipt size={20} /> },
];

export default function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-sandal-50 flex">
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-sandal-900 text-sandal-100 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center justify-between px-6 border-b border-sandal-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gold-500/20 flex items-center justify-center">
                <Leaf className="text-gold-400" size={22} />
              </div>
              <div>
                <h1 className="font-song text-lg font-bold text-gold-400">茗韵轩</h1>
                <p className="text-xs text-sandal-400">包间管理系统</p>
              </div>
            </div>
            <button
              className="lg:hidden text-sandal-400 hover:text-sandal-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 py-6 px-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  onPageChange(item.key);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === item.key
                    ? 'bg-gold-500/20 text-gold-400 shadow-inner'
                    : 'text-sandal-300 hover:bg-sandal-800/50 hover:text-sandal-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {currentPage === item.key && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-400" />
                )}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-sandal-800">
            <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-sandal-800/50">
              <div className="w-9 h-9 rounded-full bg-gold-500/30 flex items-center justify-center">
                <span className="text-gold-400 text-sm font-bold">管</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sandal-100 truncate">管理员</p>
                <p className="text-xs text-sandal-400 truncate">admin@mingyunxuan</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-sandal-200 flex items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-ink-600 hover:text-ink-800"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={22} />
            </button>
            <h2 className="font-song text-xl font-bold text-sandal-900">
              {navItems.find((i) => i.key === currentPage)?.label}
            </h2>
          </div>
          <div className="text-sm text-ink-500">
            {new Date().toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-ink-900/40 z-20 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
