import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar userName="Admin Transporte" />
      
      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header spacer */}
        <div className="h-[57px] lg:hidden" />
        
        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}