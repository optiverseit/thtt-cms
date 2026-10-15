
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaPlus, FaPen, FaTrash, FaTimes } from "react-icons/fa";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Navbar from "../../../components/Navbar/Navbar";
import Pagination from "../../../components/Pagination/Pagination";
import { getAllCountries, getAllWorkPermitHighlightsCms, createWorkPermitHighlight, updateWorkPermitHighlight, deleteWorkPermitHighlight } from "../../../api/BackendApi";
import "./WorkPermitHighlights.css";

const emptyForm = { country_id: "", subtitle: "", working_days: "", validity: "", support: "", status_tracking: "", image: null, imagePreview: "" };

const WorkPermitHighlights = () => {
    const role = (localStorage.getItem("role") || "").toLowerCase().trim();
    const canManage = ["admin", "cms-admin"].includes(role);

    const [highlights, setHighlights] = useState([]);
    const [countries, setCountries] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingCountryId, setEditingCountryId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => { fetchHighlights(currentPage); }, [currentPage]);
    useEffect(() => { fetchCountries(); }, []);
    useEffect(() => { return () => { if (form.imagePreview?.startsWith("blob:")) URL.revokeObjectURL(form.imagePreview); }; }, [form.imagePreview]);

    const fetchHighlights = async (page = 1) => {
        try {
            setLoading(true);
            const response = await getAllWorkPermitHighlightsCms(page);
            const result = response.data?.data;
            const rows = Array.isArray(result) ? result : result?.data || [];
            setHighlights(rows);
            setLastPage(Array.isArray(result) ? 1 : result?.last_page || 1);
            setTotal(Array.isArray(result) ? rows.length : result?.total ?? rows.length);
        } catch (error) {
            Swal.fire("Failed", error.response?.data?.message || "Unable to load work permit highlights.", "error");
        } finally { setLoading(false); }
    };

    const fetchCountries = async () => {
        try {
            const response = await getAllCountries();
            const data = response.data?.data;
            setCountries(Array.isArray(data) ? data : data?.data || []);
        } catch (error) { console.error("Country fetch error:", error); }
    };

    const closeModal = () => {
        if (saving) return;
        setShowModal(false);
        setEditingCountryId(null);
        setForm(emptyForm);
    };

    const openCreateModal = () => {
        if (!canManage) return;
        setEditingCountryId(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEditModal = (item) => {
        if (!canManage) return;
        setEditingCountryId(item.country_id);
        setForm({ country_id: String(item.country_id), subtitle: item.subtitle || "", working_days: item.working_days || "", validity: item.validity || "", support: item.support || "", status_tracking: item.status_tracking || "", image: null, imagePreview: item.image || "" });
        setShowModal(true);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
            Swal.fire("Invalid Image", "Please select a JPG, PNG or WEBP image up to 5 MB.", "warning");
            event.target.value = "";
            return;
        }
        setForm(prev => ({ ...prev, image: file, imagePreview: URL.createObjectURL(file) }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!canManage) return;
        if (!form.country_id) return Swal.fire("Country Required", "Please select a country.", "warning");
        const payload = new FormData();
        if (!editingCountryId) payload.append("country_id", form.country_id);
        ["subtitle", "working_days", "validity", "support", "status_tracking"].forEach(field => payload.append(field, form[field]));
        if (form.image) payload.append("image", form.image);
        try {
            setSaving(true);
            const isEditing = !!editingCountryId;
            const response = isEditing ? await updateWorkPermitHighlight(editingCountryId, payload) : await createWorkPermitHighlight(payload);
            if (!response.data?.status) throw new Error(response.data?.message || "Unable to save highlights.");
            setShowModal(false);
            setEditingCountryId(null);
            setForm(emptyForm);
            await Swal.fire({ icon: "success", title: isEditing ? "Updated" : "Created", text: response.data?.message || "Highlights saved successfully.", confirmButtonColor: "#351255" });
            if (currentPage !== 1 && !isEditing) setCurrentPage(1);
            else await fetchHighlights(currentPage);
        } catch (error) {
            const errors = error.response?.data?.errors;
            const firstError = errors ? Object.values(errors)?.[0]?.[0] : null;
            Swal.fire("Failed", firstError || error.response?.data?.message || error.message || "Unable to save highlights.", "error");
        } finally { setSaving(false); }
    };

    const handleDelete = async (item) => {
        if (!canManage) return;
        const confirmation = await Swal.fire({ icon: "warning", title: "Delete Highlights?", text: `Delete highlights for ${item.country?.country_name || "this country"}?`, showCancelButton: true, confirmButtonText: "Yes, Delete", confirmButtonColor: "#d33", cancelButtonColor: "#77717d" });
        if (!confirmation.isConfirmed) return;
        try {
            setDeletingId(item.country_id);
            const response = await deleteWorkPermitHighlight(item.country_id);
            if (!response.data?.status) throw new Error(response.data?.message || "Delete failed.");
            await Swal.fire({ icon: "success", title: "Deleted", text: response.data?.message || "Highlights deleted successfully.", confirmButtonColor: "#351255" });
            if (highlights.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
            else await fetchHighlights(currentPage);
        } catch (error) {
            Swal.fire("Failed", error.response?.data?.message || error.message || "Unable to delete highlights.", "error");
        } finally { setDeletingId(null); }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="dashboard-main">
                <Navbar />
                <main className="dashboard-content">
                    <div className="work-permit-highlights-page">
                        <div className="work-permit-highlights-header">
                            <div><h1>Work Permit Highlights</h1><p>Manage country-specific banner images and work permit highlights.</p></div>
                            {canManage && <button type="button" className="work-permit-highlights-add" onClick={openCreateModal}><FaPlus /> Create Highlights</button>}
                        </div>
                        <div className="work-permit-highlights-card">
                            <div className="work-permit-highlights-card-header"><div><h2>Highlights List</h2><p>{total} {total === 1 ? "country" : "countries"} configured</p></div></div>
                            <div className="work-permit-highlights-table-wrapper">
                                <table className="work-permit-highlights-table">
                                    <thead><tr><th>S.N.</th><th>Country</th><th>Banner</th><th>Subtitle</th><th>Working Days</th><th>Validity</th><th>Support</th><th>Status Tracking</th>{canManage && <th>Actions</th>}</tr></thead>
                                    <tbody>
                                        {loading ? <tr><td colSpan={canManage ? 9 : 8} className="work-permit-highlights-empty">Loading highlights...</td></tr> : highlights.length === 0 ? <tr><td colSpan={canManage ? 9 : 8} className="work-permit-highlights-empty">No highlights found. Create one for a country.</td></tr> : highlights.map((item, index) => (
                                            <tr key={item.id}>
                                                <td>{(currentPage - 1) * 10 + index + 1}</td>
                                                <td><strong>{item.country?.country_name || countries.find(c => String(c.id) === String(item.country_id))?.country_name || `Country #${item.country_id}`}</strong></td>
                                                <td>{item.image ? <img src={item.image} alt="Work permit banner" className="work-permit-highlights-table-image" /> : "-"}</td>
                                                <td>{item.subtitle || "-"}</td>
                                                <td>{item.working_days || "-"}</td>
                                                <td>{item.validity || "-"}</td>
                                                <td>{item.support || "-"}</td>
                                                <td>{item.status_tracking || "-"}</td>
                                                {canManage && <td><div className="work-permit-highlights-actions"><button type="button" className="work-permit-highlights-edit" onClick={() => openEditModal(item)} disabled={deletingId === item.country_id}><FaPen /> Edit</button><button type="button" className="work-permit-highlights-delete" onClick={() => handleDelete(item)} disabled={deletingId === item.country_id}>{deletingId === item.country_id ? "Deleting..." : <><FaTrash /> Delete</>}</button></div></td>}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {!loading && lastPage > 1 && <div className="work-permit-highlights-pagination"><Pagination currentPage={currentPage} totalPages={lastPage} onPageChange={setCurrentPage} /></div>}
                        </div>
                    </div>
                </main>
            </div>
            {canManage && showModal && <div className="work-permit-highlights-modal-overlay" onClick={closeModal}>
                <div className="work-permit-highlights-modal" role="dialog" aria-modal="true" aria-label={editingCountryId ? "Edit work permit highlights" : "Create work permit highlights"} onClick={e => e.stopPropagation()}>
                    <div className="work-permit-highlights-modal-header"><div><h2>{editingCountryId ? "Edit Highlights" : "Create Highlights"}</h2><p>{editingCountryId ? "Update this country's highlights and banner." : "Set highlights and banner for one country."}</p></div><button type="button" className="work-permit-highlights-close" onClick={closeModal} disabled={saving}><FaTimes /></button></div>
                    <form onSubmit={handleSubmit}>
                        <div className="work-permit-highlights-modal-body">
                            <div className="work-permit-highlights-field"><label>Country <span>*</span></label><select name="country_id" value={form.country_id} onChange={handleChange} disabled={!!editingCountryId || saving} required><option value="">Select Country</option>{countries.map(country => <option key={country.id} value={country.id}>{country.country_name}</option>)}</select></div>
                            <div className="work-permit-highlights-field"><label>Subtitle</label><input name="subtitle" value={form.subtitle} onChange={handleChange} placeholder="Authorized Labor Counseling & Government Shram Approval Support" maxLength={255} disabled={saving} /></div>
                            <div className="work-permit-highlights-grid">
                                <div className="work-permit-highlights-field"><label>Working Days</label><input name="working_days" value={form.working_days} onChange={handleChange} placeholder="7 Working Days" maxLength={255} disabled={saving} /></div>
                                <div className="work-permit-highlights-field"><label>Validity</label><input name="validity" value={form.validity} onChange={handleChange} placeholder="2 Years Valid" maxLength={255} disabled={saving} /></div>
                                <div className="work-permit-highlights-field"><label>Support</label><input name="support" value={form.support} onChange={handleChange} placeholder="24/7 Support" maxLength={255} disabled={saving} /></div>
                                <div className="work-permit-highlights-field"><label>Status Tracking</label><input name="status_tracking" value={form.status_tracking} onChange={handleChange} placeholder="Live Status Tracking" maxLength={255} disabled={saving} /></div>
                            </div>
                            <div className="work-permit-highlights-image-field"><label>Banner Image</label><input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleImageChange} disabled={saving} /><p>JPG, PNG or WEBP. Maximum 5 MB. {editingCountryId ? "Leave empty to keep the current image." : ""}</p>{form.imagePreview && <img className="work-permit-highlights-image-preview" src={form.imagePreview} alt="Banner preview" />}</div>
                        </div>
                        <div className="work-permit-highlights-modal-footer"><button type="button" className="work-permit-highlights-cancel" onClick={closeModal} disabled={saving}>Cancel</button><button type="submit" className="work-permit-highlights-save" disabled={saving}>{saving ? "Saving..." : editingCountryId ? "Update Highlights" : "Create Highlights"}</button></div>
                    </form>
                </div>
            </div>}
        </div>
    );
};

export default WorkPermitHighlights;
