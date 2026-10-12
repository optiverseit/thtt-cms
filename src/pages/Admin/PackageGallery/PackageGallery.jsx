import { useCallback, useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Navbar from "../../../components/Navbar/Navbar";
import Pagination from "../../../components/Pagination/Pagination";
import { getPackages, getPackageGalleryCms, createPackageGallery, updatePackageGallery, changePackageGalleryStatus, deletePackageGallery } from "../../../api/BackendApi";
import "./PackageGallery.css";
const emptyImage = () => ({ image: null, image_url: "", alt_text: "", display_order: 0, status: "ACTIVE" });
const getError = (error, fallback) => Object.values(error?.response?.data?.errors || {}).flat()[0] || error?.response?.data?.message || fallback;
const Preview = ({ file, url }) => {
  const [preview, setPreview] = useState("");
  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  const src = file ? preview : url;
  return src ? <img className="package-gallery-preview" src={src} alt="Gallery preview" /> : null;
};
const PackageGallery = () => {
  const [packages, setPackages] = useState([]);
  const [packageId, setPackageId] = useState("");
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const statusUpdatingRef = useRef(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [rows, setRows] = useState([emptyImage()]);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await getPackages();
        const result = response.data?.data;
        const list = Array.isArray(result) ? result : Array.isArray(result?.data) ? result.data : [];
        if (active) setPackages(list);
      } catch (error) {
        if (active) Swal.fire("Error", getError(error, "Failed to fetch packages."), "error");
      }
    })();
    return () => { active = false; };
  }, []);
  const fetchGallery = useCallback(async (page = 1) => {
    if (!packageId) { setGalleries([]); setTotal(0); setLastPage(1); return; }
    setLoading(true);
    try {
      const response = await getPackageGalleryCms(packageId, page);
      const pagination = response.data?.data || {};
      setGalleries(Array.isArray(pagination.data) ? pagination.data : []);
      setCurrentPage(pagination.current_page || page);
      setLastPage(pagination.last_page || 1);
      setTotal(pagination.total || 0);
      setPerPage(pagination.per_page || 10);
    } catch (error) {
      setGalleries([]);
      Swal.fire("Error", getError(error, "Failed to fetch gallery."), "error");
    } finally { setLoading(false); }
  }, [packageId]);
  useEffect(() => { fetchGallery(currentPage); }, [fetchGallery, currentPage]);
  const selectPackage = (id) => { setPackageId(id); setCurrentPage(1); setGalleries([]); setTotal(0); };
  const updateRow = (index, key, value) => setRows(previous => previous.map((row, i) => i === index ? { ...row, [key]: value } : row));
  const openCreate = () => {
    if (!packageId) { Swal.fire("Select package", "Please select a package first.", "warning"); return; }
    setEditingId(null); setRows([emptyImage()]); setShowModal(true);
  };
  const openEdit = (item) => {
    setEditingId(item.id);
    setRows([{ image: null, image_url: item.image_url || "", alt_text: item.alt_text || "", display_order: item.display_order ?? 0, status: item.status || "ACTIVE" }]);
    setShowModal(true);
  };
  const closeModal = () => { if (saving) return; setShowModal(false); setEditingId(null); setRows([emptyImage()]); };
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!packageId) return;
    if (!editingId && rows.some(row => !row.image)) { Swal.fire("Image required", "Select an image for each gallery row.", "warning"); return; }
    setSaving(true);
    try {
      const formData = new FormData();
      if (editingId) {
        const row = rows[0];
        if (row.image) formData.append("image", row.image);
        formData.append("alt_text", row.alt_text);
        formData.append("display_order", String(row.display_order === "" ? 0 : row.display_order));
        formData.append("status", row.status);
        await updatePackageGallery(editingId, formData);
      } else {
        formData.append("package_id", packageId);
        rows.forEach((row, index) => {
          formData.append(`images[${index}][image]`, row.image);
          formData.append(`images[${index}][alt_text]`, row.alt_text);
          formData.append(`images[${index}][display_order]`, String(row.display_order === "" ? index : row.display_order));
          formData.append(`images[${index}][status]`, row.status);
        });
        await createPackageGallery(formData);
      }
      await Swal.fire("Success", editingId ? "Gallery image updated successfully." : "Gallery images created successfully.", "success");
      closeModal();
      if (editingId || currentPage === 1) await fetchGallery(editingId ? currentPage : 1);
      else setCurrentPage(1);
    } catch (error) { Swal.fire("Error", getError(error, "Failed to save gallery images."), "error"); }
    finally { setSaving(false); }
  };
  const changeStatus = async (item) => {
    if (statusUpdatingRef.current) return;
    const next = item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const result = await Swal.fire({ title: "Change status?", text: `Change this image to ${next}?`, icon: "question", showCancelButton: true, confirmButtonText: "Yes, change it" });
    if (!result.isConfirmed || statusUpdatingRef.current) return;
    statusUpdatingRef.current = true;
    setUpdatingStatusId(item.id);
    try { await changePackageGalleryStatus(item.id); await fetchGallery(currentPage); Swal.fire({ icon: "success", title: "Status updated", timer: 1200, showConfirmButton: false }); }
    catch (error) { Swal.fire("Error", getError(error, "Failed to change status."), "error"); }
    finally { statusUpdatingRef.current = false; setUpdatingStatusId(null); }
  };
  const removeImage = async (item) => {
    const result = await Swal.fire({ title: "Delete gallery image?", text: "This image will be permanently deleted.", icon: "warning", showCancelButton: true, confirmButtonText: "Delete", confirmButtonColor: "#d33" });
    if (!result.isConfirmed) return;
    try {
      await deletePackageGallery(item.id);
      await Swal.fire({ icon: "success", title: "Deleted", timer: 1100, showConfirmButton: false });
      if (galleries.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
      else await fetchGallery(currentPage);
    } catch (error) { Swal.fire("Error", getError(error, "Failed to delete image."), "error"); }
  };
  const packageName = packages.find(item => String(item.id) === String(packageId));
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <Navbar />
        <main className="dashboard-content">
          <div className="package-gallery-page">
            <div className="package-gallery-page-header">
              <div><h1>Package Gallery</h1><p>Manage package images and their display order.</p></div>
              <button className="package-gallery-add-button" type="button" onClick={openCreate}>+ Add Gallery Images</button>
            </div>
            <div className="package-gallery-filter">
              <label htmlFor="package-gallery-package">Select Package</label>
              <select id="package-gallery-package" value={packageId} onChange={e => selectPackage(e.target.value)}>
                <option value="">Select Package</option>
                {packages.map(item => <option key={item.id} value={item.id}>{item.title || item.name || item.package_name || `Package #${item.id}`}</option>)}
              </select>
            </div>
            <div className="package-gallery-card">
              <div className="package-gallery-card-header"><h2>Gallery List</h2><p>{total} {total === 1 ? "image" : "images"}</p></div>
              <div className="package-gallery-table-wrapper">
                <table className="package-gallery-table">
                  <thead><tr><th>S.N.</th><th>Image</th><th>Alt Text</th><th>Display Order</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {loading ? <tr><td colSpan="6" className="package-gallery-empty">Loading gallery...</td></tr> :
                      !packageId ? <tr><td colSpan="6" className="package-gallery-empty">Select a package to view its gallery.</td></tr> :
                      galleries.length === 0 ? <tr><td colSpan="6" className="package-gallery-empty">No gallery images found.</td></tr> :
                      galleries.map((item, index) => (
                        <tr key={item.id}>
                          <td>{(currentPage - 1) * perPage + index + 1}</td>
                          <td>{item.image_url ? <img className="package-gallery-table-image" src={item.image_url} alt={item.alt_text || "Package gallery"} /> : "-"}</td>
                          <td><div className="package-gallery-alt-text" title={item.alt_text || ""}>{item.alt_text || "-"}</div></td>
                          <td>{item.display_order ?? 0}</td>
                          <td><button type="button" className={`package-gallery-status ${item.status === "ACTIVE" ? "active" : "inactive"}`} onClick={() => changeStatus(item)} disabled={updatingStatusId !== null}>{updatingStatusId === item.id ? <><span className="package-gallery-status-spinner" />Updating...</> : item.status}</button></td>
                          <td><div className="package-gallery-actions"><button type="button" className="package-gallery-edit" onClick={() => openEdit(item)}>Edit</button><button type="button" className="package-gallery-delete" onClick={() => removeImage(item)}>Delete</button></div></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {!loading && lastPage > 1 && <div className="package-gallery-pagination"><Pagination currentPage={currentPage} totalPages={lastPage} onPageChange={setCurrentPage} /></div>}
            </div>
          </div>
        </main>
      </div>
      {showModal && (
        <div className="package-gallery-modal-overlay" onClick={closeModal}>
          <div className="package-gallery-modal" onClick={e => e.stopPropagation()}>
            <div className="package-gallery-modal-header"><div><h2>{editingId ? "Edit Gallery Image" : "Add Gallery Images"}</h2><p>Package: {packageName?.title || packageName?.name || packageName?.package_name || `#${packageId}`}</p></div><button type="button" className="package-gallery-modal-close" onClick={closeModal}>×</button></div>
            <form onSubmit={handleSubmit}>
              <div className="package-gallery-modal-body">
                {rows.map((row, index) => (
                  <div className="package-gallery-row-card" key={index}>
                    <div className="package-gallery-row-header"><h3>{editingId ? "Gallery Image" : `Image ${index + 1}`}</h3>{!editingId && rows.length > 1 && <button type="button" className="package-gallery-remove" onClick={() => setRows(previous => previous.filter((_, i) => i !== index))}>Remove</button>}</div>
                    <div className="package-gallery-fields-grid">
                      <div className="package-gallery-form-group"><label>Image {editingId ? "(optional replacement)" : "*"}</label><input type="file" accept="image/jpeg,image/png,image/webp" required={!editingId} onChange={e => updateRow(index, "image", e.target.files?.[0] || null)} /><Preview file={row.image} url={row.image_url} /></div>
                      <div className="package-gallery-form-group"><label>Alt Text</label><input type="text" maxLength="255" value={row.alt_text} placeholder="Describe this image" onChange={e => updateRow(index, "alt_text", e.target.value)} /></div>
                      <div className="package-gallery-form-group"><label>Display Order</label><input type="number" min="0" value={row.display_order} onChange={e => updateRow(index, "display_order", e.target.value)} /></div>
                      <div className="package-gallery-form-group"><label>Status</label><select value={row.status} onChange={e => updateRow(index, "status", e.target.value)}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></div>
                    </div>
                  </div>
                ))}
                {!editingId && <button type="button" className="package-gallery-add-row" onClick={() => setRows(previous => [...previous, emptyImage()])}>+ Add Another Image</button>}
              </div>
              <div className="package-gallery-modal-footer"><button type="button" className="package-gallery-cancel" onClick={closeModal} disabled={saving}>Cancel</button><button type="submit" className="package-gallery-save" disabled={saving}>{saving ? "Saving..." : editingId ? "Update Image" : `Create ${rows.length} ${rows.length === 1 ? "Image" : "Images"}`}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default PackageGallery;
