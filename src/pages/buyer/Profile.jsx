import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Eye,
  EyeOff,
  Check,
  Pencil,
  X,
  MapPin,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import api from "../../api/axios";
import usePageTitle from "../../hooks/usePageTitle";

function Profile() {
  usePageTitle("My Profile");
  const { user, login, token } = useAuth();

  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [editMode, setEditMode] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "",
    cityName: "",
    barangayName: "",
    streetNo: "",
  });
  const [newAddressBarangays, setNewAddressBarangays] = useState([]);

  const [profileData, setProfileData] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    suffix: "",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStep, setPasswordStep] = useState("form");
  const [passwordOtp, setPasswordOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Primary/Secondary ID upload state
  const [primaryIdName, setPrimaryIdName] = useState("");
  const [secondaryIdName, setSecondaryIdName] = useState("");

  useEffect(() => {
    fetchProfile();
    fetchAddresses();
    api.get("/locations/cities").then((res) => setCities(res.data.data));
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/me");
      const u = res.data.data;
      setProfileData(u);
      setForm({
        firstName: u.firstName || "",
        lastName: u.lastName || "",
        middleName: u.middleName || "",
        suffix: u.suffix || "",
        phone: u.phone || "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await api.get("/buyer/addresses");
      setSavedAddresses(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewAddressCityChange = async (cityId) => {
    const city = cities.find((c) => c.id === parseInt(cityId));
    setNewAddress((prev) => ({
      ...prev,
      cityName: city?.name || "",
      barangayName: "",
    }));
    if (cityId) {
      const res = await api.get(`/locations/barangays/${cityId}`);
      setNewAddressBarangays(res.data.data);
    }
  };

  const handleUpdateProfile = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await api.put("/buyer/profile", form);
      const updated = res.data.data;
      login({ ...user, fullName: updated.fullName }, token);
      setSuccess("Profile updated successfully!");
      setEditMode(false);
      fetchProfile();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile!");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.cityName || !newAddress.barangayName) {
      setError("Please select city and barangay!");
      return;
    }
    if (savedAddresses.length >= 5) {
      setError("Maximum 5 addresses allowed!");
      return;
    }
    setLoading(true);
    try {
      await api.post("/buyer/addresses", {
        label: newAddress.label || `Address ${savedAddresses.length + 1}`,
        cityName: newAddress.cityName,
        barangayName: newAddress.barangayName,
        streetNo: newAddress.streetNo,
      });
      setSuccess("Address added!");
      setShowAddAddressForm(false);
      setNewAddress({
        label: "",
        cityName: "",
        barangayName: "",
        streetNo: "",
      });
      setNewAddressBarangays([]);
      fetchAddresses();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add address!");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await api.delete(`/buyer/addresses/${id}`);
      fetchAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestPasswordOtp = async () => {
    if (!passwordForm.currentPassword) {
      setError("Please enter your current password first!");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match!");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setError("Password must be at least 8 characters!");
      return;
    }
    setSendingOtp(true);
    setError("");
    try {
      await api.post("/auth/forgot-password", { email: user?.email });
      setPasswordStep("otp");
      setSuccess("OTP sent to your email!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to send OTP!");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleChangePasswordWithOtp = async () => {
    if (!passwordOtp || passwordOtp.length < 6) {
      setError("Please enter the OTP!");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/verify-password-change-otp", {
        email: user?.email,
        otp: passwordOtp,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setSuccess("Password changed successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordOtp("");
      setPasswordStep("form");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password!");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {user?.fullName?.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800">
              {user?.fullName}
            </h2>
            <p className="text-gray-400 text-sm">{user?.email}</p>
            <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-semibold uppercase">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Static Info Display */}
        {profileData && !editMode && (
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
            {[
              { label: "First Name", value: profileData.firstName || "—" },
              { label: "Last Name", value: profileData.lastName || "—" },
              { label: "Middle Name", value: profileData.middleName || "—" },
              { label: "Suffix", value: profileData.suffix || "—" },
              { label: "Phone", value: profileData.phone || "—" },
              { label: "Email", value: profileData.email || "—" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-gray-400 font-semibold uppercase">
                  {label}
                </p>
                <p className="text-sm font-semibold text-gray-800">{value}</p>
              </div>
            ))}
            <div className="col-span-2 pt-2">
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition"
              >
                <Pencil size={14} /> Edit Personal Info
              </button>
            </div>
          </div>
        )}

        {/* Edit Form */}
        {editMode && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Edit Personal Info</h3>
              <button
                onClick={() => {
                  setEditMode(false);
                  setError("");
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>First Name *</label>
                <input
                  value={form.firstName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, firstName: e.target.value }))
                  }
                  className={inputClass}
                  placeholder="Juan"
                />
              </div>
              <div>
                <label className={labelClass}>Last Name *</label>
                <input
                  value={form.lastName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, lastName: e.target.value }))
                  }
                  className={inputClass}
                  placeholder="Dela Cruz"
                />
              </div>
              <div>
                <label className={labelClass}>Middle Name</label>
                <input
                  value={form.middleName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, middleName: e.target.value }))
                  }
                  className={inputClass}
                  placeholder="Santos"
                />
              </div>
              <div>
                <label className={labelClass}>Suffix</label>
                <select
                  value={form.suffix}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, suffix: e.target.value }))
                  }
                  className={inputClass}
                >
                  <option value="">None</option>
                  <option value="Jr.">Jr.</option>
                  <option value="Sr.">Sr.</option>
                  <option value="II">II</option>
                  <option value="III">III</option>
                  <option value="IV">IV</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <input
                value={form.phone}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    phone: e.target.value.replace(/\D/g, ""),
                  }))
                }
                className={inputClass}
                placeholder="09171234567"
                maxLength={11}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditMode(false);
                  setError("");
                }}
                className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProfile}
                disabled={loading}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <Check size={16} /> {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 bg-white rounded-2xl shadow-sm p-2">
        {[
          { id: "info", label: "My Info" },
          { id: "addresses", label: "Addresses" },
          { id: "ids", label: "ID Documents" },
          { id: "password", label: "Password" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setError("");
              setSuccess("");
            }}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${activeTab === tab.id ? "bg-red-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* My Info Tab */}
      {activeTab === "info" && profileData && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">Account Information</h3>
          <div className="space-y-3">
            {[
              { label: "Full Name", value: profileData.fullName || "—" },
              { label: "Email", value: profileData.email || "—" },
              { label: "Phone", value: profileData.phone || "—" },
              { label: "Role", value: profileData.role || "—" },
              {
                label: "Account Status",
                value: profileData.active ? "✅ Active" : "❌ Inactive",
              },
              {
                label: "Member Since",
                value: profileData.createdAt
                  ? new Date(profileData.createdAt).toLocaleDateString("en-PH")
                  : "—",
              },
              {
                label: "Last Login",
                value: profileData.lastLogin
                  ? new Date(profileData.lastLogin).toLocaleString("en-PH")
                  : "—",
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <p className="text-sm text-gray-500 font-semibold">{label}</p>
                <p className="text-sm font-semibold text-gray-800">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-xs">
            ℹ️ To update personal info, use the Edit button on your profile card
            above.
          </div>
        </div>
      )}

      {/* Addresses Tab */}
      {activeTab === "addresses" && (
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800">Saved Addresses</h3>
            {savedAddresses.length < 5 && (
              <button
                onClick={() => setShowAddAddressForm(!showAddAddressForm)}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition"
              >
                <Plus size={12} /> Add Address
              </button>
            )}
          </div>

          {savedAddresses.length === 0 && !showAddAddressForm && (
            <div className="text-center py-8">
              <MapPin size={32} className="mx-auto mb-2 text-gray-200" />
              <p className="text-gray-400 text-sm">No saved addresses yet</p>
              <button
                onClick={() => setShowAddAddressForm(true)}
                className="mt-3 text-red-600 font-semibold text-sm hover:underline"
              >
                + Add your first address
              </button>
            </div>
          )}

          {/* Saved Addresses List */}
          {savedAddresses.map((addr) => (
            <div
              key={addr.id}
              className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200"
            >
              <MapPin size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-800 text-sm">
                    {addr.label}
                  </p>
                  {addr.default && (
                    <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {addr.streetNo ? addr.streetNo + ", " : ""}
                  {addr.barangayName}, {addr.cityName}
                </p>
              </div>
              <button
                onClick={() => handleDeleteAddress(addr.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {/* Add Address Form */}
          {showAddAddressForm && (
            <div className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-800 text-sm">
                  New Address
                </p>
                <button
                  onClick={() => setShowAddAddressForm(false)}
                  className="p-1 hover:bg-gray-100 rounded transition"
                >
                  <X size={14} className="text-gray-400" />
                </button>
              </div>
              <input
                value={newAddress.label}
                onChange={(e) =>
                  setNewAddress((prev) => ({ ...prev, label: e.target.value }))
                }
                className={inputClass}
                placeholder="Label: Home, Office, etc."
              />
              <select
                onChange={(e) => handleNewAddressCityChange(e.target.value)}
                className={inputClass}
              >
                <option value="">Select City *</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                value={newAddress.barangayName}
                onChange={(e) =>
                  setNewAddress((prev) => ({
                    ...prev,
                    barangayName: e.target.value,
                  }))
                }
                disabled={!newAddress.cityName}
                className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-400`}
              >
                <option value="">Select Barangay *</option>
                {newAddressBarangays.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
              <input
                value={newAddress.streetNo}
                onChange={(e) =>
                  setNewAddress((prev) => ({
                    ...prev,
                    streetNo: e.target.value,
                  }))
                }
                className={inputClass}
                placeholder="Street / House No. (optional)"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddAddressForm(false)}
                  className="flex-1 py-2 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAddress}
                  disabled={loading}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition disabled:opacity-60"
                >
                  {loading ? "Saving..." : "Save Address"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ID Documents Tab */}
      {activeTab === "ids" && (
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-gray-800">ID Documents</h3>
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm">
            🪪 Upload valid government IDs for account verification. Required
            for vehicle purchases.
          </div>

          {/* Primary ID */}
          <div>
            <label className={labelClass}>Primary ID — Driver's License</label>
            {profileData?.primaryIdUrl ? (
              <div className="space-y-2">
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <img
                    src={`http://localhost:8080/api/files${profileData.primaryIdUrl.replace("/uploads", "")}`}
                    alt="Primary ID"
                    className="w-full h-40 object-contain bg-gray-50"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div className="hidden h-40 items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <p className="text-4xl">📄</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Document uploaded
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">
                    ✅ Uploaded
                  </span>
                  <label className="text-xs text-red-600 font-semibold cursor-pointer hover:underline">
                    Replace
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={async (e) => {
                        if (e.target.files[0]) {
                          const fd = new FormData();
                          fd.append("file", e.target.files[0]);
                          try {
                            await api.post("/buyer/profile/id/primary", fd, {
                              headers: {
                                "Content-Type": "multipart/form-data",
                              },
                            });
                            setSuccess("Primary ID updated!");
                            fetchProfile();
                            setTimeout(() => setSuccess(""), 3000);
                          } catch (err) {
                            setError("Failed to upload!");
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <label className="block border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-red-400 transition">
                <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500 text-sm font-semibold">
                  Upload Driver's License
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  JPG, PNG, PDF • Max 5MB
                </p>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={async (e) => {
                    if (e.target.files[0]) {
                      const fd = new FormData();
                      fd.append("file", e.target.files[0]);
                      try {
                        await api.post("/buyer/profile/id/primary", fd, {
                          headers: { "Content-Type": "multipart/form-data" },
                        });
                        setSuccess("Primary ID uploaded!");
                        fetchProfile();
                        setTimeout(() => setSuccess(""), 3000);
                      } catch (err) {
                        setError("Failed to upload!");
                      }
                    }
                  }}
                />
              </label>
            )}
          </div>

          {/* Secondary ID */}
          <div>
            <label className={labelClass}>
              Secondary ID — PhilSys / TIN / Passport
            </label>
            {profileData?.secondaryIdUrl ? (
              <div className="space-y-2">
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <img
                    src={`http://localhost:8080/api/files${profileData.secondaryIdUrl.replace("/uploads", "")}`}
                    alt="Secondary ID"
                    className="w-full h-40 object-contain bg-gray-50"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div className="hidden h-40 items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <p className="text-4xl">📄</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Document uploaded
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">
                    ✅ Uploaded
                  </span>
                  <label className="text-xs text-red-600 font-semibold cursor-pointer hover:underline">
                    Replace
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={async (e) => {
                        if (e.target.files[0]) {
                          const fd = new FormData();
                          fd.append("file", e.target.files[0]);
                          try {
                            await api.post("/buyer/profile/id/secondary", fd, {
                              headers: {
                                "Content-Type": "multipart/form-data",
                              },
                            });
                            setSuccess("Secondary ID updated!");
                            fetchProfile();
                            setTimeout(() => setSuccess(""), 3000);
                          } catch (err) {
                            setError("Failed to upload!");
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <label className="block border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-red-400 transition">
                <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500 text-sm font-semibold">
                  Upload Secondary ID
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  PhilSys, TIN, Passport, UMID • Max 5MB
                </p>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={async (e) => {
                    if (e.target.files[0]) {
                      const fd = new FormData();
                      fd.append("file", e.target.files[0]);
                      try {
                        await api.post("/buyer/profile/id/secondary", fd, {
                          headers: { "Content-Type": "multipart/form-data" },
                        });
                        setSuccess("Secondary ID uploaded!");
                        fetchProfile();
                        setTimeout(() => setSuccess(""), 3000);
                      } catch (err) {
                        setError("Failed to upload!");
                      }
                    }
                  }}
                />
              </label>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-xs">
            🔒 Your IDs are stored securely and will only be reviewed by
            authorized Carpeso staff in compliance with R.A. 10173.
          </div>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === "password" && (
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-gray-800">Change Password</h3>
          {passwordStep === "form" ? (
            <>
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm">
                🔒 For security, we'll send an OTP to your email before changing
                your password.
              </div>
              <div>
                <label className={labelClass}>Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    className={`${inputClass} pr-11`}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-2.5 text-gray-400"
                  >
                    {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className={labelClass}>New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    className={`${inputClass} pr-11`}
                    placeholder="Min. 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-2.5 text-gray-400"
                  >
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className={labelClass}>Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className={`${inputClass} pr-11 ${passwordForm.confirmPassword && passwordForm.confirmPassword === passwordForm.newPassword ? "border-green-400" : passwordForm.confirmPassword ? "border-red-400" : ""}`}
                    placeholder="Re-enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-2.5 text-gray-400"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordForm.confirmPassword && (
                  <p
                    className={`text-xs mt-1 font-semibold ${passwordForm.confirmPassword === passwordForm.newPassword ? "text-green-500" : "text-red-500"}`}
                  >
                    {passwordForm.confirmPassword === passwordForm.newPassword
                      ? "✓ Passwords match"
                      : "✗ Do not match"}
                  </p>
                )}
              </div>
              <button
                onClick={handleRequestPasswordOtp}
                disabled={sendingOtp}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition disabled:opacity-60"
              >
                {sendingOtp ? "Sending OTP..." : "Send OTP to Email"}
              </button>
            </>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm">
                📧 OTP sent to <strong>{user?.email}</strong>
              </div>
              <div>
                <label className={labelClass}>Enter OTP *</label>
                <input
                  type="text"
                  value={passwordOtp}
                  onChange={(e) =>
                    setPasswordOtp(e.target.value.replace(/\D/g, ""))
                  }
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-3xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                  placeholder="000000"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setPasswordStep("form");
                    setPasswordOtp("");
                    setError("");
                  }}
                  className="flex-1 py-3 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold"
                >
                  ← Back
                </button>
                <button
                  onClick={handleChangePasswordWithOtp}
                  disabled={loading || passwordOtp.length < 6}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition disabled:opacity-60"
                >
                  {loading ? "Changing..." : "Change Password"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Profile;
