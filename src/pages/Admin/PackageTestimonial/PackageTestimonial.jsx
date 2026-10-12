import { useCallback, useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Navbar from "../../../components/Navbar/Navbar";
import Pagination from "../../../components/Pagination/Pagination";
import {
  getPackages,
  getPackageTestimonialsCms,
  createPackageTestimonials,
  updatePackageTestimonial,
  changePackageTestimonialStatus,
  deletePackageTestimonial,
} from "../../../api/BackendApi";
import "./PackageTestimonial.css";

const emptyRow = () => ({
  traveler_name: "", country: "", profile_image: null, profile_image_url: "",
  is_verified: false, rating: 5, review: "", review_date: "",
  display_order: 0, status: "ACTIVE",
});

const errorMessage = (error, fallback) => {
  const errors = error?.response?.data?.errors;
  const first = errors && Object.values(errors).flat()[0];
  return first || error?.response?.data?.message || fallback;
};

const ImagePreview = ({ file, url }) => {
  const [preview, setPreview] = useState("");
  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  const src = file ? preview : url;
  return src ? <img className="package-testimonial-image-preview" src={src} alt="Traveler preview" /> : null;
};

const PackageTestimonial = () => {
  const [packages, setPackages] = useState([]);
  const [packageId, setPackageId] = useState("");
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const statusLock = useRef(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [rows, setRows] = useState([emptyRow()]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await getPackages();
        const result = response.data?.data;
        const list = Array.isArray(result) ? result : Array.isArray(result?.data) ? result.data : [];
        if (active) setPackages(list);
      } catch (error) {
        if (active) Swal.fire("Error", errorMessage(error, "Failed to fetch packages."), "error");
      }
    })();
    return () => { active = false; };
  }, []);

  const fetchTestimonials = useCallback(async (page = 1) => {
    if (!packageId) { setTestimonials([]); setTotal(0); setLastPage(1); return; }
    setLoading(true);
    try {
      const response = await getPackageTestimonialsCms(packageId, page);
      const pagination = response.data?.data || {};
      setTestimonials(Array.isArray(pagination.data) ? pagination.data : []);
      setCurrentPage(pagination.current_page || page);
      setLastPage(pagination.last_page || 1);
      setTotal(pagination.total || 0);
      setPerPage(pagination.per_page || 10);
    } catch (error) {
      setTestimonials([]);
      Swal.fire("Error", errorMessage(error, "Failed to fetch testimonials."), "error");
    } finally { setLoading(false); }
  }, [packageId]);

  useEffect(() => { fetchTestimonials(currentPage); }, [fetchTestimonials, currentPage]);

  const changePackage = (id) => {
    setPackageId(id);
    setCurrentPage(1);
    setTestimonials([]);
    setTotal(0);
  };
  const updateRow = (index, key, value) => setRows(previous => previous.map((row, i) => i === index ? { ...row, [key]: value } : row));
  const openCreate = () => {
    if (!packageId) { Swal.fire("Select package", "Please select a package first.", "warning"); return; }
    setEditingId(null);
    setRows([emptyRow()]);
    setShowModal(true);
  };
  const openEdit = (item) => {
    setEditingId(item.id);
    setRows([{ ...emptyRow(), ...item, profile_image: null, profile_image_url: item.profile_image || "", review_date: item.review_date ? String(item.review_date).slice(0, 10) : "" }]);
    setShowModal(true);
  };
  const closeModal = () => { if (!saving) { setShowModal(false); setEditingId(null); setRows([emptyRow()]); } };

  const appendRow = (form, row, index, bulk) => {
    const prefix = bulk ? `testimonials[${index}]` : "";
    const append = (key, value) => form.append(bulk ? `${prefix}[${key}]` : key, value);
    append("traveler_name", row.traveler_name.trim());
    append("country", row.country.trim());
    append("rating", String(row.rating));
    append("review", row.review.trim());
    append("is_verified", row.is_verified ? "1" : "0");
    append("display_order", String(row.display_order === "" ? 0 : row.display_order));
    append("status", row.status);
    if (row.review_date) append("review_date", row.review_date);
    if (row.profile_image instanceof File) append("profile_image", row.profile_image);
  };

  const save = async (event) => {
    event.preventDefault();
    if (!packageId) return;
    setSaving(true);
    try {
      const form = new FormData();
      if (editingId) {
        appendRow(form, rows[0], 0, false);
        await updatePackageTestimonial(editingId, form);
      } else {
        form.append("package_id", packageId);
        rows.forEach((row, index) => appendRow(form, row, index, true));
        await createPackageTestimonials(form);
      }
      setShowModal(false);
      setEditingId(null);
      setRows([emptyRow()]);
      await Swal.fire({ icon: "success", title: editingId ? "Updated" : "Created", timer: 1200, showConfirmButton: false });
      if (!editingId && currentPage !== 1) setCurrentPage(1);
      else await fetchTestimonials(currentPage);
    } catch (error) {
      Swal.fire("Failed", errorMessage(error, "Could not save testimonials."), "error");
    } finally { setSaving(false); }
  };

  const changeStatus = async (item) => {
    if (statusLock.current || loading || saving) return;
    statusLock.current = true;
    const next = item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const confirm = await Swal.fire({ title: "Change status?", text: `Set this testimonial to ${next}?`, icon: "question", showCancelButton: true, confirmButtonText: "Yes, change it" });
      if (!confirm.isConfirmed) return;
      setUpdatingStatusId(item.id);
      await changePackageTestimonialStatus(item.id);
      await fetchTestimonials(currentPage);
      Swal.fire({ icon: "success", title: "Status updated", timer: 1000, showConfirmButton: false });
    } catch (error) {
      Swal.fire("Failed", errorMessage(error, "Could not change status."), "error");
    } finally {
      setUpdatingStatusId(null);
      statusLock.current = false;
    }
  };

  const remove = async (item) => {
    const confirm = await Swal.fire({ title: "Delete testimonial?", text: "This cannot be undone.", icon: "warning", showCancelButton: true, confirmButtonText: "Delete", confirmButtonColor: "#dc2626" });
    if (!confirm.isConfirmed) return;
    try {
      await deletePackageTestimonial(item.id);
      if (testimonials.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
      else await fetchTestimonials(currentPage);
      Swal.fire({ icon: "success", title: "Deleted", timer: 1000, showConfirmButton: false });
    } catch (error) { Swal.fire("Failed", errorMessage(error, "Could not delete testimonial."), "error"); }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <Navbar />
        <main className="dashboard-content">
          <div className="package-testimonial-page">
            <div className="package-testimonial-page-header">
              <div><h1>Package Testimonials</h1><p>Manage traveler reviews and ratings for each package.</p></div>
              <button className="package-testimonial-add-button" onClick={openCreate}>+ Add Testimonials</button>
            </div>
            <div className="package-testimonial-filter">
              <label htmlFor="testimonial-package">Select Package</label>
              <select id="testimonial-package" value={packageId} onChange={event => changePackage(event.target.value)}>
                <option value="">Select Package</option>
                {packages.map(item => <option key={item.id} value={item.id}>{item.title || item.name || item.package_name || `Package #${item.id}`}</option>)}
              </select>
            </div>
            <div className="package-testimonial-card">
              <div className="package-testimonial-card-header"><div><h2>Testimonial List</h2><p>{total} {total === 1 ? "testimonial" : "testimonials"}</p></div></div>
              <div className="package-testimonial-table-wrapper">
                <table className="package-testimonial-table">
                  <thead><tr><th>S.N.</th><th>Traveler</th><th>Image</th><th>Country</th><th>Rating</th><th>Verified</th><th>Review</th><th>Review Date</th><th>Order</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {!packageId || loading || testimonials.length === 0 ? (
                      <tr><td className="package-testimonial-empty" colSpan="11">{!packageId ? "Select a package to view testimonials." : loading ? "Loading testimonials..." : "No testimonials found."}</td></tr>
                    ) : testimonials.map((item, index) => (
                      <tr key={item.id}>
                        <td>{(currentPage - 1) * perPage + index + 1}</td>
                        <td><strong>{item.traveler_name}</strong></td>
                        <td>{item.profile_image ? <img className="package-testimonial-table-image" src={item.profile_image} alt={item.traveler_name} /> : "-"}</td>
                        <td>{item.country || "-"}</td>
                        <td><span className="package-testimonial-rating">{"★".repeat(Math.min(5, Math.max(0, Number(item.rating) || 0)))}{"☆".repeat(5 - Math.min(5, Math.max(0, Number(item.rating) || 0)))}</span></td>
                        <td>{item.is_verified ? "Yes" : "No"}</td>
                        <td><div className="package-testimonial-review" title={item.review}>{item.review}</div></td>
                        <td>{item.review_date ? String(item.review_date).slice(0, 10) : "-"}</td>
                        <td>{item.display_order ?? 0}</td>
                        <td>
                          <button type="button" className={`package-testimonial-status ${item.status === "ACTIVE" ? "active" : "inactive"} ${updatingStatusId === item.id ? "updating" : ""}`} onClick={() => changeStatus(item)} disabled={updatingStatusId !== null || loading || saving} aria-busy={updatingStatusId === item.id}>
                            {updatingStatusId === item.id ? <><span className="package-testimonial-status-spinner" aria-hidden="true" /> Updating...</> : item.status}
                          </button>
                        </td>
                        <td><div className="package-testimonial-actions"><button className="package-testimonial-edit" onClick={() => openEdit(item)}>Edit</button><button className="package-testimonial-delete" onClick={() => remove(item)}>Delete</button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!loading && lastPage > 1 && <div className="package-testimonial-pagination"><Pagination currentPage={currentPage} totalPages={lastPage} onPageChange={setCurrentPage} /></div>}
            </div>
          </div>
        </main>
      </div>
      {showModal && (
        <div className="package-testimonial-modal-overlay" onClick={closeModal}>
          <div className="package-testimonial-modal" onClick={event => event.stopPropagation()}>
            <div className="package-testimonial-modal-header"><div><h2>{editingId ? "Edit Package Testimonial" : "Add Package Testimonials"}</h2><p>{editingId ? "Update traveler testimonial." : "Add multiple testimonials for the selected package."}</p></div><button type="button" className="package-testimonial-modal-close" onClick={closeModal}>×</button></div>
            <form onSubmit={save}>
              <div className="package-testimonial-modal-body">
                <div className="package-testimonial-selected-package"><strong>Package:</strong> {packages.find(item => String(item.id) === String(packageId))?.title || packages.find(item => String(item.id) === String(packageId))?.name || `#${packageId}`}</div>
                {rows.map((row, index) => (
                  <div className="package-testimonial-row-card" key={index}>
                    <div className="package-testimonial-row-header"><h3>Testimonial {index + 1}</h3>{!editingId && rows.length > 1 && <button type="button" className="package-testimonial-remove" onClick={() => setRows(previous => previous.filter((_, i) => i !== index))}>Remove</button>}</div>
                    <div className="package-testimonial-fields-grid">
                      <div className="package-testimonial-form-group"><label>Traveler Name *</label><input value={row.traveler_name} onChange={e => updateRow(index, "traveler_name", e.target.value)} maxLength={255} required placeholder="Traveler name" /></div>
                      <div className="package-testimonial-form-group"><label>Country</label><input value={row.country} onChange={e => updateRow(index, "country", e.target.value)} maxLength={100} placeholder="e.g. Australia" /></div>
                      <div className="package-testimonial-form-group"><label>Rating *</label><select value={row.rating} onChange={e => updateRow(index, "rating", e.target.value)}>{[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Star{n !== 1 ? "s" : ""}</option>)}</select></div>
                      <div className="package-testimonial-form-group"><label>Review Date</label><input type="date" value={row.review_date} onChange={e => updateRow(index, "review_date", e.target.value)} /></div>
                      <div className="package-testimonial-form-group"><label>Display Order</label><input type="number" min="0" value={row.display_order} onChange={e => updateRow(index, "display_order", e.target.value)} /></div>
                      <div className="package-testimonial-form-group"><label>Status</label><select value={row.status} onChange={e => updateRow(index, "status", e.target.value)}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></div>
                      <div className="package-testimonial-form-group"><label>Traveler Image</label><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => updateRow(index, "profile_image", e.target.files?.[0] || null)} /><ImagePreview file={row.profile_image} url={row.profile_image_url} /></div>
                      <div className="package-testimonial-form-group package-testimonial-verified-field"><label><input type="checkbox" checked={Boolean(row.is_verified)} onChange={e => updateRow(index, "is_verified", e.target.checked)} /> Verified Traveler</label></div>
                    </div>
                    <div className="package-testimonial-form-group package-testimonial-review-field"><label>Review *</label><textarea rows={4} required value={row.review} onChange={e => updateRow(index, "review", e.target.value)} placeholder="Write traveler review..." /></div>
                  </div>
                ))}
                {!editingId && <button type="button" className="package-testimonial-add-row" onClick={() => setRows(previous => [...previous, emptyRow()])}>+ Add Another Testimonial</button>}
              </div>
              <div className="package-testimonial-modal-footer"><button type="button" className="package-testimonial-cancel" disabled={saving} onClick={closeModal}>Cancel</button><button type="submit" className="package-testimonial-save" disabled={saving}>{saving ? "Saving..." : editingId ? "Update Testimonial" : `Create ${rows.length} ${rows.length === 1 ? "Testimonial" : "Testimonials"}`}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageTestimonial;
