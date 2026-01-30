# Helpdesk Web App

Full-stack helpdesk system with authentication, roles, ticket management and comments.

Backend built with Django + Django REST Framework.  
Frontend built with React (Vite) + Tailwind CSS.

---

## Features

- JWT Authentication (access & refresh)
- Roles: CLIENT, AGENT, ADMIN
- Create support tickets
- Assign ticket to self (agents/admins)
- Change ticket status (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
- Ticket comments
- Filters by search, status and priority
- Responsive UI

---

## Tech Stack

Backend:
- Django
- Django REST Framework
- SimpleJWT
- SQLite (development)
- PostgreSQL (production)

Frontend:
- React (Vite)
- Tailwind CSS
- Axios

---

## Project Structure

backend/   → Django project  
frontend/  → React app  

---

## Running Locally

Backend:

cd backend  
python -m venv env  
env\Scripts\activate  
pip install -r requirements.txt  
python manage.py migrate  
python manage.py createsuperuser  
python manage.py runserver  

Frontend:

cd frontend  
npm install  
npm run dev  

---

## Main API Endpoints

POST /api/token/  
POST /api/token/refresh/  

GET /api/tickets/  
POST /api/tickets/  
POST /api/tickets/{id}/assign_to_me/  
POST /api/tickets/{id}/change_status/  

GET /api/tickets/{id}/comments/  
POST /api/tickets/{id}/comments/  

GET /api/categories/  

---

## Deployment

Backend deployed on Railway  
Frontend deployed on Vercel  

---

## Notes

- Categories are managed from Django Admin.
- Demo data can be cleaned using Django Admin.
- This project is intended as a portfolio full-stack application.

---

## Author

Rodrigo Haro
