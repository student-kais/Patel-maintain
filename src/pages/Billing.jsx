import React, { useState, useMemo } from "react";
import { useInventory } from "../context/InventoryContext";
import {
  Plus,
  Search,
  Trash2,
  FileText,
  Printer,
  CheckCircle,
  Clock,
  Calendar,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../index.css";

const Billing = () => {
  const { inventory, invoices, addInvoice, shopDetails } = useInventory();
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [serviceCharge, setServiceCharge] = useState("");

  const [vehicleNumber, setVehicleNumber] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");

  const [invoiceSearchTerm, setInvoiceSearchTerm] = useState("");
  const [historyTimeframe, setHistoryTimeframe] = useState("all");

  // Helper to check date range
  const isInTimeframe = (timestamp, timeframe) => {
    if (!timestamp) return true; // Fallback for old invoices
    const now = new Date();
    const date = new Date(timestamp);

    switch (timeframe) {
      case "today":
        return date.toDateString() === now.toDateString();
      case "week": {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return date >= oneWeekAgo;
      }
      case "month": {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);
        return date >= oneMonthAgo;
      }
      default:
        return true;
    }
  };

  // Stats calculations
  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);

    return invoices.reduce(
      (acc, inv) => {
        const invDate = inv.timestamp
          ? new Date(inv.timestamp)
          : new Date(inv.date);
        const total = Number(inv.total || 0);

        if (invDate.toDateString() === todayStr) acc.today += total;
        if (invDate >= oneWeekAgo) acc.week += total;
        if (invDate >= oneMonthAgo) acc.month += total;
        return acc;
      },
      { today: 0, week: 0, month: 0 },
    );
  }, [invoices]);

  // Filter invoices (History)
  const filteredInvoices = invoices
    .filter((inv) => {
      const matchesSearch =
        inv.customerName
          .toLowerCase()
          .includes(invoiceSearchTerm.toLowerCase()) ||
        inv.id.toLowerCase().includes(invoiceSearchTerm.toLowerCase()) ||
        (inv.vehicleNumber &&
          inv.vehicleNumber
            .toLowerCase()
            .includes(invoiceSearchTerm.toLowerCase())) ||
        (inv.customerMobile && inv.customerMobile.includes(invoiceSearchTerm));

      const matchesTimeframe = isInTimeframe(inv.timestamp, historyTimeframe);

      return matchesSearch && matchesTimeframe;
    })
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  // Items search logic (Create Invoice)
  const filteredProducts = inventory.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) && p.stock > 0,
  );

  const addToCart = (product) => {
    const existing = cart.find((c) => c.id === product.id);
    if (existing) {
      if (existing.quantity < product.stock) {
        setCart(
          cart.map((c) =>
            c.id === product.id ? { ...c, quantity: c.quantity + 1 } : c,
          ),
        );
      } else {
        alert("Not enough stock!");
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, newQty) => {
    const product = inventory.find((p) => p.id === id);
    if (newQty > product.stock) {
      alert(`Max stock available is ${product.stock}`);
      return;
    }
    if (newQty < 1) return;
    setCart(cart.map((c) => (c.id === id ? { ...c, quantity: newQty } : c)));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((c) => c.id !== id));
  };

  const calculateSubtotal = () => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + (Number(serviceCharge) || 0);
  };

  const handleCreateInvoice = () => {
    if (!customerName || cart.length === 0) return;

    addInvoice(
      cart,
      customerName,
      serviceCharge || 0,
      vehicleNumber,
      customerMobile,
    );

    // Reset form
    setCustomerName("");
    setVehicleNumber("");
    setCustomerMobile("");
    setServiceCharge("");
    setCart([]);
    setShowInvoiceForm(false);
    setInvoiceSearchTerm(""); // Reset history search on new invoice
    alert("Invoice Created Successfully!");
  };

  const downloadPDF = (invoice) => {
    const doc = new jsPDF();

    // Shop Header (Dynamic from Settings)
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    const shopName = shopDetails?.name || "Patel Auto Parts and Accessories";
    doc.text(shopName, 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const shopSubline =
      shopDetails?.subline || "Auto Rickshaw & Three-Wheeler Specialist";
    doc.text(shopSubline, 105, 26, { align: "center" });

    // Address Line if available
    if (shopDetails?.address) {
      doc.setFontSize(8);
      doc.text(shopDetails.address, 105, 30, { align: "center" });
    }

    // Line break
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 34, 196, 34);

    // Invoice Details (Left Side)
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Invoice Details:", 14, 40);
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(`Invoice ID: ${invoice.id}`, 14, 46);
    doc.text(`Date: ${invoice.date}`, 14, 51);

    // Customer Details (Right Side)
    const rightColX = 120;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Bill To:", rightColX, 40);
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(`Customer Name: ${invoice.customerName}`, rightColX, 46);

    if (invoice.customerMobile) {
      doc.text(`Mobile No: ${invoice.customerMobile}`, rightColX, 51);
    }

    // Vehicle Number logic (Handles dynamic Y position)
    let nextY = invoice.customerMobile ? 56 : 51;
    if (invoice.vehicleNumber) {
      doc.text(`Vehicle No: ${invoice.vehicleNumber}`, rightColX, nextY);
    }

    // Table
    const tableColumn = ["Item", "Quantity", "Unit Price", "Total"];
    const tableRows = [];

    invoice.items.forEach((item) => {
      const itemData = [
        item.name,
        item.quantity,
        `${item.price.toFixed(2)}`,
        `${(item.price * item.quantity).toFixed(2)}`,
      ];
      tableRows.push(itemData);
    });

    // Add Service Charge row if exists
    if (invoice.serviceCharge > 0) {
      tableRows.push([
        "Labor / Service Charge",
        "1",
        `${invoice.serviceCharge.toFixed(2)}`,
        `${invoice.serviceCharge.toFixed(2)}`,
      ]);
    }

    autoTable(doc, {
      startY: 65,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [63, 81, 181] }, // Darker Blue
      styles: { fontSize: 9 },
    });

    // Total
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Grand Total: ${invoice.total.toFixed(2)}`, 14, finalY);

    // Footer Signature
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Authorized Signature", 196, finalY + 20, { align: "right" });

    doc.save(`Invoice_${invoice.id}.pdf`);
  };

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{shopDetails.name}</h1>
          <p className="text-dim">{shopDetails.subline}</p>
          <p className="text-xs text-blue-400 mt-1">{shopDetails.address}</p>
        </div>
        <button
          className={`btn ${showInvoiceForm ? "btn-danger" : "btn-primary"}`}
          onClick={() => setShowInvoiceForm(!showInvoiceForm)}
        >
          <Plus size={18} className={showInvoiceForm ? "rotate-45" : ""} />
          {showInvoiceForm ? "Cancel" : "New Invoice"}
        </button>
      </div>

      {showInvoiceForm ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {/* Left Col: Product Selection */}
          <div className="glass-panel p-6 h-full">
            <h3 className="text-lg font-bold text-white mb-4">
              Select Products
            </h3>
            <div className="search-bar w-full mb-4">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Search parts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-white w-full"
              />
            </div>
            <div className="overflow-y-auto max-h-[400px]">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex justify-between items-center p-3 border-b border-white/10 hover:bg-white/5 rounded"
                >
                  <div>
                    <p className="font-medium text-white">{product.name}</p>
                    <p className="text-xs text-dim">
                      Stock: {product.stock} | ₹{product.price}
                    </p>
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    className="btn-xs btn-primary pt-1 pb-1"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right Col: Invoice Preview */}
          <div className="glass-panel p-6 h-full flex flex-col">
            <h3 className="text-lg font-bold text-white mb-4">
              Invoice Details
            </h3>
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1">
                <label className="text-dim text-sm block mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  className="input-glass"
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="col-span-1">
                <label className="text-dim text-sm block mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  className="input-glass"
                  placeholder="e.g. 9876543210"
                  value={customerMobile}
                  onChange={(e) => setCustomerMobile(e.target.value)}
                />
              </div>
              <div>
                <label className="text-dim text-sm block mb-1">
                  Vehicle Number
                </label>
                <input
                  type="text"
                  className="input-glass"
                  placeholder="GJ-01-AB-1234"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                />
              </div>
              <div>
                <label className="text-dim text-sm block mb-1">
                  Labor / Service Charge (₹)
                </label>
                <input
                  type="number"
                  className="input-glass"
                  placeholder="0"
                  min="0"
                  value={serviceCharge}
                  onChange={(e) => setServiceCharge(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 border border-white/10 rounded-lg p-2 min-h-[200px]">
              {cart.length === 0 ? (
                <p className="text-dim text-center mt-10">Basket is empty</p>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center py-2 border-b border-white/5"
                  >
                    <div className="flex-1">
                      <p className="text-sm text-white">{item.name}</p>
                      <p className="text-xs text-dim">₹{item.price} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        className="input-glass w-16 p-1 text-center"
                        value={item.quantity}
                        min="1"
                        onChange={(e) =>
                          updateQuantity(item.id, parseInt(e.target.value))
                        }
                      />
                      <span className="text-white font-medium text-sm w-16 text-right">
                        ₹{(item.price * item.quantity).toFixed(0)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-white/10 pt-4 mt-auto">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-dim text-sm">
                  <span>Subtotal:</span>
                  <span>₹{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-dim text-sm">
                  <span>Service Charge:</span>
                  <span>₹{Number(serviceCharge || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold text-white pt-2 border-t border-white/5">
                  <span>Grand Total:</span>
                  <span>₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={handleCreateInvoice}
                disabled={cart.length === 0 || !customerName}
                className={`btn w-full ${cart.length === 0 || !customerName ? "btn-secondary opacity-50 cursor-not-allowed" : "btn-primary"}`}
              >
                <CheckCircle size={18} /> Generate Invoice
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Invoice History List */
        <div className="space-y-6 animate-fade-in">
          {/* Timeframe Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="glass-panel p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-dim text-xs uppercase tracking-wider font-semibold">
                  Today's Revenue
                </p>
                <h3 className="text-2xl font-bold text-white">
                  ₹{stats.today.toLocaleString()}
                </h3>
              </div>
            </div>
            <div className="glass-panel p-4 flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-dim text-xs uppercase tracking-wider font-semibold">
                  Weekly Revenue
                </p>
                <h3 className="text-2xl font-bold text-white">
                  ₹{stats.week.toLocaleString()}
                </h3>
              </div>
            </div>
            <div className="glass-panel p-4 flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-lg text-green-400">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-dim text-xs uppercase tracking-wider font-semibold">
                  Monthly Revenue
                </p>
                <h3 className="text-2xl font-bold text-white">
                  ₹{stats.month.toLocaleString()}
                </h3>
              </div>
            </div>
          </div>

          <div className="glass-panel overflow-hidden">
            <div className="p-4 border-b border-white/10 flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="search-bar w-full max-w-md">
                <Search className="search-icon" size={18} />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={invoiceSearchTerm}
                  onChange={(e) => setInvoiceSearchTerm(e.target.value)}
                  className="bg-transparent border-none outline-none text-white w-full"
                />
              </div>

              <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                {["all", "today", "week", "month"].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setHistoryTimeframe(tf)}
                    className={`px-4 py-1.5 rounded-md text-sm transition-all capitalize ${
                      historyTimeframe === tf
                        ? "bg-blue-600 text-white shadow-lg"
                        : "text-dim hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
            <div className="table-container">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-4">Invoice ID</th>
                    <th className="text-left p-4">Date</th>
                    <th className="text-left p-4">Customer</th>
                    <th className="text-left p-4">Mobile</th>
                    <th className="text-left p-4">Vehicle No</th>
                    <th className="text-left p-4">Amount</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center p-8 text-dim">
                        No invoices found.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <tr
                        key={inv.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="p-4 text-white font-mono text-sm">
                          {inv.id}
                        </td>
                        <td className="p-4 text-dim text-sm">{inv.date}</td>
                        <td className="p-4 text-white font-medium">
                          {inv.customerName}
                        </td>
                        <td className="p-4 text-dim text-sm">
                          {inv.customerMobile || "-"}
                        </td>
                        <td className="p-4 text-dim text-sm">
                          {inv.vehicleNumber || "-"}
                        </td>
                        <td className="p-4 text-green-400 font-bold">
                          ₹{inv.total.toFixed(2)}
                        </td>
                        <td className="p-4">
                          <span className="badge badge-success text-xs">
                            Paid
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => downloadPDF(inv)}
                            className="icon-btn text-blue-400 hover:bg-blue-500/20"
                            title="Download PDF"
                          >
                            <FileText size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
