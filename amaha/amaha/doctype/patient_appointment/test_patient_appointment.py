import frappe
import unittest
import datetime
from . patient_appointment_utils import get_estimated_end_time_and_duration

class TestEstimatedEndTimeCalculation(unittest.TestCase):
    def setUp(self):
        # Create a dummy Healthcare Service for testing
        if not frappe.db.exists("Healthcare Service", "Test Service"):
            frappe.get_doc({
                "doctype": "Healthcare Service",
                "service_name": "Test Service",
                "duration": 30,  # Set a dummy duration
                "price": 500
            }).insert(ignore_permissions=True)

    def test_estimated_end_time_calculation(self):
        appointment_time = "10:00:00"

        # Call the function with known inputs
        result = get_estimated_end_time_and_duration(
            doc_name="Test Service",
            appointment_time=appointment_time
        )

        # Expected estimated_end_time (adding 15 minutes as per function logic)
        expected_end_time = (datetime.datetime.combine(
            datetime.date.today(),
            datetime.datetime.strptime(appointment_time, "%H:%M:%S").time()
        ) + datetime.timedelta(minutes=15)).time()

        # Assertions
        self.assertEqual(result.get("estimated_end_time"), expected_end_time)
        self.assertEqual(result.get("duration"), 30)
        self.assertEqual(result.get("price"), 500.000)

    def tearDown(self):
        # Clean up test data
        if frappe.db.exists("Healthcare Service", "Test Service"):
            frappe.delete_doc("Healthcare Service", "Test Service")

