import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getPermissions, updatePermissionApi } from "../api/permissionApi";
import { socket } from "../socket";

const AccessContext = createContext(null);

export const AccessProvider = ({ children }) => {
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPermissions();
      const mapped = {};
      res.data.data.forEach((item) => { mapped[item.role.toLowerCase()] = item.pages || []; });
      setPermissions(mapped);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPermissions(); }, [fetchPermissions]);

  useEffect(() => {
    socket.on("permissionsUpdated", fetchPermissions);
    return () => socket.off("permissionsUpdated", fetchPermissions);
  }, [fetchPermissions]);

  const updatePermission = async (role, page, checked) => {
    await updatePermissionApi({ role: role.toLowerCase(), page, checked });
    await fetchPermissions();
  };

  const hasAccess = (role, page) => {
    const r = role?.toLowerCase();
    if (r === "superadmin") return true;
    return permissions[r]?.includes(page) || false;
  };

  return (
    <AccessContext.Provider value={{ permissions, loading, updatePermission, hasAccess, refreshPermissions: fetchPermissions }}>
      {children}
    </AccessContext.Provider>
  );
};

export const useAccess = () => useContext(AccessContext);
