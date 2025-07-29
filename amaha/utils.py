import frappe


def success_response(data=None, id=None,success_message = None):
    response = {'message': 'success','success_message' : success_message}
    response['data'] = data
    if id:
        response['data'] = {'id': id, "name": id}
    return response

def error_response(err_msg):
    return {
        'message': 'error',
        'error': err_msg
    }