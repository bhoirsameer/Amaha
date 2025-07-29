# Copyright (c) 2025, sameer and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from . healthcare_service_utils import create_update_item

class HealthcareService(Document):
	def on_update(self):
		create_update_item(self)
		