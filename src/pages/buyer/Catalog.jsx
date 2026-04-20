import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Car, Search, Filter, X } from "lucide-react";
import api from "../../api/axios";

function Catalog() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [reserveForm, setReserveForm] = useState({
    deliveryAddress: "",
    deliveryNotes: "",
    paymentMode: "",
  });

  const PAYMENT_MODES = [
    "CASH",
    "GCASH",
    "MAYA",
    "BANK_TRANSFER",
    "CAR_FINANCING",
    "CREDIT_CARD",
  ];

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await api.get("/public/vehicles");
      setVehicles(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async () => {
    if (!reserveForm.deliveryAddress || !reserveForm.paymentMode) {
      setError("Please fill all required fields!");
      return;
    }
    try {
      await api.post("/buyer/reserve", {
        vehicleId: selected.id,
        deliveryAddress: reserveForm.deliveryAddress,
        deliveryNotes: reserveForm.deliveryNotes,
        paymentMode: reserveForm.paymentMode,
      });
      setSuccess("Reservation submitted successfully!");
      setShowReserveModal(false);
      setShowModal(false);
      fetchVehicles();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reserve vehicle!");
    }
  };

  const filtered = vehicles.filter((v) =>
    `${v.brand} ${v.model} ${v.year} ${v.color} ${v.categoryName}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">Browse Vehicles</h2>
        <p className="text-sm text-gray-400">
          {vehicles.length} vehicles available
        </p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
          ✅ {success}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition bg-white"
          placeholder="Search by brand, model, year, color..."
        />
      </div>

      {/* Vehicle Grid */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">
          Loading vehicles...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No vehicles found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((v) => (
            <div
              key={v.id}
              onClick={() => navigate(`/buyer/vehicles/${v.id}`)}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer"
            >
              {/* Image Placeholder */}
              <div className="bg-gray-100 h-40 flex items-center justify-center">
                <Car size={48} className="text-gray-300" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-800">
                      {v.brand} {v.model}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {v.year} • {v.color} • {v.categoryName}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${v.status === "AVAILABLE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                  >
                    {v.status}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-red-600 font-bold text-lg">
                    ₱{Number(v.price).toLocaleString()}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/buyer/vehicles/${v.id}`);
                      }}
                      className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 transition"
                    >
                      Details
                    </button>
                    {v.status === "AVAILABLE" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(v);
                          setReserveForm({
                            deliveryAddress: "",
                            deliveryNotes: "",
                            paymentMode: "",
                          });
                          setError("");
                          setShowReserveModal(true);
                        }}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition"
                      >
                        Reserve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vehicle Details Modal */}
      {showModal && selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-gray-800">
                {selected.brand} {selected.model}
              </h3>
              <button
                onClick={() => navigate(`/buyer/vehicles/${selected.id}`)}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-100 h-48 rounded-xl flex items-center justify-center">
                <Car size={64} className="text-gray-300" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Brand", value: selected.brand },
                  { label: "Model", value: selected.model },
                  { label: "Year", value: selected.year },
                  { label: "Color", value: selected.color },
                  { label: "Category", value: selected.categoryName },
                  {
                    label: "Condition",
                    value: selected.condition?.replace(/_/g, " ") || "—",
                  },
                  { label: "Fuel Type", value: selected.fuelType || "—" },
                  {
                    label: "Transmission",
                    value: selected.transmission || "—",
                  },
                  {
                    label: "Mileage",
                    value: selected.mileage
                      ? `${selected.mileage.toLocaleString()} km`
                      : "—",
                  },
                  {
                    label: "Warranty",
                    value: selected.warrantyYears
                      ? `${selected.warrantyYears} year(s)`
                      : "—",
                  },
                  { label: "Plate Number", value: selected.plateNumber || "—" },
                  { label: "Status", value: selected.status },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400 font-semibold uppercase">
                      {label}
                    </p>
                    <p className="text-sm text-gray-800 font-medium">{value}</p>
                  </div>
                ))}
              </div>
              {selected.description && (
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase mb-1">
                    Description
                  </p>
                  <p className="text-sm text-gray-600">
                    {selected.description}
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between pt-2">
                <p className="text-2xl font-bold text-red-600">
                  ₱{Number(selected.price).toLocaleString()}
                </p>
                {selected.status === "AVAILABLE" && (
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setReserveForm({
                        deliveryAddress: "",
                        deliveryNotes: "",
                        paymentMode: "",
                      });
                      setError("");
                      setShowReserveModal(true);
                    }}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition"
                  >
                    Reserve Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reserve Modal */}
      {showReserveModal && selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">
                Reserve Vehicle
              </h3>
              <button
                onClick={() => setShowReserveModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="font-bold text-gray-800">
                  {selected.brand} {selected.model}
                </p>
                <p className="text-sm text-gray-500">
                  {selected.year} • ₱{Number(selected.price).toLocaleString()}
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  ⚠️ {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                  Payment Mode *
                </label>
                <select
                  value={reserveForm.paymentMode}
                  onChange={(e) =>
                    setReserveForm((prev) => ({
                      ...prev,
                      paymentMode: e.target.value,
                    }))
                  }
                  className={inputClass}
                >
                  <option value="">Select Payment Mode</option>
                  {PAYMENT_MODES.map((p) => (
                    <option key={p} value={p}>
                      {p.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                  Delivery Address *
                </label>
                <textarea
                  value={reserveForm.deliveryAddress}
                  onChange={(e) =>
                    setReserveForm((prev) => ({
                      ...prev,
                      deliveryAddress: e.target.value,
                    }))
                  }
                  className={inputClass}
                  rows={3}
                  placeholder="Enter your complete delivery address..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">
                  Delivery Notes
                </label>
                <textarea
                  value={reserveForm.deliveryNotes}
                  onChange={(e) =>
                    setReserveForm((prev) => ({
                      ...prev,
                      deliveryNotes: e.target.value,
                    }))
                  }
                  className={inputClass}
                  rows={2}
                  placeholder="Additional notes (optional)..."
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-xs">
                ⚠️ Reservation expires in 48 hours. Admin will confirm your
                booking.
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowReserveModal(false)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleReserve}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition"
              >
                Confirm Reservation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Catalog;
