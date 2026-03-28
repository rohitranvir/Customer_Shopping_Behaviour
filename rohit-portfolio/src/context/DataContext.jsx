import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
    const [data, setData] = useState({
        about: null,
        skills: null,
        projects: null,
        experience: null,
        certifications: null,
        messages: [],
        settings: null,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            // Always load fresh JSON files (admin changes persist via localStorage override)
            const [aboutJson, skillsJson, projectsJson, experienceJson, certificationsJson, settingsJson] = await Promise.all([
                fetch('/data/about.json').then(r => r.json()),
                fetch('/data/skills.json').then(r => r.json()),
                fetch('/data/projects.json').then(r => r.json()),
                fetch('/data/experience.json').then(r => r.json()),
                fetch('/data/certifications.json').then(r => r.json()),
                fetch('/data/settings.json').then(r => r.json()),
            ]);

            // Merge with localStorage overrides (admin panel changes)
            const stored = localStorage.getItem('portfolioData');
            const overrides = stored ? JSON.parse(stored) : {};

            const merged = {
                about: overrides.about || aboutJson,
                skills: overrides.skills || skillsJson,
                projects: overrides.projects || projectsJson,
                experience: overrides.experience || experienceJson,
                certifications: overrides.certifications || certificationsJson,
                messages: overrides.messages || [],
                settings: overrides.settings || settingsJson,
            };

            setData(merged);
        } catch (err) {
            console.error('Failed to load data from JSON:', err);
            // Fallback: try localStorage only
            const stored = localStorage.getItem('portfolioData');
            if (stored) {
                setData(JSON.parse(stored));
            }
        } finally {
            setLoading(false);
        }
    }

    const updateData = useCallback((key, value) => {
        setData(prev => {
            const next = { ...prev, [key]: value };
            localStorage.setItem('portfolioData', JSON.stringify(next));
            return next;
        });
    }, []);

    const addMessage = useCallback((msg) => {
        setData(prev => {
            const next = {
                ...prev,
                messages: [...(prev.messages || []), { ...msg, id: Date.now(), read: false, date: new Date().toISOString() }],
            };
            localStorage.setItem('portfolioData', JSON.stringify(next));
            return next;
        });
    }, []);

    const resetData = useCallback(() => {
        localStorage.removeItem('portfolioData');
        loadData();
    }, []);

    return (
        <DataContext.Provider value={{ data, loading, updateData, addMessage, resetData }}>
            {children}
        </DataContext.Provider>
    );
}

export const useData = () => useContext(DataContext);
