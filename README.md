# Book Tracker Application

Welcome!  This project deploys a book tracker application.  The application allows you to enter book information and track status on whether you've read the book.  Book data is stored in a PostgreSQL table in a Supabase instance.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

### Installation
- Clone this repository.
- Download NodeJS:  https://nodejs.org/en/download
- Create a new Node app.
```
npm init
```
- Add this entry to package.json
```
"type": "module"
```
- Install required packages and helpful ones like nodemon.
```
npm install express --save
npm install ejs --save
npm install dotenv --save
npm install @supabase/supabase-js --save
npm install -g nodemon
```
- Set up a PostgreSQL table in Supabase.
    - Create new account in Supabase:  https://supabase.com/
    - In Supabase SQL Editor run this [script](./src/app/books/sql/ddl/create_table.sql) to create your books table.
    - Update the [.env](./src/app/books/.env) with the table url and anonymous key.


### Usage
With this application you can
- Add a book
- Update the book information
- Delete a book
- List information for one book
- Show a table with all books listed

To deploy the application:
```
node -r .\node_modules\dotenv\config .\app.js dotenv_config_path=.\.env
```

Then open it in your browser:  http://localhost:5000/
    
### Contributing
1. Fork the repository.
2. Create a new branch:  `git checkout -b feature-name`.
3. Make your changes.
4. Push your branch:  `git push origin feature-name`.
5. Create a pull request.

### License
This project is licensed under the [MIT License](LICENSE).
