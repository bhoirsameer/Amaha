// Copyright (c) 2025, Sameer and contributors
// For license information, please see license.txt

frappe.ui.form.on("Patient Appointment", {
    service(frm) {
        const { appointment_time, service } = frm.doc;

        if (!appointment_time) {
            frappe.throw(__("Please set the appointment time before selecting a service."));
            return;
        }

        if (!service) {
            frm.set_value("estimated_end_time", null);
            return;
        }
        frm.trigger("set_estimated_end_time_and_duration")
    },
    set_estimated_end_time_and_duration(frm){
        const { appointment_time, service } = frm.doc;
        frappe.call({
            method: "amaha.amaha.doctype.patient_appointment.patient_appointment_api.get_estimated_end_time_and_duration",
            args: {
                doctype: "Healthcare Service",
                doc_name: service,
                appointment_time: appointment_time
            },
            callback(response) {
                if (response.message) {
                    frm.set_value("estimated_end_time", response.message.estimated_end_time);
                } else {
                    frappe.msgprint(__("Service details not found."));
                    frm.set_value("estimated_end_time", null);
                }
            }
        });
    },
    appointment_time(frm){
        const { appointment_time, service } = frm.doc;
        if (appointment_time != "0" && service){
            frm.trigger("set_estimated_end_time_and_duration")
        }
    }
});



