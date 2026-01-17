import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { storageService } from '../../services/storageService';

interface RoleGuardProps {
    allowedRoles: string[];
}

const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles }) => {
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkRole = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user?.email) {
                    setLoading(false);
                    return;
                }

                const profile = await storageService.getProfileByEmail(session.user.email);
                setRole(profile?.role || 'student');
            } catch (error) {
                console.error("RoleGuard Error:", error);
                setRole('student');
            } finally {
                setLoading(false);
            }
        };

        checkRole();
    }, []);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#FFF9F0] text-[#0F766E]">Verifying Access...</div>;
    }

    if (!role || !allowedRoles.includes(role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default RoleGuard;
