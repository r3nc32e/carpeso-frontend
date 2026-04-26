import { useEffect } from 'react';

const usePageTitle = (title) => {
    useEffect(() => {
        document.title = title ? `${title} — Carpeso` : 'Carpeso';
    }, [title]);
};

export default usePageTitle;