import frappe
import  datetime
from frappe import _
from frappe.utils import flt
from amaha.utils import success_response,error_response

@frappe.whitelist(allow_guest=1)
def get_estimated_end_time_and_duration(doctype="Healthcare Service", doc_name=None,appointment_time = None):
    if appointment_time == "0":
        frappe.throw("Please Select appointment time")
    if not (doctype or doc_name):
        frappe.throw(_("Doctype, document name are required."))
    
    service_details = frappe.db.get_value(doctype, doc_name, ["duration","price"],as_dict=True)
    if not appointment_time and doc_name:
        return service_details
    
    if not service_details.duration:
        frappe.throw(
            """The <b>Duration</b> field is missing for the selected service: 
            <a href='/app/healthcare-service/{0}' target='_blank' 
            style='color: blue; text-decoration: none; font-weight: bold;'>
            Healthcare Service - {0}
            </a>. Please update it before proceeding.""".format(doc_name),
            title="Missing Duration"
        )

    dt = datetime.datetime.combine(
        datetime.date.today(),
        datetime.datetime.strptime(appointment_time, "%H:%M:%S").time()
    )
    estimated_end_time = (dt + datetime.timedelta(minutes=15)).time()
    return {
        "estimated_end_time":estimated_end_time,"price":flt(service_details.price,3),"duration":service_details.duration
    }


@frappe.whitelist(allow_guest=1)
def create_appointment(**kwargs):
    try:
        master_fields = {
            key:value  for key , value in kwargs.items() if not isinstance(value, list)
        }
        patient_appointment = frappe.get_doc({
            "doctype":"Patient Appointment",
            **master_fields
        })
        patient_appointment.insert()
        return success_response(
            data = patient_appointment.name,
            success_message="Appointment created Successfully - {} ".format(patient_appointment.name)
        )
        
    except frappe.DuplicateEntryError as e:
        return error_response("An appointment with these details already exists for Selected date.")

    except Exception as e:
        return error_response(str(e))
        