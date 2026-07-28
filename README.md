# Gym-App

App designed for trainers to gice a routine to their trainees, and allow the trainees to keep track of their daily routine

## Netlify full-stack deployment

The repository now deploys as one Netlify project:

- Create React App builds from `frontend/` into `frontend/build/`.
- Express runs inside a Netlify Function.
- Requests under `/api/*` are rewritten to the API function.
- React Router routes fall back to `index.html`.
- MongoDB runs externally in MongoDB Atlas.

Required Netlify environment variables:

- `MONGODB_URI`: MongoDB Atlas connection string for the `gym-app` database.
- `JWT_SECRET`: a long random server-only signing secret.

Do not prefix either secret with `REACT_APP_`. The frontend uses the same-origin
`/api` URL by default, so no production frontend environment variable is needed.

For local validation:

```bash
cd frontend
npm install
netlify dev
```

Copy `frontend/.env.example` to `frontend/.env` and replace the placeholders
before running locally. Do not commit the `.env` file.

Aplicación sencilla para gimnasios, donde los usuarios pueden registrarse y seleccionar a su entrenador para recibir su rutina de ejercicios por parte del entrenador seleccionado.

A su vez los entrenadores se pueden registrar y verificar que son entrenadores ingresando el codigo "Train", los entrenadores pueden ver la lista de usuarios que los han seleccionado,
siendo solo estos usuarios los cuales pueden recibir rutinas por parte de los entrenadores.

Cada entrenador puede agregar un nombre de ejercicio y una descripcion del mismo, de ser necesario puede eliminar el ejercicio que se desee quitar de la lista.

Los usuarios que tengan un entrenador seleccionado ven directamente los ejercicios que el entrenador les ha asignado, al realizar el ejercicio pueden marcar el ejercicio como completado y este cambiara de color,
al igual que el boton para completar el ejercicio cambiara su texto y su color, al presionar el boton nuevamente este regresara el ejercicio a su estado original.

## se puede probar la aplicación con el comando:

'npm run start'

# O se puede visitar la pagina:

https://boukenshagym.boukensha.site

## los usuarios que se encuentran registrados para pruebas son los siguientes:

Trainer 1 email: test@test.com password: 123456

Trainer 2 email: test2@test.com password: 123456

Usuario 1 email: test3@test.com password: 123456

Usuario 2 email: test4@test.com password: 123456

Esta aplicación se presentara como Full Stack. por el momento se entrega la parte del Front-End
