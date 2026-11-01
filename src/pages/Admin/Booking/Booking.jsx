import { useEffect, useRef, useState } from "react";
import {
    FaTrash,
    FaEye,
    FaTimes,
    FaExternalLinkAlt,
    FaEdit,
    FaSearch,
} from "react-icons/fa";
import Swal from "sweetalert2";
import {
    getAllBookingsCms,
    searchBookingsCms,
    deleteBooking,
    getHeliBookingDocuments,
    updateBookingStatusCms,
    createBookingCms,
    getPackages,
    getPackagePricingTiers,
    initiatePayment,
    getVehicles,
    getPackagesByCategory,
} from "../../../api/BackendApi";
import "./Booking.css";
import Navbar from "../../../components/Navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Pagination from "../../../components/Pagination/Pagination";

const Booking = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalBookings, setTotalBookings] = useState(0);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const requestIdRef = useRef(0);

    // Dropdown Data States
    const [packagesList, setPackagesList] = useState([]);
    const [pricingTiersList, setPricingTiersList] = useState([]);
    const [vehiclesList, setVehiclesList] = useState([]);
    const [heliPackagesList, setHeliPackagesList] = useState([]);
    const [heliPricingTiersList, setHeliPricingTiersList] = useState([]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.trim());
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    const handleSearchChange = (event) => {
        requestIdRef.current += 1;
        setSearch(event.target.value);
        setPage(1);
        setLoading(true);
    };

    const clearSearch = () => {
        requestIdRef.current += 1;
        setSearch("");
        setDebouncedSearch("");
        setPage(1);
        setLoading(true);
    };

    // HELI DOCUMENT MODAL
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [heliDocuments, setHeliDocuments] = useState([]);
    const [documentLoading, setDocumentLoading] = useState(false);

    // PACKAGE DETAIL MODAL
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedDetailBooking, setSelectedDetailBooking] = useState(null);

    // UPDATE STATUS MODAL
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusBooking, setStatusBooking] = useState(null);
    const [bookingStatus, setBookingStatus] = useState("PENDING");
    const [paymentStatus, setPaymentStatus] = useState("PENDING");
    const [savingStatus, setSavingStatus] = useState(false);

    // CREATE BOOKING MODAL & FORM STATE
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [submittingCreate, setSubmittingCreate] = useState(false);
    const [createForm, setCreateForm] = useState({
        booking_type: "PACKAGE",
        package_id: "",
        pricing_tier_id: "",
        number_of_people: 1,
        start_date: "",
        end_date: "",
        frontend_total_amount: "",
        applicant: {
            full_name: "",
            email: "",
            phone_whatsapp: "",
            nationality: "",
            pickup_hotel: "",
            dietary_health_notes: "",
            document: null,
        },
    });

    // CREATE VEHICLE BOOKING MODAL & FORM STATE (Package & Pricing Tier removed)
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [submittingVehicle, setSubmittingVehicle] = useState(false);
    const [vehicleForm, setVehicleForm] = useState({
        booking_type: "VEHICLE",
        vehicle_id: "",
        route_id: "",
        number_of_people: 1,
        start_date: "",
        end_date: "",
        frontend_total_amount: "",
        applicant: {
            full_name: "",
            email: "",
            phone_whatsapp: "",
            nationality: "",
            pickup_hotel: "",
            dietary_health_notes: "",
            document: null,
        },
    });

    // CREATE HELI BOOKING MODAL & FORM STATE
    const [showHeliModal, setShowHeliModal] = useState(false);
    const [submittingHeli, setSubmittingHeli] = useState(false);
    const [heliForm, setHeliForm] = useState({
        booking_type: "HELI",
        package_id: "",
        pricing_tier_id: "",
        number_of_people: 1,
        start_date: "",
        end_date: "",
        frontend_total_amount: "",
        travellers: [],
    });

    // Fetch packages and vehicles list on mount safely in parallel
    useEffect(() => {
        const fetchInitialOptions = async () => {
            Promise.all([
                getPackages()
                    .then((res) => {
                        const packagesData = Array.isArray(res.data?.data?.data)
                            ? res.data.data.data
                            : Array.isArray(res.data?.data)
                                ? res.data.data
                                : Array.isArray(res.data)
                                    ? res.data
                                    : [];
                        setPackagesList(packagesData);
                    })
                    .catch((err) => {
                        console.error("Failed to fetch packages", err);
                        setPackagesList([]);
                    }),

                getVehicles()
                    .then((resVehicles) => {
                        const vehiclesData = Array.isArray(resVehicles.data?.data?.data)
                            ? resVehicles.data.data.data
                            : Array.isArray(resVehicles.data?.data)
                                ? resVehicles.data.data
                                : Array.isArray(resVehicles.data)
                                    ? res.data
                                    : [];
                        setVehiclesList(vehiclesData);
                    })
                    .catch((err) => {
                        console.error("Failed to fetch vehicles", err);
                        setVehiclesList([]);
                    })
            ]);
        };
        fetchInitialOptions();
    }, []);

    // Fetch pricing tiers when package_id changes for Package Booking
    useEffect(() => {
        const fetchTiers = async () => {
            if (!createForm.package_id) {
                setPricingTiersList([]);
                return;
            }
            try {
                const res = await getPackagePricingTiers(createForm.package_id);
                const tiersData = Array.isArray(res.data?.data)
                    ? res.data.data
                    : Array.isArray(res.data)
                        ? res.data
                        : [];
                setPricingTiersList(tiersData);
            } catch (err) {
                console.error("Failed to fetch pricing tiers", err);
                setPricingTiersList([]);
            }
        };
        fetchTiers();
    }, [createForm.package_id]);

    // Fetch pricing tiers when package_id changes for Heli Booking
    useEffect(() => {
        const fetchHeliTiers = async () => {
            if (!heliForm.package_id) {
                setHeliPricingTiersList([]);
                return;
            }
            try {
                const res = await getPackagePricingTiers(heliForm.package_id);
                const tiersData = Array.isArray(res.data?.data)
                    ? res.data.data
                    : Array.isArray(res.data)
                        ? res.data
                        : [];
                setHeliPricingTiersList(tiersData);
            } catch (err) {
                console.error("Failed to fetch heli pricing tiers", err);
                setHeliPricingTiersList([]);
            }
        };
        fetchHeliTiers();
    }, [heliForm.package_id]);

    // Automatically calculate total amount for Package Booking
    useEffect(() => {
        if (createForm.pricing_tier_id) {
            const selectedTier = pricingTiersList.find(
                (tier) => String(tier.id) === String(createForm.pricing_tier_id)
            );
            if (selectedTier) {
                const unitPrice = Number(selectedTier.price_npr) || 0;
                const peopleCount = Number(createForm.number_of_people) || 1;
                const calculatedTotal = unitPrice * peopleCount;
                setCreateForm((prev) => ({
                    ...prev,
                    frontend_total_amount: calculatedTotal,
                }));
            }
        } else {
            setCreateForm((prev) => ({
                ...prev,
                frontend_total_amount: "",
            }));
        }
    }, [createForm.pricing_tier_id, createForm.number_of_people, pricingTiersList]);

    // Get routes for the currently selected vehicle in the modal directly from vehiclesList state without extra API calls
    const selectedVehicleObj = vehiclesList.find(
        (v) => String(v.id) === String(vehicleForm.vehicle_id)
    );
    const availableRoutes = Array.isArray(selectedVehicleObj?.routes)
        ? selectedVehicleObj.routes
        : [];

    // Automatically calculate total amount for Vehicle Booking based on route price and number of people
    useEffect(() => {
        if (vehicleForm.route_id) {
            const selectedRoute = availableRoutes.find(
                (route) => String(route.id) === String(vehicleForm.route_id)
            );
            if (selectedRoute && selectedRoute.price) {
                const unitPrice = Number(selectedRoute.price) || 0;
                const peopleCount = Number(vehicleForm.number_of_people) || 1;
                const calculatedTotal = unitPrice * peopleCount;
                setVehicleForm((prev) => ({
                    ...prev,
                    frontend_total_amount: calculatedTotal,
                }));
            }
        } else {
            setVehicleForm((prev) => ({
                ...prev,
                frontend_total_amount: "",
            }));
        }
    }, [vehicleForm.route_id, vehicleForm.number_of_people, vehiclesList, availableRoutes]);

    // Automatically initialize heli travellers array when number of people changes
    useEffect(() => {
        const count = Number(heliForm.number_of_people) || 1;
        setHeliForm((prev) => {
            const currentTravellers = [...prev.travellers];
            if (currentTravellers.length < count) {
                for (let i = currentTravellers.length; i < count; i++) {
                    currentTravellers.push({
                        name: "",
                        nationality: "",
                        identity_number: "",
                        weight: "",
                        luggage: "",
                        email: "",
                        whatsapp_phone: "",
                        preferred_flight_date: "",
                        pickup_hotel: "",
                        passport_nid_image: null,
                        pp_size_photo: null,
                        confirmed_flight_ticket_image: null,
                        travel_insurance_image: null,
                    });
                }
            } else if (currentTravellers.length > count) {
                currentTravellers.splice(count);
            }
            return { ...prev, travellers: currentTravellers };
        });
    }, [heliForm.number_of_people]);

    // Automatically calculate total amount for Heli Booking based on selected pricing tier and number of people
    useEffect(() => {
        if (heliForm.pricing_tier_id) {
            const selectedTier = heliPricingTiersList.find(
                (tier) => String(tier.id) === String(heliForm.pricing_tier_id)
            );
            if (selectedTier) {
                const unitPrice = Number(selectedTier.price_npr) || 0;
                const peopleCount = Number(heliForm.number_of_people) || 1;
                const calculatedTotal = unitPrice * peopleCount;
                setHeliForm((prev) => ({
                    ...prev,
                    frontend_total_amount: calculatedTotal,
                }));
            }
        } else {
            setHeliForm((prev) => ({
                ...prev,
                frontend_total_amount: "",
            }));
        }
    }, [heliForm.pricing_tier_id, heliForm.number_of_people, heliPricingTiersList]);

    const handleOpenCreateModal = () => {
        setCreateForm({
            booking_type: "PACKAGE",
            package_id: "",
            pricing_tier_id: "",
            number_of_people: 1,
            start_date: "",
            end_date: "",
            frontend_total_amount: "",
            applicant: {
                full_name: "",
                email: "",
                phone_whatsapp: "",
                nationality: "",
                pickup_hotel: "",
                dietary_health_notes: "",
                document: null,
            },
        });
        setPricingTiersList([]);
        setShowCreateModal(true);
    };

    const handleCloseCreateModal = () => {
        if (submittingCreate) return;
        setShowCreateModal(false);
    };

    const handleOpenVehicleModal = () => {
        setVehicleForm({
            booking_type: "VEHICLE",
            vehicle_id: "",
            route_id: "",
            number_of_people: 1,
            start_date: "",
            end_date: "",
            frontend_total_amount: "",
            applicant: {
                full_name: "",
                email: "",
                phone_whatsapp: "",
                nationality: "",
                pickup_hotel: "",
                dietary_health_notes: "",
                document: null,
            },
        });
        setShowVehicleModal(true);
    };

    const handleCloseVehicleModal = () => {
        if (submittingVehicle) return;
        setShowVehicleModal(false);
    };

    const handleOpenHeliModal = async () => {
        setHeliForm({
            booking_type: "HELI",
            package_id: "",
            pricing_tier_id: "",
            number_of_people: 1,
            start_date: "",
            end_date: "",
            frontend_total_amount: "",
            travellers: [{
                name: "",
                nationality: "",
                identity_number: "",
                weight: "",
                luggage: "",
                email: "",
                whatsapp_phone: "",
                preferred_flight_date: "",
                pickup_hotel: "",
                passport_nid_image: null,
                pp_size_photo: null,
                confirmed_flight_ticket_image: null,
                travel_insurance_image: null,
            }],
        });
        setHeliPricingTiersList([]);
        setShowHeliModal(true);

        try {
            const res = await getPackagesByCategory("Heli Services");
            const packagesData = Array.isArray(res.data?.data?.data)
                ? res.data.data.data
                : Array.isArray(res.data?.data)
                    ? res.data.data
                    : Array.isArray(res.data)
                        ? res.data
                        : [];
            setHeliPackagesList(packagesData);
        } catch (err) {
            console.error("Failed to fetch heli packages by category", err);
            setHeliPackagesList([]);
        }
    };

    const handleCloseHeliModal = () => {
        if (submittingHeli) return;
        setShowHeliModal(false);
    };

    const handleCreateInputChange = (e) => {
        const { name, value } = e.target;
        setCreateForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleApplicantInputChange = (e) => {
        const { name, value } = e.target;
        setCreateForm((prev) => ({
            ...prev,
            applicant: { ...prev.applicant, [name]: value },
        }));
    };

    const handleApplicantFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setCreateForm((prev) => ({
            ...prev,
            applicant: { ...prev.applicant, document: file },
        }));
    };

    const handleVehicleInputChange = (e) => {
        const { name, value } = e.target;
        setVehicleForm((prev) => {
            const updated = { ...prev, [name]: value };
            if (name === "vehicle_id") {
                updated.route_id = "";
            }
            return updated;
        });
    };

    const handleVehicleApplicantInputChange = (e) => {
        const { name, value } = e.target;
        setVehicleForm((prev) => ({
            ...prev,
            applicant: { ...prev.applicant, [name]: value },
        }));
    };

    const handleVehicleApplicantFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setVehicleForm((prev) => ({
            ...prev,
            applicant: { ...prev.applicant, document: file },
        }));
    };

    const handleHeliInputChange = (e) => {
        const { name, value } = e.target;
        setHeliForm((prev) => {
            const updated = { ...prev, [name]: value };
            if (name === "package_id") {
                updated.pricing_tier_id = "";
            }
            return updated;
        });
    };

    const handleHeliTravellerFieldChange = (index, field, value) => {
        setHeliForm((prev) => {
            const updatedTravellers = [...prev.travellers];
            updatedTravellers[index] = {
                ...updatedTravellers[index],
                [field]: value,
            };
            return { ...prev, travellers: updatedTravellers };
        });
    };

    const handleHeliTravellerFileChange = (index, field, file) => {
        setHeliForm((prev) => {
            const updatedTravellers = [...prev.travellers];
            updatedTravellers[index] = {
                ...updatedTravellers[index],
                [field]: file,
            };
            return { ...prev, travellers: updatedTravellers };
        });
    };

    const handleCreateFormSubmit = async (e) => {
        e.preventDefault();
        setSubmittingCreate(true);

        const formData = new FormData();
        formData.append("booking_type", createForm.booking_type);
        formData.append("number_of_people", createForm.number_of_people);
        formData.append("start_date", createForm.start_date);
        if (createForm.end_date) formData.append("end_date", createForm.end_date);
        formData.append("frontend_total_amount", createForm.frontend_total_amount);

        if (createForm.package_id) formData.append("package_id", createForm.package_id);
        if (createForm.pricing_tier_id) formData.append("pricing_tier_id", createForm.pricing_tier_id);

        Object.keys(createForm.applicant).forEach((key) => {
            if (createForm.applicant[key] !== null && createForm.applicant[key] !== "") {
                formData.append(`applicant[${key}]`, createForm.applicant[key]);
            }
        });

        try {
            const response = await createBookingCms(formData);
            if (response.data?.status) {
                const newBooking = response.data.data;
                const bookingId = newBooking?.id;

                if (bookingId) {
                    try {
                        await initiatePayment({
                            booking_id: bookingId,
                            provider: "PAYLATER",
                        });
                    } catch (payError) {
                        console.error("Payment initiation error:", payError);
                    }
                }

                await Swal.fire({
                    icon: "success",
                    title: "Created",
                    text: response.data.message || "Booking created successfully.",
                    confirmButtonColor: "#351255",
                });
                setShowCreateModal(false);
                fetchBookings();
            }
        } catch (error) {
            console.error("Booking create error:", error);
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: error.response?.data?.message || "Unable to create booking.",
                confirmButtonColor: "#351255",
            });
        } finally {
            setSubmittingCreate(false);
        }
    };

    const handleVehicleFormSubmit = async (e) => {
        e.preventDefault();
        setSubmittingVehicle(true);

        const formData = new FormData();
        formData.append("booking_type", vehicleForm.booking_type);
        formData.append("number_of_people", vehicleForm.number_of_people);
        formData.append("start_date", vehicleForm.start_date);
        if (vehicleForm.end_date) formData.append("end_date", vehicleForm.end_date);
        formData.append("frontend_total_amount", vehicleForm.frontend_total_amount);

        if (vehicleForm.vehicle_id) formData.append("vehicle_id", vehicleForm.vehicle_id);
        if (vehicleForm.route_id) formData.append("route_id", vehicleForm.route_id);

        Object.keys(vehicleForm.applicant).forEach((key) => {
            if (vehicleForm.applicant[key] !== null && vehicleForm.applicant[key] !== "") {
                formData.append(`applicant[${key}]`, vehicleForm.applicant[key]);
            }
        });

        try {
            const response = await createBookingCms(formData);
            if (response.data?.status) {
                const newBooking = response.data.data;
                const bookingId = newBooking?.id;

                if (bookingId) {
                    try {
                        await initiatePayment({
                            booking_id: bookingId,
                            provider: "PAYLATER",
                        });
                    } catch (payError) {
                        console.error("Vehicle payment initiation error:", payError);
                    }
                }

                await Swal.fire({
                    icon: "success",
                    title: "Created",
                    text: response.data.message || "Vehicle booking created successfully.",
                    confirmButtonColor: "#351255",
                });
                setShowVehicleModal(false);
                fetchBookings();
            }
        } catch (error) {
            console.error("Vehicle booking create error:", error);
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: error.response?.data?.message || "Unable to create vehicle booking.",
                confirmButtonColor: "#351255",
            });
        } finally {
            setSubmittingVehicle(false);
        }
    };

    const handleHeliFormSubmit = async (e) => {
        e.preventDefault();
        setSubmittingHeli(true);

        const formData = new FormData();
        formData.append("booking_type", heliForm.booking_type);
        formData.append("number_of_people", heliForm.number_of_people);
        formData.append("start_date", heliForm.start_date);
        if (heliForm.end_date) formData.append("end_date", heliForm.end_date);
        formData.append("frontend_total_amount", heliForm.frontend_total_amount);
        if (heliForm.package_id) formData.append("package_id", heliForm.package_id);
        if (heliForm.pricing_tier_id) formData.append("pricing_tier_id", heliForm.pricing_tier_id);

        heliForm.travellers.forEach((traveller, index) => {
            Object.keys(traveller).forEach((key) => {
                const val = traveller[key];
                if (val !== null && val !== "") {
                    formData.append(`travellers[${index}][${key}]`, val);
                }
            });
        });

        try {
            const response = await createBookingCms(formData);
            if (response.data?.status) {
                const newBooking = response.data.data;
                const bookingId = newBooking?.id;

                if (bookingId) {
                    try {
                        await initiatePayment({
                            booking_id: bookingId,
                            provider: "PAYLATER",
                        });
                    } catch (payError) {
                        console.error("Heli payment initiation error:", payError);
                    }
                }

                await Swal.fire({
                    icon: "success",
                    title: "Created",
                    text: response.data.message || "Heli booking created successfully.",
                    confirmButtonColor: "#351255",
                });
                setShowHeliModal(false);
                fetchBookings();
            }
        } catch (error) {
            console.error("Heli booking create error:", error);
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: error.response?.data?.message || "Unable to create heli booking.",
                confirmButtonColor: "#351255",
            });
        } finally {
            setSubmittingHeli(false);
        }
    };

    // FETCH BOOKINGS
    const fetchBookings = async () => {
        const requestId = ++requestIdRef.current;
        try {
            setLoading(true);

            const response = debouncedSearch
                ? await searchBookingsCms(debouncedSearch, page)
                : await getAllBookingsCms(page);

            if (requestId !== requestIdRef.current) return;

            if (response.data?.status) {
                setBookings(response.data.data.data || []);
                setTotalPages(response.data.data.last_page || 1);
                setTotalBookings(response.data.data.total || 0);
            }
        } catch (error) {
            if (requestId !== requestIdRef.current) return;
            console.error("Booking fetch error:", error);

            Swal.fire({
                icon: "error",
                title: "Failed",
                text: error.response?.data?.message || "Unable to fetch bookings.",
                confirmButtonColor: "#351255",
            });
        } finally {
            if (requestId === requestIdRef.current) setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
        return () => { requestIdRef.current += 1; };
    }, [page, debouncedSearch]);

    // DELETE BOOKING
    const handleDelete = async (booking) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Delete Booking?",
            text: `Are you sure you want to delete "${booking.booking_reference || `Booking #${booking.id}`}"?`,
            showCancelButton: true,
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#351255",
        });

        if (!result.isConfirmed) return;

        try {
            const response = await deleteBooking(booking.id);

            if (response.data?.status) {
                await Swal.fire({
                    icon: "success",
                    title: "Deleted",
                    text: response.data?.message || "Booking deleted successfully.",
                    confirmButtonColor: "#351255",
                });

                if (bookings.length === 1 && page > 1) {
                    setPage((prev) => prev - 1);
                } else {
                    fetchBookings();
                }
            }
        } catch (error) {
            console.error("Booking delete error:", error);
            Swal.fire({
                icon: "error",
                title: "Delete Failed",
                text: error.response?.data?.message || "Unable to delete booking.",
                confirmButtonColor: "#351255",
            });
        }
    };

    const handleViewDetail = (booking) => {
        setSelectedDetailBooking(booking);
        setShowDetailModal(true);
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setSelectedDetailBooking(null);
    };

    const handleViewDocuments = async (booking) => {
        try {
            setSelectedBooking(booking);
            setShowDocumentModal(true);
            setDocumentLoading(true);
            setHeliDocuments([]);

            const response = await getHeliBookingDocuments(
                booking.id,
                booking.package_id
            );

            if (response.data?.status) {
                setHeliDocuments(response.data.data || []);
            }
        } catch (error) {
            console.error("Heli document fetch error:", error);
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: error.response?.data?.message || "Unable to fetch heli documents.",
                confirmButtonColor: "#351255",
            });
        } finally {
            setDocumentLoading(false);
        }
    };

    const closeDocumentModal = () => {
        setShowDocumentModal(false);
        setSelectedBooking(null);
        setHeliDocuments([]);
    };

    const getPayLaterPayment = (booking) => {
        const payments = Array.isArray(booking?.payments) ? booking.payments : [];
        return [...payments]
            .filter((payment) => payment.provider === "PAYLATER")
            .sort((a, b) => Number(b.id) - Number(a.id))[0] || null;
    };

    const canEditPaymentStatus = (booking) => {
        if (!booking) return false;
        const payments = Array.isArray(booking.payments) ? booking.payments : [];
        const payLaterPayment = getPayLaterPayment(booking);
        if (!payLaterPayment) return false;
        if (booking.payment_status === "PAID") return false;
        if (payLaterPayment.status === "PAID") return false;
        if (payments.some((payment) => payment.status === "PAID")) return false;
        return true;
    };

    const handleOpenStatusModal = (booking) => {
        setStatusBooking(booking);
        setBookingStatus(booking.status || "PENDING");
        setPaymentStatus(booking.payment_status || "PENDING");
        setShowStatusModal(true);
    };

    const closeStatusModal = () => {
        if (savingStatus) return;
        setShowStatusModal(false);
        setStatusBooking(null);
    };

    const handleUpdateStatus = async () => {
        if (!statusBooking || savingStatus) return;

        const bookingId = statusBooking.id;
        const payload = {};

        if (bookingStatus !== statusBooking.status) {
            payload.status = bookingStatus;
        }

        if (
            canEditPaymentStatus(statusBooking) &&
            paymentStatus !== statusBooking.payment_status
        ) {
            payload.payment_status = paymentStatus;
        }

        if (Object.keys(payload).length === 0) {
            setShowStatusModal(false);
            setStatusBooking(null);
            await Swal.fire({
                icon: "info",
                title: "No Changes",
                text: "You have not changed any status.",
                confirmButtonColor: "#351255",
            });
            return;
        }

        setShowStatusModal(false);
        setStatusBooking(null);

        await new Promise((resolve) => setTimeout(resolve, 0));

        if (payload.payment_status === "PAID") {
            const confirmation = await Swal.fire({
                icon: "warning",
                title: "Confirm Payment?",
                text: "This will mark the PAYLATER payment as PAID. You cannot change its payment status afterward.",
                showCancelButton: true,
                confirmButtonText: "Yes, Mark as Paid",
                cancelButtonText: "Cancel",
                confirmButtonColor: "#351255",
            });

            if (!confirmation.isConfirmed) return;
        }

        try {
            setSavingStatus(true);
            const response = await updateBookingStatusCms(bookingId, payload);

            if (response.data?.status) {
                await fetchBookings();
                await Swal.fire({
                    icon: "success",
                    title: "Updated",
                    text: response.data?.message || "Booking status updated successfully.",
                    confirmButtonColor: "#351255",
                });
            } else {
                throw new Error(response.data?.message || "Update failed.");
            }
        } catch (error) {
            console.error("Booking status update error:", error);
            await Swal.fire({
                icon: "error",
                title: "Update Failed",
                text: error.response?.data?.message || error.message || "Unable to update booking status.",
                confirmButtonColor: "#351255",
            });
        } finally {
            setSavingStatus(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return "null";
        return new Date(date).toLocaleDateString();
    };

    const formatAmount = (amount) => {
        if (amount === null || amount === undefined) return "null";
        return `NPR ${Number(amount).toLocaleString()}`;
    };

    const getVehicleId = (booking) => {
        const transport = booking.transports?.find((item) => item.vehicle_id);
        return transport?.vehicle_id ?? "null";
    };

    const getHeliId = (booking) => {
        const transport = booking.transports?.find((item) => item.heli_id);
        return transport?.heli_id ?? "null";
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "CONFIRMED":
            case "COMPLETED":
            case "PAID":
                return "status-active";
            case "CANCELLED":
            case "FAILED":
                return "status-inactive";
            default:
                return "status-pending";
        }
    };

    const renderDetailField = (label, value) => (
        <div>
            <span>{label}</span>
            <strong>{value ?? "-"}</strong>
        </div>
    );

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <div className="dashboard-main">
                <Navbar />

                <main className="dashboard-content">
                    <div className="booking-page">
                        {/* HEADER */}
                        <div className="booking-header">
                            <div>
                                <h1>Bookings</h1>
                                <p>View and manage customer bookings in Trip Himalaya.</p>
                            </div>
                            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                <button className="create-category-button" onClick={handleOpenCreateModal}>
                                    <span>+</span> Create Booking
                                </button>
                                <button className="create-category-button" onClick={handleOpenVehicleModal}>
                                    <span>+</span> Create Vehicle Booking
                                </button>
                                <button className="create-category-button" onClick={handleOpenHeliModal}>
                                    <span>+</span> Create Heli Booking
                                </button>
                            </div>
                        </div>

                        {/* TABLE */}
                        <div className="booking-table-card">
                            <div className="booking-table-header">
                                <div>
                                    <h2>Booking List</h2>
                                    <p>
                                        {totalBookings} {totalBookings === 1 ? "booking" : "bookings"}
                                    </p>
                                </div>
                                <div style={{ position: "relative", width: "100%", maxWidth: "320px" }}>
                                    <FaSearch style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#777", pointerEvents: "none" }} />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={handleSearchChange}
                                        placeholder="Search bookings..."
                                        aria-label="Search bookings"
                                        style={{ width: "100%", boxSizing: "border-box", padding: "11px 36px 11px 38px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", outlineColor: "#351255" }}
                                    />
                                    {search && (
                                        <button
                                            type="button"
                                            onClick={clearSearch}
                                            aria-label="Clear search"
                                            style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", cursor: "pointer", color: "#777" }}
                                        >
                                            <FaTimes />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="booking-table-responsive">
                                <table className="booking-table">
                                    <thead>
                                        <tr>
                                            <th>S.N.</th>
                                            <th>Booking Reference</th>
                                            <th>User Email</th>
                                            <th>Type</th>
                                            <th>Package Name</th>
                                            <th>Pricing Tier</th>
                                            <th>Vehicle ID</th>
                                            <th>Heli ID</th>
                                            <th>People</th>
                                            <th>Travel Date</th>
                                            <th>End Date</th>
                                            <th>Total Amount</th>
                                            <th>Status</th>
                                            <th>Payment Status</th>
                                            <th>Created At</th>
                                            <th className="action-column">Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="16" className="table-message">
                                                    <div className="booking-loader"></div>
                                                    Loading bookings...
                                                </td>
                                            </tr>
                                        ) : bookings.length === 0 ? (
                                            <tr>
                                                <td colSpan="16" className="table-message">
                                                    No bookings found.
                                                </td>
                                            </tr>
                                        ) : (
                                            bookings.map((booking, index) => (
                                                <tr key={booking.id}>
                                                    <td>{(page - 1) * 10 + index + 1}</td>
                                                    <td>
                                                        <span className="booking-reference">
                                                            {booking.booking_reference ?? "null"}
                                                        </span>
                                                    </td>
                                                    <td>{booking.user?.email ?? "null"}</td>
                                                    <td>
                                                        <span className="booking-type">
                                                            {booking.booking_type ?? "null"}
                                                        </span>
                                                    </td>
                                                    <td>{booking.package?.title ?? "null"}</td>
                                                    <td>{booking.pricing_tier?.service ?? "null"}</td>
                                                    <td>{getVehicleId(booking)}</td>
                                                    <td>{getHeliId(booking)}</td>
                                                    <td>{booking.number_of_people ?? "null"}</td>
                                                    <td>{formatDate(booking.start_date)}</td>
                                                    <td>{formatDate(booking.end_date)}</td>
                                                    <td>
                                                        <span className="booking-amount">
                                                            {formatAmount(booking.total_amount)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge ${getStatusClass(booking.status)}`}>
                                                            {booking.status ?? "null"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge ${getStatusClass(booking.payment_status)}`}>
                                                            {booking.payment_status ?? "null"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {booking.created_at ? new Date(booking.created_at).toLocaleDateString() : "null"}
                                                    </td>
                                                    <td className="action-column">
                                                        <div className="action-buttons">
                                                            <button
                                                                type="button"
                                                                className="view-document-button"
                                                                onClick={() =>
                                                                    booking.booking_type === "HELI"
                                                                        ? handleViewDocuments(booking)
                                                                        : handleViewDetail(booking)
                                                                }
                                                            >
                                                                <FaEye /> View Detail
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="view-document-button"
                                                                onClick={() => handleOpenStatusModal(booking)}
                                                            >
                                                                <FaEdit /> Update Status
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <Pagination
                                page={page}
                                totalPages={totalPages}
                                onPageChange={setPage}
                            />
                        </div>
                    </div>
                </main>
            </div>

            {/* =====================================================
                UPDATE STATUS MODAL
            ===================================================== */}
            {showStatusModal && statusBooking && (
                <div
                    className="booking-modal-overlay"
                    onClick={closeStatusModal}
                >
                    <div
                        className="booking-document-modal"
                        style={{
                            maxWidth: "520px",
                            width: "95%",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="booking-modal-header">
                            <div>
                                <h2>Update Booking Status</h2>
                                <p>
                                    {statusBooking.booking_reference ||
                                        `Booking #${statusBooking.id}`}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="booking-modal-close"
                                onClick={closeStatusModal}
                                disabled={savingStatus}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="booking-modal-body">
                            <div className="booking-modal-summary">
                                {renderDetailField(
                                    "Booking ID",
                                    statusBooking.id
                                )}

                                {renderDetailField(
                                    "Booking Type",
                                    statusBooking.booking_type
                                )}

                                {renderDetailField(
                                    "Total Amount",
                                    formatAmount(
                                        statusBooking.total_amount
                                    )
                                )}

                                {renderDetailField(
                                    "Payment Provider",
                                    getPayLaterPayment(statusBooking)
                                        ? "PAYLATER"
                                        : statusBooking.payments?.[0]
                                            ?.provider || "-"
                                )}
                            </div>

                            <div
                                style={{
                                    marginTop: "24px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "18px",
                                }}
                            >
                                <div>
                                    <label
                                        htmlFor="booking-status-select"
                                        style={{
                                            display: "block",
                                            fontWeight: 600,
                                            marginBottom: "8px",
                                            color: "#351255",
                                        }}
                                    >
                                        Booking Status
                                    </label>

                                    <select
                                        id="booking-status-select"
                                        value={bookingStatus}
                                        onChange={(e) => setBookingStatus(e.target.value)}
                                        disabled={savingStatus}
                                        style={{
                                            width: "100%",
                                            padding: "12px",
                                            borderRadius: "8px",
                                            border: "1px solid #ddd",
                                            background: "#fff",
                                            color: "#351255",
                                            fontSize: "14px",
                                            fontWeight: 500,
                                        }}
                                    >
                                        <option value="PENDING">PENDING</option>
                                        <option value="CONFIRMED">CONFIRMED</option>
                                        <option value="CANCELLED">CANCELLED</option>
                                        <option value="COMPLETED">COMPLETED</option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="payment-status-select"
                                        style={{
                                            display: "block",
                                            fontWeight: 600,
                                            marginBottom: "8px",
                                            color: "#351255",
                                        }}
                                    >
                                        Payment Status
                                    </label>

                                    <select
                                        id="payment-status-select"
                                        value={paymentStatus}
                                        onChange={(e) => setPaymentStatus(e.target.value)}
                                        disabled={
                                            savingStatus ||
                                            !canEditPaymentStatus(statusBooking)
                                        }
                                        style={{
                                            width: "100%",
                                            padding: "12px",
                                            borderRadius: "8px",
                                            border: "1px solid #ddd",
                                            background: canEditPaymentStatus(statusBooking)
                                                ? "#fff"
                                                : "#f5f5f5",
                                            color: "#351255",
                                            WebkitTextFillColor: "#351255",
                                            cursor: canEditPaymentStatus(statusBooking)
                                                ? "pointer"
                                                : "not-allowed",
                                        }}
                                    >
                                        <option value="PENDING" style={{ color: "#351255", backgroundColor: "#fff" }}>
                                            PENDING
                                        </option>
                                        <option value="PAID" style={{ color: "#351255", backgroundColor: "#fff" }}>
                                            PAID
                                        </option>
                                        <option value="FAILED" style={{ color: "#351255", backgroundColor: "#fff" }}>
                                            FAILED
                                        </option>
                                    </select>

                                    <p
                                        style={{
                                            fontSize: "12px",
                                            color: "#777",
                                            marginTop: "8px",
                                        }}
                                    >
                                        {statusBooking.payment_status ===
                                            "PAID"
                                            ? "This booking is already paid. Payment status cannot be changed."
                                            : canEditPaymentStatus(
                                                statusBooking
                                            )
                                                ? "Payment status can be updated because this is an unpaid PAYLATER booking."
                                                : "Payment status can only be updated for unpaid PAYLATER bookings."}
                                    </p>
                                </div>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: "12px",
                                    marginTop: "28px",
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={closeStatusModal}
                                    disabled={savingStatus}
                                    style={{
                                        padding: "11px 18px",
                                        border: "1px solid #ddd",
                                        borderRadius: "8px",
                                        background: "#fff",
                                        color: "#351255",
                                        fontSize: "14px",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleUpdateStatus}
                                    disabled={savingStatus}
                                    style={{
                                        padding: "11px 20px",
                                        border: "none",
                                        borderRadius: "8px",
                                        background: "#351255",
                                        color: "#fff",
                                        fontWeight: 600,
                                        cursor: savingStatus
                                            ? "not-allowed"
                                            : "pointer",
                                        opacity: savingStatus ? 0.6 : 1,
                                    }}
                                >
                                    {savingStatus
                                        ? "Saving..."
                                        : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* =====================================================
                PACKAGE BOOKING DETAIL MODAL (Restored to exact previous structure)
            ===================================================== */}
            {showDetailModal && selectedDetailBooking && (
                <div
                    className="booking-modal-overlay"
                    onClick={closeDetailModal}
                >
                    <div
                        className="booking-document-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="booking-modal-header">
                            <div>
                                <h2>Booking Details</h2>
                                <p>
                                    {selectedDetailBooking.booking_reference ||
                                        `Booking #${selectedDetailBooking.id}`}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="booking-modal-close"
                                onClick={closeDetailModal}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="booking-modal-body">
                            <div className="booking-modal-summary">
                                {renderDetailField(
                                    "Booking ID",
                                    selectedDetailBooking.id
                                )}

                                {renderDetailField(
                                    "Booking Reference",
                                    selectedDetailBooking.booking_reference
                                )}

                                {renderDetailField(
                                    "Booking Type",
                                    selectedDetailBooking.booking_type
                                )}

                                {renderDetailField(
                                    "Package",
                                    selectedDetailBooking.package?.title
                                )}

                                {renderDetailField(
                                    "Pricing Tier",
                                    selectedDetailBooking.pricing_tier
                                        ?.service
                                )}

                                {renderDetailField(
                                    "Age Group",
                                    selectedDetailBooking.pricing_tier
                                        ?.age_group
                                )}

                                {renderDetailField(
                                    "Number of People",
                                    selectedDetailBooking.number_of_people
                                )}

                                {renderDetailField(
                                    "Start Date",
                                    formatDate(
                                        selectedDetailBooking.start_date
                                    )
                                )}

                                {renderDetailField(
                                    "End Date",
                                    formatDate(
                                        selectedDetailBooking.end_date
                                    )
                                )}

                                {renderDetailField(
                                    "Total Amount",
                                    formatAmount(
                                        selectedDetailBooking.total_amount
                                    )
                                )}

                                {renderDetailField(
                                    "Status",
                                    selectedDetailBooking.status
                                )}

                                {renderDetailField(
                                    "Payment Status",
                                    selectedDetailBooking.payment_status
                                )}
                            </div>

                            {/* USER DETAILS */}
                            <div style={{ marginTop: "24px" }}>
                                <h3
                                    style={{
                                        marginBottom: "15px",
                                        color: "#351255",
                                    }}
                                >
                                    User Details
                                </h3>

                                <div className="booking-modal-summary">
                                    {renderDetailField(
                                        "Name",
                                        [
                                            selectedDetailBooking.user
                                                ?.first_name,
                                            selectedDetailBooking.user
                                                ?.middle_name,
                                            selectedDetailBooking.user
                                                ?.last_name,
                                        ]
                                            .filter(Boolean)
                                            .join(" ") || "-"
                                    )}

                                    {renderDetailField(
                                        "Email",
                                        selectedDetailBooking.user?.email
                                    )}

                                    {renderDetailField(
                                        "Phone",
                                        `${selectedDetailBooking.user
                                            ?.country_code || ""
                                        }${selectedDetailBooking.user
                                            ?.phone || "-"
                                        }`
                                    )}

                                    {renderDetailField(
                                        "Gender",
                                        selectedDetailBooking.user?.gender
                                    )}

                                    {renderDetailField(
                                        "Date of Birth",
                                        selectedDetailBooking.user
                                            ?.date_of_birth
                                            ? formatDate(
                                                selectedDetailBooking.user
                                                    .date_of_birth
                                            )
                                            : "-"
                                    )}

                                    {renderDetailField(
                                        "Nationality",
                                        selectedDetailBooking.user
                                            ?.nationality
                                    )}

                                    {renderDetailField(
                                        "Address",
                                        selectedDetailBooking.user?.address
                                    )}

                                    {renderDetailField(
                                        "City",
                                        selectedDetailBooking.user?.city
                                    )}

                                    {renderDetailField(
                                        "State",
                                        selectedDetailBooking.user?.state
                                    )}

                                    {renderDetailField(
                                        "Country",
                                        selectedDetailBooking.user?.country
                                    )}

                                    {renderDetailField(
                                        "Postal Code",
                                        selectedDetailBooking.user
                                            ?.postal_code
                                    )}
                                </div>
                            </div>

                            {/* PACKAGE APPLICANT DETAILS */}
                            {selectedDetailBooking.package_applicants
                                ?.length > 0 && (
                                    <div style={{ marginTop: "24px" }}>
                                        <h3
                                            style={{
                                                marginBottom: "15px",
                                                color: "#351255",
                                            }}
                                        >
                                            Applicant Details
                                        </h3>

                                        {selectedDetailBooking.package_applicants.map(
                                            (applicant, index) => (
                                                <div
                                                    key={applicant.id || index}
                                                    style={{
                                                        marginBottom: "18px",
                                                    }}
                                                >
                                                    {selectedDetailBooking
                                                        .package_applicants
                                                        .length > 1 && (
                                                            <h4
                                                                style={{
                                                                    marginBottom:
                                                                        "10px",
                                                                    color: "#351255",
                                                                }}
                                                            >
                                                                Applicant {index + 1}
                                                            </h4>
                                                        )}

                                                    <div className="booking-modal-summary">
                                                        {renderDetailField(
                                                            "Full Name",
                                                            applicant.full_name
                                                        )}

                                                        {renderDetailField(
                                                            "Email Address",
                                                            applicant.email
                                                        )}

                                                        {renderDetailField(
                                                            "Phone / WhatsApp",
                                                            applicant.phone_whatsapp
                                                        )}

                                                        {renderDetailField(
                                                            "Travel Date",
                                                            formatDate(
                                                                selectedDetailBooking.start_date
                                                            )
                                                        )}

                                                        {renderDetailField(
                                                            "Nationality",
                                                            applicant.nationality
                                                        )}

                                                        {renderDetailField(
                                                            "Pickup / Hotel in Nepal",
                                                            applicant.pickup_hotel
                                                        )}

                                                        {renderDetailField(
                                                            "Dietary / Health Notes",
                                                            applicant.dietary_health_notes
                                                        )}
                                                    </div>

                                                    {applicant.document && (
                                                        <div
                                                            className="booking-document-files"
                                                            style={{
                                                                marginTop: "12px",
                                                            }}
                                                        >
                                                            <a
                                                                href={
                                                                    applicant.document
                                                                }
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="booking-document-link"
                                                            >
                                                                <FaExternalLinkAlt />
                                                                Applicant Document
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            )}

            {/* =====================================================
                HELI DOCUMENT MODAL
            ===================================================== */}
            {showDocumentModal && selectedBooking && (
                <div
                    className="booking-modal-overlay"
                    onClick={closeDocumentModal}
                >
                    <div
                        className="booking-document-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="booking-modal-header">
                            <div>
                                <h2>Helicopter Booking Documents</h2>
                                <p>
                                    {selectedBooking.booking_reference ||
                                        `Booking #${selectedBooking.id}`}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="booking-modal-close"
                                onClick={closeDocumentModal}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="booking-modal-body">
                            <div className="booking-modal-summary">
                                {renderDetailField(
                                    "Booking ID",
                                    selectedBooking.id
                                )}

                                {renderDetailField(
                                    "Package ID",
                                    selectedBooking.package_id
                                )}

                                {renderDetailField(
                                    "Passengers",
                                    selectedBooking.number_of_people
                                )}

                                {renderDetailField(
                                    "Start Date",
                                    formatDate(selectedBooking.start_date)
                                )}
                            </div>

                            {documentLoading ? (
                                <div className="booking-document-empty">
                                    <div className="booking-loader"></div>
                                    Loading documents...
                                </div>
                            ) : heliDocuments.length === 0 ? (
                                <div className="booking-document-empty">
                                    No traveller documents found for this
                                    booking.
                                </div>
                            ) : (
                                <div className="booking-traveller-list">
                                    {heliDocuments.map((document, index) => (
                                        <div
                                            className="booking-traveller-card"
                                            key={document.id || index}
                                        >
                                            <div className="booking-traveller-header">
                                                <div>
                                                    <span>
                                                        Traveller{" "}
                                                        {index + 1}
                                                    </span>

                                                    <h3>
                                                        {document.name ||
                                                            "Unnamed Traveller"}
                                                    </h3>
                                                </div>

                                                <span className="booking-traveller-number">
                                                    #{index + 1}
                                                </span>
                                            </div>

                                            <div className="booking-traveller-info">
                                                {renderDetailField(
                                                    "Name",
                                                    document.name
                                                )}

                                                {renderDetailField(
                                                    "Nationality",
                                                    document.nationality
                                                )}

                                                {renderDetailField(
                                                    "Identity Number",
                                                    document.identity_number
                                                )}

                                                {renderDetailField(
                                                    "Weight",
                                                    document.weight != null
                                                        ? `${document.weight} kg`
                                                        : "-"
                                                )}

                                                {renderDetailField(
                                                    "Luggage",
                                                    document.luggage != null
                                                        ? `${document.luggage} kg`
                                                        : "-"
                                                )}

                                                {renderDetailField(
                                                    "Email Address",
                                                    document.email
                                                )}

                                                {renderDetailField(
                                                    "WhatsApp Phone Number",
                                                    document.whatsapp_phone
                                                )}

                                                {renderDetailField(
                                                    "Preferred Flight Date",
                                                    document.preferred_flight_date
                                                        ? formatDate(
                                                            document.preferred_flight_date
                                                        )
                                                        : "-"
                                                )}

                                                {renderDetailField(
                                                    "Pickup Hotel in Kathmandu / Pokhara",
                                                    document.pickup_hotel
                                                )}
                                            </div>

                                            <div className="booking-document-files">
                                                {document.passport_nid_image && (
                                                    <a
                                                        href={
                                                            document.passport_nid_image
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="booking-document-link"
                                                    >
                                                        <FaExternalLinkAlt />
                                                        Passport / NID
                                                    </a>
                                                )}

                                                {document.pp_size_photo && (
                                                    <a
                                                        href={
                                                            document.pp_size_photo
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="booking-document-link"
                                                    >
                                                        <FaExternalLinkAlt />
                                                        PP Size Photo
                                                    </a>
                                                )}

                                                {document.confirmed_flight_ticket_image && (
                                                    <a
                                                        href={
                                                            document.confirmed_flight_ticket_image
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="booking-document-link"
                                                    >
                                                        <FaExternalLinkAlt />
                                                        Flight Ticket
                                                    </a>
                                                )}

                                                {document.travel_insurance_image && (
                                                    <a
                                                        href={
                                                            document.travel_insurance_image
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="booking-document-link"
                                                    >
                                                        <FaExternalLinkAlt />
                                                        Travel Insurance
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* CREATE BOOKING MODAL */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-card" style={{ maxWidth: "700px", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
                        <div className="modal-header">
                            <h2>Create New Booking</h2>
                            <button className="modal-close-btn" onClick={handleCloseCreateModal}>
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleCreateFormSubmit} className="modal-form" style={{ overflowY: "auto", flex: 1 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <div className="form-group">
                                    <label>Booking Type *</label>
                                    <select
                                        name="booking_type"
                                        value={createForm.booking_type}
                                        onChange={handleCreateInputChange}
                                        className="modal-select"
                                    >
                                        <option value="PACKAGE">PACKAGE</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Number of People *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        name="number_of_people"
                                        value={createForm.number_of_people}
                                        onChange={handleCreateInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Package *</label>
                                    <select
                                        name="package_id"
                                        value={createForm.package_id}
                                        onChange={handleCreateInputChange}
                                        className="modal-select"
                                        required
                                    >
                                        <option value="" disabled>-- Select Package --</option>
                                        {Array.isArray(packagesList) && packagesList.map((pkg) => (
                                            <option key={pkg.id} value={pkg.id}>
                                                {pkg.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Pricing Tier *</label>
                                    <select
                                        name="pricing_tier_id"
                                        value={createForm.pricing_tier_id}
                                        onChange={handleCreateInputChange}
                                        className="modal-select"
                                        required
                                        disabled={!createForm.package_id}
                                    >
                                        <option value="" disabled>-- Select Pricing Tier --</option>
                                        {Array.isArray(pricingTiersList) && pricingTiersList.map((tier) => (
                                            <option key={tier.id} value={tier.id}>
                                                {tier.service} ({tier.age_group}) - NPR {tier.price_npr}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Start Date *</label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={createForm.start_date}
                                        onChange={handleCreateInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>End Date</label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={createForm.end_date}
                                        onChange={handleCreateInputChange}
                                    />
                                </div>

                                <div className="form-group" style={{ gridColumn: "span 2" }}>
                                    <label>Total Amount (NPR)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="frontend_total_amount"
                                        value={createForm.frontend_total_amount}
                                        readOnly
                                        style={{ background: "#faf8fb", cursor: "not-allowed" }}
                                    />
                                </div>
                            </div>

                            {/* PACKAGE APPLICANT */}
                            <div style={{ marginTop: "15px", borderTop: "1px solid #eee9f0", paddingTop: "15px" }}>
                                <h3 style={{ color: "#351255", fontSize: "14px", marginBottom: "12px" }}>Package Applicant Details</h3>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                    <div className="form-group" style={{ marginBottom: "10px" }}>
                                        <label style={{ display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "4px", color: "#555" }}>Full Name *</label>
                                        <input type="text" name="full_name" placeholder="Full Name *" value={createForm.applicant.full_name} onChange={handleApplicantInputChange} required />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: "10px" }}>
                                        <label style={{ display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "4px", color: "#555" }}>Email Address *</label>
                                        <input type="email" name="email" placeholder="Email Address *" value={createForm.applicant.email} onChange={handleApplicantInputChange} required />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: "10px" }}>
                                        <label style={{ display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "4px", color: "#555" }}>Phone / WhatsApp *</label>
                                        <input type="text" name="phone_whatsapp" placeholder="Phone / WhatsApp *" value={createForm.applicant.phone_whatsapp} onChange={handleApplicantInputChange} required />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: "10px" }}>
                                        <label style={{ display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "4px", color: "#555" }}>Nationality *</label>
                                        <input type="text" name="nationality" placeholder="Nationality *" value={createForm.applicant.nationality} onChange={handleApplicantInputChange} required />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: "10px" }}>
                                        <label style={{ display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "4px", color: "#555" }}>Pickup Hotel</label>
                                        <input type="text" name="pickup_hotel" placeholder="Pickup Hotel" value={createForm.applicant.pickup_hotel} onChange={handleApplicantInputChange} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: "10px" }}>
                                        <label style={{ display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "4px", color: "#555" }}>Document</label>
                                        <input type="file" onChange={handleApplicantFileChange} accept="image/*,.pdf" />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: "10px", gridColumn: "span 2" }}>
                                        <label style={{ display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "4px", color: "#555" }}>Dietary / Health Notes</label>
                                        <textarea
                                            name="dietary_health_notes"
                                            placeholder="Dietary / Health Notes"
                                            value={createForm.applicant.dietary_health_notes}
                                            onChange={handleApplicantInputChange}
                                            rows="2"
                                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", outlineColor: "#351255", boxSizing: "border-box" }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={handleCloseCreateModal} disabled={submittingCreate}>
                                    Cancel
                                </button>
                                <button type="submit" className="create-category-button" disabled={submittingCreate}>
                                    {submittingCreate ? "Saving..." : "Save Booking"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CREATE VEHICLE BOOKING MODAL */}
            {showVehicleModal && (
                <div className="modal-overlay">
                    <div className="modal-card" style={{ maxWidth: "700px", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
                        <div className="modal-header">
                            <h2>Create New Vehicle Booking</h2>
                            <button className="modal-close-btn" onClick={handleCloseVehicleModal}>
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleVehicleFormSubmit} className="modal-form" style={{ overflowY: "auto", flex: 1 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <div className="form-group">
                                    <label>Booking Type *</label>
                                    <select
                                        name="booking_type"
                                        value={vehicleForm.booking_type}
                                        onChange={handleVehicleInputChange}
                                        className="modal-select"
                                    >
                                        <option value="VEHICLE">VEHICLE</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Number of People *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        name="number_of_people"
                                        value={vehicleForm.number_of_people}
                                        onChange={handleVehicleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Select Vehicle *</label>
                                    <select
                                        name="vehicle_id"
                                        value={vehicleForm.vehicle_id}
                                        onChange={handleVehicleInputChange}
                                        className="modal-select"
                                        required
                                    >
                                        <option value="" disabled>-- Select Vehicle --</option>
                                        {Array.isArray(vehiclesList) && vehiclesList.map((veh) => (
                                            <option key={veh.id} value={veh.id}>
                                                {veh.name || veh.title || `Vehicle #${veh.id}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Select Route *</label>
                                    <select
                                        name="route_id"
                                        value={vehicleForm.route_id}
                                        onChange={handleVehicleInputChange}
                                        className="modal-select"
                                        required
                                        disabled={!vehicleForm.vehicle_id}
                                    >
                                        <option value="" disabled>-- Select Route --</option>
                                        {Array.isArray(availableRoutes) && availableRoutes.map((route) => (
                                            <option key={route.id} value={route.id}>
                                                {route.from_location && route.to_location
                                                    ? `${route.from_location} → ${route.to_location} ${route.price ? `(NPR ${route.price})` : ''}`
                                                    : route.name || route.title || `Route #${route.id}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Start Date *</label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={vehicleForm.start_date}
                                        onChange={handleVehicleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>End Date</label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={vehicleForm.end_date}
                                        onChange={handleVehicleInputChange}
                                    />
                                </div>

                                <div className="form-group" style={{ gridColumn: "span 2" }}>
                                    <label>Total Amount (NPR)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="frontend_total_amount"
                                        value={vehicleForm.frontend_total_amount}
                                        readOnly
                                        style={{ background: "#faf8fb", cursor: "not-allowed" }}
                                        placeholder="Will be calculated automatically"
                                    />
                                </div>
                            </div>

                            {/* VEHICLE APPLICANT */}
                            <div style={{ marginTop: "15px", borderTop: "1px solid #eee9f0", paddingTop: "15px" }}>
                                <h3 style={{ color: "#351255", fontSize: "14px", marginBottom: "12px" }}>Applicant Details</h3>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                    <div className="form-group" style={{ marginBottom: "10px" }}>
                                        <label style={{ display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "4px", color: "#555" }}>Full Name *</label>
                                        <input type="text" name="full_name" placeholder="Full Name *" value={vehicleForm.applicant.full_name} onChange={handleVehicleApplicantInputChange} required />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: "10px" }}>
                                        <label style={{ display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "4px", color: "#555" }}>Email Address *</label>
                                        <input type="email" name="email" placeholder="Email Address *" value={vehicleForm.applicant.email} onChange={handleVehicleApplicantInputChange} required />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: "10px" }}>
                                        <label style={{ display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "4px", color: "#555" }}>Phone / WhatsApp *</label>
                                        <input type="text" name="phone_whatsapp" placeholder="Phone / WhatsApp *" value={vehicleForm.applicant.phone_whatsapp} onChange={handleVehicleApplicantInputChange} required />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: "10px" }}>
                                        <label style={{ display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "4px", color: "#555" }}>Nationality *</label>
                                        <input type="text" name="nationality" placeholder="Nationality *" value={vehicleForm.applicant.nationality} onChange={handleVehicleApplicantInputChange} required />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: "10px" }}>
                                        <label style={{ display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "4px", color: "#555" }}>Pickup Hotel</label>
                                        <input type="text" name="pickup_hotel" placeholder="Pickup Hotel" value={vehicleForm.applicant.pickup_hotel} onChange={handleVehicleApplicantInputChange} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: "10px" }}>
                                        <label style={{ display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "4px", color: "#555" }}>Document</label>
                                        <input type="file" onChange={handleVehicleApplicantFileChange} accept="image/*,.pdf" />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: "10px", gridColumn: "span 2" }}>
                                        <label style={{ display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "4px", color: "#555" }}>Dietary / Health Notes</label>
                                        <textarea
                                            name="dietary_health_notes"
                                            placeholder="Dietary / Health Notes"
                                            value={vehicleForm.applicant.dietary_health_notes}
                                            onChange={handleVehicleApplicantInputChange}
                                            rows="2"
                                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", outlineColor: "#351255", boxSizing: "border-box" }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={handleCloseVehicleModal} disabled={submittingVehicle}>
                                    Cancel
                                </button>
                                <button type="submit" className="create-category-button" disabled={submittingVehicle}>
                                    {submittingVehicle ? "Saving..." : "Save Vehicle Booking"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CREATE HELI BOOKING MODAL */}
            {showHeliModal && (
                <div className="modal-overlay">
                    <div className="modal-card" style={{ maxWidth: "750px", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
                        <div className="modal-header">
                            <h2>Create New Helicopter Booking</h2>
                            <button className="modal-close-btn" onClick={handleCloseHeliModal}>
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleHeliFormSubmit} className="modal-form" style={{ overflowY: "auto", flex: 1 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <div className="form-group">
                                    <label>Booking Type *</label>
                                    <select
                                        name="booking_type"
                                        value={heliForm.booking_type}
                                        onChange={handleHeliInputChange}
                                        className="modal-select"
                                    >
                                        <option value="HELI">HELI</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Number of People / Passengers *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        name="number_of_people"
                                        value={heliForm.number_of_people}
                                        onChange={handleHeliInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Select Heli Package *</label>
                                    <select
                                        name="package_id"
                                        value={heliForm.package_id}
                                        onChange={handleHeliInputChange}
                                        className="modal-select"
                                        required
                                    >
                                        <option value="" disabled>-- Select Heli Package --</option>
                                        {Array.isArray(heliPackagesList) && heliPackagesList.map((pkg) => (
                                            <option key={pkg.id} value={pkg.id}>
                                                {pkg.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Pricing Tier *</label>
                                    <select
                                        name="pricing_tier_id"
                                        value={heliForm.pricing_tier_id}
                                        onChange={handleHeliInputChange}
                                        className="modal-select"
                                        required
                                        disabled={!heliForm.package_id}
                                    >
                                        <option value="" disabled>-- Select Pricing Tier --</option>
                                        {Array.isArray(heliPricingTiersList) && heliPricingTiersList.map((tier) => (
                                            <option key={tier.id} value={tier.id}>
                                                {tier.service} ({tier.age_group}) - NPR {tier.price_npr}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Start Date *</label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={heliForm.start_date}
                                        onChange={handleHeliInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>End Date</label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={heliForm.end_date}
                                        onChange={handleHeliInputChange}
                                    />
                                </div>

                                <div className="form-group" style={{ gridColumn: "span 2" }}>
                                    <label>Total Amount (NPR)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="frontend_total_amount"
                                        value={heliForm.frontend_total_amount}
                                        readOnly
                                        style={{ background: "#faf8fb", cursor: "not-allowed" }}
                                    />
                                </div>
                            </div>

                            {/* DYNAMIC HELI TRAVELLERS */}
                            <div style={{ marginTop: "20px" }}>
                                <h3 style={{ color: "#351255", fontSize: "16px", marginBottom: "15px", borderBottom: "1px solid #eee9f0", paddingBottom: "8px" }}>
                                    Traveller / Applicant Document Details ({heliForm.travellers.length})
                                </h3>

                                {heliForm.travellers.map((traveller, index) => (
                                    <div key={index} style={{ background: "#faf8fb", border: "1px solid #eae5ee", borderRadius: "8px", padding: "16px", marginBottom: "16px" }}>
                                        <h4 style={{ color: "#351255", fontSize: "14px", marginBottom: "12px" }}>
                                            Traveller #{index + 1}
                                        </h4>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                            <div className="form-group" style={{ marginBottom: "10px" }}>
                                                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "4px", color: "#555" }}>Name *</label>
                                                <input
                                                    type="text"
                                                    placeholder="Name *"
                                                    value={traveller.name}
                                                    onChange={(e) => handleHeliTravellerFieldChange(index, "name", e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: "10px" }}>
                                                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "4px", color: "#555" }}>Nationality *</label>
                                                <input
                                                    type="text"
                                                    placeholder="Nationality *"
                                                    value={traveller.nationality}
                                                    onChange={(e) => handleHeliTravellerFieldChange(index, "nationality", e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: "10px" }}>
                                                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "4px", color: "#555" }}>Identity Number (Passport/NID) *</label>
                                                <input
                                                    type="text"
                                                    placeholder="Identity Number *"
                                                    value={traveller.identity_number}
                                                    onChange={(e) => handleHeliTravellerFieldChange(index, "identity_number", e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: "10px" }}>
                                                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "4px", color: "#555" }}>Weight (kg) *</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    placeholder="Weight (kg) *"
                                                    value={traveller.weight}
                                                    onChange={(e) => handleHeliTravellerFieldChange(index, "weight", e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: "10px" }}>
                                                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "4px", color: "#555" }}>Luggage (kg)</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    placeholder="Luggage (kg)"
                                                    value={traveller.luggage}
                                                    onChange={(e) => handleHeliTravellerFieldChange(index, "luggage", e.target.value)}
                                                />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: "10px" }}>
                                                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "4px", color: "#555" }}>Email Address *</label>
                                                <input
                                                    type="email"
                                                    placeholder="Email Address *"
                                                    value={traveller.email}
                                                    onChange={(e) => handleHeliTravellerFieldChange(index, "email", e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: "10px" }}>
                                                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "4px", color: "#555" }}>WhatsApp Phone Number *</label>
                                                <input
                                                    type="text"
                                                    placeholder="WhatsApp Phone *"
                                                    value={traveller.whatsapp_phone}
                                                    onChange={(e) => handleHeliTravellerFieldChange(index, "whatsapp_phone", e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: "10px" }}>
                                                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "4px", color: "#555" }}>Preferred Flight Date *</label>
                                                <input
                                                    type="date"
                                                    value={traveller.preferred_flight_date}
                                                    onChange={(e) => handleHeliTravellerFieldChange(index, "preferred_flight_date", e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: "10px", gridColumn: "span 2" }}>
                                                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "4px", color: "#555" }}>Pickup Hotel in Kathmandu / Pokhara</label>
                                                <input
                                                    type="text"
                                                    placeholder="Pickup Hotel"
                                                    value={traveller.pickup_hotel}
                                                    onChange={(e) => handleHeliTravellerFieldChange(index, "traveller", e.target.value)}
                                                />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: "10px" }}>
                                                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "4px", color: "#555" }}>Passport / NID Image *</label>
                                                <input
                                                    type="file"
                                                    accept="image/*,.pdf"
                                                    onChange={(e) => handleHeliTravellerFileChange(index, "passport_nid_image", e.target.files[0])}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: "10px" }}>
                                                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "4px", color: "#555" }}>PP Size Photo *</label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleHeliTravellerFileChange(index, "pp_size_photo", e.target.files[0])}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: "10px" }}>
                                                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "4px", color: "#555" }}>Flight Ticket Image</label>
                                                <input
                                                    type="file"
                                                    accept="image/*,.pdf"
                                                    onChange={(e) => handleHeliTravellerFileChange(index, "confirmed_flight_ticket_image", e.target.files[0])}
                                                />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: "10px" }}>
                                                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "4px", color: "#555" }}>Travel Insurance Image</label>
                                                <input
                                                    type="file"
                                                    accept="image/*,.pdf"
                                                    onChange={(e) => handleHeliTravellerFileChange(index, "travel_insurance_image", e.target.files[0])}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={handleCloseHeliModal} disabled={submittingHeli}>
                                    Cancel
                                </button>
                                <button type="submit" className="create-category-button" disabled={submittingHeli}>
                                    {submittingHeli ? "Saving..." : "Save Heli Booking"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Booking;