import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { LayoutDashboard, FolderKanban, User, Wrench, Briefcase, GraduationCap, Award, MessageSquare, Settings, LogOut, ChevronLeft } from 'lucide-react';
import Dashboard from './Dashboard';
import ManageProjects from './ManageProjects';
import ManageContent from './ManageContent';
import ManageSkills from './ManageSkills';
import ManageCertifications from './ManageCertifications';
import Messages from './Messages';
import AdminSettings from './AdminSettings';

const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'content', label: 'About & Exp.', icon: User },
    { id: 'skills', label: 'Skills', icon: Wrench },
    { id: 'certifications', label: 'Certs.', icon: Award },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
    const { logout } = useAuth();
    const { data } = useData();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const unreadCount = (data?.messages || []).filter(m => !m.read).length;

    function renderContent() {
        switch (activeTab) {
            case 'dashboard': return <Dashboard onNavigate={setActiveTab} />;
            case 'projects': return <ManageProjects />;
            case 'content': return <ManageContent />;
            case 'skills': return <ManageSkills />;
            case 'certifications': return <ManageCertifications />;
            case 'messages': return <Messages />;
            case 'settings': return <AdminSettings />;
            default: return <Dashboard onNavigate={setActiveTab} />;
        }
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            {/* Sidebar */}
            <aside className="admin-sidebar" style={{ width: sidebarOpen ? 240 : 60, transition: 'width 0.3s', flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
                    {sidebarOpen && <span className="font-display" style={{ fontSize: '1.5rem', color: 'var(--gold)', fontWeight: 600 }}>RR</span>}
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                        <ChevronLeft size={18} style={{ transform: sidebarOpen ? 'none' : 'rotate(180deg)', transition: 'transform 0.3s' }} />
                    </button>
                </div>

                <nav style={{ flex: 1, padding: '16px 0' }}>
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={activeTab === tab.id ? 'active' : ''}
                                style={{ position: 'relative' }}>
                                <Icon size={18} />
                                {sidebarOpen && <span>{tab.label}</span>}
                                {tab.id === 'messages' && unreadCount > 0 && (
                                    <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'var(--gold)', color: 'var(--bg-primary)', fontSize: '0.6rem', fontWeight: 700, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                <div style={{ borderTop: '1px solid var(--border)', padding: '8px 0' }}>
                    <a href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', fontSize: '0.9rem', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                        <ChevronLeft size={18} />{sidebarOpen && 'View Site'}
                    </a>
                    <button onClick={logout}>
                        <LogOut size={18} />{sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main style={{ flex: 1, padding: 32, overflowY: 'auto', maxHeight: '100vh' }}>
                {renderContent()}
            </main>
        </div>
    );
}
