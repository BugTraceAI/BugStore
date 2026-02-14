import React, { createContext, useContext, useState, useEffect } from 'react';

const ConfigContext = createContext({ scoring_enabled: false, difficulty_level: 0 });

export const ConfigProvider = ({ children }) => {
    const [config, setConfig] = useState({ scoring_enabled: false, difficulty_level: 0 });

    useEffect(() => {
        fetch('/api/config')
            .then(res => res.json())
            .then(data => setConfig(data))
            .catch(() => {});
    }, []);

    return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
};

export const useConfig = () => useContext(ConfigContext);
