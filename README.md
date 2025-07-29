1: Create a new bench
 a: bench init --frappe-branch version-15 frappe-bench
 b: cd frappe-bench

2: Get the ERPNext app
 bench get-app --branch version-15 erpnext

3: Get the custom Healthcare app
 bench get-app https://github.com/bhoirsameer/Amaha.git --branch feat/create_healthcare_app

4: Create a new site
 bench new-site site-name
 Enter the required database details and set the Administrator password when prompted.

5: Install apps on the site
 a: bench --site [site-name] install-app erpnext
 b: bench --site [site-name] install-app [healthcare app name] (Replace [healthcare app name] with your app's actual name, e.g., amaha)

6: Set the active site
 bench use site-name

7: Start the bench
 bench start
 Keep this terminal running.

8: Open a new terminal, navigate to the bench directory, and run migrations
 a: cd frappe-bench
 b: bench migrate

9: Run localhost in the browser
 Go to http://localhost:8000
 Complete the setup wizard by filling in company details, currency, time zone, etc.

10: Enable server scripts globally
 bench set-config -g server_script_enabled 1

11: Go to the Awesome Bar and search for Healthcare Service
 Create a few new records for testing.

12: Go to the Awesome Bar and search for Patient Appointment
 Create a few new records for testing.

13: To create appointments from the custom UI
 Go to http://localhost:8000/appointment
 Fill in the details in the page form and submit to create appointment records.
