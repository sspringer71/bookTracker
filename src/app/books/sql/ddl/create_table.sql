CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
	author VARCHAR(100) NOT NULL,
	publisher VARCHAR(100),
	year_published INTEGER,
	number_of_pages INTEGER NOT NULL,
	read BOOLEAN NOT NULL DEFAULT false,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_books_complete ON books(complete);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_book_modtime
BEFORE UPDATE ON books
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();