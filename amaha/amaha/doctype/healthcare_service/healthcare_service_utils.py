import frappe

def create_update_item(self):
    item_doc = frappe.get_doc("Item",self.name) if frappe.db.exists("Item",self.name) else frappe.new_doc("Item")
    item_doc.item_code = self.name
    item_doc.item_name = self.name
    item_doc.standard_rate = self.price
    item_doc.item_group = "Services"
    item_doc.save()