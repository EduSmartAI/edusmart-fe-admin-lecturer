import { FC, ReactNode } from 'react';
import NoSSR from 'EduSmart/components/Common/NoSSR';

interface LayoutProps {
    children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
    return (
        <NoSSR>
            <div className="min-h-screen bg-gray-50">
                {children}
            </div>
        </NoSSR>
    );
};

export default Layout;
