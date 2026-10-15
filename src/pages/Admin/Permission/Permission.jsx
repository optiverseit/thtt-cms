import { useCallback, useEffect, useMemo, useState } from "react";
import { FaEdit, FaTrash, FaTimes, FaPlus, FaSearch, FaShieldAlt, FaSave, FaSyncAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import Navbar from "../../../components/Navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Pagination from "../../../components/Pagination/Pagination";
import {
    getAllPermissionsCms, getAllPermissions, createPermission, updatePermission,
    changePermissionStatus, deletePermission, getAllRoles,
    getRolePermissions, syncRolePermissions
} from "../../../api/BackendApi";
import "./Permission.css";

const emptyForm = { name: "", slug: "", module: "", description: "", status: "ACTIVE" };
const getError = (error) => error.response?.data?.message || error.message || "Something went wrong.";
const Permission = () => {
    const [tab, setTab] = useState("permissions");
    const [permissions, setPermissions] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [moduleFilter, setModuleFilter] = useState("all");
    const [modal, setModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [busyId, setBusyId] = useState(null);
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState("");
    const [available, setAvailable] = useState([]);
    const [assigned, setAssigned] = useState([]);
    const [roleLoading, setRoleLoading] = useState(false);
    const [roleSaving, setRoleSaving] = useState(false);
    const [roleLoadError, setRoleLoadError] = useState(false);
    const [roleSearch, setRoleSearch] = useState("");

    const loadPermissions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getAllPermissionsCms(page);
            const data = res.data?.data;
            setPermissions(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
            setTotalPages(data?.last_page || 1);
            setTotal(data?.total ?? (Array.isArray(data) ? data.length : 0));
        } catch (error) {
            Swal.fire("Error", getError(error), "error");
        } finally { setLoading(false); }
    }, [page]);
    useEffect(() => { loadPermissions(); }, [loadPermissions]);

    const loadRoleOptions = useCallback(async () => {
        try {
            // Existing roles CMS endpoint is paginated; fetch each page to avoid missing roles.
            const first = await getAllRoles(1);
            const firstData = first.data?.data;
            let all = Array.isArray(firstData?.data) ? firstData.data : Array.isArray(firstData) ? firstData : [];
            const lastPage = firstData?.last_page || 1;
            if (lastPage > 1) {
                const rest = await Promise.all(Array.from({ length: lastPage - 1 }, (_, i) => getAllRoles(i + 2)));
                rest.forEach(res => {
                    const data = res.data?.data;
                    all = all.concat(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
                });
            }
            setRoles(all.filter(r => r.status === "ACTIVE" || r.status === undefined || r.status === null));
            setSelectedRole(previous => previous || String(all.find(r => r.status === "ACTIVE" || r.status === undefined || r.status === null)?.id || ""));
        } catch (error) { Swal.fire("Error", getError(error), "error"); }
    }, []);
    const loadAvailable = useCallback(async () => {
        try {
            const res = await getAllPermissions();
            setAvailable(Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data?.data?.data) ? res.data.data.data : []);
        } catch (error) { Swal.fire("Error", getError(error), "error"); }
    }, []);
    useEffect(() => {
        if (tab === "assign") { loadRoleOptions(); loadAvailable(); }
    }, [tab, loadRoleOptions, loadAvailable]);
    useEffect(() => {
        if (tab !== "assign" || !selectedRole) return;
        let cancelled = false;
        setRoleLoading(true);
        setRoleLoadError(false);
        setAssigned([]);
        getRolePermissions(selectedRole).then(res => {
            if (!cancelled) setAssigned((res.data?.data?.permissions || []).filter(p => p.status === "ACTIVE").map(p => Number(p.id)));
        }).catch(error => { if (!cancelled) { setRoleLoadError(true); Swal.fire("Error", getError(error), "error"); } })
            .finally(() => { if (!cancelled) setRoleLoading(false); });
        return () => { cancelled = true; };
    }, [selectedRole, tab]);

    const modules = useMemo(() => [...new Set(permissions.map(p => p.module).filter(Boolean))].sort(), [permissions]);
    const filtered = useMemo(() => permissions.filter(p => {
        const q = search.trim().toLowerCase();
        return (moduleFilter === "all" || p.module === moduleFilter) &&
            (!q || [p.name, p.slug, p.module, p.description].some(value => String(value || "").toLowerCase().includes(q)));
    }), [permissions, search, moduleFilter]);
    const grouped = useMemo(() => {
        const q = roleSearch.trim().toLowerCase();
        return available.filter(p => [p.name, p.slug, p.module].some(value => String(value || "").toLowerCase().includes(q)))
            .reduce((acc, p) => { (acc[p.module || "Other"] ||= []).push(p); return acc; }, {});
    }, [available, roleSearch]);
    const openCreate = () => { setEditingId(null); setForm(emptyForm); setErrors({}); setModal(true); };
    const openEdit = p => { setEditingId(p.id); setForm({ name: p.name || "", slug: p.slug || "", module: p.module || "", description: p.description || "", status: p.status || "ACTIVE" }); setErrors({}); setModal(true); };
    const closeModal = () => { if (!saving) setModal(false); };
    const submit = async event => {
        event.preventDefault(); setSaving(true); setErrors({});
        try {
            if (editingId) await updatePermission(editingId, form);
            else await createPermission(form);
            setModal(false);
            await Swal.fire({ icon: "success", title: editingId ? "Permission updated" : "Permission created", timer: 1400, showConfirmButton: false });
            if (!editingId && page !== 1) setPage(1); else await loadPermissions();
        } catch (error) {
            setErrors(error.response?.data?.errors || {});
            if (error.response?.status !== 422) Swal.fire("Error", getError(error), "error");
        } finally { setSaving(false); }
    };
    const toggleStatus = async p => {
        const result = await Swal.fire({ title: `${p.status === "ACTIVE" ? "Deactivate" : "Activate"} permission?`, text: p.status === "ACTIVE" ? "Deactivated permissions should no longer authorize actions on the backend." : p.name, icon: "question", showCancelButton: true, confirmButtonColor: "#4c2475" });
        if (!result.isConfirmed) return;
        setBusyId(p.id);
        try { await changePermissionStatus(p.id); await loadPermissions(); Swal.fire({ icon: "success", title: "Status updated", timer: 1200, showConfirmButton: false }); }
        catch (error) { Swal.fire("Error", getError(error), "error"); }
        finally { setBusyId(null); }
    };
    const remove = async p => {
        const result = await Swal.fire({ title: "Delete permission?", text: `Delete ${p.name}? Assigned permissions cannot be deleted.`, icon: "warning", showCancelButton: true, confirmButtonColor: "#dc3545" });
        if (!result.isConfirmed) return;
        setBusyId(p.id);
        try { await deletePermission(p.id); if (permissions.length === 1 && page > 1) setPage(page - 1); else await loadPermissions(); Swal.fire({ icon: "success", title: "Deleted", timer: 1200, showConfirmButton: false }); }
        catch (error) { Swal.fire("Error", getError(error), "error"); }
        finally { setBusyId(null); }
    };
    const toggleAssigned = id => setAssigned(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]);
    const toggleGroup = group => {
        const ids = group.map(p => Number(p.id));
        const allSelected = ids.every(id => assigned.includes(id));
        setAssigned(previous => allSelected ? previous.filter(id => !ids.includes(id)) : [...new Set([...previous, ...ids])]);
    };
    const saveRole = async () => {
        if (!selectedRole || roleLoading || roleLoadError) return;
        setRoleSaving(true);
        try {
            await syncRolePermissions(selectedRole, assigned);
            Swal.fire({ icon: "success", title: "Role permissions saved", timer: 1500, showConfirmButton: false });
        } catch (error) { Swal.fire("Error", getError(error), "error"); }
        finally { setRoleSaving(false); }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="dashboard-main">
                <Navbar />
                <main className="dashboard-content">
                    <div className="permission-page">
                        <header className="permission-header">
                            <div><div className="permission-eyebrow"><FaShieldAlt /> ACCESS CONTROL</div><h1>Permission Management</h1><p>Create permissions and control what each role can access or modify.</p></div>
                            {tab === "permissions" && <button className="permission-primary" onClick={openCreate}><FaPlus /> Create Permission</button>}
                        </header>
                        <div className="permission-tabs" role="tablist" aria-label="Permission management sections">
                            <button className={tab === "permissions" ? "active" : ""} onClick={() => setTab("permissions")}>Permissions</button>
                            <button className={tab === "assign" ? "active" : ""} onClick={() => setTab("assign")}>Assign to Roles</button>
                        </div>
                        {tab === "permissions" ? (
                            <section className="permission-card">
                                <div className="permission-card-top"><div><h2>All Permissions</h2><p>{total} permission{total === 1 ? "" : "s"} in your system</p></div><button className="permission-icon-button" onClick={loadPermissions} aria-label="Refresh permissions"><FaSyncAlt /></button></div>
                                <div className="permission-toolbar"><label className="permission-search"><FaSearch /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, slug or module..." /></label><select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)}><option value="all">All modules</option>{modules.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                                <div className="permission-table-wrap"><table className="permission-table"><thead><tr><th>Permission</th><th>Slug</th><th>Module</th><th>Status</th><th>Actions</th></tr></thead><tbody>
                                    {loading ? <tr><td colSpan="5" className="permission-empty">Loading permissions...</td></tr> : filtered.length === 0 ? <tr><td colSpan="5" className="permission-empty">No permissions found.</td></tr> : filtered.map(p => <tr key={p.id}><td><strong>{p.name}</strong><small>{p.description || "No description"}</small></td><td><code>{p.slug}</code></td><td><span className="permission-module">{p.module}</span></td><td><button disabled={busyId === p.id} onClick={() => toggleStatus(p)} className={`permission-status ${p.status === "ACTIVE" ? "is-active" : "is-inactive"}`}>{p.status}</button></td><td><div className="permission-actions"><button title="Edit permission" onClick={() => openEdit(p)} disabled={busyId === p.id}><FaEdit /></button><button title="Delete permission" className="danger" onClick={() => remove(p)} disabled={busyId === p.id}><FaTrash /></button></div></td></tr>)}
                                </tbody></table></div>
                                <div className="permission-footer"><span>Page {page} of {totalPages}</span><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div>
                            </section>
                        ) : (
                            <section className="permission-card">
                                <div className="permission-card-top"><div><h2>Assign Role Permissions</h2><p>Select a role, then choose the actions it can perform.</p></div></div>
                                <div className="permission-role-bar"><label><span>Choose role</span><select value={selectedRole} onChange={e => setSelectedRole(e.target.value)}><option value="">Select a role</option>{roles.map(r => <option key={r.id} value={r.id}>{r.name} ({r.slug})</option>)}</select></label><label className="permission-search"><FaSearch /><input value={roleSearch} onChange={e => setRoleSearch(e.target.value)} placeholder="Search permissions..." /></label></div>
                                {roleLoading ? <div className="permission-empty">Loading role permissions...</div> : !selectedRole ? <div className="permission-empty">Select a role to continue.</div> : <>
                                    <div className="permission-selection-summary"><span><strong>{assigned.length}</strong> active permissions selected</span><div><button onClick={() => setAssigned(available.map(p => Number(p.id)))}>Select all</button><button onClick={() => setAssigned([])}>Clear all</button></div></div>
                                    <div className="permission-groups">{Object.entries(grouped).length === 0 ? <div className="permission-empty">No matching active permissions.</div> : Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([module, list]) => <div className="permission-group" key={module}><div className="permission-group-heading"><label><input type="checkbox" checked={list.every(p => assigned.includes(Number(p.id)))} onChange={() => toggleGroup(list)} /><strong>{module}</strong></label><span>{list.filter(p => assigned.includes(Number(p.id))).length}/{list.length} selected</span></div><div className="permission-check-grid">{list.map(p => <label className="permission-check" key={p.id}><input type="checkbox" checked={assigned.includes(Number(p.id))} onChange={() => toggleAssigned(Number(p.id))} /><span><strong>{p.name}</strong><small>{p.slug}</small></span></label>)}</div></div>)}</div>
                                    <div className="permission-save-bar"><p>Saving replaces this role's current permission assignments.</p><button className="permission-primary" onClick={saveRole} disabled={roleSaving || roleLoading || roleLoadError}><FaSave /> {roleSaving ? "Saving..." : "Save Permissions"}</button></div>
                                </>}
                            </section>
                        )}
                    </div>
                </main>
            </div>
            {modal && <div className="permission-modal-backdrop" onMouseDown={closeModal}><div className="permission-modal" role="dialog" aria-modal="true" aria-label={editingId ? "Edit permission" : "Create permission"} onMouseDown={e => e.stopPropagation()}><div className="permission-modal-heading"><div><h2>{editingId ? "Edit Permission" : "Create Permission"}</h2><p>Define a permission that can be assigned to roles.</p></div><button onClick={closeModal} disabled={saving} aria-label="Close"><FaTimes /></button></div><form onSubmit={submit}><div className="permission-form-grid"><label>Permission name *<input required maxLength={100} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="View Work Permit Applications" />{errors.name && <small className="permission-error">{errors.name[0]}</small>}</label><label>Permission slug *<input required maxLength={150} value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="work-permit.application.view" />{errors.slug && <small className="permission-error">{errors.slug[0]}</small>}</label><label>Module *<input required maxLength={100} value={form.module} onChange={e => setForm({ ...form, module: e.target.value })} placeholder="Work Permit Application" />{errors.module && <small className="permission-error">{errors.module[0]}</small>}</label><label>Status<select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option></select></label><label className="permission-full">Description<textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe what this permission allows..." />{errors.description && <small className="permission-error">{errors.description[0]}</small>}</label></div><div className="permission-modal-footer"><button type="button" className="permission-secondary" onClick={closeModal} disabled={saving}>Cancel</button><button type="submit" className="permission-primary" disabled={saving}>{saving ? "Saving..." : editingId ? "Update Permission" : "Create Permission"}</button></div></form></div></div>}
        </div>
    );
};
export default Permission;
