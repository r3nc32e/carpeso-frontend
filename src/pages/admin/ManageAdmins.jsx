import { useState, useEffect } from "react";
import {
  Plus, X, Check, ShieldCheck, Eye, AlertTriangle,
  PauseCircle, PlayCircle, ChevronDown, ChevronUp, Pencil
} from "lucide-react";
import api from "../../api/axios";
import usePageTitle from "../../hooks/usePageTitle";

const PRIVILEGE_OPTIONS = [
  { value: "INVENTORY_MANAGER",  label: "Inventory Manager",   desc: "Vehicles & Categories" },
  { value: "TRANSACTION_MANAGER",label: "Transaction Manager",  desc: "Transactions only" },
  { value: "ACCOUNT_MANAGER",    label: "Account Manager",      desc: "Users only" },
  { value: "CONTENT_MODERATOR",  label: "Content Moderator",    desc: "Reviews only" },
  { value: "SALES_ANALYST",      label: "Sales Analyst",        desc: "Audit Logs & Sales Analytics" },
];

const privilegeColor = (p) =>
  ({
    INVENTORY_MANAGER:  "bg-blue-100 text-blue-700",
    TRANSACTION_MANAGER:"bg-purple-100 text-purple-700",
    ACCOUNT_MANAGER:    "bg-green-100 text-green-700",
    CONTENT_MODERATOR:  "bg-yellow-100 text-yellow-700",
    SALES_ANALYST:      "bg-orange-100 text-orange-700",
  })[p] || "bg-gray-100 text-gray-600";

const getPrivilegeLabel = (privileges) => {
  if (!privileges || privileges.length === 0) return "No privilege";
  const p = PRIVILEGE_OPTIONS.find((o) => o.value === privileges[0]);
  return p ? p.label : privileges[0];
};

