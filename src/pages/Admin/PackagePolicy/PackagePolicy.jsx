import { useCallback, useEffect, useRef, useState } from "react";

import Swal from "sweetalert2";

import Sidebar from "../../../components/Sidebar/Sidebar";

import Navbar from "../../../components/Navbar/Navbar";

import Pagination from "../../../components/Pagination/Pagination";

import { getPackages, getPackagePoliciesCms, createPackagePolicies, updatePackagePolicy, changePackagePolicyStatus, deletePackagePolicy } from "../../../api/BackendApi";

import "./PackagePolicy.css";



const emptyPolicy = () => ({ title: "", policy_type: "", icon: "", description: "", guidelines: [""], status: "ACTIVE", display_order: 0 });

const getError = (error, fallback) => Object.values(error?.response?.data?.errors || {}).flat()[0] || error?.response?.data?.message || fallback;

const normalizeGuidelines = (value) => {

  if (Array.isArray(value)) return value.length ? value.map(String) : [""];

  if (typeof value === "string") {

    try { const parsed = JSON.parse(value); if (Array.isArray(parsed)) return parsed.length ? parsed.map(String) : [""]; } catch (_) { /* Not JSON */ }

    return value ? [value] : [""];

  }

  return [""];

};



const PackagePolicy = () => {

  const [packages, setPackages] = useState([]);

  const [packageId, setPackageId] = useState("");

  const [policies, setPolicies] = useState([]);

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

  const [rows, setRows] = useState([emptyPolicy()]);



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



  const fetchPolicies = useCallback(async (page = 1) => {

    if (!packageId) { setPolicies([]); setTotal(0); setLastPage(1); return; }

    setLoading(true);

    try {

      const response = await getPackagePoliciesCms(packageId, page);

      const pagination = response.data?.data || {};

      setPolicies(Array.isArray(pagination.data) ? pagination.data : []);

      setCurrentPage(pagination.current_page || page);

      setLastPage(pagination.last_page || 1);

      setTotal(pagination.total || 0);

      setPerPage(pagination.per_page || 10);

    } catch (error) {

      setPolicies([]);

      Swal.fire("Error", getError(error, "Failed to fetch policies."), "error");

    } finally { setLoading(false); }

  }, [packageId]);

  useEffect(() => { fetchPolicies(currentPage); }, [fetchPolicies, currentPage]);



  const selectPackage = (id) => { setPackageId(id); setCurrentPage(1); setPolicies([]); setTotal(0); };

  const updateRow = (index, field, value) => setRows(previous => previous.map((row, i) => i === index ? { ...row, [field]: value } : row));

  const updateGuideline = (rowIndex, guidelineIndex, value) => setRows(previous => previous.map((row, i) => i === rowIndex ? { ...row, guidelines: row.guidelines.map((guideline, j) => j === guidelineIndex ? value : guideline) } : row));

  const addGuideline = (rowIndex) => setRows(previous => previous.map((row, i) => i === rowIndex ? { ...row, guidelines: [...row.guidelines, ""] } : row));

  const removeGuideline = (rowIndex, guidelineIndex) => setRows(previous => previous.map((row, i) => i === rowIndex ? { ...row, guidelines: row.guidelines.filter((_, j) => j !== guidelineIndex) } : row));

  const openCreate = () => {

    if (!packageId) { Swal.fire("Select package", "Please select a package first.", "warning"); return; }

    setEditingId(null); setRows([emptyPolicy()]); setShowModal(true);

  };

  const openEdit = (item) => {

    setEditingId(item.id);

    setRows([{ title: item.title || "", policy_type: item.policy_type || "", icon: item.icon || "", description: item.description || "", guidelines: normalizeGuidelines(item.guidelines), status: item.status || "ACTIVE", display_order: item.display_order ?? 0 }]);

    setShowModal(true);

  };

  const closeModal = () => { if (saving) return; setShowModal(false); setEditingId(null); setRows([emptyPolicy()]); };

  const serializePolicy = (row, index) => ({

    title: row.title.trim(),

    policy_type: row.policy_type.trim() || null,

    icon: row.icon.trim() || null,

    description: row.description.trim() || null,

    guidelines: row.guidelines.map(item => item.trim()).filter(Boolean),

    status: row.status,

    display_order: row.display_order === "" ? index : Number(row.display_order)

  });

  const handleSubmit = async (event) => {

    event.preventDefault();

    if (!packageId) return;

    setSaving(true);

    try {

      if (editingId) {

        await updatePackagePolicy(editingId, serializePolicy(rows[0], 0));

      } else {

        await createPackagePolicies({ package_id: Number(packageId), policies: rows.map(serializePolicy) });

      }

      await Swal.fire({ icon: "success", title: editingId ? "Policy updated" : "Policies created", timer: 1300, showConfirmButton: false });

      setShowModal(false); setEditingId(null); setRows([emptyPolicy()]);

      if (editingId || currentPage === 1) await fetchPolicies(editingId ? currentPage : 1);

      else setCurrentPage(1);

    } catch (error) { Swal.fire("Error", getError(error, "Failed to save policies."), "error"); }

    finally { setSaving(false); }

  };

  const changeStatus = async (item) => {
    if (statusUpdatingRef.current || loading || saving) return;
    const next = item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const result = await Swal.fire({ title: "Change status?", text: `Change this policy to ${next}?`, icon: "question", showCancelButton: true, confirmButtonText: "Yes, change it" });
    if (!result.isConfirmed || statusUpdatingRef.current) return;
    statusUpdatingRef.current = true;
    setUpdatingStatusId(item.id);
    try {
      await changePackagePolicyStatus(item.id);
      await fetchPolicies(currentPage);
      Swal.fire({ icon: "success", title: "Status updated", timer: 1200, showConfirmButton: false });
    } catch (error) {
      Swal.fire("Error", getError(error, "Failed to change status."), "error");
    } finally {
      statusUpdatingRef.current = false;
      setUpdatingStatusId(null);
    }
  };

  const removePolicy = async (item) => {

    const result = await Swal.fire({ title: "Delete policy?", text: "This policy will be permanently deleted.", icon: "warning", showCancelButton: true, confirmButtonText: "Delete", confirmButtonColor: "#d33" });

    if (!result.isConfirmed) return;

    try {

      await deletePackagePolicy(item.id);

      await Swal.fire({ icon: "success", title: "Deleted", timer: 1100, showConfirmButton: false });

      if (policies.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);

      else await fetchPolicies(currentPage);

    } catch (error) { Swal.fire("Error", getError(error, "Failed to delete policy."), "error"); }

  };

  const selectedPackage = packages.find(item => String(item.id) === String(packageId));

  const selectedPackageName = selectedPackage?.title || selectedPackage?.name || selectedPackage?.package_name || `#${packageId}`;



  return (

    <div className="dashboard-layout">

      <Sidebar />

      <div className="dashboard-main">

        <Navbar />

        <main className="dashboard-content">

          <div className="package-policy-page">

            <div className="package-policy-page-header">

              <div><h1>Package Policies</h1><p>Manage package policies and their guidelines.</p></div>

              <button type="button" className="package-policy-add-button" onClick={openCreate}>+ Add Policies</button>

            </div>

            <div className="package-policy-filter">

              <label htmlFor="package-policy-package">Select Package</label>

              <select id="package-policy-package" value={packageId} onChange={e => selectPackage(e.target.value)}>

                <option value="">Select Package</option>

                {packages.map(item => <option key={item.id} value={item.id}>{item.title || item.name || item.package_name || `Package #${item.id}`}</option>)}

              </select>

            </div>

            <div className="package-policy-card">

              <div className="package-policy-card-header"><h2>Policy List</h2><p>{total} {total === 1 ? "policy" : "policies"}</p></div>

              <div className="package-policy-table-wrapper">

                <table className="package-policy-table">

                  <thead><tr><th>S.N.</th><th>Title</th><th>Type</th><th>Icon</th><th>Description</th><th>Guidelines</th><th>Order</th><th>Status</th><th>Actions</th></tr></thead>

                  <tbody>

                    {loading ? <tr><td colSpan="9" className="package-policy-empty">Loading policies...</td></tr> :

                      !packageId ? <tr><td colSpan="9" className="package-policy-empty">Select a package to view its policies.</td></tr> :

                      policies.length === 0 ? <tr><td colSpan="9" className="package-policy-empty">No policies found.</td></tr> :

                      policies.map((item, index) => (

                        <tr key={item.id}>

                          <td>{(currentPage - 1) * perPage + index + 1}</td>

                          <td><strong>{item.title}</strong></td>

                          <td>{item.policy_type || "-"}</td>

                          <td>{item.icon || "-"}</td>

                          <td><div className="package-policy-truncate" title={item.description || ""}>{item.description || "-"}</div></td>

                          <td>{normalizeGuidelines(item.guidelines).filter(Boolean).length}</td>

                          <td>{item.display_order ?? 0}</td>

                          <td><button type="button" className={`package-policy-status ${item.status === "ACTIVE" ? "active" : "inactive"} ${updatingStatusId === item.id ? "updating" : ""}`} disabled={updatingStatusId !== null || loading || saving} aria-busy={updatingStatusId === item.id} onClick={() => changeStatus(item)}>{updatingStatusId === item.id ? <><span className="package-policy-status-spinner" aria-hidden="true" /> Updating...</> : item.status}</button></td>

                          <td><div className="package-policy-actions"><button type="button" className="package-policy-edit" onClick={() => openEdit(item)}>Edit</button><button type="button" className="package-policy-delete" onClick={() => removePolicy(item)}>Delete</button></div></td>

                        </tr>

                      ))}

                  </tbody>

                </table>

              </div>

              {!loading && lastPage > 1 && <div className="package-policy-pagination"><Pagination currentPage={currentPage} totalPages={lastPage} onPageChange={setCurrentPage} /></div>}

            </div>

          </div>

        </main>

      </div>

      {showModal && (

        <div className="package-policy-modal-overlay" onClick={closeModal}>

          <div className="package-policy-modal" onClick={e => e.stopPropagation()}>

            <div className="package-policy-modal-header">

              <div><h2>{editingId ? "Edit Package Policy" : "Add Package Policies"}</h2><p>Package: {selectedPackageName}</p></div>

              <button type="button" className="package-policy-modal-close" onClick={closeModal}>×</button>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="package-policy-modal-body">

                {rows.map((row, index) => (

                  <div className="package-policy-row-card" key={index}>

                    <div className="package-policy-row-header">

                      <h3>{editingId ? "Policy" : `Policy ${index + 1}`}</h3>

                      {!editingId && rows.length > 1 && <button type="button" className="package-policy-remove" onClick={() => setRows(previous => previous.filter((_, i) => i !== index))}>Remove</button>}

                    </div>

                    <div className="package-policy-fields-grid">

                      <div className="package-policy-form-group"><label>Title *</label><input type="text" maxLength="255" value={row.title} placeholder="Cancellation Policy" required onChange={e => updateRow(index, "title", e.target.value)} /></div>

                      <div className="package-policy-form-group"><label>Policy Type</label><input type="text" maxLength="100" value={row.policy_type} placeholder="CANCELLATION" onChange={e => updateRow(index, "policy_type", e.target.value)} /></div>

                      <div className="package-policy-form-group"><label>Icon</label><input type="text" maxLength="100" value={row.icon} placeholder="shield-check" onChange={e => updateRow(index, "icon", e.target.value)} /></div>

                      <div className="package-policy-form-group"><label>Display Order</label><input type="number" min="0" value={row.display_order} onChange={e => updateRow(index, "display_order", e.target.value)} /></div>

                      <div className="package-policy-form-group"><label>Status</label><select value={row.status} onChange={e => updateRow(index, "status", e.target.value)}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></div>

                    </div>

                    <div className="package-policy-form-group package-policy-description-field"><label>Description</label><textarea rows="3" value={row.description} placeholder="Enter policy description..." onChange={e => updateRow(index, "description", e.target.value)} /></div>

                    <div className="package-policy-guidelines">

                      <div className="package-policy-guidelines-header"><label>Guidelines</label><button type="button" onClick={() => addGuideline(index)}>+ Add Guideline</button></div>

                      {row.guidelines.map((guideline, guidelineIndex) => (

                        <div className="package-policy-guideline-row" key={guidelineIndex}>

                          <input type="text" value={guideline} placeholder={`Guideline ${guidelineIndex + 1}`} onChange={e => updateGuideline(index, guidelineIndex, e.target.value)} />

                          <button type="button" onClick={() => removeGuideline(index, guidelineIndex)} aria-label="Remove guideline">×</button>

                        </div>

                      ))}

                    </div>

                  </div>

                ))}

                {!editingId && <button type="button" className="package-policy-add-row" onClick={() => setRows(previous => [...previous, emptyPolicy()])}>+ Add Another Policy</button>}

              </div>

              <div className="package-policy-modal-footer"><button type="button" className="package-policy-cancel" onClick={closeModal} disabled={saving}>Cancel</button><button type="submit" className="package-policy-save" disabled={saving}>{saving ? "Saving..." : editingId ? "Update Policy" : `Create ${rows.length} ${rows.length === 1 ? "Policy" : "Policies"}`}</button></div>

            </form>

          </div>

        </div>

      )}

    </div>

  );

};



export default PackagePolicy;
