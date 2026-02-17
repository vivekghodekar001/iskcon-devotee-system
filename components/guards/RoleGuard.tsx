import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { storageService } from '../../services/storageService';

interface Props {
    allowedRoles: string[];
}

const RoleGuard: React.FC<Props> = ({ allowedRoles }) => {
    const [loading, setLoading] = useState(true);
    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
        checkRole();
    }, []);

    const checkRole = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user?.email) {
                setAllowed(false);
                setLoading(false);
                return;
            }

            const profile = await storageService.getProfileByEmail(session.user.email);
            if (profile && allowedRoles.includes(profile.role)) {
                setAllowed(true);
            } else {
                setAllowed(false);
            }
        } catch (err) {
            console.error('RoleGuard error:', err);
            setAllowed(false);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FFFAF3]">
                <div className="text-center">
                    <div className="w-10 h-10 border-3 border-divine-200 border-t-divine-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-slate-500">Checking access...</p>
                </div>
            </div>
        );
    }

    if (!allowed) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default RoleGuard;
