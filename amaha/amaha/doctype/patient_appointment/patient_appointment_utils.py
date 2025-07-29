import frappe
from frappe import ValidationError
from . patient_appointment_api import get_estimated_end_time_and_duration
from erpnext.accounts.doctype.payment_entry.payment_entry import get_payment_entry

def check_appointment_conflict(self):
    conflict = frappe.db.exists(
        "Patient Appointment",
        {
            "appointment_date": self.appointment_date,
            "name": ["!=", self.name or ""],
            "appointment_time": ["<", self.estimated_end_time],
            "estimated_end_time": [">", self.appointment_time],
        }
    )
    if conflict:
        frappe.throw(
            "The selected appointment time-{} is already booked. Please choose a different time."
            .format(frappe.bold(self.appointment_time)),
            title="Appointment Time Conflict",
            exc=ValidationError
        )
        
def validate_appointment_is_within_working_hours(self):
    schedule = frappe.get_single("Global Settings")

    if not self.appointment_time or not self.estimated_end_time:
        return

    if not (schedule.start_time <= self.appointment_time < schedule.end_time and
            schedule.start_time < str(self.estimated_end_time) <= schedule.end_time):
        frappe.throw(
            "Appointment must be within working hours ({} to {}). You can update it from Global Settings Doctype"
            .format(frappe.bold(schedule.start_time),frappe.bold(schedule.end_time)),
            exc=ValidationError,
            title="Time Conflict"
        )
        
def add_status_logger(self):
    is_status_change = True if not self.is_new() or self.get_doc_before_save().status != self.status else False
    if is_status_change:
        frappe.log_error("Status Log {}".format(self.name),"Appointment {} marked as Completed".format(self.name))
        
def set_status_for_new_appointments(self):
    if not self.status and self.is_new():
        self.status = "Scheduled"
        
def set_estimated_end_time(self):
    service_details = get_estimated_end_time_and_duration(
        doc_name=self.service,appointment_time=self.appointment_time
    )
    self.estimated_end_time = service_details.get("estimated_end_time")
    
def create_customer_if_not_exists(self):
    if not frappe.db.exists("Customer",self.patient_name.capitalize()):
        customer_doc = frappe.new_doc("Customer")
        customer_doc.customer_name = self.patient_name.capitalize()
        customer_doc.customer_type = "Individual"
        customer_doc.save()
        
def create_sales_invoice_and_payment_entry(self):
    if not frappe.db.exists("Sales Invoice",{"patient_appointment":self.name}):
        
        sales_invoice_doc = frappe.new_doc("Sales Invoice")
        sales_invoice_doc.customer = self.patient_name
        sales_invoice_doc.patient_appointment = self.name
        sales_invoice_doc.items = []
        sales_invoice_doc.append("items",{
            "item_code":self.service,
            "qty":1
        })
        sales_invoice_doc.save()
        sales_invoice_doc.submit()
        
        self.db_set("sales_invoice",sales_invoice_doc.name)
        
        payment_entry = get_payment_entry('Sales Invoice', sales_invoice_doc.name)
        payment_entry.mode_of_payment = "Cash"
        payment_entry.save()
        payment_entry.submit()
        
def update_company_and_account_defaults(self):
    default_company = frappe.get_single("Global Defaults").default_company
    if default_company:
        default_bank_account = frappe.db.get_value("Company",default_company,"default_bank_account")
        if default_bank_account:
            frappe.db.set_value("Account",default_bank_account,"account_type","Cash")