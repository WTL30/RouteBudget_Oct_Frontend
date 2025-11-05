
// "use client";
// import { useState, useEffect, useMemo, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import { Menu, X, LogOut, Truck } from "lucide-react";
// import { MdOutlineAssignmentTurnedIn, MdDashboard } from "react-icons/md";
// import { RiMoneyRupeeCircleLine } from "react-icons/ri";
// import { FiUser, FiTruck, FiSettings, FiBookmark, FiCheckSquare } from "react-icons/fi";
// import { FaFileInvoice } from "react-icons/fa";
// import { BsFillTaxiFrontFill } from "react-icons/bs";
"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, LogOut, Truck, ChevronDown, ChevronUp } from "lucide-react";
import { MdOutlineAssignmentTurnedIn, MdDashboard } from "react-icons/md";
import { RiMoneyRupeeCircleLine } from "react-icons/ri";
import { FiUser, FiTruck, FiSettings, FiBookmark, FiCheckSquare , FiBriefcase} from "react-icons/fi";
import { FaFileInvoice } from "react-icons/fa";
import { BsFillTaxiFrontFill } from "react-icons/bs";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import axios from "axios";
import baseURL from "@/utils/api"; // adjust if needed

const Sidebar = ({ subscription: propSubscription }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [activeItem, setActiveItem] = useState("/AdminDashboard");
  const [subscription, setSubscription] = useState(propSubscription || null);
  const [vehicleDropdownOpen, setVehicleDropdownOpen] = useState(false);
  const router = useRouter();

  // Read localStorage subscription (fast) and then fetch server to ensure fresh
  useEffect(() => {
    // if parent passed subscription prop, prefer that initially
    const fromLocal = localStorage.getItem("subscription");
    if (!propSubscription && fromLocal) {
      try {
        setSubscription(JSON.parse(fromLocal));
      } catch (e) {
        setSubscription(null);
      }
    } else if (propSubscription) {
      setSubscription(propSubscription);
      try { localStorage.setItem("subscription", JSON.stringify(propSubscription)); } catch { }
    }
  }, [propSubscription]);

  // fetch subadmin basic info + latest subscription if available
  useEffect(() => {
    const id = localStorage.getItem("id");
    const token = localStorage.getItem("token");
    if (!id) return;

    const fetch = async () => {
      try {
        const res = await axios.get(`${baseURL}api/admin/getSubAdmin/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        // Standardize subscription extraction
        let sub = null;
        if (res?.data?.subAdmin?.subscription) sub = res.data.subAdmin.subscription;
        else if (res?.data?.subscription) sub = res.data.subscription;
        else if (res?.data?.subAdmin?.subscriptionType || res?.data?.subscriptionType) {
          const t = res.data.subAdmin?.subscriptionType || res.data.subscriptionType;
          sub = { type: t, startDate: res.data.subAdmin?.subscriptionStart || res.data.subscriptionStart, endDate: res.data.subAdmin?.subscriptionEnd || res.data.subscriptionEnd };
        }

        // Normalize "[null]" -> "null" string
        if (!sub || sub.type === "[null]" || sub.type === null) {
          sub = { type: "null", startDate: null, endDate: null };
        }

        setSubscription(sub);
        try { localStorage.setItem("subscription", JSON.stringify(sub)); } catch { }
        // set company info
        const sAdmin = res.data.subAdmin;
        if (sAdmin) {
          setCompanyName(sAdmin.name || "FleetView");
          setCompanyEmail(sAdmin.email || "admin@example.com");
        }
      } catch (err) {
        console.error("Sidebar fetch error:", err);
      }
    };

    fetch();
  }, []);

  useEffect(() => {
    setIsOpen(window.innerWidth >= 1024);
    const handleResize = () => setIsOpen(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setActiveItem(window.location.pathname);
  }, []);

  const menuItems = useMemo(
    () => [
      { icon: <MdDashboard size={20} />, label: "Dashboard", link: "/AdminDashboard" },
      { icon: <FiUser size={20} />, label: "Driver Details", link: "/DriverDetails" },
      { 
        icon: <BsFillTaxiFrontFill size={20} />, 
        label: "Vehicle", 
        isDropdown: true,
        subItems: [
          { icon: <BsFillTaxiFrontFill size={18} />, label: "Vehicle Details", link: "/CabDetails" },
          { icon: <MdOutlineAssignmentTurnedIn size={18} />, label: "Assign Vehicle", link: "/AssignCab" },
          { icon: <FiTruck size={18} />, label: "Trip Status", link: "/CabInfo" },
        ]
      },
      { icon: <FiCheckSquare size={20} />, label: "Attendance", link: "/Attendance" },
      { icon: <RiMoneyRupeeCircleLine size={20} />, label: "Advance Salary", link: "/AdvanceSalary" },
      { icon: <FiBriefcase size={20} />, label: "My Bookings", link: "/MyBookings" },
      { icon: <FiTruck size={20} />, label: "Tracking", link: "/GPSTracking" },
      { icon: <FiSettings size={20} />, label: "Servicing", link: "/Servicing" },
      { icon: <RiMoneyRupeeCircleLine size={20} />, label: "FastTag Recharge", link: "/FastTagPayments" },
      { icon: <RiMoneyRupeeCircleLine size={20} />, label: "Expenses", link: "/Expensive" },
      { icon: <FiSettings size={20} />, label: "Maintenance", link: "/PredictiveMaintenance" },
      { icon: <FaFileInvoice size={20} />, label: "Invoice", link: "/InvoicePDF" },
    ],
    []
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    localStorage.removeItem("subscription");
    toast.success("Logout successful!");
    router.push("/components/login");
  };

  // Decide if other tabs should be enabled
  const otherTabsEnabled = (() => {
    if (!subscription) return false;
    const type = subscription.type;
    if (type === "paid") return true;
    if (type === "trial") {
      if (!subscription.endDate) return false;
      const end = new Date(subscription.endDate);
      return end > new Date();
    }
    return false; // "null" or anything else
  })();

  // Helper: prewarm route and data for instant loads (also exposed globally for safety)
  const localPrewarm = useCallback(async (path) => {
    try {
      if (router && typeof router.prefetch === "function") {
        try { router.prefetch(path) } catch {}
      }
      const id = localStorage.getItem("id");
      const token = localStorage.getItem("token");
      if (!id) return;
      const lastPrefetch = Number(localStorage.getItem("_sub_prefetch_ts") || 0);
      const now = Date.now();
      if (now - lastPrefetch < 800) return; // shorter throttle for hover

      // Always prewarm subscription, used across pages
      const res = await axios.get(`${baseURL}api/admin/getSubAdmin/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      let sub = null;
      if (res?.data?.subAdmin?.subscription) sub = res.data.subAdmin.subscription;
      else if (res?.data?.subscription) sub = res.data.subscription;
      else if (res?.data?.subAdmin?.subscriptionType || res?.data?.subscriptionType) {
        const t = res.data.subAdmin?.subscriptionType || res.data.subscriptionType;
        sub = {
          type: t,
          startDate: res.data.subAdmin?.subscriptionStart || res.data.subscriptionStart,
          endDate: res.data.subAdmin?.subscriptionEnd || res.data.subscriptionEnd,
        };
      }
      if (!sub || sub.type === "[null]" || sub.type === null) {
        sub = { type: "null", startDate: null, endDate: null };
      }
      try {
        localStorage.setItem("subscription", JSON.stringify(sub));
        localStorage.setItem("_sub_prefetch_ts", String(now));
      } catch {}

      // Page-specific API prewarm map
      const apiMap = {
        "/AdminDashboard": [
          `${baseURL}api/cabDetails`,
          `${baseURL}api/driver/profile`,
          `${baseURL}api/cabs/cabExpensive`,
        ],
        "/DriverDetails": [
          `${baseURL}api/driver/profile`,
        ],
        "/CabDetails": [
          `${baseURL}api/cabDetails`,
        ],
        "/CabInfo": [
          `${baseURL}api/cabDetails`,
        ],
        "/AssignCab": [
          `${baseURL}api/assigncab`,
          `${baseURL}api/assigncab/freeCabsAndDrivers`,
        ],
        "/Servicing": [
          `${baseURL}api/servicing`,
        ],
        // These pages often render fast or are static; skip heavy prewarm unless required
        "/FastTagPayments": [],
        "/GPSTracking": [],
        "/PredictiveMaintenance": [],
        "/InvoicePDF": [],
      };

      const toPrefetch = apiMap[path] || [];
      // Fire in parallel, cache simple results to localStorage
      await Promise.allSettled(
        toPrefetch.map(async (url) => {
          try {
            const r = await axios.get(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
            // cache by a stable key
            if (url.endsWith("/cabDetails")) {
              localStorage.setItem("cache:cabDetails", JSON.stringify(r.data));
            } else if (url.endsWith("/driver/profile")) {
              localStorage.setItem("cache:drivers", JSON.stringify(r.data));
            } else if (url.endsWith("/assigncab")) {
              localStorage.setItem("cache:assigncab", JSON.stringify(r.data));
            } else if (url.endsWith("/freeCabsAndDrivers")) {
              localStorage.setItem("cache:freeCabsAndDrivers", JSON.stringify(r.data));
            } else if (url.endsWith("/servicing")) {
              localStorage.setItem("cache:servicing", JSON.stringify(r.data));
            } else if (url.endsWith("/cabExpensive")) {
              // API returns { success, data: [...] }
              const data = r.data?.data || r.data || [];
              localStorage.setItem("cache:expenses", JSON.stringify(data));
            }
          } catch {}
        })
      );
    } catch {}
  }, [router]);

  // Expose a single global safe prewarm to avoid ReferenceErrors across pages
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__prewarm = (path) => {
        // guard if redefined elsewhere
        try { return localPrewarm(path) } catch {}
      };
    }
  }, [localPrewarm]);

  // Idle-time background prefetch/compile hot routes (dev QoL)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hotRoutes = [
      "/AdminDashboard",
      "/DriverDetails",
      "/CabDetails",
      "/CabInfo",
      "/AssignCab",
      "/Servicing",
      "/FastTagPayments",
      "/GPSTracking",
      "/PredictiveMaintenance",
      "/InvoicePDF",
    ];
    let cancelled = false;
    const schedule = (i) => {
      if (i >= hotRoutes.length || cancelled) return;
      const cb = () => {
        const path = hotRoutes[i];
        // Prefetch route and prewarm APIs with small stagger
        window.__prewarm?.(path);
        schedule(i + 1);
      };
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(cb, { timeout: 2000 });
      } else {
        setTimeout(cb, 800);
      }
    };
    schedule(0);
    return () => { cancelled = true; };
  }, [localPrewarm]);

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 p-4 flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Truck className="h-6 w-6 text-yellow-400" />
          <span className="text-white text-lg font-bold">{companyName}</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-white text-2xl">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <aside className={`fixed z-40 h-screen transition-all duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="h-full w-64 flex flex-col bg-gray-900 shadow-lg border-r border-gray-700">
          <div className="hidden lg:flex items-center gap-3 px-6 py-4 border-b border-gray-700">
            <Truck className="h-8 w-8 text-yellow-400" />
            <span className="text-white text-xl font-bold">{companyName}</span>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {/* Subscription always clickable */}
              <li>
                <button
                  onClick={() => {
                    setActiveItem("/Subscription");
                    router.push("/Subscription");
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                  onMouseEnter={() => window.__prewarm?.("/Subscription")}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${activeItem === "/Subscription" ? "bg-yellow-400 text-gray-900 font-semibold" : "text-gray-300 hover:bg-gray-800 hover:text-white"}`}
                >
                  <span className="relative">
                    <svg
                      className="w-5 h-5"
                      fill={activeItem === "/Subscription" ? "white" : "currentColor"}
                      viewBox="0 0 24 24"
                      style={{
                        filter: activeItem === "/Subscription"
                          ? "drop-shadow(0 0 3px white)"
                          : "none"
                      }}
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    {activeItem === "/Subscription" && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-yellow-400 opacity-75"></span>
                      </span>
                    )}
                  </span>
                  <span className="text-sm">Subscription</span>
                </button>
              </li>

              {menuItems.map((item, i) => {
                if (item.isDropdown) {
                  // Vehicle dropdown
                  return (
                    <li key={i}>
                      <button
                        disabled={!otherTabsEnabled}
                        onClick={() => {
                          if (!otherTabsEnabled) return;
                          setVehicleDropdownOpen(!vehicleDropdownOpen);
                        }}
                        className={`w-full flex items-center justify-between gap-3 p-3 rounded-lg transition-all duration-200 ${
                          !otherTabsEnabled
                            ? "text-gray-500 cursor-not-allowed opacity-50"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400">{item.icon}</span>
                          <span className="text-sm">{item.label}</span>
                        </div>
                        {vehicleDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {vehicleDropdownOpen && otherTabsEnabled && (
                        <ul className="ml-6 mt-1 space-y-1">
                          {item.subItems.map((subItem, j) => {
                            const isActive = activeItem === subItem.link;
                            return (
                              <li key={j}>
                                <button
                                  onClick={() => {
                                    setActiveItem(subItem.link);
                                    router.push(subItem.link);
                                    if (window.innerWidth < 1024) setIsOpen(false);
                                  }}
                                  onMouseEnter={() => window.__prewarm?.(subItem.link)}
                                  className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-200 ${
                                    isActive
                                      ? "bg-yellow-400 text-gray-900 font-semibold"
                                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                  }`}
                                >
                                  <span className={`${isActive ? "text-gray-900" : "text-gray-400"}`}>{subItem.icon}</span>
                                  <span className="text-sm">{subItem.label}</span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                }
                
                // Regular menu item
                const isActive = activeItem === item.link;
                return (
                  <li key={i}>
                    <button
                      disabled={!otherTabsEnabled}
                      onClick={() => {
                        if (!otherTabsEnabled) return;
                        setActiveItem(item.link);
                        router.push(item.link);
                        if (window.innerWidth < 1024) setIsOpen(false);
                      }}
                      onMouseEnter={() => window.__prewarm?.(item.link)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${isActive
                          ? "bg-yellow-400 text-gray-900 font-semibold"
                          : !otherTabsEnabled
                            ? "text-gray-500 cursor-not-allowed opacity-50"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                        }`}
                    >
                      <span className={`${isActive ? "text-gray-900" : "text-gray-400"}`}>{item.icon}</span>
                      <span className="text-sm">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center gap-3 mb-3 p-2">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">{(companyName || "F")[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{companyName}</p>
                <p className="text-gray-400 text-xs truncate">{companyEmail}</p>
              </div>
            </div>
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Logout</span>
            </motion.button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
