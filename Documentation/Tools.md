# Tools.md

### 📦 Install Dependencies

To install all necessary dependencies in a virtual environment, run:

```sh
py install.py
```


### 🔄 Migrate Database

Run database migrations using:

```sh
py migrate.py
```


### 🔐 Create Superuser

To automatically create a Django superuser, run the following script after applying migrations:

```sh
py create_superuser.py
```

This will create a superuser with:

- 👤 Username: `admin`  
- 📧 Email: `admin@gmail.com`  
- 🔑 Password: `admin`

You can also create a custom superuser by passing credentials in the format `username:password`:

```sh
py create_superuser.py username:password
```

This will use `username@gmail.com` as the email address.  
The script checks if the user already exists and only creates the superuser if necessary.


### 🚀 Start the Project

To start the backend server, execute:

```sh
py run.py
```
