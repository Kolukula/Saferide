Authentication Routes (/auth)
Method	Endpoint	Roles Allowed	Request Body	Response / Feature
POST	/register	All (new users)	{ name, email, password, role }	Create a new user
POST	/login	All	{ email, password }	Login and return token
POST	/logout	All (authenticated)	{}	Logout user (invalidate session/token)

Notes:

Passwords are hashed using bcrypt.

JWT token is issued on login and used for protected routes.

2. Bus Routes (/buses)
Method	Endpoint	Roles Allowed	Request Body / Params	Response / Feature
POST	/addbus	Admin	{ busNumber, route, driver, capacity }	Create a new bus
GET	/getbuses	All authenticated	{}	List all buses with current locations
GET	/:id	All authenticated	id (Bus ID in URL)	Get details of a single bus
PUT	/:id/location	Driver	{ lat, lng }	Update bus location; emits real-time updates via Socket.io
DELETE	/:id	Admin	id (Bus ID in URL)	Delete a bus