import frappe

@frappe.whitelist()
def get_list_of_healthcare_services():
    return frappe.db.get_all(
        "Healthcare Service",pluck = "name"
    );
    
def duration_of_health_care_service(healthcare_service = None):
    duration = frappe.db.get_value(
        "Healthcare Service",healthcare_service,"duration"
    );
    return duration;