function ManageAdmins() {
  usePageTitle("Manage Admins");

  const [admins, setAdmins]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [success, setSuccess]       = useState("");
  const [error, setError]           = useState("");

  // ─── Create modal ────────────────────────────────────────────────
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm]             = useState({
    firstName: "", lastName: "", middleName: "", suffix: "",
    phone: "", email: "", password: "", privilege: "",
  });

  // ─── View / Edit modal ───────────────────────────────────────────
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showView, setShowView]           = useState(false);
  const [editMode, setEditMode]           = useState(false);
  const [editForm, setEditForm]           = useState({});

  // ─── Change Role modal ───────────────────────────────────────────
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleTarget, setRoleTarget]       = useState(null);
  const [newPrivilege, setNewPrivilege]   = useState("");

  // ─── Warn modal ──────────────────────────────────────────────────
  const [showWarn, setShowWarn]   = useState(false);
  const [warnTarget, setWarnTarget] = useState(null);
  const [warnReason, setWarnReason] = useState("");

  // ─── Suspend modal ───────────────────────────────────────────────
  const [showSuspend, setShowSuspend]     = useState(false);
  const [suspendTarget, setSuspendTarget] = useState(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendDays, setSuspendDays]     = useState(30);

  // ─── OTP for email change (on View/Edit) ─────────────────────────
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [emailStep, setEmailStep]             = useState("form");
  const [emailForm, setEmailForm]             = useState({ newEmail: "", superadminPassword: "", otp: "" });
  const [sendingOtp, setSendingOtp]           = useState(false);

  const inputClass =
    "w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition";

  useEffect(() => { fetchAdmins(); }, []);

  const fetchAdmins = async () => {
    try {
      const res = await api.get("/superadmin/admins");
      setAdmins(res.data.data || []);
    } catch {
      setError("Failed to fetch admins!");
    } finally { setLoading(false); }
  };

  const showMsg = (msg, isError = false) => {
    if (isError) { setError(msg); setTimeout(() => setError(""), 4000); }
    else { setSuccess(msg); setTimeout(() => setSuccess(""), 4000); }
  };

  // ─── CREATE ───────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password || !form.privilege) {
      setError("First name, last name, email, password and privilege are required!"); return;
    }
    const pwChecks = {
      length:  form.password.length >= 8,
      upper:   /[A-Z]/.test(form.password),
      number:  /[0-9]/.test(form.password),
      special: /[!@#$%^&*]/.test(form.password),
    };
    if (!pwChecks.length)  { setError("Password must be at least 8 characters!"); return; }
    if (!pwChecks.upper)   { setError("Password must have at least 1 uppercase letter!"); return; }
    if (!pwChecks.number)  { setError("Password must have at least 1 number!"); return; }
    if (!pwChecks.special) { setError("Password must have at least 1 special character (!@#$%^&*)!"); return; }

    try {
      await api.post("/superadmin/admins", {
        firstName: form.firstName,
        lastName:  form.lastName,
        middleName: form.middleName || null,
        suffix:    form.suffix || null,
        phone:     form.phone || null,
        email:     form.email,
        password:  form.password,
        privileges: [form.privilege],
      });
      showMsg("Admin created! Credentials sent to their email.");
      setShowCreate(false);
      setForm({ firstName: "", lastName: "", middleName: "", suffix: "", phone: "", email: "", password: "", privilege: "" });
      setError("");
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create admin!");
    }
  };

  // ─── VIEW/EDIT ────────────────────────────────────────────────────
  const openView = (admin) => {
    setSelectedAdmin(admin);
    setEditForm({
      firstName:  admin.firstName  || "",
      lastName:   admin.lastName   || "",
      middleName: admin.middleName || "",
      suffix:     admin.suffix     || "",
      phone:      admin.phone      || "",
    });
    setEditMode(false);
    setShowEmailChange(false);
    setEmailStep("form");
    setEmailForm({ newEmail: "", superadminPassword: "", otp: "" });
    setError("");
    setShowView(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm.firstName || !editForm.lastName) {
      setError("First name and last name are required!"); return;
    }
    try {
      await api.put(`/superadmin/admins/${selectedAdmin.id}`, editForm);
      showMsg("Admin details updated!");
      setEditMode(false);
      fetchAdmins();
      // update selectedAdmin so the view reflects changes
      setSelectedAdmin(prev => ({ ...prev, ...editForm,
        fullName: `${editForm.firstName} ${editForm.middleName ? editForm.middleName + " " : ""}${editForm.lastName}${editForm.suffix ? ", " + editForm.suffix : ""}`.trim()
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update admin!");
    }
  };

  // ─── EMAIL CHANGE (for sub-admin, done by superadmin) ────────────
  const handleSendEmailOtp = async () => {
    if (!emailForm.newEmail || !emailForm.newEmail.includes("@")) {
      setError("Enter a valid email address!"); return;
    }
    if (!emailForm.superadminPassword) {
      setError("Enter your (superadmin) current password!"); return;
    }
    setSendingOtp(true); setError("");
    try {
      await api.post("/superadmin/send-otp");
      setEmailStep("otp");
      showMsg("OTP sent to your email!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP!");
    } finally { setSendingOtp(false); }
  };

  const handleConfirmEmailChange = async () => {
    if (!emailForm.otp || emailForm.otp.length < 6) {
      setError("Enter the 6-digit OTP!"); return;
    }
    try {
      await api.put(`/superadmin/admins/${selectedAdmin.id}/change-email`, {
        superadminPassword: emailForm.superadminPassword,
        otp: emailForm.otp,
        newEmail: emailForm.newEmail,
      });
      showMsg("Admin email changed successfully!");
      setShowEmailChange(false);
      setEmailStep("form");
      setEmailForm({ newEmail: "", superadminPassword: "", otp: "" });
      fetchAdmins();
      setSelectedAdmin(prev => ({ ...prev, email: emailForm.newEmail }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change email!");
    }
  };

  // ─── CHANGE ROLE / PRIVILEGE ──────────────────────────────────────
  const openRoleModal = (admin) => {
    setRoleTarget(admin);
    setNewPrivilege(admin.privileges?.[0] || "");
    setShowRoleModal(true);
    setError("");
  };

  const handleChangeRole = async () => {
    if (!newPrivilege) { setError("Select a privilege!"); return; }
    try {
      await api.put(`/superadmin/admins/${roleTarget.id}/privileges`, [newPrivilege]);
      showMsg("Role/privilege updated!");
      setShowRoleModal(false);
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update privilege!");
    }
  };

  // ─── WARN ─────────────────────────────────────────────────────────
  const openWarn = (admin) => {
    setWarnTarget(admin);
    setWarnReason("");
    setError("");
    setShowWarn(true);
  };

  const handleWarn = async () => {
    if (!warnReason.trim()) { setError("Please enter a reason!"); return; }
    try {
      const res = await api.put(`/superadmin/admins/${warnTarget.id}/warn`, { reason: warnReason });
      showMsg(res.data.message || "Warning issued!");
      setShowWarn(false);
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to warn admin!");
    }
  };

  // ─── SUSPEND / UNSUSPEND ─────────────────────────────────────────
  const openSuspend = (admin) => {
    setSuspendTarget(admin);
    setSuspendReason("");
    setSuspendDays(30);
    setError("");
    setShowSuspend(true);
  };

  const handleSuspend = async () => {
    if (!suspendReason.trim()) { setError("Please enter a reason!"); return; }
    try {
      await api.put(`/superadmin/admins/${suspendTarget.id}/suspend`, {
        reason: suspendReason,
        durationDays: suspendDays,
      });
      showMsg("Admin suspended!");
      setShowSuspend(false);
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to suspend admin!");
    }
  };

  const handleUnsuspend = async (admin) => {
    if (!window.confirm(`Unsuspend ${admin.fullName}? Their warning count will be reset.`)) return;
    try {
      await api.put(`/superadmin/admins/${admin.id}/unsuspend`);
      showMsg("Admin reinstated!");
      fetchAdmins();
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to unsuspend!", true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Manage Admins</h2>
          <p className="text-sm text-gray-400">{admins.length} sub-admin{admins.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setError(""); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition"
        >
          <Plus size={16} /> Add Admin
        </button>
      </div>

      {/* Alerts */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <Check size={16} /> {success}
        </div>
      )}
      {error && !showCreate && !showView && !showWarn && !showSuspend && !showRoleModal && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">⚠️ {error}</div>
      )}

      {/* Privilege Legend */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <p className="text-xs font-bold text-gray-500 uppercase mb-3">Privilege Levels</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {PRIVILEGE_OPTIONS.map((p) => (
            <div key={p.value} className="text-center">
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${privilegeColor(p.value)}`}>{p.label}</span>
              <p className="text-xs text-gray-400 mt-1">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["#", "Name", "Email", "Role", "Warnings", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">Loading...</td></tr>
              ) : admins.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">No sub-admins yet</td></tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="py-3 px-4 text-gray-400 font-mono text-xs">#{admin.id}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {admin.firstName?.charAt(0)}
                        </div>
                        <p className="font-semibold text-gray-800">{admin.fullName}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-sm">{admin.email}</td>
                    <td className="py-3 px-4">
                      {admin.privileges?.length > 0 ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${privilegeColor(admin.privileges[0])}`}>
                          {getPrivilegeLabel(admin.privileges)}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-bold ${admin.warningCount >= 2 ? "text-red-600" : admin.warningCount === 1 ? "text-orange-500" : "text-gray-400"}`}>
                        {admin.warningCount}/3
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${admin.suspended ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                        {admin.suspended ? "Suspended" : "Active"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        {/* View */}
                        <button onClick={() => openView(admin)} title="View / Edit"
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition">
                          <Eye size={14} />
                        </button>
                        {/* Change Role */}
                        <button onClick={() => openRoleModal(admin)} title="Change Role"
                          className="p-1.5 text-purple-500 hover:bg-purple-50 rounded-lg transition">
                          <ShieldCheck size={14} />
                        </button>
                        {/* Warn */}
                        {!admin.suspended && (
                          <button onClick={() => openWarn(admin)} title="Issue Warning"
                            className="p-1.5 text-yellow-500 hover:bg-yellow-50 rounded-lg transition">
                            <AlertTriangle size={14} />
                          </button>
                        )}
                        {/* Suspend / Unsuspend */}
                        {admin.suspended ? (
                          <button onClick={() => handleUnsuspend(admin)} title="Reinstate Admin"
                            className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition">
                            <PlayCircle size={14} />
                          </button>
                        ) : (
                          <button onClick={() => openSuspend(admin)} title="Suspend Admin"
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition">
                            <PauseCircle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════ CREATE ADMIN MODAL ══════════════ */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-red-600" />
                <h3 className="text-lg font-bold text-gray-800">Create Sub-Admin</h3>
              </div>
              <button onClick={() => { setShowCreate(false); setError(""); }} className="p-2 hover:bg-gray-100 rounded-lg transition"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">⚠️ {error}</div>}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name *</label>
                  <input value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                    className={inputClass} placeholder="Juan" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name *</label>
                  <input value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                    className={inputClass} placeholder="Dela Cruz" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Middle Name</label>
                  <input value={form.middleName} onChange={e => setForm(p => ({ ...p, middleName: e.target.value }))}
                    className={inputClass} placeholder="Santos" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Suffix</label>
                  <select value={form.suffix} onChange={e => setForm(p => ({ ...p, suffix: e.target.value }))} className={inputClass}>
                    <option value="">None</option>
                    <option value="Jr.">Jr.</option>
                    <option value="Sr.">Sr.</option>
                    <option value="II">II</option>
                    <option value="III">III</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
                <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, "") }))}
                  className={inputClass} placeholder="09171234567" maxLength={11} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address *</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className={inputClass} placeholder="admin@carpeso.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Temporary Password *</label>
                <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className={inputClass} placeholder="Min. 8 chars, uppercase, number, special" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Assign Role / Privilege *</label>
                <select value={form.privilege} onChange={e => setForm(p => ({ ...p, privilege: e.target.value }))} className={inputClass}>
                  <option value="">Select Privilege</option>
                  {PRIVILEGE_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label} — {p.desc}</option>
                  ))}
                </select>
              </div>
              <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-xs">
                ⚠️ Login credentials will be sent to the admin's email upon creation.
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => { setShowCreate(false); setError(""); }}
                className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold">Cancel</button>
              <button onClick={handleCreate}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition">Create Admin</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ VIEW / EDIT ADMIN MODAL ══════════════ */}
      {showView && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold">
                  {selectedAdmin.firstName?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{selectedAdmin.fullName}</h3>
                  <p className="text-xs text-gray-400">{selectedAdmin.email}</p>
                </div>
              </div>
              <button onClick={() => { setShowView(false); setEditMode(false); setShowEmailChange(false); setError(""); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">⚠️ {error}</div>}

              {/* Status badges */}
              <div className="flex gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${privilegeColor(selectedAdmin.privileges?.[0])}`}>
                  {getPrivilegeLabel(selectedAdmin.privileges)}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedAdmin.suspended ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                  {selectedAdmin.suspended ? "Suspended" : "Active"}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedAdmin.warningCount >= 2 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}>
                  {selectedAdmin.warningCount}/3 warnings
                </span>
              </div>

              {/* Info or Edit form */}
              {!editMode ? (
                <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4">
                  {[
                    { label: "First Name",   value: selectedAdmin.firstName  || "—" },
                    { label: "Last Name",    value: selectedAdmin.lastName   || "—" },
                    { label: "Middle Name",  value: selectedAdmin.middleName || "—" },
                    { label: "Suffix",       value: selectedAdmin.suffix     || "—" },
                    { label: "Phone",        value: selectedAdmin.phone      || "—" },
                    { label: "Email",        value: selectedAdmin.email      || "—" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-gray-400 font-semibold uppercase">{label}</p>
                      <p className="text-sm font-semibold text-gray-800 break-all">{value}</p>
                    </div>
                  ))}
                  <div className="col-span-2 pt-2">
                    <button onClick={() => setEditMode(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition">
                      <Pencil size={14} /> Edit Details
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-gray-700">Edit Details</p>
                    <button onClick={() => { setEditMode(false); setError(""); }}
                      className="p-1 hover:bg-gray-200 rounded-lg transition"><X size={16} className="text-gray-400" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">First Name *</label>
                      <input value={editForm.firstName} onChange={e => setEditForm(p => ({ ...p, firstName: e.target.value }))}
                        className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Last Name *</label>
                      <input value={editForm.lastName} onChange={e => setEditForm(p => ({ ...p, lastName: e.target.value }))}
                        className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Middle Name</label>
                      <input value={editForm.middleName} onChange={e => setEditForm(p => ({ ...p, middleName: e.target.value }))}
                        className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Suffix</label>
                      <select value={editForm.suffix} onChange={e => setEditForm(p => ({ ...p, suffix: e.target.value }))}
                        className={inputClass}>
                        <option value="">None</option>
                        <option value="Jr.">Jr.</option>
                        <option value="Sr.">Sr.</option>
                        <option value="II">II</option>
                        <option value="III">III</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                    <input value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, "") }))}
                      className={inputClass} maxLength={11} placeholder="09171234567" />
                  </div>
                  <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-lg text-xs">
                    ℹ️ No OTP required for name/phone changes. To change email, use the button below.
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditMode(false); setError(""); }}
                      className="flex-1 py-2 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold">Cancel</button>
                    <button onClick={handleSaveEdit}
                      className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition text-sm">Save Changes</button>
                  </div>
                </div>
              )}

              {/* Change Email section (collapsible) */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => { setShowEmailChange(!showEmailChange); setEmailStep("form"); setEmailForm({ newEmail: "", superadminPassword: "", otp: "" }); setError(""); }}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
                  <span>Change Admin's Email Address</span>
                  {showEmailChange ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {showEmailChange && (
                  <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                    <div className="bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-lg text-xs">
                      ⚠️ Requires your (superadmin) password + OTP sent to your email.
                    </div>
                    {emailStep === "form" ? (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">New Email Address *</label>
                          <input type="email" value={emailForm.newEmail}
                            onChange={e => setEmailForm(p => ({ ...p, newEmail: e.target.value }))}
                            className={inputClass} placeholder="newemail@gmail.com" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Your (Superadmin) Password *</label>
                          <input type="password" value={emailForm.superadminPassword}
                            onChange={e => setEmailForm(p => ({ ...p, superadminPassword: e.target.value }))}
                            className={inputClass} placeholder="Your current password" />
                        </div>
                        <button onClick={handleSendEmailOtp} disabled={sendingOtp}
                          className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition text-sm disabled:opacity-60">
                          {sendingOtp ? "Sending OTP..." : "Send OTP to My Email"}
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-lg text-xs">
                          📧 OTP sent to your superadmin email.
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Enter OTP *</label>
                          <input type="text" value={emailForm.otp}
                            onChange={e => setEmailForm(p => ({ ...p, otp: e.target.value.replace(/\D/g, "") }))}
                            maxLength={6}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                            placeholder="000000" />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setEmailStep("form"); setEmailForm(p => ({ ...p, otp: "" })); setError(""); }}
                            className="flex-1 py-2 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold">← Back</button>
                          <button onClick={handleConfirmEmailChange} disabled={emailForm.otp.length < 6}
                            className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition text-sm disabled:opacity-60">Confirm</button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ CHANGE ROLE MODAL ══════════════ */}
      {showRoleModal && roleTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Change Role</h3>
              <button onClick={() => { setShowRoleModal(false); setError(""); }} className="p-2 hover:bg-gray-100 rounded-lg transition"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">⚠️ {error}</div>}
              <p className="text-sm text-gray-600">Changing role for: <strong>{roleTarget.fullName}</strong></p>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select New Role / Privilege *</label>
                <select value={newPrivilege} onChange={e => setNewPrivilege(e.target.value)} className={inputClass}>
                  <option value="">Select Privilege</option>
                  {PRIVILEGE_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label} — {p.desc}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => { setShowRoleModal(false); setError(""); }}
                className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold">Cancel</button>
              <button onClick={handleChangeRole}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition">Update Role</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ WARN MODAL ══════════════ */}
      {showWarn && warnTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <AlertTriangle size={18} className="text-yellow-500" /> Issue Warning
              </h3>
              <button onClick={() => { setShowWarn(false); setError(""); }} className="p-2 hover:bg-gray-100 rounded-lg transition"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">⚠️ {error}</div>}
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-xl text-sm">
                ⚠️ Warning <strong>{warnTarget.warningCount + 1}/3</strong> for <strong>{warnTarget.fullName}</strong>.
                At 3 warnings, the account is automatically suspended.
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Reason *</label>
                <textarea value={warnReason} onChange={e => setWarnReason(e.target.value)}
                  className={`${inputClass} resize-none`} rows={3} placeholder="Describe the policy violation..." />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => { setShowWarn(false); setError(""); }}
                className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold">Cancel</button>
              <button onClick={handleWarn}
                className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold transition">Issue Warning</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ SUSPEND MODAL ══════════════ */}
      {showSuspend && suspendTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <PauseCircle size={18} className="text-red-500" /> Suspend Admin
              </h3>
              <button onClick={() => { setShowSuspend(false); setError(""); }} className="p-2 hover:bg-gray-100 rounded-lg transition"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">⚠️ {error}</div>}
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                Suspending <strong>{suspendTarget.fullName}</strong>. Their account will be locked until reinstated.
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Reason *</label>
                <textarea value={suspendReason} onChange={e => setSuspendReason(e.target.value)}
                  className={`${inputClass} resize-none`} rows={3} placeholder="Describe the reason for suspension..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Duration</label>
                <select value={suspendDays} onChange={e => setSuspendDays(Number(e.target.value))} className={inputClass}>
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                  <option value={90}>90 days</option>
                  <option value={-1}>Permanent (until reviewed)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => { setShowSuspend(false); setError(""); }}
                className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold">Cancel</button>
              <button onClick={handleSuspend}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition">Suspend</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageAdmins;