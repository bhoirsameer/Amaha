# Copyright (c) 2025, sameer and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
import datetime
from . patient_appointment_api import get_estimated_end_time_and_duration
from . patient_appointment_utils import (
	check_appointment_conflict,validate_appointment_is_within_working_hours,add_status_logger,
 	set_estimated_end_time,create_customer_if_not_exists,create_sales_invoice_and_payment_entry,
    update_company_and_account_defaults
)

class PatientAppointment(Document):
    
	def before_validate(self):
		update_company_and_account_defaults(self)
		set_estimated_end_time(self)
  
	def validate(self):
		check_appointment_conflict(self)
		validate_appointment_is_within_working_hours(self)
  
	def on_update(self):
		add_status_logger(self)
		create_customer_if_not_exists(self)
		create_sales_invoice_and_payment_entry(self)