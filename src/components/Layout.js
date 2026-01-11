import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

export default function Layout() {
    const location = useLocation();

    useEffect(() => {
        if (window.umami) {
            const currentPath = location.pathname;
            // Ensure the path tracked always starts with /learn-kana
            // This fixes the issue where Cloudflare Pages reports as / but GitHub Pages reports as /learn-kana
            const trackPath = currentPath.startsWith('/learn-kana')
                ? currentPath
                : `/learn-kana${currentPath === '/' ? '' : currentPath}`;

            window.umami.track(props => ({
                ...props,
                url: trackPath
            }));
        }
    }, [location]);

    return <Outlet />;
}
